import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class HttpService {
	private url = '';
	constructor(private http: HttpClient,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config){
		if(!this.config) this.config = DEFAULT_CONFIG;
		this.url = this.config.url || '';
	}
	post(url, doc, callback=(resp:any) => {}, opts={}){
		this.http.post(this.url+url, doc).subscribe(callback);
	}
	get(url, callback=(resp:any) => {}, opts={}){
		this.http.get(this.url+url).subscribe(callback);
	}
}
