import { Injectable, Inject, Optional } from '@angular/core';
import { CONFIG_TOKEN, Config } from '../interfaces/config';
import {
	HttpClient,
	HttpErrorResponse,
	HttpHeaders,
} from '@angular/common/http';
import { Subject } from 'rxjs';
import { catchError, first } from 'rxjs/operators';
import { StoreService } from './store.service';

@Injectable({
	providedIn: 'root',
})
export class HttpService {
	err_handle(
		err: HttpErrorResponse,
		next: (err: HttpErrorResponse) => void,
		retry: () => void
	) {
		if (typeof next === 'function') {
			next(err);
		}
	}

	prepare_handle(url: string, body: unknown) { }

	response_handle(url: string, body: unknown, next: () => void) {
		if (typeof next === 'function') {
			next();
		}
	}

	constructor(
		private store: StoreService,
		private http: HttpClient,
		@Inject(CONFIG_TOKEN) @Optional() private _config: Config
	) {
		this._http = this._config.http;

		if (!this._http) this._http = {};

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

	url = '';

	setUrl(url: string) {
		this.url = url;
		this.store.set('http_url', url);
	}

	removeUrl() {
		this.url = this._http.url || '';
		this.store.remove('http_url');
	}

	private _http: any;

	private _headers: any = {};

	private _http_headers = new HttpHeaders(this._headers);

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

	_httpMethod(method: string, _url: string, doc: unknown, headers: any) {
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

	_post(
		url: string,
		doc: unknown,
		callback = (resp: unknown) => { },
		opts: any = {},
		method = 'post',
		subject = new Subject()
	): any {
		if (typeof opts === 'function') {
			opts = {
				err: opts,
			};
		}

		if (!opts.err) {
			opts.err = (err: HttpErrorResponse) => { };
		}

		if (this.locked && !opts.skipLock) {
			const wait = setTimeout(() => {
				this._post(url, doc, callback, opts, method, subject);
			}, 100);

			this.awaitLocked.push(wait);

			return subject;
		}

		const _url = (opts.url || this.url) + url;

		this.prepare_handle(_url, doc);

		const observable = this._httpMethod(method, _url, doc, {
			headers: this._http_headers,
		});

		observable
			.pipe(
				first(),
				catchError(
					this.handleError(opts.err, () => {
						this._post(url, doc, callback, opts, method);
					})
				)
			)
			.subscribe((resp: unknown) => {
				this.response_handle(_url, resp, () => {
					callback(resp);
					subject.next(resp);
				});
			});

		return subject;
	}

	post(url: any, doc: any, callback = (resp: any) => { }, opts: any = {}): any {
		this._post(url, doc, callback, opts);
	}

	put(url: any, doc: any, callback = (resp: any) => { }, opts: any = {}): any {
		this._post(url, doc, callback, opts, 'put');
	}

	patch(url: any, doc: any, callback = (resp: any) => { }, opts: any = {}): any {
		this._post(url, doc, callback, opts, 'patch');
	}

	delete(url: any, callback = (resp: any) => { }, opts: any = {}): any {
		this._post(url, null, callback, opts, 'delete');
	}

	get(url: any, callback = (resp: any) => { }, opts: any = {}): any {
		this._post(url, null, callback, opts, 'get');
	}

	locked = false;

	awaitLocked: any = [];

	clearLocked() {
		for (const awaitLocked of this.awaitLocked){
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
		return (error: HttpErrorResponse): any => {
			this.err_handle(
				error,
				() => {
					if (typeof callback === 'function') {
						callback(error);
					}
				},
				() => {
					if (typeof retry === 'function') {
						retry();
					}
				}
			);
			// Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.
		};
	}
}
