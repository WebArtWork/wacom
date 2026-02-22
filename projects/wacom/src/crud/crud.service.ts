import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { defer, from, Observable, switchMap } from 'rxjs';
import { CoreService } from '../core/core.service';
import { EmitterService } from '../services/emitter.service';
import { HttpService } from '../services/http.service';
import { NetworkService } from '../services/network.service';
import { StoreService } from '../store/store.service';
import {
	CrudConfig,
	CrudDocument,
	CrudOptions,
	GetConfig,
} from './crud.interface';

/**
 * Abstract class representing a CRUD (Create, Read, Update, Delete) service.
 *
 * This class provides methods for managing documents, interacting with an API,
 * and storing/retrieving data from local storage. It is designed to be extended
 * for specific document types.
 *
 * @template Document - The type of the document the service handles.
 */
export abstract class CrudService<Document extends CrudDocument<Document>> {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	/**
	 * Base URL for the API collection associated with this service.
	 */
	private _url = '/api/';

	/**
	 * In-memory cache with all documents currently known by the service.
	 */
	private _docs: Document[] = [];

	/**
	 * Number of documents per page for paginated `get()` calls.
	 */
	private _perPage = 20;

	/**
	 * Registered callbacks that recompute filtered document views.
	 */
	private _filteredDocumentsCallbacks: (() => void)[] = [];

	/**
	 * HTTP client wrapper used for API communication.
	 */
	protected __httpService = inject(HttpService);

	/**
	 * Key–value storage service used to persist documents locally.
	 */
	protected __storeService = inject(StoreService);

	/**
	 * Core helper service with utility methods (copy, debounce, toSignal, etc.).
	 */
	protected __coreService = inject(CoreService);

	/**
	 * Global event bus for cross-service communication.
	 */
	protected __emitterService = inject(EmitterService);

	/**
	 * Network status service used to queue work while offline.
	 */
	protected __networkService = inject(NetworkService);

	/**
	 * Emits once when documents are restored from local storage on startup.
	 */
	loaded: Observable<unknown>;

	/**
	 * Emits once when the initial `get()` (without page param) completes.
	 */
	getted: Observable<unknown>;

	constructor(private _config: CrudConfig<Document>) {
		this._config.signalFields = this._config.signalFields || {};

		this._url += this._config.name;

		this.loaded = this.__emitterService.onComplete(
			this._config.name + '_loaded',
		);

		this.getted = this.__emitterService.onComplete(
			this._config.name + '_getted',
		);

		if (this._config.unauthorized) {
			this.restoreDocs();
		} else if (this._isBrowser && localStorage.getItem('waw_user')) {
			const user = JSON.parse(localStorage.getItem('waw_user') as string);

			if (
				user._id ===
				localStorage.getItem(this._config.name + 'waw_user_id')
			) {
				this.restoreDocs();
			}
		}

		this.__emitterService.on('wipe').subscribe((): void => {
			this.clearDocs();

			this._filterDocuments();
		});

		this.__emitterService.on('wacom_online').subscribe(() => {
			for (const callback of this._onOnline) {
				callback();
			}

			this._onOnline.length = 0;
		});
	}

	/**
	 * Cache of per-document signals indexed by document _id.
	 * Prevents creating multiple signals for the same document.
	 */
	private _signal: Record<string, WritableSignal<Document>> = {};

	/**
	 * Cache of per (field,value) lists of document signals.
	 * Key format: `${field}_${JSON.stringify(value)}`.
	 */
	private _signals: Record<
		string,
		WritableSignal<WritableSignal<Document>[]>
	> = {};

	/**
	 * Cache of per-field maps: fieldValue -> array of document signals.
	 */
	private _fieldSignals: Record<
		string,
		WritableSignal<Record<string, WritableSignal<Document>[]>>
	> = {};

	/**
	 * Returns a WritableSignal for a document by _id, creating it if absent.
	 * Caches the signal to avoid redundant instances and initializes it
	 * with the current snapshot of the document.
	 * Work very carefully with this and localId, better avoid such flows.
	 *
	 * @param _id - Document identifier or a document instance.
	 */
	getSignal(_id: string | Document) {
		if (typeof _id !== 'string') {
			_id = this._id(_id);
		}

		// Reuse existing signal if present
		if (this._signal[_id]) {
			return this._signal[_id];
		}

		// Always base the signal on the current canonical doc()
		const doc = this.doc(_id);

		this._signal[_id] = this.__coreService.toSignal(
			doc,
			this._config.signalFields,
		) as WritableSignal<Document>;

		return this._signal[_id];
	}

	/**
	 * Returns a signal with an array of document signals that match
	 * a given field/value pair.
	 *
	 * Example:
	 *   const activitiesSig = service.getSignals('userId', currentUserId);
	 */
	getSignals(field: string, value: unknown) {
		const id = field + '_' + JSON.stringify(value);

		if (!this._signals[id]) {
			this._signals[id] = signal<WritableSignal<Document>[]>(
				this._getSignals(id),
			);
		}

		return this._signals[id];
	}

	/**
	 * Builds the array of document signals for a given (field,value) key.
	 * Only documents with a real _id are included.
	 */
	private _getSignals(id: string): WritableSignal<Document>[] {
		const sep = id.indexOf('_');
		if (sep === -1) {
			return [];
		}

		const field = id.slice(0, sep) as keyof Document;
		const valueJson = id.slice(sep + 1);

		const list: WritableSignal<Document>[] = [];

		for (const doc of this.getDocs()) {
			if (JSON.stringify(doc[field] as unknown) !== valueJson) {
				continue;
			}

			const docId = this._id(doc);
			if (!docId) continue;

			list.push(this.getSignal(docId));
		}

		return list;
	}

	/**
	 * Returns a signal with a map: fieldValue -> array of document signals.
	 *
	 * Example:
	 *   const byStatusSig = service.getFieldSignals('status');
	 *   byStatusSig() might be { active: [sig1, sig2], draft: [sig3] }.
	 */
	getFieldSignals(field: string) {
		if (!this._fieldSignals[field]) {
			this._fieldSignals[field] = signal<
				Record<string, WritableSignal<Document>[]>
			>(this._getFieldSignals(field));
		}

		return this._fieldSignals[field];
	}

	/**
	 * Builds the map for a given field.
	 * Only documents with a real _id are included.
	 */
	private _getFieldSignals(
		field: string,
	): Record<string, WritableSignal<Document>[]> {
		const byFields: Record<string, WritableSignal<Document>[]> = {};

		for (const doc of this.getDocs()) {
			const docId = this._id(doc);
			if (!docId) continue;

			const value = String(doc[field as keyof Document]);

			if (!byFields[value]) {
				byFields[value] = [];
			}

			byFields[value].push(this.getSignal(docId));
		}

		return byFields;
	}

	/**
	 * Clears cached document signals except those explicitly preserved.
	 * Useful when changing routes or contexts to reduce memory.
	 *
	 * @param exceptIds - List of ids whose signals should be kept.
	 */
	removeSignals(exceptIds: string[] = []) {
		for (const _id in this._signal) {
			if (!exceptIds.includes(_id)) {
				delete this._signal[_id];
			}
		}
	}

	/**
	 * Restores documents from local storage (if present) and syncs
	 * all existing signals with the restored data.
	 */
	async restoreDocs() {
		const docs = await this.__storeService.getJson<Document[]>(
			'docs_' + this._config.name,
		);

		if (docs?.length) {
			this._docs.length = 0;

			this._docs.push(...docs);

			this._filterDocuments();

			for (const doc of this._docs) {
				if (doc.__deleted) {
					this.delete(doc, doc.__options?.['delete'] || {});
				} else if (!doc._id) {
					this.create(doc, doc.__options?.['create'] || {});
				} else if (doc.__modified?.length) {
					for (const id of doc.__modified) {
						if (id.startsWith('up')) {
							this.update(doc, doc.__options?.[id] || {});
						} else {
							this.unique(doc, doc.__options?.[id] || {});
						}
					}
				}
			}

			this.__emitterService.complete(
				this._config.name + '_loaded',
				this._docs,
			);
		}
	}

	/**
	 * Saves the current set of documents to local storage.
	 */
	setDocs(): void {
		this.__storeService.setJson<Document[]>(
			'docs_' + this._config.name,
			this._docs,
		);
	}

	/**
	 * Retrieves the current list of documents.
	 *
	 * @returns The list of documents.
	 */
	getDocs(filter: (doc: Document) => boolean = () => true): Document[] {
		return this._docs.filter(filter);
	}

	/**
	 * Retrieves the first document that matches the given predicate.
	 *
	 * @param find - Predicate used to locate a specific document.
	 */
	getDoc(find: (doc: Document) => boolean): Document | undefined {
		return this._docs.find(find);
	}

	/**
	 * Clears the current list of documents, persists the empty state
	 * and recomputes all derived signals.
	 *
	 * Empties the internal documents array and saves the updated state to local storage.
	 */
	clearDocs(): void {
		this._docs.splice(0, this._docs.length);

		this.setDocs();

		this._updateSignals();
	}

	/**
	 * Adds multiple documents to the service and saves them to local storage.
	 *
	 * @param docs - An array of documents to add.
	 */
	addDocs(docs: Document[]): void {
		if (Array.isArray(docs)) {
			for (const doc of docs) {
				this.addDoc(doc);
			}
		}
	}

	/**
	 * Adds a single document to the service. If it already exists, it will be updated.
	 *
	 * @param doc - The document to add.
	 */
	addDoc(doc: Document): void {
		if (this._config.replace) {
			this._config.replace(doc);
		}

		const existingDoc = this._docs.find(
			(d) =>
				(this._id(doc) && this._id(d) === this._id(doc)) ||
				(doc._localId && d._localId === doc._localId),
		);

		if (existingDoc) {
			this.__coreService.copy(doc, existingDoc);
			this.__coreService.copy(existingDoc, doc);
			this._syncSignalForDoc(existingDoc);
		} else {
			this._docs.push(doc);
			this._syncSignalForDoc(doc);
		}

		this.setDocs();
	}

	/**
	 * Creates a new document with a temporary ID and status flags.
	 *
	 * @param doc - Optional base document to use for the new document.
	 * @returns A new document instance with default properties.
	 */
	new(doc: Document = {} as Document): Document {
		return {
			...doc,
			_id: undefined,
			_localId: this._localId(),
			__created: false,
			__modified: false,
		} as Document;
	}

	/**
	 * Retrieves a document by its unique ID or creates a new one if it doesn't exist.
	 *
	 * @param _id - The document ID to search for.
	 * @returns The found document or a new document if not found.
	 */
	doc(_id: string): Document {
		// If we already have a signal for this id, use its current value
		if (this._signal[_id]) {
			return this._signal[_id]();
		}

		let doc =
			this._docs.find(
				(d) =>
					this._id(d) === _id ||
					(d._localId && d._localId === Number(_id)),
			) || null;

		// If doc not found, create + push into _docs so it is not detached
		if (!doc) {
			doc = this.new({ _id } as Document);
			this._docs.push(doc);
			this.setDocs();
		}

		if (
			!this._docs.find((d) => this._id(d) === _id) &&
			!this._fetchingId[_id]
		) {
			this._fetchingId[_id] = true;

			setTimeout(() => {
				this.fetch({ _id }).subscribe((_doc: Document) => {
					this._fetchingId[_id] = false;

					if (_doc) {
						this.__coreService.copy(_doc, doc as Document);
						this._syncSignalForDoc(doc as Document);
					}
				});
			});
		}

		return doc as Document;
	}

	/**
	 * Sets the number of documents to display per page.
	 *
	 * @param _perPage - Number of documents per page.
	 */
	setPerPage(_perPage: number): void {
		this._perPage = _perPage;
	}

	/**
	 * Middleware hooks (override in child services).
	 * Can be sync or async. Must return the document to be sent.
	 */
	protected beforeCreate(
		doc: Document,
		options: CrudOptions<Document>,
	): Document | Promise<Document> {
		return doc;
	}

	protected afterCreate(
		resp: unknown,
		doc: Document,
		options: CrudOptions<Document>,
	): void | Promise<void> {}

	protected beforeUpdate(
		doc: Document,
		options: CrudOptions<Document>,
	): Document | Promise<Document> {
		return doc;
	}

	protected afterUpdate(
		resp: unknown,
		doc: Document,
		options: CrudOptions<Document>,
	): void | Promise<void> {}

	protected beforeUnique(
		doc: Document,
		options: CrudOptions<Document>,
	): Document | Promise<Document> {
		return doc;
	}

	protected afterUnique(
		resp: unknown,
		doc: Document,
		options: CrudOptions<Document>,
	): void | Promise<void> {}

	protected beforeDelete(
		doc: Document,
		options: CrudOptions<Document>,
	): Document | Promise<Document> {
		return doc;
	}

	protected afterDelete(
		resp: unknown,
		doc: Document,
		options: CrudOptions<Document>,
	): void | Promise<void> {}

	protected beforeFetch(
		query: object,
		options: CrudOptions<Document>,
	): object | Promise<object> {
		return query;
	}

	protected afterFetch(
		resp: unknown,
		query: object,
		options: CrudOptions<Document>,
	): void | Promise<void> {}

	/**
	 * Small helper to normalize sync/async hooks.
	 */
	private _mw<T>(value: T | Promise<T>): Promise<T> {
		return Promise.resolve(value);
	}

	/**
	 * Fetches a list of documents from the API with optional pagination.
	 *
	 * @param config - Optional pagination configuration.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that resolves with the list of documents.
	 */
	get(
		config: GetConfig = {},
		options: CrudOptions<Document> = {},
	): Observable<Document[]> {
		if (!this.__networkService.isOnline()) {
			return new Observable((observer) => {
				this._onOnline.push(() => {
					this.get(config, options).subscribe(observer);
				});
			});
		}

		if (
			this._isBrowser &&
			!this._config.unauthorized &&
			localStorage.getItem('waw_user')
		) {
			const user = JSON.parse(localStorage.getItem('waw_user') as string);

			localStorage.setItem(this._config.name + 'waw_user_id', user._id);
		}

		const url = `${this._url}/get${options.name || ''}`;

		const params =
			(typeof config.page === 'number' || config.query ? '?' : '') +
			(config.query || '') +
			(typeof config.page === 'number'
				? `&skip=${this._perPage * (config.page - 1)}&limit=${this._perPage}`
				: '');

		const obs = this.__httpService.get(`${url}${params}`);

		obs.subscribe({
			next: (resp: unknown): void => {
				resp = resp || [];

				if (typeof config.page !== 'number') {
					this.clearDocs();
				}

				(resp as Document[]).forEach((doc) => this.addDoc(doc));

				if (options.callback) {
					options.callback(resp as Document[]);
				}

				if (typeof config.page !== 'number') {
					this._filterDocuments();

					this.__emitterService.complete(
						this._config.name + '_getted',
						this._docs,
					);
				}

				this.__emitterService.emit(
					`${this._config.name}_get`,
					this._docs,
				);

				this.__emitterService.emit(
					`${this._config.name}_changed`,
					this._docs,
				);
			},
			error: (err: unknown): void => {
				if (options.errCallback) {
					options.errCallback(err);
				}
			},
		});

		return obs as Observable<Document[]>;
	}

	/**
	 * Sends a request to the API to create a new document.
	 *
	 * @param doc - The document to create.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that resolves with the created document, or emits an error if already created.
	 */
	create(
		doc: Document = {} as Document,
		options: CrudOptions<Document> = {},
	): Observable<Document> {
		return defer(() =>
			from(this._mw(this.beforeCreate(doc, options))).pipe(
				switchMap((mwDoc) => {
					doc = (mwDoc || doc) as Document;

					if (doc._id) {
						return this.update(doc, options);
					}

					doc._localId ||= this._localId();

					doc.__options ||= {};
					doc.__options['create'] = options;

					this.addDoc(doc);
					this._filterDocuments();

					if (!this.__networkService.isOnline()) {
						return new Observable((observer) => {
							this._onOnline.push(() => {
								this.create(doc, options).subscribe(observer);
							});
						});
					}

					if (doc.__creating) {
						return new Observable<Document>((observer) => {
							observer.error(
								new Error(
									'Document is currently already creating.',
								),
							);
						});
					}

					if (this._config.appId) {
						doc.appId = this._config.appId;
					}

					doc.__creating = true;

					const obs = this.__httpService.post(
						`${this._url}/create${options.name || ''}`,
						doc,
					);

					obs.subscribe({
						next: async (resp: unknown) => {
							if (resp) {
								this.__coreService.copy(resp, doc);

								this.addDoc(doc);
								this._filterDocuments();

								if (options.callback) options.callback(doc);

								await this._mw(
									this.afterCreate(resp, doc, options),
								);
							} else {
								doc.__creating = false;

								if (options.errCallback)
									options.errCallback(resp);
							}

							this.__emitterService.emit(
								`${this._config.name}_create`,
								doc,
							);
							this.__emitterService.emit(
								`${this._config.name}_list`,
								doc,
							);
							this.__emitterService.emit(
								`${this._config.name}_changed`,
								doc,
							);
						},
						error: (err: unknown) => {
							doc.__creating = false;
							if (options.errCallback) options.errCallback(err);
						},
					});

					return obs as Observable<Document>;
				}),
			),
		) as Observable<Document>;
	}

	/**
	 * Fetches a document from the API based on a query.
	 *
	 * @param query - The query object used to filter documents.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that resolves with the fetched document.
	 */
	fetch(
		query: object = {},
		options: CrudOptions<Document> = {},
	): Observable<Document> {
		return defer(() =>
			from(this._mw(this.beforeFetch(query, options))).pipe(
				switchMap((mwQuery) => {
					query = (mwQuery || query) as object;

					if (!this.__networkService.isOnline()) {
						return new Observable((observer) => {
							this._onOnline.push(() => {
								this.fetch(query, options).subscribe(observer);
							});
						});
					}

					const obs = this.__httpService.post(
						`${this._url}/fetch${options.name || ''}`,
						query,
					);

					obs.subscribe({
						next: async (doc: unknown) => {
							if (doc) {
								this.addDoc(doc as Document);
								this._filterDocuments();

								if (options.callback)
									options.callback(doc as Document);

								await this._mw(
									this.afterFetch(doc, query, options),
								);

								this.__emitterService.emit(
									`${this._config.name}_changed`,
									doc,
								);
							} else {
								if (options.errCallback)
									options.errCallback(doc as Document);
							}
						},
						error: (err: unknown) => {
							if (options.errCallback) options.errCallback(err);
						},
					});

					return obs as Observable<Document>;
				}),
			),
		) as Observable<Document>;
	}

	/**
	 * Updates a document after a specified delay and returns an observable.
	 *
	 * @param doc - The document to update.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that emits the updated document.
	 */
	updateAfterWhile(
		doc: Document,
		options: CrudOptions<Document> = {},
	): Observable<Document> {
		return new Observable<Document>((observer) => {
			this.__coreService.afterWhile(this._id(doc), () => {
				this.update(doc, options).subscribe({
					next: (updatedDoc) => {
						observer.next(updatedDoc); // Emit the updated document
					},
					error: (err) => {
						observer.error(err); // Forward the error
					},
					complete: () => {
						observer.complete(); // Complete the observable
					},
				});
			});
		});
	}

	/**
	 * Updates a document in the API.
	 *
	 * @param doc - The document to update.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that resolves with the updated document.
	 */
	update(
		doc: Document,
		options: CrudOptions<Document> = {},
	): Observable<Document> {
		return defer(() =>
			from(this._mw(this.beforeUpdate(doc, options))).pipe(
				switchMap((mwDoc) => {
					doc = (mwDoc || doc) as Document;

					this._updateModified(
						doc,
						'up' + (options.name || ''),
						options,
					);

					if (!this.__networkService.isOnline()) {
						return new Observable((observer) => {
							this._onOnline.push(() => {
								this.update(doc, options).subscribe(observer);
							});
						});
					}

					const obs = this.__httpService.post(
						`${this._url}/update${options.name || ''}`,
						doc,
					);

					obs.subscribe({
						next: async (resp: unknown) => {
							if (resp) {
								this._removeModified(
									doc,
									'up' + (options.name || ''),
								);

								const storedDoc = this.doc(doc._id as string);

								this.__coreService.copy(resp, storedDoc);
								this.__coreService.copy(resp, doc);

								this._syncSignalForDoc(storedDoc);

								if (options.callback) options.callback(doc);

								await this._mw(
									this.afterUpdate(resp, doc, options),
								);
							} else {
								if (options.errCallback)
									options.errCallback(resp);
							}

							this.__emitterService.emit(
								`${this._config.name}_update`,
								doc,
							);
							this.__emitterService.emit(
								`${this._config.name}_changed`,
								doc,
							);
						},
						error: (err: unknown) => {
							if (options.errCallback) options.errCallback(err);
						},
					});

					return obs as Observable<Document>;
				}),
			),
		) as Observable<Document>;
	}

	/**
	 * Unique update a document field in the API.
	 *
	 * @param doc - The document to update.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that resolves with the updated document.
	 */
	unique(
		doc: Document,
		options: CrudOptions<Document> = {},
	): Observable<Document> {
		return defer(() =>
			from(this._mw(this.beforeUnique(doc, options))).pipe(
				switchMap((mwDoc) => {
					doc = (mwDoc || doc) as Document;

					this._updateModified(
						doc,
						'un' + (options.name || ''),
						options,
					);

					if (!this.__networkService.isOnline()) {
						return new Observable((observer) => {
							this._onOnline.push(() => {
								this.unique(doc, options).subscribe(observer);
							});
						});
					}

					const obs = this.__httpService.post(
						`${this._url}/unique${options.name || ''}`,
						doc,
					);

					obs.subscribe({
						next: async (resp: unknown) => {
							if (resp) {
								this._removeModified(
									doc,
									'un' + (options.name || ''),
								);

								(doc as any)[options.name as string] = resp;

								this._syncSignalForDoc(doc);

								if (options.callback) options.callback(doc);

								await this._mw(
									this.afterUnique(resp, doc, options),
								);
							} else {
								if (options.errCallback)
									options.errCallback(resp);
							}

							this.__emitterService.emit(
								`${this._config.name}_unique`,
								doc,
							);
							this.__emitterService.emit(
								`${this._config.name}_changed`,
								doc,
							);
						},
						error: (err: unknown) => {
							if (options.errCallback) options.errCallback(err);
						},
					});

					return obs as Observable<Document>;
				}),
			),
		) as Observable<Document>;
	}

	/**
	 * Deletes a document from the API.
	 *
	 * @param doc - The document to delete.
	 * @param options - Optional callback and error handling configuration.
	 * @returns An observable that resolves with the deleted document.
	 */
	delete(
		doc: Document,
		options: CrudOptions<Document> = {},
	): Observable<Document> {
		return defer(() =>
			from(this._mw(this.beforeDelete(doc, options))).pipe(
				switchMap((mwDoc) => {
					doc = (mwDoc || doc) as Document;

					doc.__deleted = true;

					doc.__options ||= {};
					doc.__options['delete'] = options;

					this.addDoc(doc);
					this._filterDocuments();

					if (!this.__networkService.isOnline()) {
						return new Observable((observer) => {
							this._onOnline.push(() => {
								this.delete(doc, options).subscribe(observer);
							});
						});
					}

					const obs = this.__httpService.post(
						`${this._url}/delete${options.name || ''}`,
						doc,
					);

					obs.subscribe({
						next: async (resp: unknown) => {
							if (resp) {
								const idx = this._docs.findIndex(
									(d) => this._id(d) === this._id(doc),
								);
								if (idx !== -1) this._docs.splice(idx, 1);

								this.setDocs();

								this._syncSignalForDoc({
									...doc,
									__deleted: true,
								} as Document);

								this._filterDocuments();

								if (options.callback) options.callback(doc);

								await this._mw(
									this.afterDelete(resp, doc, options),
								);
							} else {
								if (options.errCallback)
									options.errCallback(resp);
							}

							this.__emitterService.emit(
								`${this._config.name}_delete`,
								doc,
							);
							this.__emitterService.emit(
								`${this._config.name}_changed`,
								doc,
							);
						},
						error: (err: unknown) => {
							if (options.errCallback) options.errCallback(err);
						},
					});

					return obs as Observable<Document>;
				}),
			),
		) as Observable<Document>;
	}

	/**
	 * Registers a filtered view of documents and returns the recompute callback.
	 *
	 * The callback is called automatically whenever `_filterDocuments()` runs.
	 */
	filteredDocuments(
		storeObjectOrArray: Record<string, Document[]> | Document[],
		config: {
			field?: string | ((doc: Document) => string);
			valid?: (doc: Document) => boolean;
			sort?: (a: Document, b: Document) => number;
			filtered?: (
				storeObjectOrArray: Record<string, Document[]> | Document[],
			) => void;
		} = {},
	) {
		const callback = (): void => {
			if (Array.isArray(storeObjectOrArray)) {
				let result = this._docs
					.filter((doc) => !doc.__deleted)
					.filter(config.valid ?? (() => true));

				storeObjectOrArray.length = 0;

				if (typeof config.sort === 'function') {
					result = result.sort(config.sort);
				}

				storeObjectOrArray.push(...result);
			} else {
				const storeObject = storeObjectOrArray as Record<
					string,
					Document[]
				>;

				/* remove docs if they were removed */
				for (const parentId in storeObject) {
					for (
						let i = storeObject[parentId].length - 1;
						i >= 0;
						i--
					) {
						const _field =
							typeof config.field === 'function'
								? config.field(storeObject[parentId][i])
								: config.field || 'author';
						const _doc: any = storeObject[parentId][i];

						if (
							!this._docs.find((doc: any) =>
								Array.isArray(doc[_field])
									? doc[_field].includes(_doc[this._id(doc)])
									: doc[_field] === _doc[this._id(doc)],
							)
						) {
							storeObject[parentId].splice(i, 1);
						}
					}
				}

				/* add docs if they are not added */
				for (const doc of this._docs) {
					if (doc.__deleted) continue;

					const _field =
						typeof config.field === 'function'
							? config.field(doc)
							: config.field || 'author';

					if (
						typeof config.valid === 'function'
							? !config.valid(doc)
							: Array.isArray((doc as any)[_field])
								? !(doc as any)[_field]?.length
								: !(doc as any)[_field]
					) {
						continue;
					}

					if (typeof config.field === 'function') {
						if (
							config.field(doc) &&
							!storeObject[(doc as any)[_field]].find(
								(c) => c._id === doc._id,
							)
						) {
							storeObject[(doc as any)[_field]].push(doc);
						}
					} else if (Array.isArray((doc as any)[_field])) {
						(doc as any)[_field].forEach((_field: string) => {
							storeObject[_field] = storeObject[_field] || [];

							if (
								!storeObject[_field].find(
									(c) => c._id === doc._id,
								)
							) {
								storeObject[_field].push(doc);
							}
						});
					} else {
						storeObject[(doc as any)[_field]] =
							storeObject[(doc as any)[_field]] || [];

						if (
							!storeObject[(doc as any)[_field]].find(
								(c) => c._id === doc._id,
							)
						) {
							storeObject[(doc as any)[_field]].push(doc);
						}
					}
				}

				/* sort the array's */
				if (typeof config.sort === 'function') {
					for (const parentId in storeObject) {
						storeObject[parentId].sort(config.sort);
					}
				}
			}

			config.filtered?.(storeObjectOrArray);
		};

		this._filteredDocumentsCallbacks.push(callback);

		return callback;
	}

	/**
	 * Track pending fetch-by-id requests to avoid duplicate calls.
	 */
	private _fetchingId: Record<string, boolean> = {};

	/**
	 * Queue of operations that must be retried when network comes back online.
	 */
	private _onOnline: (() => void)[] = [];

	/**
	 * Local counter used to build unique local identifiers together with Date.now().
	 */
	private _randomCount = 0;

	/**
	 * Generates a unique ID for a document when using local-only identifiers.
	 *
	 * @returns The unique ID as a number.
	 */
	private _localId() {
		return Number(Date.now() + '' + this._randomCount++);
	}

	/**
	 * Returns the configured identity field for the given document as string.
	 *
	 * @param doc - The document for which to generate the ID.
	 * @returns The unique ID as a string.
	 */
	private _id(doc: Document): string {
		return (doc as unknown as Record<string, unknown>)[
			this._config._id || '_id'
		]?.toString() as string;
	}

	/**
	 * Executes all registered filter document callbacks and emits a
	 * `<name>_filtered` event.
	 */
	private _filterDocuments(): void {
		for (const callback of this._filteredDocumentsCallbacks) {
			callback();
		}

		this.__emitterService.emit(`${this._config.name}_filtered`);
	}

	/**
	 * Marks a document as modified for a given operation id and
	 * keeps the document in the store until the operation is confirmed.
	 */
	private _updateModified(
		doc: Document,
		id: string,
		options: CrudOptions<Document>,
	) {
		doc.__modified ||= [];

		doc.__options ||= {};

		doc.__options[id] = options;

		if (!doc.__modified.find((m) => m === id)) {
			doc.__modified.push(id);

			this.addDoc(doc);
		}
	}

	/**
	 * Removes a modification mark from the document once the
	 * server operation is confirmed.
	 */
	private _removeModified(doc: Document, id: string) {
		doc.__modified ||= [];

		if (doc.__modified.find((m) => m === id)) {
			doc.__modified.splice(
				doc.__modified.findIndex((m) => m === id),
				1,
			);

			this.addDoc(doc);
		}
	}

	/**
	 * Syncs a single document's signal (if exists) and refreshes all
	 * derived collections (field/value lists and field maps).
	 */
	private _syncSignalForDoc(doc: Document) {
		const id = this._id(doc);

		if (id && this._signal[id]) {
			this._signal[id].set({ ...doc });
		}

		this._updateSignals();
	}

	/**
	 * Rebuilds all derived signal collections:
	 *  - all per (field,value) lists of document signals
	 *  - all per-field maps value -> [signals]
	 *
	 * This keeps `getSignals()` and `getFieldSignals()` in sync after
	 * any mutation that touches `_docs`.
	 */
	private _updateSignals() {
		// refresh all (field,value) collections
		for (const key in this._signals) {
			this._signals[key].set(this._getSignals(key));
		}

		// refresh all per-field maps
		for (const field in this._fieldSignals) {
			this._fieldSignals[field].set(this._getFieldSignals(field));
		}
	}
}
