import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, first } from 'rxjs/operators';
import { StoreService } from './store.service';

@Injectable({
	providedIn: 'root'
})
export class HttpService {
	public url = '';

	private _http: any;

	private headers:any = {};

	private http_headers = new HttpHeaders(this.headers);

	constructor(
		private store: StoreService,
		private http: HttpClient,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config
	) {
		this._http = config.http;

		if (!this.config) this.config = DEFAULT_CONFIG;

		if (!this._http) this._http = {};

		if (typeof this._http.headers === 'object') {
			for (const header in this._http.headers) {
				this.headers[header] = this._http.headers[header];
			}

			this.http_headers = new HttpHeaders(this.headers);
		}

		this.store.get('http_url', (url:any)=>{
			this.url = url || this._http.url || '';
		});

		this.store.getJson('http_headers', (headers:any)=>{
			if (headers) {
				for (const header in headers){
					this.headers[header] = headers[header];
				}

				this.http_headers = new HttpHeaders(this.headers);
			}
		});
	}

	setUrl(url: string) {
		this.url = url;
		this.store.set('http_url', url);
	}

	removeUrl() {
		this.url = this._http.url || '';
		this.store.remove('http_url');
	}

	set(key: any, value: any) {
		this.headers[key] = value;

		this.store.setJson('http_headers', this.headers);

		this.http_headers = new HttpHeaders(this.headers);
	}

	header(key: any) {
		return this.headers[key];
	}

	remove(key: any) {
		delete this.headers[key];

		this.http_headers = new HttpHeaders(this.headers);

		this.store.setJson('http_headers', this.headers);
	}

	post(url:any, doc:any, callback=(resp:any) => {}, opts:any={}):any{
		if (typeof opts === 'function'){
			opts = {
				err: opts
			}
		}

		if (!opts.err && this._http.err) {
			opts.err = this._http.err;
		} else if (!opts.err) {
			opts.err = (err: HttpErrorResponse) => { };
		}

		if (this._locked){
			return setTimeout(()=>{
				this.post(url, doc, callback, opts);
			}, 100);
		}

		const observable = this.http.post<any>((opts.url||this.url)+url, doc, {
			headers: this.http_headers
		});

		observable.pipe(
			first(),
			catchError(this.handleError(opts.err))
		).subscribe(resp=>{
			if (typeof this._http.replace === 'function') {
				this._http.replace(resp, callback);
			} else {
				callback(resp);
			}
		});

		return observable;
	}
	put(url:any, doc:any, callback=(resp:any) => {}, opts:any={}):any{
		if (typeof opts === 'function'){
			opts = {
				err: opts
			}
		}

		if (!opts.err && this._http.err) {
			opts.err = this._http.err;
		} else if (!opts.err) {
			opts.err = (err: HttpErrorResponse) => { };
		}

		if (this._locked){
			return setTimeout(()=>{
				this.put(url, doc, callback, opts);
			}, 100);
		}

		const observable = this.http.put<any>((opts.url||this.url)+url, doc, {
			headers: this.http_headers
		});

		observable.pipe(
			first(),
			catchError(this.handleError(opts.err))
		).subscribe(resp=>{
			if (typeof this._http.replace === 'function'){
				this._http.replace(resp, callback);
			} else {
				callback(resp);
			}
		});

		return observable;
	}
	patch(url:any, doc:any, callback=(resp:any) => {}, opts:any={}):any{
		if (typeof opts === 'function'){
			opts = {
				err: opts
			}
		}

		if (!opts.err && this._http.err) {
			opts.err = this._http.err;
		} else if (!opts.err) {
			opts.err = (err: HttpErrorResponse) => { };
		}

		if (this._locked){
			return setTimeout(()=>{
				this.patch(url, doc, callback, opts);
			}, 100);
		}

		const observable = this.http.patch<any>((opts.url||this.url)+url, doc, {
			headers: this.http_headers
		});

		observable.pipe(
			first(),
			catchError(this.handleError(opts.err))
		).subscribe(resp=>{
			if (typeof this._http.replace === 'function'){
				this._http.replace(resp, callback);
			} else {
				callback(resp);
			}
		});

		return observable;
	}
	delete(url:any, doc:any, callback=(resp:any) => {}, opts:any={}):any{
		if (typeof opts === 'function'){
			opts = {
				err: opts
			}
		}

		if (!opts.err && this._http.err) {
			opts.err = this._http.err;
		} else if (!opts.err) {
			opts.err = (err: HttpErrorResponse) => { };
		}

		if (this._locked){
			return setTimeout(()=>{
				this.delete(url, doc, callback, opts);
			}, 100);
		}

		const observable = this.http.request<any>('delete', (opts.url||this.url)+url, {
			headers: this.http_headers,
			body: doc || {}
		});

		observable.pipe(
			first(),
			catchError(this.handleError(opts.err))
		).subscribe(resp=>{
			if (typeof this._http.replace === 'function'){
				this._http.replace(resp, callback);
			} else callback(resp);
		});

		return observable;
	}
	get(url:any, callback=(resp:any) => {}, opts:any={}):any{
		if (typeof opts === 'function'){
			opts = {
				err: opts
			}
		}

		if (!opts.err && this._http.err) {
			opts.err = this._http.err;
		} else if (!opts.err) {
			opts.err = (err: HttpErrorResponse) => { };
		}

		if (this._locked){
			return setTimeout(()=>{
				this.get(url, callback, opts);
			}, 100);
		}

		let params:any = {
			headers: this.http_headers
		};

		if (opts.params){
			params.params = opts.params;
		}

		const observable = this.http.get<any>((opts.url || this.url) + url, params);

		observable.pipe(
			first(),
			catchError(this.handleError(opts.err))
		).subscribe(resp=>{
			if (typeof this._http.replace === 'function'){
				this._http.replace(resp, callback);
			} else callback(resp);
		});

		return observable;
	}

	private _locked = false;

	lock(){
		this._locked = true;
	}

	unlock(){
		this._locked = false;
	}

	err(callback:any){
		if (typeof callback === 'function'){
			this._http.err = callback;
		}
	}

	private handleError(cb:any = this._http.err) {
		return function(error: HttpErrorResponse){
			cb && cb(error);

			return throwError("We can't connect to the server");
		}
	};
}
