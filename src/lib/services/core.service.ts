import { Router, NavigationEnd } from '@angular/router';
import { Injectable } from '@angular/core';
declare var window:any;

@Injectable({
	providedIn: 'root'
})
export class CoreService {
	private serial_process(i, arr, callback){
		if(i>=arr.length) return callback();
		arr[i](()=>{
			this.serial_process(++i, arr, callback);
		});
	}
	public device:any;
	constructor(private router: Router) {
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;
		if (/windows phone/i.test(userAgent)) {
			this.device = "windows";
		}else if (/android/i.test(userAgent)) {
			this.device = "android";
		}else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
			this.device = "ios";
		}else this.device = "web";
	}
	public url( cb:any=()=>{}, replace:any=null ){
		this.router.events.subscribe((e: any) => {
			if (e instanceof NavigationEnd) {
				let path = window.location.pathname;
				if(typeof replace == 'string'){
					path = path.replace(replace, '');
				}else if(Array.isArray(replace)){
					for (let i = 0; i < replace.length; i++){
						path = path.replace(replace[i], '');
					}
				}
				cb(path);
			}
		});
	}
	public host:any = window.location.host.toLowerCase();
	public parallel(arr, callback){
		let counter = arr.length;
		if(counter===0) return callback();
		for (let i = 0; i < arr.length; i++) {
			arr[i](function(){
				if(--counter===0) callback();
			});
		}
	}
	public serial(arr, callback){
		this.serial_process(0, arr, callback);
	}
	public each(arrOrObj, func, callback, isSerial=false){
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
					serialArr.push(function(next){
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
				let arr = [];
				for(let each in arrOrObj){
					arr.push({
						value: arrOrObj[each],
						each: each
					});
				}
				let counter = arr.length;
				for (let i = 0; i < arr.length; i++) {
					serialArr.push(function(next){
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
	public afterWhile(doc, cb, time=1000){
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
	private cb:any = {};
	public emit(signal, doc:any={}){
		if(!this.cb[signal]) this.cb[signal] = {};
		for (let each in this.cb[signal]){
			if(typeof this.cb[signal][each] == 'function'){
				this.cb[signal][each](doc);
			}
		}
	}
	private _ids:any = {};
	public on(signal, cb){
		let id = Math.floor(Math.random() * Date.now()) + 1;
		if(this._ids[id]) return this.on(signal, cb);
		this._ids[id]=true;
		if(!this.cb[signal]) this.cb[signal] = {};
		this.cb[signal][id] = cb;
		return ()=>{
			this.cb[signal][id] = null;
		}
	}
	/* once Signal when something is ready */
	private done_next:any = {};
	public done(signal) {
		this.done_next[signal] = true;
	};
	public next(signal, cb) {
		if(this.done_next[signal]) cb();
		else {
			return setTimeout(()=>{
				this.next(signal, cb);
			}, 100);
		}
	};
	/*
	public for(arr, cb, i=0, field=[], counter=[], lead:any){
		if(i < arr.length){
			if(Array.isArray(arr[i])){
				for (let k = 0; k < arr[i].length; k++){
					if(field.length<i+1) field.push(arr[i][k]);
					else field[i] = arr[i][k];
					if(counter.length<i+1) counter.push(k);
					else counter[i] = k;
					this.for(arr, cb, i+1, field, counter, arr[i]);
				}
			}else if(typeof arr[i] == 'string'){
				if(Array.isArray(lead[arr[i]])){
					for (let k = 0; k < lead[arr[i]].length; k++){
						if(field.length<i+1) field.push(lead[arr[i]][k]);
						else field[i] = lead[arr[i]][k];
						if(counter.length<i+1) counter.push(k);
						else counter[i] = k;
						this.for(arr, cb, i+1, field, counter, lead[arr[i]]);
					}
				}else{
					if(field.length<i+1) field.push(null);
					else field[i] = null;
					if(counter.length<i+1) counter.push(null);
					else counter[i] = null;
					this.for(arr, cb, i+1, field, counter, lead[arr[i]]);
				}
			}
		} else cb(field, counter);
	}
	*/
}
