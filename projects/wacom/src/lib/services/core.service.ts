import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { retryWhen } from 'rxjs';
declare var cordova:any;
@Injectable({
	providedIn: 'root'
})
export class CoreService {
	public ssr = isPlatformServer(this.platformId);
	public localStorage:any; // = localStorage;
	public document:any; // = document;
	public window:any; // = window;
	public navigator:any; // = navigator;
	//public cordova:any; // = cordova;
	constructor(@Inject(PLATFORM_ID) private platformId:boolean) {
		console.log(this.ids2id('a', 'b'));
		if(isPlatformServer(this.platformId)){
			this.localStorage = {
				getItem:()=>{},
				setItem:()=>{},
				removeItem:()=>{},
				clear:()=>{}
			};;
			this.document = {
				querySelectorAll: ()=>{},
				addEventListener: ()=>{},
				removeEventListener: ()=>{},
				documentElement: {},
				body: {},
			};;
			this.window = {
				location: {
					host: ''
				},
				addEventListener: ()=>{},
				removeEventListener: ()=>{},
				setTimeout: ()=>{}
			};;
			this.navigator = {
				userAgent: '',
				platform: ''
			};
		}else{
			this.localStorage = localStorage;
			this.document = document;
			this.window = window;
			this.navigator = navigator;
		}
		this.host = this.window.location.host.toLowerCase();
		var userAgent = this.navigator.userAgent || this.navigator.vendor || this.window.opera;
		if (/windows phone/i.test(userAgent)) {
			this.device = "windows";
		}else if (/android/i.test(userAgent)) {
			this.device = "android";
		}else if (this.ios()) {
			this.device = "ios";
		}else this.device = "web";
		this.set_version();
	}
	public host:any;
	public device:any;
	public version:any;
	public set_version(version='1.0.0'){
		this.version = version;
		this.document.addEventListener('deviceready', () => {
			this.done('mobile');
			if(!cordova.getAppVersion) return;
			cordova.getAppVersion.getVersionNumber((version:string)=>{
				this.version = version;
			});
		});
	}
	ios() {
		return [
			'iPad Simulator',
			'iPhone Simulator',
			'iPod Simulator',
			'iPad',
			'iPhone',
			'iPod'
		].includes(this.navigator.platform)
		// iPad on iOS 13 detection
		|| (this.navigator.userAgent.includes("Mac") && "ontouchend" in document)
	}
	/*
	*	Pipes
	*/
		ota(obj: any, holder?:boolean): any {
			if(Array.isArray(obj)) return obj;
			if(typeof obj != 'object') return [];
			let arr = [];
			for(let each in obj){
				if(obj[each]){
					if(holder) arr.push(each);
					else arr.push(obj[each]);
				}
			}
			return arr;
		}
	/*
	*	Supportive
	*/
		public ids2id(...args:any[]) {
			args.sort( (a, b) => {
				if (Number(a.toString().substring(0, 8)) > Number(b.toString().substring(0, 8))){
					return 1;
				}
				return -1;
			});
			return args.join();
		}
		public parallel(arr: any[], callback:()=>void){
			let counter = arr.length;
			if(counter===0) return callback();
			for (let i = 0; i < arr.length; i++) {
				arr[i](function(){
					if(--counter===0) callback();
				});
			}
		}
		private serial_process(i:number, arr:any[], callback:()=>void){
			if(i>=arr.length) return callback();
			arr[i](()=>{
				this.serial_process(++i, arr, callback);
			});
		}
		public serial(arr:any[], callback:()=>void){
			this.serial_process(0, arr, callback);
		}
		public each(arrOrObj:any, func:any, callback:()=>void, isSerial=false){
			if(typeof callback == 'boolean'){
				isSerial = callback;
				callback = ()=>{};
			}
			if(Array.isArray(arrOrObj)){
				let counter = arrOrObj.length;
				if(counter===0) return callback();
				if(isSerial){
					let serialArr = [];
					for (let i = 0; i < arrOrObj.length; i++) {
						serialArr.push(function(next:()=>void){
							func(arrOrObj[i], function(){
								if(--counter===0) callback();
								else next();
							}, i);
						});
					}
					this.serial_process(0, serialArr, callback);
				}else{
					for (let i = 0; i < arrOrObj.length; i++) {
						func(arrOrObj[i], function(){
							if(--counter===0) callback();
						}, i);
					}
				}
			}else if(typeof arrOrObj == 'object'){
				if(isSerial){
					let serialArr = [];
					let arr:any = [];
					for(let each in arrOrObj){
						arr.push({
							value: arrOrObj[each],
							each: each
						});
					}
					let counter = arr.length;
					for (let i = 0; i < arr.length; i++) {
						serialArr.push(function(next:()=>void){
							func(arr[i].each, arr[i].value, function(){
								if(--counter===0) callback();
								else next();
							}, i);
						});
					}
					this.serial_process(0, serialArr, callback);
				}else{
					let counter = 1;
					for(let each in arrOrObj){
						counter++;
						func(each, arrOrObj[each], function(){
							if(--counter===0) callback();
						});
					}
					if(--counter===0) callback();
				}
			}else callback();
		}
		private _afterWhile:any = {};
		public afterWhile(doc:any, cb:()=>void, time=1000){
			if(typeof doc == 'function'){
				cb = doc;
				doc = 'common';
			}
			if(typeof doc == 'string'){
				if(!this._afterWhile[doc]) this._afterWhile[doc]={};
				doc = this._afterWhile[doc];
			}
			if(typeof cb == 'function' && typeof time == 'number'){
				clearTimeout(doc.__updateTimeout);
				doc.__updateTimeout = setTimeout(cb, time);
			}
		};
		// Signal
		private cb:any = {};
		public emit(signal:string, doc:any={}){
			if(!this.cb[signal]) this.cb[signal] = {};
			for (let each in this.cb[signal]){
				if(typeof this.cb[signal][each] == 'function'){
					this.cb[signal][each](doc);
				}
			}
		}
		private _ids:any = {};
		public on(signal:string, cb:any):any {
			if (typeof cb !== 'function') return;
			let id = Math.floor(Math.random() * Date.now()) + 1;
			if(this._ids[id]) return this.on(signal, cb);
			this._ids[id]=true;
			if(!this.cb[signal]) this.cb[signal] = {};
			this.cb[signal][id] = cb;
			return ()=>{
				this.cb[signal][id] = null;
			}
		}
		// On Done
		private done_next:any = {};
		public done(signal:string, doc:any = true) {
			this.done_next[signal] = doc;
		};
		public ready(signal:string){
			return this.done_next[signal];
		};
		public next(signal:string, cb:(message:any)=>void) {
			if (this.done_next[signal]) cb(this.done_next[signal]);
			else {
				setTimeout(()=>{
					this.next(signal, cb);
				}, 100);
			}
		};

		private locked:any = {};
		public lock(which:any, func:any){
			if(typeof which === 'object' && which.__locked) return;
			else if(this.locked[which]) return;
			if(typeof which === 'object') which.__locked = true;
			else this.locked[which] = true;
			func(()=>{
				if(typeof which === 'object') which.__locked = false;
				else this.locked[which] = false;
			});
		}
	/* End of Core*/
}
