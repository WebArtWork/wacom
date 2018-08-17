import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class MongoService {
	/*
	*	Data will be storage for all information we are pulling from waw crud.
	*	data['arr' + part] will host all docs from collection part in array form
	*	data['obj' + part] will host all docs from collection part in object form
	*	data['opts' + part] will host options for docs from collection part
	*		Will be initialized only inside get
	*		Will be used inside push
	*/
		private data = {};
	/*
	*	waw crud connect functions
	*/
		public create(part, doc=undefined, cb=undefined) {
			if (typeof doc == 'function') {
				cb = doc;
				doc = {};
			}
			this.http.post < any > ('/api/' + part + '/create', doc || {}).subscribe(resp => {
				if (resp) {
					this.push(part,resp);
					if (typeof cb == 'function') cb(resp);
				}else if (typeof cb == 'function') {
					cb(false);
				}
			});
		};
		public get(part, opts=undefined, cb=undefined) {
			if (typeof opts == 'function') {
				cb = opts;
				opts = {};
			}
			if(Array.isArray(this.data['arr' + part])){
				if(typeof cb == 'function'){
					cb(this.data['arr' + part], this.data['obj' + part]);
				}
				return this.data['arr' + part];
			}
			this.data['arr' + part] = [];
			this.data['obj' + part] = {};
			this.data['opts' + part] = opts||{};
			this.http.get < any > ('/api/' + part + '/get').subscribe(resp => {
				if (resp) {
					for (let i = 0; i < resp.length; i++) {
						this.push(part,resp[i]);
					}
					if (typeof cb == 'function') cb(this.data['arr' + part], this.data['obj' + part]);
				} else if (typeof cb == 'function') {
					cb(false);
				}
				this.data['loaded'+part]=true;
			});
			return this.data['arr' + part];
		};
		public updateAll(part, doc, opts=undefined, cb=undefined) {
			if (typeof opts == 'function'){
				cb = opts;
				opts = {};
			}
			if(typeof opts != 'object') opts = {};
			if(opts.fields){
				if(typeof opts.fields == 'string') opts.fields = opts.fields.split(' ');
				let _doc = {};
				for(let i = 0; i < opts.fields.length; i++){
					_doc[opts.fields[i]] = doc[opts.fields[i]];
				}
				doc = _doc;
			}
			this.http.post('/api/' + part + '/update/all' + (opts.name||''), doc).subscribe(resp => {
				if (resp && typeof cb == 'function') {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			});
		};
		public updateUnique(part, doc, opts=undefined, cb=undefined){
			if(typeof opts == 'function'){
				cb = opts;
				opts='';
			}
			if(typeof opts != 'object') opts = {};
			if(opts.fields){
				if(typeof opts.fields == 'string') opts.fields = opts.fields.split(' ');
				let _doc = {};
				for(let i = 0; i < opts.fields.length; i++){
					_doc[opts.fields[i]] = doc[opts.fields[i]];
				}
				doc = _doc;
			}
			this.http.post('/api/'+part+'/unique/field'+opts, doc).subscribe(resp => {
					if (resp && typeof cb == 'function') {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			});
		};
		public delete(part, doc, opts=undefined, cb=undefined) {
			if (typeof opts == 'function') {
				cb = opts;
				opts = {};
			}
			if(typeof opts !== 'object') opts = {};
			console.log(opts);
			console.log(typeof(opts));
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
			this.http.post('/api/' + part + '/delete' + (opts.name||''), doc).subscribe(resp => {
				if (resp && Array.isArray(this.data['arr' + part])) {
					for (var i = 0; i < this.data['arr' + part].length; i++) {
						if (this.data['arr' + part][i]._id == doc._id) {
							this.data['arr' + part].splice(i, 1);
							break;
						}
					}
					delete this.data['obj' + part][doc._id];
				}
				if (resp && typeof cb == 'function') {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			});
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
							doc[field][i] = this.data['obj'+part][doc[field][i]]
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
		}
	/*
	*	mongo replace support functions
	*/
		public beArr(val, cb){
			if(!Array.isArray(val)) cb([]);
			else cb(val);
		};
		public beObj(val, cb){
			if(typeof val != 'object' || Array.isArray(val)){
				val = {};
			}
			cb(val);
		}
		public forceArr(cb){ cb([]); }
		public forceObj(cb){ cb({}); }
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
		private push(part, doc){
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
			this.data['obj' + part][doc._id] = doc;
		}
	/*
	*	Endof Mongo Service
	*/
	constructor(private http: HttpClient) {}
}