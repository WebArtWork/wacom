import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { CoreService } from './core.service';
import { Subject } from 'rxjs';
import { StoreService } from './store.service';
@Injectable({
	providedIn: 'root',
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
	private data: any = {};
	private socket: any = {
		emit: (which: any, doc: any) => {
			console.log(which, doc, 'is not used on sockets');
		},
	};
	/*
	 *	waw crud connect functions
	 */
	public config(part: any, opts: any) {
		if (this.data['opts' + part]) return;
		if (!this.data['arr' + part]) this.data['arr' + part] = [];
		if (!this.data['obj' + part]) this.data['obj' + part] = {};
		if (this.data['opts' + part]) {
			for (let each in opts) {
				this.data['opts' + part][each] = opts[each];
			}
		} else this.data['opts' + part] = opts = opts || {};
		if (typeof opts.use === 'string') {
			opts.use = opts.use.split(' ');
		}
		if (opts.query) {
			for (let key in opts.query) {
				if (typeof opts.query[key] == 'function') {
					opts.query[key] = {
						allow: opts.query[key],
					};
				}
				this.data['obj' + part][key] = [];
			}
		}
		if (opts.groups) {
			if (typeof opts.groups === 'string') {
				opts.groups = opts.groups.split(' ');
			}
			if (Array.isArray(opts.groups)) {
				let arr = opts.groups;
				opts.groups = {};
				for (let i = 0; i < arr.length; i++) {
					if (typeof arr[i] === 'string') {
						opts.groups[arr[i]] = true;
					} else {
						for (let key in arr[i]) {
							if (typeof arr[i][key] == 'function') {
								arr[i][key] = {
									field: arr[i][key],
								};
							}
							opts.groups[key] = arr[i][key];
						}
					}
				}
			}
			for (let key in opts.groups) {
				if (typeof opts.groups[key] == 'boolean') {
					if (opts.groups[key]) {
						opts.groups[key] = {
							field: function (doc: any) {
								return doc[key];
							},
						};
					} else {
						delete opts.groups[key];
						continue;
					}
				}
				if (typeof opts.groups[key] != 'object') {
					delete opts.groups[key];
					continue;
				}
				if (typeof opts.groups[key].field != 'function') {
					delete opts.groups[key];
					continue;
				}
				if (Array.isArray(this.data['obj' + part][key])) {
					console.warn(
						'You can have same field groups with query. Field ' +
							key +
							' is not used in groups.'
					);
					delete opts.groups[key];
					continue;
				}
				this.data['obj' + part][key] = {};
			}
		}
		if (opts.fields) {
			if (typeof opts.fields === 'string') {
				opts.fields = opts.fields.split(' ');
			}
		}
		if (!Array.isArray(opts.fields)) {
			opts.fields = [];
		}
		// this.store.getJson('mongo' + part, data => {
		// 	if (data && Array.isArray(data)) {
		// 		for (let i = 0; i < data.length; i++) {
		// 			this.push(part, data[i]);
		// 		}
		// 	}
		// });
		return {
			arr: this.data['arr' + part],
			obj: this.data['obj' + part],
		};
	}
	public create(
		part: any,
		doc: any = undefined,
		cb: any = undefined,
		opts: any = {}
	) {
		if (typeof doc == 'function') {
			if (cb) opts = cb;
			cb = doc;
			doc = {};
		}
		if (typeof opts == 'function') {
			opts = {
				err: opts,
			};
		}
		if (typeof doc != 'object') doc = {};
		if (doc.___created && !opts.allow_multiple) return;
		doc.___created = true;
		this.http.post(
			opts.url || '/api/' + part + '/create',
			doc || {},
			(resp) => {
				if (resp) {
					this.socket.emit('create', {
						_id: resp._id,
						part: part,
					});
					this.push(part, resp);
					if (typeof cb == 'function') cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			},
			{
				url: opts.base_url || this.http.url,
			}
		);
	}
	public fetch(part: any, opts: any = undefined, cb: any = undefined) {
		if (
			opts.query &&
			opts.query._id &&
			!opts.force &&
			this.data['obj' + part][opts.query._id]
		) {
			return this.data['obj' + part][opts.query._id];
		}
		if (typeof opts == 'function') {
			cb = opts;
			opts = {};
		}
		if (!opts) opts = {};
		this.config(part, opts); // remove this in future
		let url = '/api/' + part + '/fetch' + (opts.name || ''),
			doc: any;
		if (
			opts.query &&
			opts.query._id &&
			this.data['obj' + part][opts.query._id]
		) {
			doc = this.data['obj' + part][opts.query._id];
		} else {
			doc = {};
			for (let key in this.data['opts' + part].replace) {
				this.replace(doc, key, this.data['opts' + part].replace[key]);
			}
		}
		this.http.post(
			opts.url || url,
			opts.query || {},
			(resp) => {
				if (!resp) return cb && cb(false);
				for (let each in resp) {
					doc[each] = resp[each];
				}
				for (let each in doc) {
					doc[each] = resp[each];
				}
				this.push(part, doc);
				if (resp && typeof cb == 'function') {
					cb(doc);
				}
			},
			{
				url: opts.base_url || this.http.url,
			}
		);
		return doc;
	}
	public get(part: any, opts: any = undefined, cb: any = undefined) {
		if (typeof opts == 'function') {
			cb = opts;
			opts = {};
		}
		if (!opts) opts = {};
		this.config(part, opts); // remove this in future
		let url =
			'/api/' + part + '/get' + (opts.name || '') + (opts.param || '');
		this.http.get(
			opts.url || url,
			(resp) => {
				if (Array.isArray(resp)) {
					for (let i = 0; i < resp.length; i++) {
						this.push(part, resp[i]);
					}
					if (!opts.paginate) {
						for (
							let i = 0;
							i < this.data['arr' + part].length;
							i++
						) {
							let remove = true;
							for (let j = 0; j < resp.length; j++) {
								if (
									resp[j]._id ===
									this.data['arr' + part][i]._id
								) {
									remove = false;
									break;
								}
							}
							if (remove) {
								this.remove(part, this.data['arr' + part][i]);
							}
						}
					}
					if (typeof cb == 'function')
						cb(
							this.data['arr' + part],
							this.data['obj' + part],
							opts.name || '',
							resp
						);
				} else if (typeof cb == 'function') {
					cb(
						this.data['arr' + part],
						this.data['obj' + part],
						opts.name || '',
						resp
					);
				}
				this.data['loaded' + part] = true;
			},
			{
				url: opts.base_url || this.http.url,
			}
		);
		return this.data['arr' + part];
	}
	public set(part: any, opts: any = undefined, resp: any = undefined) {
		if (Array.isArray(opts)) {
			resp = opts;
			opts = undefined;
		}
		if (opts) this.config(part, opts);
		if (Array.isArray(resp)) {
			for (let i = 0; i < resp.length; i++) {
				this.push(part, resp[i]);
			}
		}
		return {
			arr: this.data['arr' + part],
			obj: this.data['obj' + part],
		};
	}
	private prepare_update(part: any, doc: any, opts: any) {
		if (opts.fields) {
			if (typeof opts.fields === 'string')
				opts.fields = opts.fields.split(' ');
			let _doc: any = {};
			for (let i = 0; i < opts.fields.length; i++) {
				_doc[opts.fields[i]] = doc[opts.fields[i]];
			}
			doc = _doc;
		} else this.renew(part, doc);
		if (
			typeof opts.rewrite == 'object' &&
			Object.values(opts.rewrite).length
		) {
			doc = JSON.parse(JSON.stringify(doc));
			for (let key in opts.rewrite) {
				this.replace(doc, key, opts.rewrite[key]);
			}
		}
		return doc;
	}
	public update(
		part: any,
		doc: any,
		opts: any = undefined,
		cb: any = undefined
	) {
		if (typeof opts == 'function') {
			cb = opts;
			opts = {};
		}
		if (typeof opts != 'object') opts = {};
		doc = this.prepare_update(part, doc, opts);
		let url = '/api/' + part + '/update' + (opts.name || '');
		this.http.post(
			opts.url || url,
			doc,
			(resp) => {
				if (resp) {
					this.socket.emit('update', {
						_id: doc._id,
						part: part,
					});
				}
				if (resp && typeof cb == 'function') {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			},
			{
				url: opts.base_url || this.http.url,
			}
		);
	}
	public unique(
		part: any,
		doc: any,
		opts: any = undefined,
		cb: any = undefined
	) {
		if (typeof opts == 'function') {
			cb = opts;
			opts = {};
		}
		if (typeof opts != 'object') opts = {};
		doc = this.prepare_update(part, doc, opts);
		let url = '/api/' + part + '/unique' + (opts.name || '');
		this.http.post(
			opts.url || url,
			doc,
			(resp) => {
				if (resp) {
					this.socket.emit('update', {
						_id: doc._id,
						part: part,
					});
					let current_doc = this.data['obj' + part][doc._id];
					for (let each in doc) {
						current_doc[each] = doc[each];
					}
					this.renew(part, current_doc);
				}
				if (
					(resp || typeof resp === 'string') &&
					typeof cb == 'function'
				) {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			},
			{
				url: opts.base_url || this.http.url,
			}
		);
	}
	public delete(
		part: any,
		doc: any,
		opts: any = undefined,
		cb: any = undefined
	) {
		if (typeof opts == 'function') {
			cb = opts;
			opts = {};
		}
		if (typeof opts !== 'object') opts = {};
		if (opts.fields) {
			if (typeof opts.fields === 'string')
				opts.fields = opts.fields.split(' ');
			let _doc: any = {};
			for (let i = 0; i < opts.fields.length; i++) {
				_doc[opts.fields[i]] = doc[opts.fields[i]];
			}
			doc = _doc;
		} else {
			doc = {
				_id: doc._id,
			};
		}
		let url = '/api/' + part + '/delete' + (opts.name || '');
		this.http.post(
			opts.url || url,
			doc,
			(resp) => {
				if (resp) {
					this.socket.emit('delete', {
						_id: doc._id,
						part: part,
					});
					this.remove(part, doc);
				}
				if (resp && typeof cb == 'function') {
					cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			},
			{
				url: opts.base_url || this.http.url,
			}
		);
	}
	public _id(cb: any) {
		if (typeof cb == 'function') {
			this.http.get('/waw/newId', cb);
		}
	}
	public to_id(docs: any) {
		if (!docs) return [];
		if (Array.isArray(docs)) {
			docs = docs.slice();
		} else if (typeof docs == 'object') {
			if (docs._id) return [docs._id];
			let _docs = [];
			for (let key in docs) {
				if (docs[key]) _docs.push(docs[key]._id || docs[key]);
			}
			docs = _docs;
		}
		for (let i = 0; i < docs.length; ++i) {
			if (docs[i]) docs[i] = docs[i]._id || docs[i];
		}
		return docs;
	}
	public afterWhile(doc: any, cb: any, time = 1000) {
		if (typeof cb == 'function' && typeof time == 'number') {
			clearTimeout(doc.__updateTimeout);
			doc.__updateTimeout = setTimeout(cb, time);
		}
	}
	public populate(doc: any, field: any, part: any): any {
		if (!doc || !field || !part) return;
		if (Array.isArray(doc)) {
			for (let i = 0; i < doc.length; i++) {
				this.populate(doc[i], field, part);
			}
			return;
		}
		if (this.data['loaded' + part]) {
			if (Array.isArray(field)) {
				for (let i = 0; i < field.length; i++) {
					this.populate(doc, field[i], part);
				}
				return;
			} else if (field.indexOf('.') > -1) {
				field = field.split('.');
				let sub = field.shift();
				if (typeof doc[sub] != 'object') return;
				return this.populate(doc[sub], field.join('.'), part);
			}
			if (Array.isArray(doc[field])) {
				for (let i = doc[field].length - 1; i >= 0; i--) {
					if (this.data['obj' + part][doc[field][i]]) {
						doc[field][i] = this.data['obj' + part][doc[field][i]];
					} else {
						doc[field].splice(i, 1);
					}
				}
				return;
			} else if (typeof doc[field] === 'string') {
				doc[field] = this.data['obj' + part][doc[field]] || null;
			} else return;
		} else {
			setTimeout(() => {
				this.populate(doc, field, part);
			}, 100);
		}
	}
	public on(parts: any, cb: any): any {
		if (typeof parts === 'string') {
			parts = parts.split(' ');
		}
		for (var i = 0; i < parts.length; i++) {
			if (!this.data['loaded' + parts[i]]) {
				return setTimeout(() => {
					this.on(parts, cb);
				}, 100);
			}
		}
		cb(this.data);
	}
	public track(index: any, doc: any) {
		return (doc && doc._id && doc._id) || index;
	}
	/*
	 *	mongo sort filters
	 */
	public sortAscId() {
		return function (a: any, b: any) {
			if (a._id > b._id) return 1;
			else return -1;
		};
	}
	public sortDescId() {
		return function (a: any, b: any) {
			if (a._id < b._id) return 1;
			else return -1;
		};
	}
	public sortAscString(opts: any) {
		if (typeof opts === 'string') {
			opts = {
				field: opts,
			};
		}
		return function (a: any, b: any) {
			if (a[opts.field].toLowerCase() > b[opts.field].toLowerCase())
				return 1;
			else if (
				a[opts.field].toLowerCase() < b[opts.field].toLowerCase() ||
				!opts.next
			)
				return -1;
			else return opts.next(a, b);
		};
	}
	public sortDescString(opts: any) {
		if (typeof opts === 'string') {
			opts = {
				field: opts,
			};
		}
		return function (a: any, b: any) {
			if (a[opts.field].toLowerCase() < b[opts.field].toLowerCase())
				return 1;
			else if (
				a[opts.field].toLowerCase() > b[opts.field].toLowerCase() ||
				!opts.next
			)
				return -1;
			else return opts.next(a, b);
		};
	}
	public sortAscDate(opts: any) {
		if (typeof opts === 'string') {
			opts = {
				field: opts,
			};
		}
		return function (a: any, b: any) {
			if (a[opts.field].getTime() > b[opts.field].getTime()) return 1;
			else if (
				a[opts.field].getTime() < b[opts.field].getTime() ||
				!opts.next
			)
				return -1;
			else return opts.next(a, b);
		};
	}
	public sortDescDate(opts: any) {
		if (typeof opts === 'string') {
			opts = {
				field: opts,
			};
		}
		return function (a: any, b: any) {
			if (a[opts.field].getTime() < b[opts.field].getTime()) return 1;
			else if (
				a[opts.field].getTime() > b[opts.field].getTime() ||
				!opts.next
			)
				return -1;
			else return opts.next(a, b);
		};
	}
	public sortAscNumber(opts: any) {
		if (typeof opts === 'string') {
			opts = {
				field: opts,
			};
		}
		return function (a: any, b: any) {
			if (a[opts.field] > b[opts.field]) return 1;
			else if (a[opts.field] < b[opts.field] || !opts.next) return -1;
			else return opts.next(a, b);
		};
	}
	public sortDescNumber(opts: any) {
		if (typeof opts === 'string') {
			opts = {
				field: opts,
			};
		}
		return function (a: any, b: any) {
			if (a[opts.field] < b[opts.field]) return 1;
			else if (a[opts.field] > b[opts.field] || !opts.next) return -1;
			else return opts.next(a, b);
		};
	}
	public sortAscBoolean(opts: any) {
		if (typeof opts === 'string') {
			opts = {
				field: opts,
			};
		}
		return function (a: any, b: any) {
			if (!a[opts.field] && b[opts.field]) return 1;
			else if ((a[opts.field] && !b[opts.field]) || !opts.next) return -1;
			else return opts.next(a, b);
		};
	}
	public sortDescBoolean(opts: any) {
		if (typeof opts === 'string') {
			opts = {
				field: opts,
			};
		}
		return function (a: any, b: any) {
			if (a[opts.field] && !b[opts.field]) return 1;
			else if ((!a[opts.field] && b[opts.field]) || !opts.next) return -1;
			else return opts.next(a, b);
		};
	}
	/*
	 *	mongo replace filters
	 */
	public beArr(val: any, cb: any) {
		if (!Array.isArray(val)) cb([]);
		else cb(val);
	}
	public beObj(val: any, cb: any) {
		if (typeof val != 'object' || Array.isArray(val) || !val) {
			val = {};
		}
		cb(val);
	}
	public beDate(val: any, cb: any) {
		cb(new Date(val));
	}
	public beString(val: any, cb: any) {
		if (typeof val != 'string') {
			val = '';
		}
		cb(val);
	}
	public beDoc = (val: any, cb: any) => {
		this.beObj(val, (val: any) => {
			if (!val._id) {
				this._id((_id: any) => {
					val._id = _id;
					cb(val);
				});
			} else cb(val);
		});
	};
	public forceArr(val: any, cb: any) {
		cb([]);
	}
	public forceObj(val: any, cb: any) {
		cb({});
	}
	public forceString(val: any, cb: any) {
		cb('');
	}
	public forceDoc = (val: any, cb: any) => {
		this._id((_id: any) => {
			cb({
				_id: _id,
			});
		});
	};
	public getCreated(val: any, cb: any, doc: any) {
		cb(new Date(parseInt(doc._id.substring(0, 8), 16) * 1000));
	}
	/*
	 *	mongo local support functions
	 */
	private replace(doc: any, value: any, rpl: any): any {
		if (value.indexOf('.') > -1) {
			value = value.split('.');
			let sub = value.shift();
			if (
				doc[sub] &&
				(typeof doc[sub] != 'object' || Array.isArray(doc[sub]))
			)
				return;
			if (!doc[sub]) doc[sub] = {};
			return this.replace(doc[sub], value.join('.'), rpl);
		}
		if (typeof rpl == 'function') {
			rpl(
				doc[value],
				function (newValue: any) {
					doc[value] = newValue;
				},
				doc
			);
		}
	}
	public renew(part: any, doc: any) {
		if (!this.data['obj' + part][doc._id]) return this.push(part, doc);
		if (this.data['opts' + part].replace) {
			for (let key in this.data['opts' + part].replace) {
				this.replace(doc, key, this.data['opts' + part].replace[key]);
			}
		}
		for (let each in this.data['obj' + part][doc._id]) {
			this.data['obj' + part][doc._id][each] = doc[each];
		}
		for (let each in doc) {
			this.data['obj' + part][doc._id][each] = doc[each];
		}
		for (let i = 0; i < this.data['opts' + part].fields.length; i++) {
			const field = this.data['opts' + part].fields[i];
			if (!this.data['obj' + part][doc[field]]) {
				this.data['obj' + part][doc[field]] = doc;
				continue;
			}
			for (let each in doc) {
				this.data['obj' + part][doc[field]][each] = doc[each];
			}
		}
		if (this.data['opts' + part].groups) {
			for (let key in this.data['opts' + part].groups) {
				let to_have = true;
				let g = this.data['opts' + part].groups[key];
				if (typeof g.ignore == 'function' && g.ignore(doc))
					to_have = false;
				if (typeof g.allow == 'function' && !g.allow(doc))
					to_have = false;
				if (!this.data['obj' + part][key]) {
					this.data['obj' + part][key] = {};
				}
				let fields: any = {};
				let set = (field: any) => {
					fields[field] = true;
					if (!field) return;
					if (!Array.isArray(this.data['obj' + part][key][field])) {
						this.data['obj' + part][key][field] = [];
					}
					if (to_have) {
						for (
							let i =
								this.data['obj' + part][key][field].length - 1;
							i >= 0;
							i--
						) {
							if (
								this.data['obj' + part][key][field][i]._id ==
								doc._id
							)
								return;
						}
						this.data['obj' + part][key][field].push(doc);
					} else {
						for (
							let i =
								this.data['obj' + part][key][field].length - 1;
							i >= 0;
							i--
						) {
							if (
								this.data['obj' + part][key][field][i]._id ==
								doc._id
							) {
								this.data['obj' + part][key][field].splice(
									i,
									1
								);
							}
						}
					}
					if (typeof g.sort == 'function') {
						this.data['obj' + part][key][field].sort(g.sort);
					}
				};
				set(g.field(doc, set.bind(this)));
				for (let field in this.data['obj' + part][key]) {
					if (fields[field]) continue;
					for (
						let i = this.data['obj' + part][key][field].length - 1;
						i >= 0;
						i--
					) {
						if (
							this.data['obj' + part][key][field][i]._id ==
							doc._id
						) {
							this.data['obj' + part][key][field].splice(i, 1);
						}
					}
				}
			}
		}
		if (this.data['opts' + part].query) {
			for (let key in this.data['opts' + part].query) {
				let to_have = true;
				let query = this.data['opts' + part].query[key];
				if (typeof query.ignore == 'function' && query.ignore(doc))
					to_have = false;
				if (typeof query.allow == 'function' && !query.allow(doc))
					to_have = false;
				if (!this.data['obj' + part][key]) {
					this.data['obj' + part][key] = [];
				}
				if (to_have) {
					for (
						let i = this.data['obj' + part][key].length - 1;
						i >= 0;
						i--
					) {
						if (this.data['obj' + part][key][i]._id == doc._id)
							return;
					}
					this.data['obj' + part][key].push(doc);
				} else {
					for (
						let i = this.data['obj' + part][key].length - 1;
						i >= 0;
						i--
					) {
						if (this.data['obj' + part][key][i]._id == doc._id) {
							this.data['obj' + part][key].splice(i, 1);
						}
					}
				}
				if (typeof query.sort == 'function') {
					this.data['obj' + part][key].sort(query.sort);
				}
			}
		}
	}
	public push(part: any, doc: any): any {
		if (!this.data['arr' + part]) this.data['arr' + part] = [];
		if (!this.data['obj' + part]) this.data['obj' + part] = {};
		if (!this.data['opts' + part]) this.data['opts' + part] = {};
		if (this.data['obj' + part][doc._id]) return this.renew(part, doc);
		if (this.data['opts' + part].replace) {
			for (let key in this.data['opts' + part].replace) {
				this.replace(doc, key, this.data['opts' + part].replace[key]);
			}
		}
		if (this.data['opts' + part].populate) {
			let p = this.data['opts' + part].populate;
			if (Array.isArray(p)) {
				for (let i = 0; i < p.length; i++) {
					if (typeof p == 'object' && p[i].field && p[i].part) {
						this.populate(doc, p[i].field, p[i].part);
					}
				}
			} else if (typeof p == 'object' && p.field && p.part) {
				this.populate(doc, p.field, p.part);
			}
		}
		this.data['arr' + part].push(doc);
		if (this.data['opts' + part].sort) {
			this.data['arr' + part].sort(this.data['opts' + part].sort);
		}
		this.data['obj' + part][doc._id] = doc;
		if (Array.isArray(this.data['opts' + part].use)) {
			for (let i = 0; i < this.data['opts' + part].use.length; i++) {
				this.data['obj' + part][doc[this.data['opts' + part].use[i]]] =
					doc;
			}
		}
		if (this.data['opts' + part].groups) {
			for (let key in this.data['opts' + part].groups) {
				let g = this.data['opts' + part].groups[key];
				if (typeof g.ignore == 'function' && g.ignore(doc)) continue;
				if (typeof g.allow == 'function' && !g.allow(doc)) continue;
				if (!this.data['obj' + part][key]) {
					this.data['obj' + part][key] = {};
				}
				let set = (field: any) => {
					if (!field) return;
					if (!Array.isArray(this.data['obj' + part][key][field])) {
						this.data['obj' + part][key][field] = [];
					}
					this.data['obj' + part][key][field].push(doc);
					if (typeof g.sort == 'function') {
						this.data['obj' + part][key][field].sort(g.sort);
					}
				};
				set(
					g.field(doc, (field: any) => {
						set(field);
					})
				);
			}
		}
		if (this.data['opts' + part].query) {
			for (let key in this.data['opts' + part].query) {
				let query = this.data['opts' + part].query[key];
				if (typeof query.ignore == 'function' && query.ignore(doc))
					continue;
				if (typeof query.allow == 'function' && !query.allow(doc))
					continue;
				if (!this.data['obj' + part][key]) {
					this.data['obj' + part][key] = [];
				}
				this.data['obj' + part][key].push(doc);
				if (typeof query.sort == 'function') {
					this.data['obj' + part][key].sort(query.sort);
				}
			}
		}
		for (let i = 0; i < this.data['opts' + part].fields.length; i++) {
			const field = this.data['opts' + part].fields[i];
			if (!this.data['obj' + part][doc[field]]) {
				this.data['obj' + part][doc[field]] = doc;
				continue;
			}
			for (let each in doc) {
				this.data['obj' + part][doc[field]][each] = doc[each];
			}
		}
		// this.store.setJson('mongo' + part, this.data['arr' + part]);
	}
	public remove(part: any, doc: any) {
		if (!Array.isArray(this.data['arr' + part])) return;
		for (let i = 0; i < this.data['arr' + part].length; i++) {
			if (this.data['arr' + part][i]._id == doc._id) {
				this.data['arr' + part].splice(i, 1);
				break;
			}
		}
		delete this.data['obj' + part][doc._id];
		for (let i = 0; i < this.data['opts' + part].fields.length; i++) {
			const field = this.data['opts' + part].fields[i];
			delete this.data['obj' + part][doc[field]];
		}
		if (this.data['opts' + part].groups) {
			for (let key in this.data['opts' + part].groups) {
				for (let field in this.data['obj' + part][key]) {
					for (
						let i = this.data['obj' + part][key][field].length - 1;
						i >= 0;
						i--
					) {
						if (
							this.data['obj' + part][key][field][i]._id ==
							doc._id
						) {
							this.data['obj' + part][key][field].splice(i, 1);
						}
					}
				}
			}
		}
		if (this.data['opts' + part].query) {
			for (let key in this.data['opts' + part].query) {
				for (
					let i = this.data['obj' + part][key].length - 1;
					i >= 0;
					i--
				) {
					if (this.data['obj' + part][key][i]._id == doc._id) {
						this.data['obj' + part][key].splice(i, 1);
						break;
					}
				}
			}
		}
	}
	/*
	 *	Endof Mongo Service
	 */
	constructor(
		private store: StoreService,
		private http: HttpService,
		private core: CoreService
	) {
		console.warn('Mongo Service is deprecated');

		this.core.onComplete('socket').then((socket: any) => {
			this.socket = socket;
			socket.on('create', (created: any) => {
				this.fetch(created.part, {
					force: true,
					query: {
						_id: created._id,
					},
				});
			});
			socket.on('update', (updated: any) => {
				this.fetch(updated.part, {
					force: true,
					query: {
						_id: updated._id,
					},
				});
			});
			socket.on('delete', (deleted: any) => {
				this.remove(deleted.part, deleted);
			});
		});
	}
}
