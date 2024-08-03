import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { CONFIG_TOKEN, Config } from '../interfaces/config';
import { EMPTY, Subject, Observable } from 'rxjs';
import { catchError, first } from 'rxjs/operators';
import { StoreService } from './store.service';

@Injectable({
	providedIn: 'root',
})
export class HttpService {
	private errors: Array<(err: HttpErrorResponse, retry?: () => void) => void> = [];
	private _http: any = {};
	private _headers: { [key: string]: string } = {};
	private _httpHeaders = new HttpHeaders(this._headers);
	private url = '';
	private locked = false;
	private awaitLocked: any[] = [];

	/**
	 * Constructor to initialize HttpService.
	 *
	 * @param store - Instance of StoreService to manage storage.
	 * @param http - Instance of HttpClient to make HTTP requests.
	 * @param config - Optional configuration for HTTP service.
	 */
	constructor(
		private store: StoreService,
		private http: HttpClient,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config
	) {
		this._http = this.config?.http || {};
		this.initializeHeaders(this._http.headers);

		this.store.get('http_url', (url: string) => {
			this.url = url || this._http.url || '';
		});

		this.store.getJson('http_headers', (headers: { [key: string]: string }) => {
			if (headers) {
				this.initializeHeaders(headers);
			}
		});
	}

	/**
	 * Initializes HTTP headers.
	 *
	 * @param headers - Headers to initialize.
	 */
	private initializeHeaders(headers: { [key: string]: string } = {}): void {
		for (const header in headers) {
			this._headers[header] = headers[header];
		}
		this._httpHeaders = new HttpHeaders(this._headers);
	}

	/**
	 * Sets the base URL for HTTP requests.
	 *
	 * @param url - The base URL to set.
	 */
	public setUrl(url: string): void {
		this.url = url;
		this.store.set('http_url', url);
	}

	/**
	 * Removes the base URL for HTTP requests.
	 */
	public removeUrl(): void {
		this.url = this._http.url || '';
		this.store.remove('http_url');
	}

	/**
	 * Sets an HTTP header.
	 *
	 * @param key - The header key.
	 * @param value - The header value.
	 */
	public setHeader(key: string, value: string): void {
		this._headers[key] = value;
		this.store.setJson('http_headers', this._headers);
		this._httpHeaders = new HttpHeaders(this._headers);
	}

	/**
	 * Gets the value of an HTTP header.
	 *
	 * @param key - The header key.
	 * @returns The value of the header.
	 */
	public getHeader(key: string): string | undefined {
		return this._headers[key];
	}

	/**
	 * Removes an HTTP header.
	 *
	 * @param key - The header key to remove.
	 */
	public removeHeader(key: string): void {
		delete this._headers[key];
		this._httpHeaders = new HttpHeaders(this._headers);
		this.store.setJson('http_headers', this._headers);
	}

	/**
	 * Makes an HTTP POST request.
	 *
	 * @param url - The URL to send the request to.
	 * @param body - The body of the request.
	 * @param options - Optional parameters.
	 * @returns An Observable of the HTTP response.
	 */
	public post<T>(url: string, body: any, options: any = {}): Observable<T> {
		return this.request<T>('post', url, body, options);
	}

	/**
	 * Makes an HTTP PUT request.
	 *
	 * @param url - The URL to send the request to.
	 * @param body - The body of the request.
	 * @param options - Optional parameters.
	 * @returns An Observable of the HTTP response.
	 */
	public put<T>(url: string, body: any, options: any = {}): Observable<T> {
		return this.request<T>('put', url, body, options);
	}

	/**
	 * Makes an HTTP PATCH request.
	 *
	 * @param url - The URL to send the request to.
	 * @param body - The body of the request.
	 * @param options - Optional parameters.
	 * @returns An Observable of the HTTP response.
	 */
	public patch<T>(url: string, body: any, options: any = {}): Observable<T> {
		return this.request<T>('patch', url, body, options);
	}

	/**
	 * Makes an HTTP DELETE request.
	 *
	 * @param url - The URL to send the request to.
	 * @param options - Optional parameters.
	 * @returns An Observable of the HTTP response.
	 */
	public delete<T>(url: string, options: any = {}): Observable<T> {
		return this.request<T>('delete', url, null, options);
	}

	/**
	 * Makes an HTTP GET request.
	 *
	 * @param url - The URL to send the request to.
	 * @param options - Optional parameters.
	 * @returns An Observable of the HTTP response.
	 */
	public get<T>(url: string, options: any = {}): Observable<T> {
		return this.request<T>('get', url, null, options);
	}

	/**
	 * General method to make HTTP requests.
	 *
	 * @param method - The HTTP method to use.
	 * @param url - The URL to send the request to.
	 * @param body - The body of the request.
	 * @param options - Optional parameters.
	 * @returns An Observable of the HTTP response.
	 */
	private request<T>(method: string, url: string, body: any, options: any): Observable<T> {
		if (this.locked && !options.skipLock) {
			const subject = new Subject<T>();
			const wait = setTimeout(() => {
				this.request<T>(method, url, body, options).subscribe(subject);
			}, 100);
			this.awaitLocked.push(wait);
			return subject.asObservable();
		}

		const fullUrl = (options.url || this.url) + url;
		this.prepareHandle(fullUrl, body);

		const observable = this.http.request<T>(method, fullUrl, {
			body,
			headers: this._httpHeaders,
			...options,
		});

		return observable.pipe(
			first(),
			catchError((error: HttpErrorResponse) => this.handleError<T>(options.err, () => this.request<T>(method, url, body, options))(error))
		) as Observable<T>;
	}

	/**
	 * Prepares the request before sending.
	 *
	 * @param url - The URL of the request.
	 * @param body - The body of the request.
	 */
	private prepareHandle(url: string, body: any): void {
		// Custom preparation logic
	}

	/**
	 * Handles HTTP errors.
	 *
	 * @param callback - The error callback.
	 * @param retry - The retry function.
	 * @returns A function that handles the error.
	 */
	private handleError<T>(callback: (err: HttpErrorResponse) => void, retry: () => void): (error: HttpErrorResponse) => Observable<T> {
		return (error: HttpErrorResponse): Observable<T> => {
			this.errHandle(error, callback, retry);
			return EMPTY;
		};
	}

	/**
	 * Central error handling method.
	 *
	 * @param err - The HTTP error.
	 * @param next - The next error callback.
	 * @param retry - The retry function.
	 */
	private errHandle(err: HttpErrorResponse, next: (err: HttpErrorResponse) => void, retry: () => void): void {
		if (typeof next === 'function') {
			next(err);
		}

		for (const callback of this.errors) {
			if (typeof callback === 'function') {
				callback(err, retry);
			}
		}
	}

	/**
	 * Locks the HTTP service to prevent concurrent requests.
	 */
	public lock(): void {
		this.locked = true;
	}

	/**
	 * Unlocks the HTTP service to allow requests.
	 */
	public unlock(): void {
		this.locked = false;
		this.clearLocked();
	}

	/**
	 * Clears the list of locked requests.
	 */
	private clearLocked(): void {
		for (const timeout of this.awaitLocked) {
			clearTimeout(timeout);
		}
		this.awaitLocked = [];
	}
}
