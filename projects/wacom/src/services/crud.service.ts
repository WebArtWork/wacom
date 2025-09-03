import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudDocument, CrudOptions } from '../interfaces/crud.interface';
import { AlertService } from './alert.service';
import { BaseService } from './base.service';
import { CoreService } from './core.service';
import { HttpService } from './http.service';
import { NetworkService } from './network.service';
import { StoreService } from './store.service';

interface CrudConfig<Document> {
	signalFields?: Record<string, (doc: Document) => unknown>;
	name: string;
	_id?: string;
	replace?: (doc: Document) => void;
	unauthorized?: boolean;
	appId?: string;
}

interface GetConfig {
	page?: number;
	perPage?: number;
	query?: string;
}

/**
 * Abstract class representing a CRUD (Create, Read, Update, Delete) service.
 *
 * This class provides methods for managing documents, interacting with an API,
 * and storing/retrieving data from local storage. It is designed to be extended
 * for specific document types.
 *
 * @template Document - The type of the document the service handles.
 */
export abstract class CrudService<
	Document extends CrudDocument<Document>,
> extends BaseService {
	/**
	 * URL for the API.
	 */
	private _url = '/api/';

	/**
	 * Array of documents managed by this service.
	 */
	private _docs: Document[] = [];

	/**
	 * Number of documents per page.
	 */
	private _perPage = 20;

	/**
	 * Callbacks for filtering documents.
	 */
	private _filteredDocumentsCallbacks: (() => void)[] = [];

	/**
	 * Constructs a CRUD service instance.
	 *
	 * @param _config - Configuration options for the CRUD service.
	 * @param __httpService - Service to handle HTTP requests.
	 * @param __storeService - Service to manage local storage of documents.
	 * @param __alertService - Service to display alerts.
	 * @param __coreService - Core service for utility functions.
	 */
	protected __httpService = inject(HttpService);

	protected __storeService = inject(StoreService);

	protected __alertService = inject(AlertService);

	protected __coreService = inject(CoreService);

	protected __networkService = inject(NetworkService);

	loaded: Promise<unknown>;

	constructor(private _config: CrudConfig<Document>) {
		super();

		this._config.signalFields = this._config.signalFields || {};

		this._url += this._config.name;

		this.loaded = this.__coreService.onComplete(
			this._config.name + '_loaded',
		);

		if (this._config.unauthorized) {
			this.restoreDocs();
		} else if (localStorage.getItem('waw_user')) {
			const user = JSON.parse(localStorage.getItem('waw_user') as string);

			if (
				user._id ===
				localStorage.getItem(this._config.name + 'waw_user_id')
			) {
				this.restoreDocs();
			}
		}

		this.__coreService.on('wipe').subscribe((): void => {
			this.clearDocs();

			this._filterDocuments();
		});

		this.__coreService.on('wacom_online').subscribe(() => {
			for (const callback of this._onOnline) {
				callback();
			}

			this._onOnline.length = 0;
		});
	}

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
	getDocs(): Document[] {
		return this._docs;
	}

	/**
	 * Clears the current list of documents.
	 *
	 * Empties the internal documents array and saves the updated state to local storage.
	 */
	clearDocs(): void {
		this._docs.splice(0, this._docs.length);

		this.setDocs();
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
			// Update the existing document
			this.__coreService.copy(doc, existingDoc);

			this.__coreService.copy(existingDoc, doc);
		} else {
			// Add new document
			this._docs.push(doc);
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
		const doc =
			this._docs.find((d) => this._id(d) === _id) ||
			this.new({
				_id,
			} as Document);

		if (
			!this._docs.find((d) => this._id(d) === _id) &&
			!this._fetchingId[_id]
		) {
			this._fetchingId[_id] = true;

			setTimeout(() => {
				this.fetch({ _id }).subscribe((_doc: Document) => {
					this._fetchingId[_id] = false;

					if (_doc) {
						this.__coreService.copy(_doc, doc);
					}
				});
			});
		}

		return doc;
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

		if (!this._config.unauthorized && localStorage.getItem('waw_user')) {
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

					this.__coreService.complete(
						this._config.name + '_loaded',
						this._docs,
					);
				}

				this.__coreService.emit(`${this._config.name}_get`, this._docs);
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
			// Emit an error observable if the document is already created
			return new Observable<Document>((observer) => {
				observer.error(
					new Error('Document is currently already creating.'),
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
			next: (resp: unknown) => {
				if (resp) {
					this.__coreService.copy(resp, doc);

					this.addDoc(doc);

					this._filterDocuments();

					if (options.callback) {
						options.callback(doc);
					}

					if (options.alert) {
						this.__alertService.show({
							unique: `${this._config.name}create`,
							text: options.alert,
						});
					}
				} else {
					doc.__creating = false;

					if (options.errCallback) {
						options.errCallback(resp);
					}
				}

				this.__coreService.emit(`${this._config.name}_create`, doc);

				this.__coreService.emit(`${this._config.name}_list`, doc);

				this.__coreService.emit(`${this._config.name}_changed`, doc);
			},
			error: (err: unknown) => {
				doc.__creating = false;

				if (options.errCallback) options.errCallback(err);
			},
		});

		return obs as Observable<Document>;
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
			next: (doc: unknown) => {
				if (doc) {
					this.addDoc(doc as Document);

					this._filterDocuments();

					if (options.callback) options.callback(doc as Document);

					if (options.alert) {
						this.__alertService.show({
							unique: `${this._config.name}create`,
							text: options.alert,
						});
					}

					this.__coreService.emit(
						`${this._config.name}_changed`,
						doc,
					);
				} else {
					if (options.errCallback) {
						options.errCallback(doc as Document);
					}
				}
			},
			error: (err: unknown) => {
				if (options.errCallback) {
					options.errCallback(err);
				}
			},
		});

		return obs as Observable<Document>;
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
		this._updateModified(doc, 'up' + (options.name || ''), options);

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
			next: (resp: unknown) => {
				if (resp) {
					this._removeModified(doc, 'up' + (options.name || ''));

					const storedDoc = this.doc(doc._id as string);

					this.__coreService.copy(resp, storedDoc);

					this.__coreService.copy(resp, doc);

					if (options.callback) {
						options.callback(doc);
					}

					if (options.alert) {
						this.__alertService.show({
							unique: `${this._config.name}update`,
							text: options.alert,
						});
					}
				} else {
					if (options.errCallback) {
						options.errCallback(resp);
					}
				}

				this.__coreService.emit(`${this._config.name}_update`, doc);

				this.__coreService.emit(`${this._config.name}_changed`, doc);
			},
			error: (err: unknown) => {
				if (options.errCallback) {
					options.errCallback(err);
				}
			},
		});

		return obs as Observable<Document>;
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
		this._updateModified(doc, 'un' + (options.name || ''), options);

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
			next: (resp: unknown) => {
				if (resp) {
					this._removeModified(doc, 'un' + (options.name || ''));

					(doc as any)[options.name as string] = resp;

					if (options.callback) {
						options.callback(doc);
					}

					if (options.alert) {
						this.__alertService.show({
							unique: `${this._config.name}unique`,
							text: options.alert,
						});
					}
				} else {
					if (options.errCallback) {
						options.errCallback(resp);
					}
				}

				this.__coreService.emit(`${this._config.name}_unique`, doc);

				this.__coreService.emit(`${this._config.name}_changed`, doc);
			},
			error: (err: unknown) => {
				if (options.errCallback) {
					options.errCallback(err);
				}
			},
		});

		return obs as Observable<Document>;
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
			next: (resp: unknown) => {
				if (resp) {
					this._docs.splice(
						this._docs.findIndex(
							(d) => this._id(d) === this._id(doc),
						),
						1,
					);

					this.setDocs();

					this._filterDocuments();

					if (options.callback) {
						options.callback(doc);
					}

					if (options.alert) {
						this.__alertService.show({
							unique: `${this._config.name}delete`,
							text: options.alert,
						});
					}
				} else {
					if (options.errCallback) {
						options.errCallback(resp);
					}
				}

				this.__coreService.emit(`${this._config.name}_delete`, doc);

				this.__coreService.emit(`${this._config.name}_list`, doc);

				this.__coreService.emit(`${this._config.name}_changed`, doc);
			},
			error: (err: unknown) => {
				if (options.errCallback) {
					options.errCallback(err);
				}
			},
		});

		return obs as Observable<Document>;
	}

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

	private _fetchingId: Record<string, boolean> = {};

	private _onOnline: (() => void)[] = [];

	private _randomCount = 0;

	/**
	 * Generates a unique ID for a document.
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
	 * Executes all registered filter document callbacks.
	 */
	private _filterDocuments(): void {
		for (const callback of this._filteredDocumentsCallbacks) {
			callback();
		}

		this.__coreService.emit(`${this._config.name}_filtered`);
	}

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

	private _localId() {
		return Number(Date.now() + '' + this._randomCount++);
	}
}
