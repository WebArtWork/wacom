import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import { CoreService } from './core.service';

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

	async set(
		hold: string,
		value: string,
		cb?: () => void,
		errCb?: () => void
	): Promise<boolean> {
		if (this.config.store?.prefix) {
			hold = this.config.store.prefix + hold;
		}

		try {
			if (this.config.store?.set) {
				return this.config.store.set(hold, value, cb, errCb);
			} else {
				this.core.localStorage.setItem(hold, value);

				cb && cb();

				return true;
			}
		} catch (err) {
			console.error(err);

			errCb && errCb();

			return false;
		}
	}

	async get(
		hold: string,
		cb?: (value: string) => void,
		errCb?: () => void
	): Promise<string> {
		if (this.config.store?.prefix) {
			hold = this.config.store.prefix + hold;
		}

		try {
			if (this.config.store?.get) {
				return this.config.store.get(hold, cb, errCb);
			} else {
				const value = this.core.localStorage.getItem(hold) || '';

				cb && cb(value);

				return value;
			}
		} catch (err) {
			console.error(err);

			errCb && errCb();

			return '';
		}
	}


	async setJson(
		hold: string,
		value: unknown,
		cb?: () => void,
		errCb?: () => void
	): Promise<boolean> {
		return this.set(hold, JSON.stringify(value), cb, errCb);
	}

	async getJson(
		hold: string,
		cb?: (value: any) => void,
		errCb?: () => void
	): Promise<any> {
		let value: any = await this.get(hold, undefined, errCb);

		if (value) {
			try {
				value = JSON.parse(value as string);
			} catch (err) {}

			cb && cb(value);

			return value;
		} else {
			cb && cb(null);

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

			cb && cb();

			return true;
		} catch (err) {
			console.error(err);

			errCb && errCb();

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

			cb && cb();

			return true;
		} catch (err) {
			console.error(err);

			errCb && errCb();

			return false;

		}
	}
}
