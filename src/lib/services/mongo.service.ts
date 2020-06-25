import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SocketService } from './socket.service';

@Injectable({
	providedIn: 'root'
})
export class MongoService {
	/*
	*	Data will be storage for all information we are pulling from waw crud.
	*	data['arr' + part] will host all docs from collection part in array form
	*	data['obj' + part] will host all docs from collection part in object form
	*		and all groups collecitons provided
	*	data['opts' + part] will host options for docs from collection part
	*		Will be initialized only inside get
	*		Will be used inside push
	*/
		private data = {};
	/*
	*	waw crud connect functions
	*/
		public config(part, opts){
			if(this.data['opts' + part]) return;
			this.data['arr' + part] = [];
			this.data['obj' + part] = {};
			this.data['opts' + part] = opts = opts||{};
			if(opts.query){
				for(let key in opts.query){
					if(typeof opts.query[key] == 'function'){
						opts.query[key] = {
							allow: opts.query[key]
						}
					}
					this.data['obj' + part][key] = [];
				}
			}
			if(opts.groups){
				if(typeof opts.groups == 'string'){
					opts.groups = opts.groups.split(' ');
				}
				if(Array.isArray(opts.groups)){
					let arr = opts.groups;
					opts.groups = {};
					for(let i = 0; i < arr.length; i++){
						if(typeof arr[i] == 'string'){
							opts.groups[arr[i]] = true;
						}else {
							for(let key in arr[i]){
								if(typeof arr[i][key] == 'function'){
									arr[i][key] = {
										field: arr[i][key]
									}
								}
								opts.groups[key] = arr[i][key];
							}
						}
					}
				}
				for(let key in opts.groups){
					if(typeof opts.groups[key] == 'boolean'){
						if(opts.groups[key]){
							opts.groups[key] = {
								field: function(doc){
									return doc[key];
								}
							}
						}else{
							delete opts.groups[key];
							continue;
						}
					}
					if(typeof opts.groups[key] != 'object'){
						delete opts.groups[key];
						continue;
					}
					if(typeof opts.groups[key].field != 'function'){
						delete opts.groups[key];
						continue;
					}
					if(Array.isArray(this.data['obj' + part][key])){
						console.warn('You can have same field groups with query. Field '+key+' is not used in groups.');
						delete opts.groups[key];
						continue;
					}
					this.data['obj' + part][key] = {};
				}
			}
		};
		public create(part, doc=undefined, cb=undefined, errCb=undefined) {
			if (typeof doc == 'function') {
				errCb = cb;
				cb = doc;
				doc = {};
			}
			this.http.post < any > ('/api/' + part + '/create', doc || {}).subscribe(resp => {
				if (resp) {
					this.socket.emit('create', {
						_id: resp._id,
						part: part
					});
					this.push(part, resp);
					if (typeof cb == 'function') cb(resp);
				}else if (typeof cb == 'function') {
					cb(false);
				}
			}, errCb||()=>{});
		};
		public fetch(part, opts=undefined, cb=undefined, errCb=undefined) {
			if (typeof opts == 'function') {
				errCb = cb;
				cb = opts;
				opts = {};
			}
			this.config(part, opts);
			let url = '/api/' + part + '/fetch'+(opts.name||'');
			this.http.post < any > (opts.url || url, (opts.query||{})).subscribe(resp => {
				this.push(part, resp);
				if (resp && typeof cb == 'function') {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			}, errCb||()=>{});
		};
		public get(part, opts=undefined, cb=undefined, errCb=undefined) {
			if (typeof opts == 'function') {
				errCb = cb;
				cb = opts;
				opts = {};
			}
			this.config(part, opts);			
			let url = '/api/' + part + '/get'+(opts.name||'')+(opts.param||'');
			this.http.get<any>(opts.url || url).subscribe(resp => {
				if (Array.isArray(resp)) {
					for (let i = 0; i < resp.length; i++) {
						this.push(part,resp[i]);
					}
					if (typeof cb == 'function') cb(this.data['arr' + part], this.data['obj' + part], opts.name||'', resp);
				} else if (typeof cb == 'function') {
					cb(this.data['arr' + part], this.data['obj' + part], opts.name||'', resp);
				}
				this.data['loaded'+part]=true;
			}, errCb||()=>{});
			return this.data['arr' + part];
		};
		public set(part, opts=undefined, resp=undefined) {
			if (Array.isArray(opts)) {
				resp = opts;
				opts = undefined;
			}
			if(opts) this.config(part, opts);
			if (Array.isArray(resp)) {
				for (let i = 0; i < resp.length; i++) {
					this.push(part, resp[i]);
				}
			}
			return {
				arr: this.data['arr' + part],
				obj: this.data['obj' + part]
			}
		};
		private prepare_update(doc, opts){
			if(opts.fields){
				if(typeof opts.fields == 'string') opts.fields = opts.fields.split(' ');
				let _doc = {};
				for(let i = 0; i < opts.fields.length; i++){
					_doc[opts.fields[i]] = doc[opts.fields[i]];
				}
				doc = _doc;
			}
			if(typeof opts.replace == 'object' && Object.values(opts.replace).length){
				doc = JSON.parse(JSON.stringify(doc));
				for(let key in opts.replace){
					this.replace(doc, key, opts.replace[key]);
				}
			}
			return doc;
		};
		public update(part, doc, opts=undefined, cb=undefined, errCb=undefined) {
			if (typeof opts == 'function'){
				errCb = cb;
				cb = opts;
				opts = {};
			}
			if(typeof opts != 'object') opts = {};
			doc = this.prepare_update(doc, opts);
			let url = '/api/' + part + '/update' + (opts.name||'');
			this.http.post(opts.url || url, doc).subscribe(resp => {
				if(resp){
					this.socket.emit('update', {
						_id: doc._id,
						part: part
					});
					this.renew(part, doc);
				}
				if (resp && typeof cb == 'function') {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			}, errCb||()=>{});
		};
		public unique(part, doc, opts=undefined, cb=undefined, errCb=undefined) {
			if (typeof opts == 'function'){
				errCb = cb;
				cb = opts;
				opts = {};
			}
			if(typeof opts != 'object') opts = {};
			doc = this.prepare_update(doc, opts);
			let url = '/api/' + part + '/unique' + (opts.name||'');
			this.http.post(opts.url || url, doc).subscribe(resp => {
				if(resp){
					this.socket.emit('update', {
						_id: doc._id,
						part: part
					});
					this.renew(part, doc);
				}
				if (resp && typeof cb == 'function') {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			}, errCb||()=>{});
		};
		public delete(part, doc, opts=undefined, cb=undefined, errCb=undefined) {
			if (typeof opts == 'function') {
				errCb = cb;
				cb = opts;
				opts = {};
			}
			if(typeof opts !== 'object') opts = {};
			if(opts.fields){
				if(typeof opts.fields == 'string') opts.fields = opts.fields.split(' ');
				let _doc = {};
				for(let i = 0; i < opts.fields.length; i++){
					_doc[opts.fields[i]] = doc[opts.fields[i]];
				}
				doc = _doc;
			}else{
				doc={
					_id:doc._id
				}
			}
			let url = '/api/' + part + '/delete' + (opts.name||'');
			this.http.post(opts.url || url, doc).subscribe(resp => {
				if (resp) {
					this.socket.emit('delete', {
						_id: doc._id,
						part: part
					});
					this.remove(part, doc);
				}
				if (resp && typeof cb == 'function') {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			}, errCb||()=>{});
		};
		public _id(cb){
			if(typeof cb == 'function'){
				this.http.get <any> ('/waw/newId').subscribe(cb);
			}
		};
		public to_id(docs){
			if(!docs) return [];
			if(Array.isArray(docs)){
				docs = docs.slice();
			}else if(typeof docs == 'object'){
				if(docs._id) return [docs._id];
				let _docs = [];
				for(let key in docs){
					if(docs[key]) _docs.push(docs[key]._id||docs[key]);
				}
				docs = _docs;
			}
			for (let i = 0; i < docs.length; ++i) {
				if(docs[i]) docs[i] = docs[i]._id || docs[i];
			}
			return docs;
		};
		public afterWhile(doc, cb, time=1000){
			if(typeof cb == 'function' && typeof time == 'number'){
				clearTimeout(doc.__updateTimeout);
				doc.__updateTimeout = setTimeout(cb, time);
			}
		};
		public populate(doc, field, part){
			if(!doc||!field||!part) return;
			if(Array.isArray(doc)){
				for(let i = 0; i < doc.length; i++){
					this.populate(doc[i], field, part);
				}
				return;
			}
			if(this.data['loaded'+part]){
				if(Array.isArray(field)){
					for(let i = 0; i < field.length; i++){
						this.populate(doc, field[i], part);
					}
					return;
				}else if(field.indexOf('.')>-1){
					field = field.split('.');
					let sub = field.shift();
					if(typeof doc[sub] != 'object') return;
					return this.populate(doc[sub], field.join('.'), part);
				}
				if(Array.isArray(doc[field])){
					for(let i = doc[field].length-1; i >= 0; i--){
						if(this.data['obj'+part][doc[field][i]]){
							doc[field][i] = this.data['obj'+part][doc[field][i]];
						}else{
							doc[field].splice(i, 1);
						}
					}
					return;
				}else if(typeof doc[field] == 'string'){
					doc[field] = this.data['obj'+part][doc[field]] || null;
				}else return;
			}else{
				setTimeout(() =>{
					this.populate(doc, field, part);
				}, 100);
			}
		};
		public on(parts, cb) {
   		    if (typeof parts == 'string') {
   		        parts = parts.split(" ");
   		    }
   		    for (var i = 0; i < parts.length; i++) {
   		        if (!this.data['loaded'+parts[i]]) {
   		            return setTimeout( () => {
   		                this.on(parts, cb);
   		            }, 100);
   		        }
   		    }
   		    cb(this.data);
   		};
   		public track(index, doc){ return doc && doc._id && doc._id || index; }
   	/*
	*	mongo sort filters
	*/
   		public sortAscId(){
   			return function(a,b){
   				if(a._id>b._id) return 1;
   				else return -1;
   			}
   		};
   		public sortDescId(){
   			return function(a,b){
   				if(a._id<b._id) return 1;
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
	/*
	*	mongo replace filters
	*/
		public beArr(val, cb){
			if(!Array.isArray(val)) cb([]);
			else cb(val);
		};
		public beObj(val, cb){
			if(typeof val != 'object' || Array.isArray(val) || !val){
				val = {};
			}
			cb(val);
		};
		public beDate(val, cb) { cb( new Date(val) ); };
		public beString(val, cb){
			if(typeof val != 'string'){
				val = '';
			}
			cb(val);
		};
		public beDoc = (val, cb)=>{
			this.beObj(val, val=>{
				if(!val._id){
					this._id(_id=>{
						val._id = _id;
						cb(val);
					});
				}else cb(val);
			});
		};
		public forceArr(val, cb){ cb([]); };
		public forceObj(val, cb){ cb({}); };
		public forceString(val, cb){ cb(''); };
		public forceDoc = (val, cb) => {
			this._id(_id=>{
				cb({
					_id: _id
				});
			});
		};
		public getCreated(val, cb, doc){ cb(new Date(parseInt(doc._id.substring(0,8), 16)*1000)); };
	/*
	*	mongo local support functions
	*/
		private replace(doc, value, rpl){
			if(value.indexOf('.')>-1){
				value = value.split('.');
				let sub = value.shift();
				if(doc[sub] && (typeof doc[sub] != 'object' || Array.isArray(doc[sub])))
					return;
				if(!doc[sub]) doc[sub] = {};
				return this.replace(doc[sub], value.join('.'), rpl);
			}
			if(typeof rpl == 'function'){
				rpl(doc[value], function(newValue){
					doc[value] = newValue;
				}, doc);
			}
		};
		public push(part, doc){
			if(this.data['obj' + part][doc._id]) return this.renew(part, doc);
			if(this.data['opts'+part].replace){
				for(let key in this.data['opts'+part].replace){
					this.replace(doc, key, this.data['opts'+part].replace[key]);
				}
			}
			if(this.data['opts'+part].populate){
				let p = this.data['opts'+part].populate;
				if(Array.isArray(p)){
					for(let i = 0; i < p.length; i++){
						if(typeof p == 'object' && p[i].field && p[i].part){
							this.populate(doc, p[i].field, p[i].part);
						}
					}
				}else if(typeof p == 'object' && p.field && p.part){
					this.populate(doc, p.field, p.part);
				}
			}
			this.data['arr' + part].push(doc);
			if(this.data['opts'+part].sort){
				this.data['arr' + part].sort(this.data['opts'+part].sort);
			}
			this.data['obj' + part][doc._id] = doc;
			if(this.data['opts'+part].groups){
				for(let key in this.data['opts'+part].groups){
					let g = this.data['opts'+part].groups[key];
					if(typeof g.ignore == 'function' && g.ignore(doc)) continue;
					if(typeof g.allow == 'function' && !g.allow(doc)) continue;
					if(!this.data['obj' + part][key]){
						this.data['obj' + part][key] = {};
					}
					let set = field => {
						if(!field) return;
						if(!Array.isArray(this.data['obj' + part][key][field])){
							this.data['obj' + part][key][field] = [];
						}
						this.data['obj' + part][key][field].push(doc);
						if(typeof g.sort == 'function'){
							this.data['obj' + part][key][field].sort(g.sort);
						}
					}
					set(g.field(doc, (field)=>{
						set(field);
					}));
				}
			}
			if(this.data['opts'+part].query){
				for(let key in this.data['opts'+part].query){
					let query = this.data['opts'+part].query[key];
					if(typeof query.ignore == 'function' && query.ignore(doc)) continue;
					if(typeof query.allow == 'function' && !query.allow(doc)) continue;
					if(!this.data['obj' + part][key]){
						this.data['obj' + part][key] = [];
					}
					this.data['obj' + part][key].push(doc);
					if(typeof query.sort == 'function'){
						this.data['obj' + part][key].sort(query.sort);
					}
				}
			}
		};
		public remove(part, doc){
			if(!Array.isArray(this.data['arr' + part])) return;
			for (let i = 0; i < this.data['arr' + part].length; i++) {
				if (this.data['arr' + part][i]._id == doc._id) {
					this.data['arr' + part].splice(i, 1);
					break;
				}
			}
			delete this.data['obj' + part][doc._id];
			if(this.data['opts'+part].groups){
				for(let key in this.data['opts'+part].groups){
					for(let field in this.data['obj' + part][key]){
						for (let i = this.data['obj' + part][key][field].length-1; i >= 0 ; i--) {
							if (this.data['obj' + part][key][field][i]._id == doc._id) {
								this.data['obj' + part][key][field].splice(i, 1);
							}
						}
					}
				}
			}
			if(this.data['opts'+part].query){
				for(let key in this.data['opts'+part].query){
					for (let i = this.data['obj' + part][key].length-1; i >= 0 ; i--) {
						if (this.data['obj' + part][key][i]._id == doc._id) {
							this.data['obj' + part][key].splice(i, 1);
							break;
						}
					}
				}
			}
		};
		public renew(part, doc){
			if(!this.data['obj' + part][doc._id]) return this.push(part, doc);
			for (let each in this.data['obj' + part][doc._id]){
				this.data['obj' + part][doc._id][each] = doc[each];
			}
			for (let each in doc){
				this.data['obj' + part][doc._id][each] = doc[each];
			}
			if(this.data['opts'+part].groups){
				for(let key in this.data['opts'+part].groups){
					let to_have = true;
					let g = this.data['opts'+part].groups[key];
					if(typeof g.ignore == 'function' && g.ignore(doc)) to_have = false;
					if(typeof g.allow == 'function' && !g.allow(doc)) to_have = false;
					if(!this.data['obj' + part][key]){
						this.data['obj' + part][key] = {};
					}
					let fields = {};
					let set = field => {
						fields[field] = true;
						if(!field) return;
						if(!Array.isArray(this.data['obj' + part][key][field])){
							this.data['obj' + part][key][field] = [];
						}
						if(to_have){
							for (let i = this.data['obj' + part][key][field].length-1; i >= 0; i--){
							    if(this.data['obj' + part][key][field][i]._id == doc._id) return;
							}
							this.data['obj' + part][key][field].push(doc);
						} else {
							for (let i = this.data['obj' + part][key][field].length-1; i >= 0; i--){
							    if(this.data['obj' + part][key][field][i]._id == doc._id){
							    	this.data['obj' + part][key][field].splice(i, 1);
							    }
							}
						}
						if(typeof g.sort == 'function'){
							this.data['obj' + part][key][field].sort(g.sort);
						}
					}
					set(g.field(doc, set.bind(this)));
					for (let field in this.data['obj' + part][key]){
						if(fields[field]) continue;
						for (let i = this.data['obj' + part][key][field].length-1; i >= 0; i--){
							if(this.data['obj' + part][key][field][i]._id == doc._id){
								this.data['obj' + part][key][field].splice(i, 1);
							}
						}
					}
				}
			}
			if(this.data['opts'+part].query){
				for(let key in this.data['opts'+part].query){
					let to_have = true;
					let query = this.data['opts'+part].query[key];
					if(typeof query.ignore == 'function' && query.ignore(doc)) to_have = false;
					if(typeof query.allow == 'function' && !query.allow(doc)) to_have = false;
					if(!this.data['obj' + part][key]){
						this.data['obj' + part][key] = [];
					}
					if(to_have){
						for (let i = this.data['obj' + part][key].length-1; i >= 0; i--){
						    if(this.data['obj' + part][key][i]._id == doc._id) return;
						}
						this.data['obj' + part][key].push(doc);
					} else {
						for (let i = this.data['obj' + part][key].length-1; i >= 0; i--){
						    if(this.data['obj' + part][key][i]._id == doc._id){
						    	this.data['obj' + part][key].splice(i, 1);
						    }
						}
					}
					if(typeof query.sort == 'function'){
						this.data['obj' + part][key].sort(query.sort);
					}
				}
			}
		};
	/*
	*	Endof Mongo Service
	*/
	constructor(private http: HttpClient, private socket: SocketService){
		socket.on('create', created=>{
			this.fetch(created.part, {
				query: {
					_id: created._id
				}
			});
		});
		socket.on('update', updated=>{
			this.fetch(updated.part, {
				query: {
					_id: updated._id
				}
			});
		});
		socket.on('delete', deleted=>{
			this.remove(deleted.part, deleted);
		});
	}
}