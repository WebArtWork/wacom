import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { StoreService } from './store.service';

@Injectable({
	providedIn: 'root'
})
export class HttpService {
	private _http: any;
	private url = '';
	private headers:any = {};
	private http_headers = new HttpHeaders(this.headers);
	set(key:any, value:any){
		this.headers[key] = value;
		this.store.setJson('http_headers', this.headers);
		this.http_headers = new HttpHeaders(this.headers);
	}
	header(key:any){
		return this.headers[key];
	}
	remove(key:any){
		delete this.headers[key];
		this.http_headers = new HttpHeaders(this.headers);
		this.store.setJson('http_headers', this.headers);
	}
	constructor(private store: StoreService, private http: HttpClient,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config) {
		this._http = config.http;
		if (!this.config) this.config = DEFAULT_CONFIG;
		if (!this._http) this._http = {};
		this.store.getJson('http_headers', (headers:any)=>{
			if(headers) {
				this.headers = headers;
				this.http_headers = new HttpHeaders(this.headers);
			}
			this.url = this._http.url || '';
		});
	}
	post(url:any, doc:any, callback=(resp:any) => {}, opts:any={}):any{
		if(typeof opts == 'function'){
			opts = {
				err: opts
			}
		}
		if(!opts.err) opts.err = (err:HttpErrorResponse)=>{};
		if(this.locked){
			return setTimeout(()=>{
				this.post(url, doc, callback, opts);
			}, 100);
		}
		this.http.post<any>((opts.url||this.url)+url, doc, {
			headers: this.http_headers
		}).pipe(catchError(this.handleError(opts.err))).subscribe(resp=>{
			if(typeof this._http.replace == 'function'){
				this._http.replace(resp, callback);
			}else callback(resp);
		});
	}
	put(url:any, doc:any, callback=(resp:any) => {}, opts:any={}):any{
		if(typeof opts == 'function'){
			opts = {
				err: opts
			}
		}
		if(!opts.err) opts.err = (err:HttpErrorResponse)=>{};
		if(this.locked){
			return setTimeout(()=>{
				this.put(url, doc, callback, opts);
			}, 100);
		}
		this.http.put<any>((opts.url||this.url)+url, doc, {
			headers: this.http_headers
		}).pipe(catchError(this.handleError(opts.err))).subscribe(resp=>{
			if(typeof this._http.replace == 'function'){
				this._http.replace(resp, callback);
			}else callback(resp);
		});
	}
	patch(url:any, doc:any, callback=(resp:any) => {}, opts:any={}):any{
		if(typeof opts == 'function'){
			opts = {
				err: opts
			}
		}
		if(!opts.err) opts.err = (err:HttpErrorResponse)=>{};
		if(this.locked){
			return setTimeout(()=>{
				this.patch(url, doc, callback, opts);
			}, 100);
		}
		this.http.patch<any>((opts.url||this.url)+url, doc, {
			headers: this.http_headers
		}).pipe(catchError(this.handleError(opts.err))).subscribe(resp=>{
			if(typeof this._http.replace == 'function'){
				this._http.replace(resp, callback);
			}else callback(resp);
		});
	}
	delete(url:any, doc:any, callback=(resp:any) => {}, opts:any={}):any{
		if(typeof opts == 'function'){
			opts = {
				err: opts
			}
		}
		if(!opts.err) opts.err = (err:HttpErrorResponse)=>{};
		if(this.locked){
			return setTimeout(()=>{
				this.delete(url, doc, callback, opts);
			}, 100);
		}
		this.http.request<any>('delete', (opts.url||this.url)+url, {
			headers: this.http_headers,
			body: doc || {}
		}).pipe(catchError(this.handleError(opts.err))).subscribe(resp=>{
			if(typeof this._http.replace == 'function'){
				this._http.replace(resp, callback);
			}else callback(resp);
		});
	}
	get(url:any, callback=(resp:any) => {}, opts:any={}):any{
		if(typeof opts == 'function'){
			opts = {
				err: opts
			}
		}
		if(!opts.err) opts.err = (err:HttpErrorResponse)=>{};
		if(this.locked){
			return setTimeout(()=>{
				this.get(url, callback, opts);
			}, 100);
		}
		let params:any = {
			headers: this.http_headers
		};
		if(opts.params){
			params.params = opts.params;
		}
		this.http.get<any>((opts.url||this.url)+url, params).pipe(catchError(this.handleError(opts.err))).subscribe(resp=>{
			if(typeof this._http.replace == 'function'){
				this._http.replace(resp, callback);
			}else callback(resp);
		});
	}
	// http management
	private locked = false;
	lock(){
		this.locked = true;
	}
	unlock(){
		this.locked = false;
	}
	err(callback:any){
		if(typeof callback == 'function'){
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
