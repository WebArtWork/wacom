// find . -name "*.spec.ts" -type f -delete
import { Injectable } from '@angular/core';
import { CoreService } from './core.service';
@Injectable({
	providedIn: 'root',
})
export class HashService {
	private replaces = [
		{
			from: '%20',
			to: ' ',
		},
	];
	public hash: any = {};
	private done: boolean = false;
	constructor(public core: CoreService) {
		if (!this.core.window.location.hash) {
			this.done = true;
			return;
		}
		this.load();
		this.done = true;
	}
	load() {
		this.hash = {};
		let hash: any = this.core.window.location.hash
			.replace('#!#', '')
			.replace('#', '')
			.split('&');
		for (let i = 0; i < hash.length; i++) {
			let holder = hash[i].split('=')[0];
			let value = hash[i].split('=')[1];
			for (let j = 0; j < this.replaces.length; j++) {
				holder = (holder || '')
					.split(this.replaces[j].from)
					.join(this.replaces[j].to);
				value = (value || '')
					.split(this.replaces[j].from)
					.join(this.replaces[j].to);
			}
			this.hash[holder] = value;
		}
	}
	on(field: any, cb = (resp: any) => {}): any {
		if (!this.done)
			return setTimeout(() => {
				this.on(field, cb);
			}, 100);
		cb(this.hash[field]);
	}
	save() {
		let hash = '';
		for (let each in this.hash) {
			if (hash) hash += '&';
			hash += each + '=' + this.hash[each];
		}
		this.core.window.location.hash = hash;
	}
	set(field: any, value: any) {
		this.hash[field] = value;
		this.save();
	}
	get(field: any) {
		return this.hash[field];
	}
	clear(field?: any) {
		if (field) delete this.hash[field];
		else this.hash = {};
		this.save();
	}
}
