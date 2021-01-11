import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import { CoreService } from './core.service';
@Injectable({
	providedIn: 'root'
})
export class StoreService {
	private db:any = null;
	constructor(public core: CoreService, @Inject(CONFIG_TOKEN) @Optional() private config: Config) {
		if(!this.config) this.config = DEFAULT_CONFIG;
		/* Database Management*/
			if(!this.config.database) this.config.database={};
			if(this.config.database._id) this._id = this.config.database._id;
			if(Array.isArray(this.config.database.collections)){
				for (let i = 0; i < this.config.database.collections.length; i++){
					this.initialize(this.config.database.collections[i]);
				}
			}
		/* SQL Management*/
			this.core.document.addEventListener('deviceready', () => {
				if(this.core.window.sqlitePlugin){
					this.db = this.core.window.sqlitePlugin.openDatabase({
						location: 'default',
						name: 'data'
					});
					if(!this.db) return;
					this.db.transaction((tx) => {
						tx.executeSql('CREATE TABLE IF NOT EXISTS Data (hold, value)');
						tx.executeSql("INSERT INTO Data (hold, value) VALUES (?,?)", ["test", "100"], (tx, res) => {
							// Initialize
						}, (e) => {});
					}, (error) => {
					}, () => {});
				}
			});
		/* End Of Contructor*/
	}
	/* Storage Management */
		set(hold, value, cb:any=()=>{}, errCb:any=()=>{}){
			if(this.core.window.sqlitePlugin){
				if(!this.db){
					return setTimeout(()=>{
						this.set(hold, value, cb);
					}, 100);
				} 
				this.get(hold, resp=>{
					if(resp){
						this.db.transaction((tx) => {
							tx.executeSql("UPDATE Data SET value=? WHERE hold=?", [value, hold], cb, cb);
						}, errCb);
					}
					else{
						this.db.transaction((tx) => {
							tx.executeSql('INSERT INTO Data (hold, value) VALUES (?, ?)', [hold, value], cb, cb);
						}, errCb);
					}
				});
			}else{
				try { this.core.localStorage.setItem('waw_temp_storage_'+hold, value); }
				catch(e){ errCb(); }
				cb();
			}
		}
		get(hold, cb:any=()=>{}, errcb:any=()=>{}){
			if(this.core.window.sqlitePlugin){
				if(!this.db){
					return setTimeout(()=>{
						this.get(hold, cb);
					}, 100);
				} 
				this.db.executeSql('SELECT value FROM Data where hold=?', [hold], (rs)=>{
					if(rs.rows && rs.rows.length){
						cb(rs.rows.item(0).value);
					}else{
						cb('');
					}
				}, errcb);	
			}else{
				cb(this.core.localStorage.getItem('waw_temp_storage_'+hold)||'');
			}
		}
		remove(hold, cb:any=()=>{}, errcb:any=()=>{}){
			if(this.core.window.sqlitePlugin){
				if(!this.db)
					return setTimeout(()=>{
						this.remove(hold);
					}, 100);
				this.db.executeSql('DELETE FROM Data where hold=?', [hold], cb, errcb);	
			}else{
				this.core.localStorage.removeItem('waw_temp_storage_'+hold);
				cb();
			}
		}
		clear(cb:any=()=>{}, errcb:any=()=>{}){
			this.core.localStorage.clear();
			if(this.core.window.sqlitePlugin){
				if(!this.db){
					return setTimeout(()=>{
						this.clear();
					}, 100);
				}
				this.db.executeSql('DROP TABLE IF EXISTS Data', [], (rs)=>{
					this.db.executeSql('CREATE TABLE IF NOT EXISTS Data (hold, value)', [], cb, errcb);
				}, errcb);
			}
		}
	/* Document Management */
		private data:any = {};
		private _id:string = '_id';
		private store_docs(name){
			let docs = [];
			for (let each in this.data[name].by_id){
			    docs.push(each);
			}
			this.set(name+'_docs', JSON.stringify(docs));
		}
		private add_doc(name, doc){
			let _id = this.data[name]._id || this._id;
			for (let each in doc){
			    this.data[name].by_id[doc[_id]][each] = doc[each];
			}
			let add = true;
			this.data[name].all.forEach(selected=>{
				if(selected[_id] == doc[_id]) add = false;
			});
			if(add){
				this.data[name].all.push(this.data[name].by_id[doc[_id]]);
				// if(this.data[name].opts.sort == 'string' &&
				// 	typeof this[this.data[name].opts.sort] == 'function'){
				// 	this.data[name].all.sort(this[this.data[name].opts.sort](_id));
				// }else 
				if(typeof this.data[name].opts.sort == 'function'){
					this.data[name].all.sort(this.data[name].opts.sort);
				}
			}
		}
		private initialize_doc(type, doc_id){
			this.get_doc(type, doc_id, doc=>{
				this.add_doc(type, doc);
			});
		}
		private initialize(collection){
			if(!collection.opts) collection.opts={};
			if(!collection.all) collection.all=[];
			if(!collection.by_id) collection.by_id={};
			this.data[collection.name] = collection;
			this.get(collection.name+'_docs', docs=>{
				if(!docs) return;
				docs = JSON.parse(docs);
				for (let i = 0; i < docs.length; i++){
					this.initialize_doc(collection.name, docs[i]);
				}
			});
		}
		get_docs(type:string){ return this.data[type].all; }
		get_doc(type:string, _id:string, cb:any=doc=>{}){
			if(!this.data[type].by_id[_id]){
				this.data[type].by_id[_id] = {};
				this.data[type].by_id[_id][this.data[type]._id || this._id] = _id;
				this.get(type+'_'+_id, doc=>{
					if(!doc) return;
					doc = JSON.parse(doc);
					for (let each in doc){
						this.data[type].by_id[_id][each] = doc[each]
					}
					cb(this.data[type].by_id[_id]);
				});
			}else{
				cb(this.data[type].by_id[_id]);
			}
			return this.data[type].by_id[_id];
		}
		private replace(doc, each, exe){
			doc[each] = exe(doc, value=>{
				doc[each] = value;
			});
		}
		set_docs(type:string, docs:any){
			if(!Array.isArray(docs)) return;
			for (let i = 0; i < docs.length; i++){
				this.set_doc(type, docs[i]);
			}
		}
		set_doc(type:string, doc:object){
			let _id = this.data[type]._id || this._id;
			if(!this.data[type].by_id[doc[_id]]){
				this.data[type].by_id[doc[_id]] = {};
			}
			if(typeof this.data[type].opts.replace == 'function'){
				doc = this.data[type].opts.replace(doc);
			}else if(typeof this.data[type].opts.replace == 'object'){
				for (let each in this.data[type].opts.replace){
					if(typeof this.data[type].opts.replace[each] == 'function'){
						this.replace(doc, each, this.data[type].opts.replace[each]);
					}
				}
			}
			this.set(type+'_'+doc[_id], JSON.stringify(doc));
			this.add_doc(type, doc);
			this.store_docs(type);
			return this.data[type].by_id[doc[_id]];
		}
		remove_doc(type:string, _id:string){
			this.remove(type+'_'+_id);
			delete this.data[type].by_id[_id];
			this.store_docs(type);
		}
	/* sorts Management */
		public sortAscId(id='_id'){
			return function(a,b){
				if(a[id]>b[id]) return 1;
				else return -1;
			}
		};
		public sortDescId(id='_id'){
			return function(a,b){
				if(a[id]<b[id]) return 1;
				else return -1;
			}
		};
		public sortAscString(opts){
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field].toLowerCase()>b[opts.field].toLowerCase()) return 1;
				else if(a[opts.field].toLowerCase()<b[opts.field].toLowerCase() || !opts.next) return -1;
				else return opts.next(a,b);
			}
		}
		public sortDescString(opts){
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field].toLowerCase()<b[opts.field].toLowerCase()) return 1;
				else if(a[opts.field].toLowerCase()>b[opts.field].toLowerCase() || !opts.next) return -1;
				else return opts.next(a,b);
			}
		}
		public sortAscDate(opts){
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field].getTime()>b[opts.field].getTime()) return 1;
				else if(a[opts.field].getTime()<b[opts.field].getTime() || !opts.next) return -1;
				else return opts.next(a,b);
			}
		}
		public sortDescDate(opts){
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field].getTime()<b[opts.field].getTime()) return 1;
				else if(a[opts.field].getTime()>b[opts.field].getTime() || !opts.next) return -1;
				else return opts.next(a,b);
			}
		}
		public sortAscNumber(opts){
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field]>b[opts.field]) return 1;
				else if(a[opts.field]<b[opts.field] || !opts.next) return -1;
				else return opts.next(a,b);
			}
		}
		public sortDescNumber(opts){
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field]<b[opts.field]) return 1;
				else if(a[opts.field]>b[opts.field] || !opts.next) return -1;
				else return opts.next(a,b);
			}
		}
		public sortAscBoolean(opts){
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(!a[opts.field]&&b[opts.field]) return 1;
				else if(a[opts.field]&&!b[opts.field] || !opts.next) return -1;
				else return opts.next(a,b);
			}
		}
		public sortDescBoolean(opts){
			if(typeof opts == 'string'){
				opts = {
					field: opts
				}
			}
			return function(a,b){
				if(a[opts.field]&&!b[opts.field]) return 1;
				else if(!a[opts.field]&&b[opts.field] || !opts.next) return -1;
				else return opts.next(a,b);
			}
		}
	/* End of Store Service */
}