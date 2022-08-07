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
	set(hold: string, value: string, cb: () => void, errCb: () => void): void {
		if (
			this.config.store &&
			this.config.store.set
		) {
			this.config.store.set(hold, value, cb, errCb);
		} else {
			try { this.core.localStorage.setItem('temp_storage_'+hold, value); }
			catch(e){ errCb(); }
			cb();
		}
	}
	get(hold: string, cb: any = () => {}, errCb:any=()=>{}): any {
		if (
			this.config.store &&
			this.config.store.get
		) {
			this.config.store.get(hold, cb, errCb);
		} else {
			cb(this.core.localStorage.getItem('temp_storage_'+hold)||'');
		}
	}
	setJson(hold: string, value:any, cb:any=()=>{}, errCb:any=()=>{}){
		value = JSON.stringify(value);
		this.set(hold, value, cb, errCb);
	}
	getJson(hold: string, cb:any=()=>{}, errcb:any=()=>{}){
		this.get(hold, (value:string) => {
			if (value) {
				try {
					value = JSON.parse(value);
				} catch(e) {}
				cb(typeof value === 'object' && value || null);
			} else {
				cb(null);
			}
		}, errcb);
	}
	remove(hold: string, cb: any = () => { }, errCb:any=()=>{}): any {
		if (
			this.config.store &&
			this.config.store.remove
		) {
			this.config.store.remove(hold, cb, errCb);
		} else {
			this.core.localStorage.removeItem('temp_storage_'+hold);
			cb();
		}
	}
	clear(cb: any = () => { }, errCb: any = () => { }): any {
		if (
			this.config.store &&
			this.config.store.clear
		) {
			this.config.store.clear(cb, errCb);
		} else {
			this.core.localStorage.clear();
			cb();
		}
	}
}
