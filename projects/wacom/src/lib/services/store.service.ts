import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import { CoreService } from './core.service';
const window:any = {};

@Injectable({
	providedIn: 'root'
})
export class StoreService {
	private db:any = null;
	private store:any = null;
	constructor(public core: CoreService, @Inject(CONFIG_TOKEN) @Optional() private config: Config) {
		if(!this.config) this.config = DEFAULT_CONFIG;
		/* IndexedDB Initialize */
		if(!this.core.ssr) {
			window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
			window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};
			window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
		}
		if (window.indexedDB) {
			const request = window.indexedDB.open("database", 3);
			request.onsuccess = function(event) {
				this.store = event.target.result.createObjectStore("Data", {
					keyPath: "id"
				});
			};
		} else {
			this.core.document.addEventListener('deviceready', () => {
				if(this.core.window.sqlitePlugin){
					this.db = this.core.window.sqlitePlugin.openDatabase({
						location: 'default',
						name: 'data'
					});
					if(!this.db) return;
					this.db.transaction((tx: any) => {
						tx.executeSql('CREATE TABLE IF NOT EXISTS Data (hold, value)');
						tx.executeSql("INSERT INTO Data (hold, value) VALUES (?,?)", ["test", "100"], (tx: any, res: any) => {
							// Initialize
						}, (e: any) => {});
					}, (error: any) => {
					}, () => {});
				}
			});
		}
	}
	set(hold: any, value: any, cb:any=()=>{}, errCb:any=()=>{}): any {
		if(this.store) {
			const objectStore = db.transaction(["Data"], "readwrite").objectStore("Data");
			const request = objectStore.get(hold);
			request.onerror = errCb;
			request.onsuccess = function(event) {
				if (event.target.result) {
					event.target.result.data = value;
					const requestUpdate = objectStore.put(event.target.result);
					requestUpdate.onerror = errCb;
					requestUpdate.onsuccess = cb;
				} else {
					objectStore.add({
						id: hold,
						data: value
					});
				}
			};
		} else if (this.core.window.sqlitePlugin && this.db){
			this.get(hold, (resp: any)=>{
				if(resp) {
					this.db.transaction((tx: any) => {
						tx.executeSql("UPDATE Data SET value=? WHERE hold=?", [value, hold], cb, cb);
					}, errCb);
				} else {
					this.db.transaction((tx: any) => {
						tx.executeSql('INSERT INTO Data (hold, value) VALUES (?, ?)', [hold, value], cb, cb);
					}, errCb);
				}
			});
		} else {
			try { this.core.localStorage.setItem('temp_storage_'+hold, value); }
			catch(e){ errCb(); }
			cb();
		}
	}
	get(hold: any, cb:any=()=>{}, errcb:any=()=>{}): any {
		if (this.store) {
			const transaction = db.transaction(["Data"]);
			const objectStore = transaction.objectStore("Data");
			const request = objectStore.get(hold);
			request.onerror = errcb;
			request.onsuccess = function(event) {
				cb(event.target.result.data);
			};
		} else if (this.core.window.sqlitePlugin && this.db) {
			this.db.executeSql('SELECT value FROM Data where hold=?', [hold], (rs: any)=>{
				if(rs.rows && rs.rows.length){
					cb(rs.rows.item(0).value);
				}else{
					cb('');
				}
			}, errcb);
		}else{
			cb(this.core.localStorage.getItem('temp_storage_'+hold)||'');
		}
	}
	setJson(hold:any, value:any, cb:any=()=>{}, errCb:any=()=>{}){
		value = JSON.stringify(value);
		this.set(hold, value, cb, errCb);
	}
	getJson(hold:any, cb:any=()=>{}, errcb:any=()=>{}){
		this.get(hold, (value:any)=>{
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
	remove(hold:any, cb:any=()=>{}, errcb:any=()=>{}): any {
		if (this.store) {
			const transaction = db.transaction(["Data"]);
			const objectStore = transaction.objectStore("Data");
			const request = objectStore.delete(hold);
			request.onerror = errcb;
			request.onsuccess = cb;
		} else if(this.core.window.sqlitePlugin && this.db){
			this.db.executeSql('DELETE FROM Data where hold=?', [hold], cb, errcb);
		}else{
			this.core.localStorage.removeItem('temp_storage_'+hold);
			cb();
		}
	}
	clear(cb:any=()=>{}, errcb:any=()=>{}): any {
		this.core.localStorage.clear();
		if (this.store) {

		}
		if (this.core.window.sqlitePlugin && this.db) {
			this.db.executeSql('DROP TABLE IF EXISTS Data', [], (rs:any)=>{
				this.db.executeSql('CREATE TABLE IF NOT EXISTS Data (hold, value)', [], cb, errcb);
			}, errcb);
		}
	}
}
