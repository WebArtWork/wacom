import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs'; 
import { catchError } from 'rxjs/operators'; 

@Injectable({
	providedIn: 'root'
})
export class HttpService {
	private url = '';
	constructor(private http: HttpClient, @Inject(CONFIG_TOKEN) @Optional() private config: Config){
		if(!this.config) this.config = DEFAULT_CONFIG;
		this.url = this.config.url || '';
	}
	post(url, doc, callback=(resp:any) => {}, opts:any={}){
		if(!opts.err) opts.err = (err:HttpErrorResponse)=>{};
		this.http.post<any>(this.url+url, doc).pipe(catchError(this.handleError(opts.err))).subscribe(callback);
	}
	get(url, callback=(resp:any) => {}, opts:any={}){
		if(!opts.err) opts.err = (err:HttpErrorResponse)=>{};
		this.http.get<any>(this.url+url).pipe(catchError(this.handleError(opts.err))).subscribe(callback);
	}
	private handleError(cb = err=>{}) {
		return function(error: HttpErrorResponse){
			cb(error);
			return throwError("We can't connect to the server");
		}
	};
}