import { Injectable } from '@angular/core';
import { CoreService } from './core.service';
@Injectable({
	providedIn: 'root'
})
export class UiService {
	public var:any = {};
	constructor(public core: CoreService){
		this.variables = this.core.localStorage.getItem('css_variables') && JSON.parse(this.core.localStorage.getItem('css_variables')) || {}
		for (let key in this.variables){
			this.setProperty(key, this.variables[key]);
		}
	}
	/* Forms Management */
		private _forms:any = {};
		public form(id){
			if(typeof id != 'string') return {};
			if(!this._forms[id]) this._forms[id]={};
			// add more cool things or submiting, etc
			return this._forms[id];
		}
		public valid(value, kind='email', extra:any=''){
			if(kind=='email'){
				return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value||'');
			}else if(kind=='text'){
				return typeof value == 'string';
			}else if(kind=='array'){
				return Array.isArray(value);
			}else if(kind=='object'){
				if(typeof value == 'object' && !Array.isArray(value) && value!=null){
					return true;
				}
			}else if(kind=='number'){
				return typeof value == 'number';
			}else if(kind=='password'){
				if(!value) return false;
				if(extra == 1){
					return /^((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9]))/.test(value||'');
				}else if(extra == 2){
					return /^(((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})/.test(value||'');
				}else if(extra == 3){
					return /^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))(?=.{8,})/.test(value||'');
				}else if(extra == 4){
					return /^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&!-_]))(?=.{8,})/.test(value||'');
				}else return !!value;
			}else if(kind=='password'){
				if(!value) return 0;
				let counter = 0;
				if(/^((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9]))/.test(value||'')){
					counter++;
				}else if(/^(((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})/.test(value||'')){
					counter++;
				}else if(/^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))(?=.{8,})/.test(value||'')){
					counter++;
				}else if(/^((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@#$%&!-_]))(?=.{8,})/.test(value||'')){
					counter++;
				}
				return counter;
			}
			return false;
		}
	/* Css Management*/
		private variables:any = {};
		private save(){
			this.core.localStorage.setItem('css_variables', JSON.stringify(this.variables));
		}
		private setProperty(key, value){
			this.core.document.documentElement.style.setProperty(key, value);
		}
		public set(variables, opts:any={}){
			if(typeof opts == 'string'){
				if(opts == 'local') opts = {local: true};
				else{
					opts = { host: opts };
				}
			}
			if(opts.host && this.core.window.location.host != opts.host) return;
			if(Array.isArray(variables)){
				for (let i = 0; i < variables.length; i++){
					if( opts.local ){
						this.variables[variables[i].key] = variables[variables[i].value];
					}else if( this.variables[variables[i].key] ) continue;
					this.setProperty(variables[i].key, variables[i].value);
				}
			}else if(typeof variables == 'object'){
				for (let key in variables){
					if(opts.local){
						this.variables[key] = variables[key];
					}else if( this.variables[key] ) continue;
					this.setProperty(key, variables[key]);
				}
			}
			if(opts.local) this.save();
		}
		public get(){ return this.variables };
		public remove(key:any){
			if(typeof key == 'string') key = key.split(' ');
			for (let i = 0; i < key.length; i++){
				delete this.variables[key[i]];
			}
			this.save();
		}
		public arr(arrLen=10, type:any='number'){
			let arr = [];
			for (let i = 0; i < arrLen; i++){
				if(type == 'number'){
					arr.push(i+1);
				}else if (type == 'text'){
					arr.push(this.text());
				}else if(type == 'date'){
					arr.push(new Date(new Date().getTime()+(i*86400000)));
				}else{
					arr.push(type);
				}
			}
			return arr;
		}
		public text(arrLen=10){
			let result = '';
			let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			let charactersLength = characters.length;
			for ( let i = 0; i < arrLen; i++ ) {
				result += characters.charAt(Math.floor(Math.random() * charactersLength));
			}
			return result;
		}
	/* End Of Management*/
}