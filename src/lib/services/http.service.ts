import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators'; 

@Injectable({
	providedIn: 'root'
})
export class HttpService {
	private url = '';
	private headers = localStorage.getItem('waw_headers') && JSON.parse(localStorage.getItem('waw_headers')) || {};
	private http_headers = new HttpHeaders(this.headers);
	set(key, value){
		this.headers[key] = value;
		this.http_headers = new HttpHeaders(this.headers);
	}
	remove(key){
		delete this.headers[key];
		this.http_headers = new HttpHeaders(this.headers);
	}
	constructor(private http: HttpClient, @Inject(CONFIG_TOKEN) @Optional() private config: Config){
		if(!this.config) this.config = DEFAULT_CONFIG;
		if(!this.config.http) this.config.http = {};
		this.url = this.config.http.url || '';
	}
	post(url, doc, callback=(resp:any) => {}, opts:any={}){
		if(typeof opts == 'function'){
			opts = {
				err: opts
			}
		}
		if(!opts.err) opts.err = (err:HttpErrorResponse)=>{};
		this.http.post<any>(this.url+url, doc, {
			headers: this.http_headers
		}).pipe(catchError(this.handleError(opts.err))).subscribe(resp=>{
			if(typeof this.config.http.replace == 'function'){
				this.config.http.replace(resp, callback);
			}else callback(resp);
		});
	}
	get(url, callback=(resp:any) => {}, opts:any={}){
		if(typeof opts == 'function'){
			opts = {
				err: opts
			}
		}
		if(!opts.err) opts.err = (err:HttpErrorResponse)=>{};
		this.http.get<any>(this.url+url, {
			headers: this.http_headers
		}).pipe(catchError(this.handleError(opts.err))).subscribe(resp=>{
			if(typeof this.config.http.replace == 'function'){
				this.config.http.replace(resp, callback);
			}else callback(resp);
		});
	}
	private handleError(cb = err=>{}) {
		return function(error: HttpErrorResponse){
			cb(error);
			return throwError("We can't connect to the server");
		}
	};
}