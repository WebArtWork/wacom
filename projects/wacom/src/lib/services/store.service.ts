import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import { CoreService } from './core.service';

type ResponseData<T> = T | null;

@Injectable({
	providedIn: 'root'
})
export class StoreService {
	private _prefix = '';

	setPrefix(prefix: string): void {
		this._prefix = prefix;
	}

	constructor(
		@Inject(CONFIG_TOKEN) @Optional() private config: Config,
		private core: CoreService
	) {
		if (!this.config) this.config = DEFAULT_CONFIG;
	}

	set(
		hold: string,
		value: string,
		callback: () => void = () => { },
		errCallback: () => void = () => { }
	): void {
		if (this.config.store?.prefix) {
			hold = this.config.store?.prefix + hold
		}

		if (this._prefix) {
			hold = this._prefix + hold
		}

		if (this.config.store?.set) {
			this.config.store.set(hold, value, callback, errCallback);
		} else {
			try { this.core.localStorage.setItem('temp_storage_' + hold, value); }
			catch (e) { errCallback(); }
			callback();
		}
	}

	async setAsync(
		hold: string,
		value: string,
	): Promise<boolean> {
		if (this.config.store?.prefix) {
			hold = this.config.store.prefix + hold;
		}

		try {
			if (this.config.store?.set) {
				return this.config.store.set(hold, value);
			} else {
				this.core.localStorage.setItem(hold, value);

				return true;
			}
		} catch (err) {
			console.error(err);

			return false;
		}
	}

	get(
		hold: string,
		callback: (value: string) => void = () => { },
		errCallback: () => void = () => { }
	): any {
		if (this.config.store?.prefix) {
			hold = this.config.store?.prefix + hold
		}

		if (this._prefix) {
			hold = this._prefix + hold
		}

		if (this.config.store?.get) {
			this.config.store.get(hold, callback, errCallback);
		} else {
			callback(this.core.localStorage.getItem('temp_storage_' + hold) || '');
		}
	}

	async getAsync(
		hold: string,
	): Promise<string> {
		if (this.config.store?.prefix) {
			hold = this.config.store.prefix + hold;
		}

		try {
			if (this.config.store?.get) {
				return this.config.store.get(hold);
			} else {
				const value = this.core.localStorage.getItem(hold) || '';

				return value;
			}
		} catch (err) {
			console.error(err);

			return '';
		}
	}

	setJson(
		hold: string,
		value: any,
		callback: () => void = () => { },
		errCallback: () => void = () => { }
	) {
		value = JSON.stringify(value);

		this.set(hold, value, callback, errCallback);
	}

	async setJsonAsync(
		hold: string,
		value: unknown,
	): Promise<boolean> {
		return this.setAsync(hold, JSON.stringify(value));
	}

	getJson(
		hold: string,
		callback: (value: any) => void = () => { },
		errCallback: () => void = () => { }
	) {
		this.get(hold, (value: string) => {
			if (value) {
				try {
					value = JSON.parse(value);
				} catch (e) { }

				callback(typeof value === 'object' && value || null);
			} else {
				callback(null);
			}
		}, errCallback);
	}

	async getJsonAsync<T = any>(hold: string): Promise<T | null> {
		let value: string | null = await this.getAsync(hold);

		if (value) {
			try {
				value = JSON.parse(value as string);
			} catch (err) { }

			return value as T;
		} else {

			return null;
		}
	}

	async remove(hold: string, cb?: () => void, errCb?: () => void): Promise<boolean> {
		if (this.config.store?.prefix) {
			hold = this.config.store.prefix + hold;
		}

		try {
			if (this.config.store?.remove) {
				await this.config.store.remove(hold, cb, errCb);
			} else {
				this.core.localStorage.removeItem(hold);
			}

			cb?.();

			return true;
		} catch (err) {
			console.error(err);

			errCb?.();

			return false;
		}
	}

	async clear(cb?: () => void, errCb?: () => void): Promise<boolean> {
		try {
			if (this.config.store?.clear) {
				this.config.store.clear();
			} else {
				this.core.localStorage.clear();
			}

			cb?.();

			return true;
		} catch (err) {
			console.error(err);

			errCb?.();

			return false;

		}
	}
}
