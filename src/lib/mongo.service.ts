import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class MongoService {
	create(part, obj, cb) {
		if (typeof obj == 'function') {
			cb = obj;
			obj = {};
		}
		this.http.post < any > ('/api/' + part + '/create', obj || {})
			.subscribe(resp => {
				if (resp) {
					if (typeof cb == 'function') cb(resp);
				} else if (typeof cb == 'function') {
					cb(false);
				}
			}, err => {

			})
	};
	private data = {};
	get(part, opts, cb) {
		if (typeof opts == 'function') {
			cb = opts;
			opts = {};
		}
		this.data['arr' + part] = [];
		this.data['obj' + part] = {};
		this.http.get < any > ('/api/' + part + '/get')
			.subscribe(resp => {
				if (resp) {
					for (let i = 0; i < resp.length; i++) {
						this.data['arr' + part].push(resp[i]);
						this.data['obj' + part][resp[i]._id] = resp[i];
					}
					if (typeof cb == 'function') cb(this.data['arr' + part], this.data['obj' + part]);
				} else if (typeof cb == 'function') {
					cb(false);
				}
				console.log(resp);
			}, err => {

			})
		return this.data['arr' + part];
	};
	updateAll(part, doc, opts, cb) {
		if (typeof opts == 'function') cb = opts;
		if (typeof opts != 'string') opts = '';
		this.http.post('/api/' + part + '/update/all' + opts, doc).subscribe(resp => {
			if (resp && typeof cb == 'function') {
				cb(resp);
			} else if (typeof cb == 'function') {
				cb(false);
			}
		});
	};
	delete(part, doc, opts, cb) {
		if (!opts) opts = '';
		if (!doc) return;
		if (typeof opts == 'function') {
			cb = opts;
			opts = '';
		}
		this.http.post('/api/' + part + '/delete' + opts, doc).subscribe(resp => {
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
	constructor(private http: HttpClient) {}
}