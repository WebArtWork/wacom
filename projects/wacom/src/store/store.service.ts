import { isPlatformBrowser } from '@angular/common';
import {
	Inject,
	Injectable,
	Optional,
	PLATFORM_ID,
	inject,
} from '@angular/core';
import {
	CONFIG_TOKEN,
	Config,
	DEFAULT_CONFIG,
} from '../interfaces/config.interface';
import { StoreConfig, StoreOptions } from './store.interface';

@Injectable({
	providedIn: 'root',
})
export class StoreService {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	private _prefix = '';
	private _config: StoreConfig;

	constructor(@Inject(CONFIG_TOKEN) @Optional() config: Config) {
		this._config = {
			...DEFAULT_CONFIG,
			...(config?.store || {}),
		};
	}

	/**
	 * Sets the prefix for storage keys.
	 */
	setPrefix(prefix: string): void {
		this._prefix = prefix;
	}

	/**
	 * Stores a raw string value.
	 */
	async set(
		key: string,
		value: string,
		options?: StoreOptions,
	): Promise<boolean> {
		key = this._applyPrefix(key);

		try {
			if (this._config.set) {
				await this._config.set(
					key,
					value,
					() => options?.onSuccess?.(),
					options?.onError,
				);
			} else {
				if (!this._isBrowser) {
					options?.onSuccess?.();
					return true;
				}

				localStorage.setItem(key, value);
				options?.onSuccess?.();
			}

			return true;
		} catch (err) {
			console.error(err);
			options?.onError?.(err);
			return false;
		}
	}

	/**
	 * Retrieves a raw string value.
	 */
	async get(
		key: string,
		options?: StoreOptions<string>,
	): Promise<string | null> {
		key = this._applyPrefix(key);

		try {
			if (this._config.get) {
				const value = await this._config.get(
					key,
					(val: string) => options?.onSuccess?.(val ?? null),
					options?.onError,
				);

				return value ?? null;
			}

			if (!this._isBrowser) {
				options?.onSuccess?.(null);
				return null;
			}

			const value = localStorage.getItem(key);

			options?.onSuccess?.(value ?? null);

			return value ?? null;
		} catch (err) {
			console.error(err);
			options?.onError?.(err);
			return null;
		}
	}

	/**
	 * Stores a JSON value safely.
	 */
	async setJson<T>(
		key: string,
		value: T,
		options?: StoreOptions,
	): Promise<boolean> {
		return this.set(key, JSON.stringify(value), options);
	}

	/**
	 * Retrieves a JSON value safely (auto-heals broken data).
	 */
	async getJson<T = unknown>(
		key: string,
		options?: StoreOptions<T>,
	): Promise<T | null> {
		const clearOnError = options?.clearOnError ?? true;

		const raw = await this.get(key, {
			onError: options?.onError,
		});

		if (raw === null || raw.trim() === '') {
			const fallback = options?.defaultValue ?? null;
			options?.onSuccess?.(fallback);
			return fallback;
		}

		try {
			const parsed = JSON.parse(raw) as T;

			options?.onSuccess?.(parsed);

			return parsed;
		} catch (err) {
			console.error(raw, err);
			options?.onError?.(err);

			if (clearOnError) {
				await this.remove(key);
			}

			const fallback = options?.defaultValue ?? null;
			options?.onSuccess?.(fallback);

			return fallback;
		}
	}

	/**
	 * Removes a single key.
	 */
	async remove(key: string, options?: StoreOptions): Promise<boolean> {
		key = this._applyPrefix(key);

		try {
			if (this._config.remove) {
				return await this._config.remove(
					key,
					() => options?.onSuccess?.(),
					options?.onError,
				);
			}

			if (!this._isBrowser) {
				options?.onSuccess?.();
				return true;
			}

			localStorage.removeItem(key);
			options?.onSuccess?.();

			return true;
		} catch (err) {
			console.error(err);
			options?.onError?.(err);
			return false;
		}
	}

	/**
	 * Clears all storage.
	 */
	async clear(options?: StoreOptions): Promise<boolean> {
		try {
			if (this._config.clear) {
				await this._config.clear();
			} else {
				if (!this._isBrowser) {
					options?.onSuccess?.();
					return true;
				}

				localStorage.clear();
			}

			options?.onSuccess?.();

			return true;
		} catch (err) {
			console.error(err);
			options?.onError?.(err);
			return false;
		}
	}

	/**
	 * Applies configured prefixes to key.
	 */
	private _applyPrefix(key: string): string {
		if (this._config.prefix) {
			key = this._config.prefix + key;
		}

		if (this._prefix) {
			key = this._prefix + key;
		}

		return key;
	}
}
