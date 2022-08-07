import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import { CoreService } from './core.service';
const window:any = {};

@Injectable({
	providedIn: 'root'
})
export class StoreService {
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
		if (
			this.config.store &&
			this.config.store.set
		) {
			this.config.store.set(hold, value, callback, errCallback);
		} else {
			try { this.core.localStorage.setItem('temp_storage_'+hold, value); }
			catch(e){ errCallback(); }
			callback();
		}
	}
	get(
		hold: string,
		callback: (value: string) => void = () => { },
		errCallback: () => void = () => { }
	): any {
		if (
			this.config.store &&
			this.config.store.get
		) {
			this.config.store.get(hold, callback, errCallback);
		} else {
			callback(this.core.localStorage.getItem('temp_storage_'+hold)||'');
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
	getJson(
		hold: string,
		callback: (value: object | null) => void = () => { },
		errCallback: () => void = () => { }
	){
		this.get(hold, (value:string) => {
			if (value) {
				try {
					value = JSON.parse(value);
				} catch(e) {}
				callback(typeof value === 'object' && value || null);
			} else {
				callback(null);
			}
		}, errCallback);
	}
	remove(
		hold: string,
		callback: () => void = () => { },
		errCallback: () => void = () => { }
	): void {
		if (
			this.config.store &&
			this.config.store.remove
		) {
			this.config.store.remove(hold, callback, errCallback);
		} else {
			this.core.localStorage.removeItem('temp_storage_'+hold);
			callback();
		}
	}
	clear(
		callback: () => void = () => { },
		errCallback: () => void = () => { }
	): any {
		if (
			this.config.store &&
			this.config.store.clear
		) {
			this.config.store.clear(callback, errCallback);
		} else {
			this.core.localStorage.clear();
			callback();
		}
	}
}
