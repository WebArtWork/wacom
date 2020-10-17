import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
declare var window:any;
@Injectable({
	providedIn: 'root'
})
export class StoreService {
	private db:any = null;
	constructor(@Inject(CONFIG_TOKEN) @Optional() private config: Config) {
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
			document.addEventListener('deviceready', () => {
				if(window.sqlitePlugin){
					this.db = window.sqlitePlugin.openDatabase({
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
			if(window.sqlitePlugin){
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
				try { localStorage.setItem('waw_temp_storage_'+hold, value); }
				catch(e){ errCb(); }
				cb();
			}
		}
		get(hold, cb:any=()=>{}, errcb:any=()=>{}){
			if(window.sqlitePlugin){
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
				cb(localStorage.getItem('waw_temp_storage_'+hold)||'');
			}
		}
		remove(hold, cb:any=()=>{}, errcb:any=()=>{}){
			if(window.sqlitePlugin){
				if(!this.db)
					return setTimeout(()=>{
						this.remove(hold);
					}, 100);
				this.db.executeSql('DELETE FROM Data where hold=?', [hold], cb, errcb);	
			}else{
				localStorage.removeItem('waw_temp_storage_'+hold);
				cb();
			}
		}
		clear(cb:any=()=>{}, errcb:any=()=>{}){
			localStorage.clear();
			if(window.sqlitePlugin){
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
		private set_docs(type){
			let docs = [];
			for (let each in this.data[type].by_id){
			    docs.push(each);
			}
			this.set(type+'_docs', JSON.stringify(docs));
		}
		private add_doc(type, doc){
			for (let each in doc){
			    this.data[type].by_id[doc[this._id]][each] = doc[each];
			}
			let add = true;
			this.data[type].all.forEach(selected=>{
				if(selected[this._id] == doc[this._id]) add = false;
			});
			if(add) this.data[type].all.push(this.data[type].by_id[doc[this._id]]);
		}
		private initialize(collection){
			if(!collection.all) collection.all=[];
			if(!collection.by_id) collection.by_id={};
			this.data[collection.name] = collection;
			this.get(collection.name+'_docs', docs=>{
				if(!docs) return;
				docs = JSON.parse(docs);
				for (let i = 0; i < docs.length; i++){
					this.add_doc(collection.name, this.get_doc(collection.name, docs[i]));
				}
			});
		}
		get_docs(type:string, doc:object){
			return this.data[type].all;
		}
		get_doc(type:string, _id:string){
			if(!this.data[type].by_id[_id]){
				this.data[type].by_id[_id] = {};
				this.data[type].by_id[_id][this._id] = _id;
				this.get(type+'_'+_id, doc=>{
					if(!doc) return;
					for (let each in doc){
						this.data[type].by_id[_id][each] = doc[each]
					}
				});
			}
			return this.data[type].by_id[_id];
		}
		private replace(doc, each, exe){
			doc[each] = exe(doc, value=>{
				doc[each] = value;
			});
		}
		set_doc(type:string, doc:object){
			if(!this.data[type].by_id[doc[this._id]]){
				this.data[type].by_id[doc[this._id]] = {};
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
			this.set(type+'_'+doc[this._id], doc);
			this.add_doc(type, doc);
			this.set_docs(type);
			return this.data[type].by_id[doc[this._id]];
		}
		remove_doc(_id){

		}
	/* End of Store Service */
}