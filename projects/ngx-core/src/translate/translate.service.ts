import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { StoreService } from '../store/store.service';
import { ProvideTranslateConfig, Translate } from './translate.interface';
import { Translates } from './translate.type';

@Injectable({ providedIn: 'root' })
export class TranslateService {
	private static readonly _LANGUAGE_STORE_KEY = 'translate.language';
	private static readonly _DEFAULT_FOLDER = '/i18n/';

	private _http = inject(HttpClient);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private _storeService = inject(StoreService);
	private _language = signal('');
	private _defaultLanguage = signal('');
	private _config: Required<Pick<ProvideTranslateConfig, 'folder' | 'persistLanguage'>> &
		Omit<ProvideTranslateConfig, 'folder' | 'persistLanguage'> = {
		folder: TranslateService._DEFAULT_FOLDER,
		persistLanguage: true,
	};
	private _translationsByLanguage = new Map<string, Translate[]>();
	private _loadingByLanguage = new Map<string, Promise<Translate[]>>();

	/**
	 * Internal registry of translation signals.
	 *
	 * Each key (sourceText) maps to a WritableSignal<string>
	 * that always holds the current translated value.
	 *
	 * Example:
	 * {
	 *   "Hello": signal("Hola"),
	 *   "Save": signal("Guardar")
	 * }
	 */
	private _signalTranslates: Translates = {};

	constructor() {}

	async init(config: ProvideTranslateConfig = {}): Promise<void> {
		this._config = {
			...this._config,
			...config,
			folder: this._normalizeFolder(config.folder ?? this._config.folder),
			persistLanguage: config.persistLanguage ?? this._config.persistLanguage,
		};

		if (this._config.defaultLanguage) {
			this._defaultLanguage.set(this._config.defaultLanguage);
		}

		const storedLanguage = this._config.persistLanguage
			? await this._storeService.get(TranslateService._LANGUAGE_STORE_KEY)
			: null;

		const initialLanguage =
			this._config.language || storedLanguage || this._config.defaultLanguage || '';

		if (initialLanguage) {
			await this.setLanguage(initialLanguage);
		}
	}

	language() {
		return this._language();
	}

	defaultLanguage() {
		return this._defaultLanguage();
	}

	async setLanguage(language: string): Promise<void> {
		const nextLanguage = (language || '').trim();

		if (!nextLanguage) {
			return;
		}

		this._language.set(nextLanguage);

		if (this._config.persistLanguage) {
			void this._storeService.set(TranslateService._LANGUAGE_STORE_KEY, nextLanguage);
		}

		const translations = await this.loadTranslations(nextLanguage);

		this._applyTranslations(translations);
	}

	async loadTranslations(language: string): Promise<Translate[]> {
		const normalizedLanguage = (language || '').trim();

		if (!normalizedLanguage) {
			return [];
		}

		const cached = this._translationsByLanguage.get(normalizedLanguage);

		if (cached) {
			return [...cached];
		}

		const existingLoad = this._loadingByLanguage.get(normalizedLanguage);

		if (existingLoad) {
			return existingLoad;
		}

		const loadPromise = this._loadLanguageInternal(normalizedLanguage).finally(() => {
			this._loadingByLanguage.delete(normalizedLanguage);
		});

		this._loadingByLanguage.set(normalizedLanguage, loadPromise);

		return loadPromise;
	}

	/**
	 * Returns a reactive translation signal for the given source text.
	 *
	 * If a signal for this key does not exist yet,
	 * it is lazily created with the source text as its initial value.
	 *
	 * This ensures:
	 * - The UI immediately renders the original text.
	 * - When translations are later loaded, the signal updates automatically.
	 *
	 * @param text - The source text used as the translation key.
	 * @returns A WritableSignal<string> containing the translated value.
	 */
	translate(text: string): WritableSignal<string> {
		if (!this._signalTranslates[text]) {
			this._signalTranslates[text] = signal(text);
		}

		return this._signalTranslates[text];
	}

	/**
	 * Replaces translations in bulk.
	 *
	 * Behavior:
	 * 1. Any existing signal not present in the new translations
	 *    is reset to its original source text (fallback behavior).
	 * 2. Provided translations update their corresponding signals.
	 *
	 * This is typically used when switching language.
	 *
	 * Important:
	 * Signals must already exist (created via `translate()`)
	 * before calling this method.
	 *
	 * @param translations - Array of translation objects
	 * containing sourceText and translated text.
	 */
	setMany(translations: Translate[]) {
		this._applyTranslations(translations);

		const language = this._language();

		if (language) {
			this._translationsByLanguage.set(
				language,
				translations.map(translation => ({ ...translation })),
			);
		}
	}

	/**
	 * Updates a single translation entry.
	 *
	 * This method updates the existing signal for a given source text.
	 * Typically used for dynamic or incremental translation updates.
	 *
	 * Important:
	 * The signal must already exist (created via `translate()`),
	 * otherwise this will throw an error.
	 *
	 * @param translation - Translate object containing
	 * sourceText and translated text.
	 */
	setOne(translation: Translate) {
		this._setTranslation(translation.sourceText, translation.text);

		const language = this._language();

		if (!language) {
			return;
		}

		const currentTranslations = this._translationsByLanguage.get(language) || [];
		const existingIndex = currentTranslations.findIndex(
			item => item.sourceText === translation.sourceText,
		);

		if (existingIndex >= 0) {
			currentTranslations[existingIndex] = { ...translation };
		} else {
			currentTranslations.push({ ...translation });
		}

		this._translationsByLanguage.set(language, currentTranslations);
	}

	/**
	 * Returns the internal translation signal registry.
	 *
	 * Useful for debugging, inspection, or tooling.
	 *
	 * @returns A record mapping sourceText keys to WritableSignal<string>.
	 */
	get(): Translates {
		return this._signalTranslates;
	}

	private _applyTranslations(translations: Translate[]) {
		const sourceSet = new Set(translations.map(translation => translation.sourceText));

		for (const sourceText in this._signalTranslates) {
			if (!sourceSet.has(sourceText)) {
				this._signalTranslates[sourceText].set(sourceText);
			}
		}

		for (const translation of translations) {
			this._setTranslation(translation.sourceText, translation.text);
		}
	}

	private async _loadLanguageInternal(language: string): Promise<Translate[]> {
		const inlineTranslations = this._config.translations?.[language];

		if (Array.isArray(inlineTranslations)) {
			const normalizedInline = inlineTranslations.map(translation => ({ ...translation }));
			this._translationsByLanguage.set(language, normalizedInline);
			return [...normalizedInline];
		}

		if (!this._config.folder) {
			this._translationsByLanguage.set(language, []);
			return [];
		}

		if (!this._isBrowser) {
			this._translationsByLanguage.set(language, []);
			return [];
		}

		const url = this._createLanguageUrl(language);

		try {
			const payload =
				(await firstValueFrom(this._http.get<Record<string, string>>(url))) || {};
			const translations = this._mapJsonToTranslations(payload);

			this._translationsByLanguage.set(language, translations);

			return [...translations];
		} catch (error) {
			console.warn(
				`[ngx-core:translate] Failed to load translations for "${language}" from "${url}".`,
				error,
			);
			this._translationsByLanguage.set(language, []);
			return [];
		}
	}

	private _createLanguageUrl(language: string): string {
		return `${this._normalizeFolder(this._config.folder)}${language}.json`;
	}

	private _mapJsonToTranslations(payload: Record<string, string>): Translate[] {
		const translations: Translate[] = [];

		for (const sourceText in payload) {
			translations.push({
				sourceText,
				text: payload[sourceText],
			});
		}

		return translations;
	}

	private _normalizeFolder(folder: string): string {
		const normalized = (folder || '').trim();

		if (!normalized) {
			return TranslateService._DEFAULT_FOLDER;
		}

		return normalized.endsWith('/') ? normalized : `${normalized}/`;
	}

	private _setTranslation(sourceText: string, text: string) {
		if (!this._signalTranslates[sourceText]) {
			this._signalTranslates[sourceText] = signal(sourceText);
		}

		this._signalTranslates[sourceText].set(text);
	}
}
