import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { StoreService } from '../store/store.service';
import { Translation } from './translation.interface';
import { Translations } from './translation.type';

@Injectable({ providedIn: 'root' })
export class TranslationService {
	private _storeService = inject(StoreService);

	constructor() {
		/**
		 * Hydrates translations from the internal persistent store (if present).
		 *
		 * This runs once at service construction time and calls `setMany()` to:
		 * - populate/update known translation signals
		 * - persist the normalized set back to storage (via `setMany()` side effect)
		 *
		 * Notes:
		 * - The stored payload is expected to be an array of `Translation`.
		 * - Signals for keys not yet requested via `translate()` will not exist,
		 *   so `setMany()` assumes signals are already registered (strict mode).
		 */
		this._storeService.getJson('translations', {
			onSuccess: (translations) => {
				if (Array.isArray(translations)) {
					this.setMany(translations as Translation[]);
				}
			},
		});
	}

	/**
	 * Persists the current in-memory translations into the internal store.
	 *
	 * The payload is derived from `_signalTranslates` by materializing each signal's
	 * current value at the time of saving.
	 *
	 * Side effects:
	 * - Writes to storage via `StoreService.setJson`.
	 *
	 * Intended usage:
	 * - Called after `setMany()` and `setOne()` to keep storage in sync.
	 */
	private _updateStorageTranslations() {
		const translations = [];

		for (const sourceText in this._signalTranslates) {
			translations.push({
				text: this._signalTranslates[sourceText](),
				sourceText,
			});
		}

		this._storeService.setJson('translations', translations);
	}

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
	private _signalTranslates: Translations = {};

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
	setMany(translations: Translation[]) {
		const sourceTexts = translations.map((t) => t.sourceText);
		const sourceSet = new Set(sourceTexts);

		// Reset removed translations back to original text
		for (const sourceText in this._signalTranslates) {
			if (!sourceSet.has(sourceText)) {
				this._signalTranslates[sourceText].set(sourceText);
			}
		}

		// Update provided translations
		for (const translation of translations) {
			this._setTranslation(translation.sourceText, translation.text);
		}

		this._updateStorageTranslations();
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
	 * @param translation - Translation object containing
	 * sourceText and translated text.
	 */
	setOne(translation: Translation) {
		this._setTranslation(translation.sourceText, translation.text);

		this._updateStorageTranslations();
	}

	/**
	 * Returns the internal translation signal registry.
	 *
	 * Useful for debugging, inspection, or tooling.
	 *
	 * @returns A record mapping sourceText keys to WritableSignal<string>.
	 */
	get(): Translations {
		return this._signalTranslates;
	}

	private _setTranslation(sourceText: string, text: string) {
		if (!this._signalTranslates[sourceText]) {
			this._signalTranslates[sourceText] = signal(sourceText);
		}

		this._signalTranslates[sourceText].set(text);
	}
}
