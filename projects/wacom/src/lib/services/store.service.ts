import { Inject, Injectable, Optional } from '@angular/core';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { CoreService } from './core.service';

@Injectable({
	providedIn: 'root',
})
export class StoreService {
	private _prefix = '';

	constructor(
		@Inject(CONFIG_TOKEN) @Optional() private config: Config,
		private core: CoreService
	) {
		this.config = this.config || DEFAULT_CONFIG;
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
	 * Sets a value in storage.
	 *
	 * @param key - The storage key.
	 * @param value - The value to store.
	 * @param callback - The callback to execute on success.
	 * @param errCallback - The callback to execute on error.
	 */
	set(
		key: string,
		value: string,
		callback: () => void = () => {},
		errCallback: () => void = () => {}
	): void {
		key = this.applyPrefix(key);

		if (this.config.store?.set) {
			this.config.store.set(key, value, callback, errCallback);
		} else {
			try {
				localStorage.setItem(key, value);
				callback();
			} catch (e) {
				errCallback();
			}
		}
	}

	/**
	 * Sets a value in storage asynchronously.
	 *
	 * @param key - The storage key.
	 * @param value - The value to store.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	async setAsync(key: string, value: string): Promise<boolean> {
		key = this.applyPrefix(key);

		try {
			if (this.config.store?.set) {
				await this.config.store.set(key, value);
			} else {
				localStorage.setItem(key, value);
			}
			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	}

	/**
	 * Gets a value from storage.
	 *
	 * @param key - The storage key.
	 * @param callback - The callback to execute with the retrieved value.
	 * @param errCallback - The callback to execute on error.
	 */
	get(
		key: string,
		callback: (value: string) => void = () => {},
		errCallback: () => void = () => {}
	): void {
		key = this.applyPrefix(key);

		if (this.config.store?.get) {
			this.config.store.get(key, callback, errCallback);
		} else {
			const value = localStorage.getItem(key) || '';
			callback(value);
		}
	}

        /**
         * Gets a value from storage asynchronously.
         *
         * @param key - The storage key.
         * @returns A promise that resolves to the retrieved value or `null` if the key is missing.
         */
        async getAsync(key: string): Promise<string | null> {
                key = this.applyPrefix(key);

                try {
                        if (this.config.store?.get) {
                                const value = await this.config.store.get(key);
                                return value ?? null;
                        } else {
                                return localStorage.getItem(key);
                        }
                } catch (err) {
                        console.error(err);
                        return null;
                }
        }

	/**
	 * Sets a JSON value in storage.
	 *
	 * @param key - The storage key.
	 * @param value - The value to store.
	 * @param callback - The callback to execute on success.
	 * @param errCallback - The callback to execute on error.
	 */
	setJson(
		key: string,
		value: any,
		callback: () => void = () => {},
		errCallback: () => void = () => {}
	): void {
		this.set(key, JSON.stringify(value), callback, errCallback);
	}

	/**
	 * Sets a JSON value in storage asynchronously.
	 *
	 * @param key - The storage key.
	 * @param value - The value to store.
	 * @returns A promise that resolves to a boolean indicating success.
	 */
	async setJsonAsync(key: string, value: any): Promise<boolean> {
		return this.setAsync(key, JSON.stringify(value));
	}

	/**
	 * Gets a JSON value from storage.
	 *
	 * @param key - The storage key.
	 * @param callback - The callback to execute with the retrieved value.
	 * @param errCallback - The callback to execute on error.
	 */
	getJson(
		key: string,
		callback: (value: any) => void = () => {},
		errCallback: () => void = () => {}
	): void {
		this.get(
			key,
			(value: string) => {
				try {
					const parsedValue = JSON.parse(value);
					callback(parsedValue);
				} catch (e) {
					callback(null);
				}
			},
			errCallback
		);
	}

	/**
	 * Gets a JSON value from storage asynchronously.
	 *
	 * @param key - The storage key.
	 * @returns A promise that resolves to the retrieved value.
	 */
        async getJsonAsync<T = any>(key: string): Promise<T | null> {
                const value = await this.getAsync(key);
                if (value === null) {
                        return null;
                }
                try {
                        return JSON.parse(value);
                } catch (err) {
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
		callback?: () => void,
		errCallback?: () => void
	): Promise<boolean> {
		key = this.applyPrefix(key);

		try {
			if (this.config.store?.remove) {
				await this.config.store.remove(key, callback, errCallback);
			} else {
				localStorage.removeItem(key);
			}
			callback?.();
			return true;
		} catch (err) {
			console.error(err);
			errCallback?.();
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
		errCallback?: () => void
	): Promise<boolean> {
		try {
			if (this.config.store?.clear) {
				await this.config.store.clear();
			} else {
				localStorage.clear();
			}
			callback?.();
			return true;
		} catch (err) {
			console.error(err);
			errCallback?.();
			return false;
		}
	}

	/**
	 * Applies the configured prefix to a storage key.
	 *
	 * @param key - The storage key.
	 * @returns The prefixed storage key.
	 */
	private applyPrefix(key: string): string {
		if (this.config.store?.prefix) {
			key = this.config.store.prefix + key;
		}
		if (this._prefix) {
			key = this._prefix + key;
		}
		return key;
	}

        /**
         * Checks if a value exists in storage.
         *
         * This function checks whether a value is present for the given key in the storage.
         * It uses the configured storage mechanism if available; otherwise, it defaults to using `localStorage`.
         *
         * @param key - The storage key to check.
         * @returns A promise that resolves to `true` if the value exists, otherwise `false`.
         *
         * @example
         * const store = new StoreService(config, core);
         *
         * // Set a value and check if it exists
         * await store.setAsync('exampleKey', 'exampleValue');
         * const exists = await store.has('exampleKey');
         * console.log(exists); // Output: true
         *
         * @notes
         * - This method internally uses `getAsync` and checks only for `null`.
         * - An empty string value will still return `true` as the key exists in storage.
         */
        async has(key: string): Promise<boolean> {
                return (await this.getAsync(key)) !== null;
        }
}
