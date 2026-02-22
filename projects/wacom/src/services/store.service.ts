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
import { StoreConfig } from '../interfaces/store.interface';

@Injectable({
	providedIn: 'root',
})
export class StoreService {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	constructor(@Inject(CONFIG_TOKEN) @Optional() config: Config) {
		this._config = {
			...DEFAULT_CONFIG,
			...(config?.store || {}),
		};
	}

	/**
	 * Sets the prefix for storage keys.
	 *
	 * @param prefix - The prefix to set.
	 */
	setPrefix(prefix: string): void {
		this._prefix = prefix;
	}

	/**
	 * Sets a value in storage asynchronously.
	 *
	 * @param key - The storage key.
	 * @param value - The value to store.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	async set(
		key: string,
		value: string,
		callback: () => void = () => {},
		errCallback: (err: unknown) => void = () => {},
	): Promise<boolean> {
		key = this._applyPrefix(key);

		try {
			if (this._config.set) {
				await this._config.set(key, value, callback, errCallback);
			} else {
				if (!this._isBrowser) {
					callback();
					return true;
				}

				localStorage.setItem(key, value);

				callback();
			}

			return true;
		} catch (err) {
			console.error(err);

			errCallback(err);

			return false;
		}
	}

	/**
	 * Gets a value from storage asynchronously.
	 *
	 * @param key - The storage key.
	 * @returns A promise that resolves to the retrieved value or `null` if the key is missing.
	 */
	async get(
		key: string,
		callback?: (value: string | null) => void,
		errCallback: (err: unknown) => void = () => {},
	): Promise<string | null> {
		key = this._applyPrefix(key);

		try {
			if (this._config.get) {
				const value = await this._config.get(
					key,
					(val: string) => {
						callback?.(val ?? null);
					},
					errCallback,
				);

				return value ?? null;
			} else {
				if (!this._isBrowser) {
					callback?.(null);
					return null;
				}

				const value = localStorage.getItem(key);

				callback?.(value ?? null);

				return value ?? null;
			}
		} catch (err) {
			console.error(err);

			errCallback(err);

			return null;
		}
	}

	/**
	 * Sets a JSON value in storage asynchronously.
	 *
	 * @param key - The storage key.
	 * @param value - The value to store.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	async setJson<T>(
		key: string,
		value: T,
		callback: () => void = () => {},
		errCallback: (err: unknown) => void = () => {},
	): Promise<boolean> {
		return await this.set(
			key,
			JSON.stringify(value),
			callback,
			errCallback,
		);
	}

	/**
	 * Gets a JSON value from storage asynchronously.
	 *
	 * @param key - The storage key.
	 * @returns A promise that resolves to the retrieved value.
	 */
	async getJson<T = any>(
		key: string,
		callback?: (value: string | object | null) => void,
		errCallback: (err: unknown) => void = () => {},
	): Promise<T | null> {
		const value = await this.get(key);

		if (value === null) {
			return null;
		}

		try {
			const result = JSON.parse(value);

			callback?.(result);

			return result;
		} catch (err) {
			errCallback?.(err);

			console.error(err);

			return null;
		}
	}

	/**
	 * Removes a value from storage.
	 *
	 * @param key - The storage key.
	 * @param callback - The callback to execute on success.
	 * @param errCallback - The callback to execute on error.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	async remove(
		key: string,
		callback: () => void = () => {},
		errCallback: (err: unknown) => void = () => {},
	): Promise<boolean> {
		key = this._applyPrefix(key);

		try {
			if (this._config.remove) {
				return await this._config.remove(key, callback, errCallback);
			} else {
				if (!this._isBrowser) {
					callback();
					return true;
				}

				localStorage.removeItem(key);

				callback();

				return true;
			}
		} catch (err) {
			console.error(err);

			errCallback(err);

			return false;
		}
	}

	/**
	 * Clears all values from storage.
	 *
	 * @param callback - The callback to execute on success.
	 * @param errCallback - The callback to execute on error.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	async clear(
		callback?: () => void,
		errCallback?: (err: unknown) => void,
	): Promise<boolean> {
		try {
			if (this._config.clear) {
				await this._config.clear();
			} else {
				if (!this._isBrowser) {
					callback?.();
					return true;
				}

				localStorage.clear();
			}

			callback?.();

			return true;
		} catch (err) {
			console.error(err);

			errCallback?.(err);

			return false;
		}
	}

	private _prefix = '';

	private _config: StoreConfig;

	/**
	 * Applies the configured prefix to a storage key.
	 *
	 * @param key - The storage key.
	 * @returns The prefixed storage key.
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
