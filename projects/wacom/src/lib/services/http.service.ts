import { Injectable, Inject, Optional } from '@angular/core';
import { CONFIG_TOKEN, Config } from '../interfaces/config';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, first } from 'rxjs/operators';
import { StoreService } from './store.service';

@Injectable({
	providedIn: 'root',
})
export class HttpService {
	errors: ((err: HttpErrorResponse, retry?: () => void) => {})[] = [];
	url = '';
	locked = false;
	awaitLocked: any[] = [];
	private _http: any;
	private _headers: any = {};
	private _http_headers = new HttpHeaders(this._headers);

	constructor(
		private store: StoreService,
		private http: HttpClient,
		@Inject(CONFIG_TOKEN) @Optional() private _config: Config
	) {
		this._http = this._config.http || {};

		if (typeof this._http.headers === 'object') {
			for (const header in this._http.headers) {
				this._headers[header] = this._http.headers[header];
			}
			this._http_headers = new HttpHeaders(this._headers);
		}

		this.store.get('http_url', (url: any) => {
			this.url = url || this._http.url || '';
		});

		this.store.getJson('http_headers', (headers: any) => {
			if (headers) {
				for (const header in headers) {
					this._headers[header] = headers[header];
				}
				this._http_headers = new HttpHeaders(this._headers);
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
		this._headers[key] = value;
		this.store.setJson('http_headers', this._headers);
		this._http_headers = new HttpHeaders(this._headers);
	}

	header(key: any) {
		return this._headers[key];
	}

	remove(key: any) {
		delete this._headers[key];
		this._http_headers = new HttpHeaders(this._headers);
		this.store.setJson('http_headers', this._headers);
	}

	private _httpMethod(method: string, _url: string, doc: unknown, headers: any): Observable<any> {
		if (method === 'post') {
			return this.http.post<any>(_url, doc, headers);
		} else if (method === 'put') {
			return this.http.put<any>(_url, doc, headers);
		} else if (method === 'patch') {
			return this.http.patch<any>(_url, doc, headers);
		} else if (method === 'delete') {
			return this.http.delete<any>(_url, headers);
		} else {
			return this.http.get<any>(_url, headers);
		}
	}

	private _post(
		url: string,
		doc: unknown,
		callback = (resp: unknown) => { },
		opts: any = {},
		method = 'post'
	): Observable<any> {
		if (typeof opts === 'function') {
			opts = { err: opts };
		}

		if (!opts.err) {
			opts.err = (err: HttpErrorResponse) => { };
		}

		if (this.locked && !opts.skipLock) {
			const wait = setTimeout(() => {
				this._post(url, doc, callback, opts, method);
			}, 100);

			this.awaitLocked.push(wait);
			return new Subject().asObservable();
		}

		const _url = (opts.url || this.url) + url;

		this.prepare_handle(_url, doc);

		const observable = this._httpMethod(method, _url, doc, { headers: this._http_headers });

		observable
			.pipe(
				first(),
				catchError((error: HttpErrorResponse) => {
					this.handleError(opts.err, () => {
						this._post(url, doc, callback, opts, method);
					})(error);
					return EMPTY;
				})
			)
			.subscribe((resp: unknown) => {
				this.response_handle(_url, resp, () => {
					callback(resp);
				});
			});

		return observable;
	}

	post(url: string, doc: any, callback = (resp: any) => { }, opts: any = {}): Observable<any> {
		return this._post(url, doc, callback, opts);
	}

	put(url: string, doc: any, callback = (resp: any) => { }, opts: any = {}): Observable<any> {
		return this._post(url, doc, callback, opts, 'put');
	}

	patch(url: string, doc: any, callback = (resp: any) => { }, opts: any = {}): Observable<any> {
		return this._post(url, doc, callback, opts, 'patch');
	}

	delete(url: string, callback = (resp: any) => { }, opts: any = {}): Observable<any> {
		return this._post(url, null, callback, opts, 'delete');
	}

	get(url: string, callback = (resp: any) => { }, opts: any = {}): Observable<any> {
		return this._post(url, null, callback, opts, 'get');
	}

	clearLocked() {
		for (const awaitLocked of this.awaitLocked) {
			clearTimeout(awaitLocked);
		}
		this.awaitLocked = [];
	}

	lock() {
		this.locked = true;
	}

	unlock() {
		this.locked = false;
	}

	private handleError(callback: any, retry: () => void) {
		return (error: HttpErrorResponse): Promise<void> => {
			return new Promise((resolve) => {
				this.err_handle(error, callback, retry);
				resolve();
			});
		};
	}

	private err_handle(
		err: HttpErrorResponse,
		next: (err: HttpErrorResponse) => void,
		retry: () => void
	) {
		if (typeof next === 'function') {
			next(err);
		}

		for (const callback of this.errors) {
			if (typeof callback === 'function') {
				callback(err, retry);
			}
		}
	}

	private prepare_handle(url: string, body: unknown) { }

	private response_handle(url: string, body: unknown, next: () => void) {
		if (typeof next === 'function') {
			next();
		}
	}
}
