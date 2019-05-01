// find . -name "*.spec.ts" -type f -delete
import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class HashService {
	private replaces = [{
		from: '%20',
		to: ' '
	}];
	public hash = {};
	private done: boolean = false;
	constructor() {
		if(!window.location.hash){
			this.done = true;
			return;
		}
		let hash:any = window.location.hash.replace('#!#', '').replace('#', '').split('&');
		for(let i = 0; i < hash.length; i++){
			let holder = hash[i].split('=')[0];
			let value = hash[i].split('=')[1];
			for(let j = 0; j < this.replaces.length; j++){
				holder = holder.split(this.replaces[j].from).join(this.replaces[j].to);
				value = value.split(this.replaces[j].from).join(this.replaces[j].to);
			}
			this.hash[holder] = value;
		}
		this.done = true;
	}
	on(field, cb = resp=>{}){
		if(!this.done) return setTimeout(()=>{
			this.on(field, cb);
		}, 100);
		cb(this.hash[field]);
	}
	save(){
		let hash = '';
		for(let each in this.hash){
			if(hash) hash += '&';
			hash += each + '=' + this.hash[each];
		}
		window.location.hash = hash;
	}
	set(field, value){
		this.hash[field] = value;
		this.save();
	}
	clear(field){
		delete this.hash[field];
		this.save();
	}
}
