import {
	HttpClient,
	HttpErrorResponse,
	HttpHeaders,
} from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { EMPTY, Observable, ReplaySubject } from 'rxjs';
import { catchError, first } from 'rxjs/operators';
import { CONFIG_TOKEN, Config } from '../interfaces/config.interface';
import { StoreService } from './store.service';

@Injectable({
	providedIn: 'root',
})
export class HttpService {
	// An array of error handling callbacks
	errors: ((err: HttpErrorResponse, retry?: () => void) => {})[] = [];

	// Base URL for HTTP requests
	url = '';

	// Flag to lock the service to prevent multiple requests
	locked = false;

	// Array to store setTimeout IDs for managing request locks
	awaitLocked: any[] = [];

	// Configuration object for HTTP settings
	private _http: any;

	// Object to store HTTP headers
	private _headers: any = {};

	// Instance of HttpHeaders with current headers
	private _http_headers = new HttpHeaders(this._headers);

	constructor(
		private store: StoreService,
		private http: HttpClient,
		@Inject(CONFIG_TOKEN) @Optional() private _config: Config
	) {
		// Initialize HTTP configuration and headers from injected config
		this._http = this._config.http || {};

		if (typeof this._http.headers === 'object') {
			for (const header in this._http.headers) {
				this._headers[header] = this._http.headers[header];
			}

			this._http_headers = new HttpHeaders(this._headers);
		}

		// Retrieve and set the base URL and headers from the store
		this.store.get('http_url', (url) => {
			this.url = url || this._http.url || '';
		});

		this.store
			.getJson<Record<string, string>>('http_headers')
			.then((headers) => {
				headers ||= {};

				for (const header in headers) {
					this._headers[header] = headers[header];
				}

				this._http_headers = new HttpHeaders(this._headers);
			});
	}

	// Set a new base URL and save it in the store
	setUrl(url: string) {
		this.url = url;

		this.store.set('http_url', url);
	}

	// Remove the base URL and revert to the default or stored one
	removeUrl() {
		this.url = this._http.url || '';

		this.store.remove('http_url');
	}

	// Set a new HTTP header and update the stored headers
	set(key: any, value: any) {
		this._headers[key] = value;

		this.store.setJson<Record<string, string>>(
			'http_headers',
			this._headers
		);

		this._http_headers = new HttpHeaders(this._headers);
	}

	// Get the value of a specific HTTP header
	header(key: any) {
		return this._headers[key];
	}

	// Remove a specific HTTP header and update the stored headers
	remove(key: any) {
		delete this._headers[key];

		this._http_headers = new HttpHeaders(this._headers);

		this.store.setJson<Record<string, string>>(
			'http_headers',
			this._headers
		);
	}

	// Internal method to make HTTP requests based on the method type
	private _httpMethod(
		method: string,
		_url: string,
		doc: unknown,
		headers: any
	): Observable<any> {
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

	/**
	 * Internal method to handle HTTP requests for various methods (POST, PUT, PATCH, DELETE, GET).
	 *
	 * Features:
	 * - **Request Locking**: Manages request locking to prevent simultaneous requests.
	 * - **Acceptance Check**: Validates the server response against a user-defined `acceptance` function.
	 *   If the check fails, the response is rejected with an error.
	 * - **Replace Logic**: Allows modification of specific parts of the response object, determined by a user-defined `replace` function.
	 *   Can handle both objects and arrays within the response.
	 * - **Field Filtering**: Supports extracting specific fields from response objects or arrays.
	 * - **Legacy Support**: Compatible with callback-based usage alongside Observables.
	 * - **ReplaySubject**: Ensures that the response can be shared across multiple subscribers.
	 *
	 * @param url - The endpoint to send the HTTP request to (relative to the base URL).
	 * @param doc - The request payload for methods like POST, PUT, and PATCH.
	 * @param callback - A legacy callback function to handle the response.
	 * @param opts - Additional options:
	 *   - `err`: Error handling callback.
	 *   - `acceptance`: Function to validate the server response. Should return `true` for valid responses.
	 *   - `replace`: Function to modify specific parts of the response data.
	 *   - `fields`: Array of fields to extract from the response object(s).
	 *   - `data`: Path in the response where the data resides for `replace` and `fields` operations.
	 *   - `skipLock`: If `true`, bypasses request locking.
	 *   - `url`: Overrides the base URL for this request.
	 * @param method - The HTTP method (e.g., 'post', 'put', 'patch', 'delete', 'get').
	 * @returns An Observable that emits the processed HTTP response or an error.
	 */
	private _post(
		url: string,
		doc: unknown,
		callback = (resp: unknown) => {},
		opts: any = {},
		method = 'post'
	): Observable<any> {
		if (typeof opts === 'function') {
			opts = { err: opts };
		}

		if (!opts.err) {
			opts.err = (err: HttpErrorResponse) => {};
		}

		// Handle request locking to avoid multiple simultaneous requests
		if (this.locked && !opts.skipLock) {
			return new Observable((observer) => {
				const wait = setTimeout(() => {
					this._post(url, doc, callback, opts, method).subscribe(
						observer
					);
				}, 100);
				this.awaitLocked.push(wait);
			});
		}

		const _url = (opts.url || this.url) + url;

		this.prepare_handle(_url, doc);

		// Using ReplaySubject to allow multiple subscriptions without re-triggering the HTTP request
		const responseSubject = new ReplaySubject<any>(1);

		this._httpMethod(method, _url, doc, { headers: this._http_headers })
			.pipe(
				first(),
				catchError((error: HttpErrorResponse) => {
					this.handleError(opts.err, () => {
						this._post(url, doc, callback, opts, method).subscribe(
							responseSubject
						);
					})(error);

					responseSubject.error(error);

					return EMPTY;
				})
			)
			.subscribe({
				next: (resp: unknown) => {
					if (
						opts.acceptance &&
						typeof opts.acceptance === 'function'
					) {
						if (!opts.acceptance(resp)) {
							const error = new HttpErrorResponse({
								error: 'Acceptance failed',
								status: 400,
							});

							this.handleError(opts.err, () => {})(error);

							responseSubject.error(error);

							return;
						}
					}

					if (opts.replace && typeof opts.replace === 'function') {
						if (
							Array.isArray(
								this._getObjectToReplace(resp, opts.data)
							)
						) {
							(
								this._getObjectToReplace(
									resp,
									opts.data
								) as Array<unknown>
							).map((item: unknown) => opts.replace(item));
						} else if (this._getObjectToReplace(resp, opts.data)) {
							opts.replace(
								this._getObjectToReplace(resp, opts.data)
							);
						}
					}

					if (Array.isArray(opts.fields)) {
						if (
							Array.isArray(
								this._getObjectToReplace(resp, opts.data)
							)
						) {
							(
								this._getObjectToReplace(
									resp,
									opts.data
								) as Array<unknown>
							).map((item: unknown) => {
								return this._newDoc(item, opts.fields);
							});
						} else if (this._getObjectToReplace(resp, opts.data)) {
							const newDoc = this._newDoc(
								this._getObjectToReplace(resp, opts.data),
								opts.fields
							);

							if (opts.data) {
								this._setObjectToReplace(
									resp,
									opts.data,
									newDoc
								);
							} else {
								resp = newDoc;
							}
						}
					}

					this.response_handle(_url, resp, () => callback(resp));

					responseSubject.next(resp);

					responseSubject.complete();
				},
				error: (err) => responseSubject.error(err),
				complete: () => responseSubject.complete(),
			});

		return responseSubject.asObservable();
	}

	/**
	 * Public method to perform a POST request.
	 * - Supports legacy callback usage.
	 * - Returns an Observable for reactive programming.
	 */
	post(
		url: string,
		doc: any,
		callback = (resp: any) => {},
		opts: any = {}
	): Observable<any> {
		return this._post(url, doc, callback, opts);
	}

	/**
	 * Public method to perform a PUT request.
	 * - Supports legacy callback usage.
	 * - Returns an Observable for reactive programming.
	 */
	put(
		url: string,
		doc: any,
		callback = (resp: any) => {},
		opts: any = {}
	): Observable<any> {
		return this._post(url, doc, callback, opts, 'put');
	}

	/**
	 * Public method to perform a PATCH request.
	 * - Supports legacy callback usage.
	 * - Returns an Observable for reactive programming.
	 */
	patch(
		url: string,
		doc: any,
		callback = (resp: any) => {},
		opts: any = {}
	): Observable<any> {
		return this._post(url, doc, callback, opts, 'patch');
	}

	/**
	 * Public method to perform a DELETE request.
	 * - Supports legacy callback usage.
	 * - Returns an Observable for reactive programming.
	 */
	delete(
		url: string,
		callback = (resp: any) => {},
		opts: any = {}
	): Observable<any> {
		return this._post(url, null, callback, opts, 'delete');
	}

	/**
	 * Public method to perform a GET request.
	 * - Supports legacy callback usage.
	 * - Returns an Observable for reactive programming.
	 */
	get(
		url: string,
		callback = (resp: any) => {},
		opts: any = {}
	): Observable<any> {
		return this._post(url, null, callback, opts, 'get');
	}

	// Clear all pending request locks
	clearLocked() {
		for (const awaitLocked of this.awaitLocked) {
			clearTimeout(awaitLocked);
		}
		this.awaitLocked = [];
	}

	// Lock the service to prevent multiple simultaneous requests
	lock() {
		this.locked = true;
	}

	// Unlock the service to allow new requests
	unlock() {
		this.locked = false;
	}

	/**
	 * Handles HTTP errors.
	 * - Calls provided error callback and retries the request if needed.
	 */
	private handleError(callback: any, retry: () => void) {
		return (error: HttpErrorResponse): Promise<void> => {
			return new Promise((resolve) => {
				this.err_handle(error, callback, retry);
				resolve();
			});
		};
	}

	/**
	 * Internal method to trigger error handling callbacks.
	 */
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

	// Placeholder method for handling request preparation (can be customized)
	private prepare_handle(url: string, body: unknown) {}

	// Placeholder method for handling the response (can be customized)
	private response_handle(url: string, body: unknown, next: () => void) {
		if (typeof next === 'function') {
			next();
		}
	}

	/**
	 * Retrieves a nested object or property from the response based on a dot-separated path.
	 *
	 * @param resp - The response object to retrieve data from.
	 * @param base - A dot-separated string indicating the path to the desired property within the response.
	 *   - Example: `'data.items'` will navigate through `resp.data.items`.
	 *   - If empty, the entire response is returned.
	 * @returns The object or property located at the specified path within the response.
	 */
	private _getObjectToReplace(resp: unknown, base = ''): unknown {
		if (base.includes('.')) {
			const newBase = base.split('');

			const currentBase: string = newBase.pop() || '';

			return this._getObjectToReplace(
				(resp as Record<string, unknown>)[currentBase] || {},
				newBase.join('.')
			);
		} else if (base) {
			return (resp as Record<string, unknown>)[base];
		} else {
			return resp;
		}
	}

	/**
	 * Sets or replaces a nested object or property in the response based on a dot-separated path.
	 *
	 * @param resp - The response object to modify.
	 * @param base - A dot-separated string indicating the path to the property to replace.
	 *   - Example: `'data.items'` will navigate through `resp.data.items`.
	 * @param doc - The new data or object to set at the specified path.
	 * @returns `void`.
	 */
	private _setObjectToReplace(resp: unknown, base = '', doc: unknown): void {
		while (base.includes('.')) {
			const newBase = base.split('');

			const currentBase: string = newBase.pop() || '';

			resp = (resp as Record<string, unknown>)[currentBase] || {};

			base = newBase.join('.');
		}

		(resp as Record<string, unknown>)[base] = doc;
	}

	/**
	 * Creates a new object containing only specified fields from the input item.
	 *
	 * @param item - The input object to extract fields from.
	 * @param fields - An array of field names to include in the new object.
	 *   - Example: `['id', 'name']` will create a new object with only the `id` and `name` properties from `item`.
	 * @returns A new object containing only the specified fields.
	 */
	private _newDoc(item: unknown, fields: string[]): unknown {
		const newDoc: Record<string, unknown> = {};

		for (const field of fields) {
			newDoc[field] = (item as Record<string, unknown>)[field];
		}

		return newDoc;
	}
}
