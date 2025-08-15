import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CrudDocument, CrudOptions } from '../interfaces/crud.interface';
import { AlertService } from './alert.service';
import { BaseService } from './base.service';
import { CoreService } from './core.service';
import { HttpService } from './http.service';
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
	Document extends CrudDocument
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
	 * @param __http - Service to handle HTTP requests.
	 * @param __store - Service to manage local storage of documents.
	 * @param __alert - Service to display alerts.
	 * @param __core - Core service for utility functions.
	 */
	protected __http = inject(HttpService);

	protected __store = inject(StoreService);

	protected __alert = inject(AlertService);

	protected __core = inject(CoreService);

	loaded: Promise<unknown>;

	constructor(private _config: CrudConfig<Document>) {
		super();

		this._config.signalFields = this._config.signalFields || {};

		this._url += this._config.name;

		this.loaded = this.__core.onComplete(this._config.name + '_loaded');

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

		this.__core.on('wipe').subscribe((): void => {
			this.clearDocs();

			this._filterDocuments();
		});
	}

	async restoreDocs() {
		const docs = await this.__store.getJson<Document[]>(
			'docs_' + this._config.name
		);

		if (Array.isArray(docs)) {
			this._docs.push(...docs);

			this._filterDocuments();
		}
	}

	/**
	 * Saves the current set of documents to local storage.
	 */
	setDocs(): void {
		this.__store.setJson<Document[]>(
			'docs_' + this._config.name,
			this._docs
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
			(d) => this._id(d) === this._id(doc)
		);

		if (existingDoc) {
			// Update the existing document
			this.__core.copy(doc, existingDoc);

			this.__core.copy(existingDoc, doc);
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
			_id: doc._id || Date.now().toString(),
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
						this.__core.copy(_doc, doc);
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
		options: CrudOptions<Document> = {}
	): Observable<Document[]> {
		if (!this._config.unauthorized && localStorage.getItem('waw_user')) {
			const user = JSON.parse(localStorage.getItem('waw_user') as string);

			localStorage.setItem(this._config.name + 'waw_user_id', user._id);
		}

		const url = `${this._url}/get${options.name || ''}`;

		const params =
			(typeof config.page === 'number' || config.query ? '?' : '') +
			(config.query || '') +
			(typeof config.page === 'number'
				? `&skip=${this._perPage * (config.page - 1)}&limit=${
						this._perPage
				  }`
				: '');

		const obs = this.__http.get(`${url}${params}`);

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

					this.__core.complete(
						this._config.name + '_loaded',
						this._docs
					);
				}

				this.__core.emit(`${this._config.name}_get`, this._docs);
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
		options: CrudOptions<Document> = {}
	): Observable<Document> {
		if (doc.__created) {
			// Emit an error observable if the document is already created
			return new Observable<Document>((observer) => {
				observer.error(new Error('Document has already been created.'));
			});
		}

		if (this._config.appId) {
			doc.appId = this._config.appId;
		}

		doc.__created = true;

		const obs = this.__http.post(
			`${this._url}/create${options.name || ''}`,
			doc
		);

		obs.subscribe({
			next: (resp: unknown) => {
				if (resp) {
					this.__core.copy(resp, doc);

					this.addDoc(doc);

					this._filterDocuments();

					if (options.callback) {
						options.callback(doc);
					}

					if (options.alert) {
						this.__alert.show({
							unique: `${this._config.name}create`,
							text: options.alert,
						});
					}
				} else {
					doc.__created = false;

					if (options.errCallback) {
						options.errCallback(resp);
					}
				}

				this.__core.emit(`${this._config.name}_create`, doc);

				this.__core.emit(`${this._config.name}_list`, doc);

				this.__core.emit(`${this._config.name}_changed`, doc);
			},
			error: (err: unknown) => {
				doc.__created = false;

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
		options: CrudOptions<Document> = {}
	): Observable<Document> {
		const obs = this.__http.post(
			`${this._url}/fetch${options.name || ''}`,
			query
		);

		obs.subscribe({
			next: (doc: unknown) => {
				if (doc) {
					this.addDoc(doc as Document);

					this._filterDocuments();

					if (options.callback) options.callback(doc as Document);

					if (options.alert) {
						this.__alert.show({
							unique: `${this._config.name}create`,
							text: options.alert,
						});
					}

					this.__core.emit(`${this._config.name}_changed`, doc);
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
		options: CrudOptions<Document> = {}
	): Observable<Document> {
		doc.__modified = true;

		return new Observable<Document>((observer) => {
			this.__core.afterWhile(this._id(doc), () => {
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
		options: CrudOptions<Document> = {}
	): Observable<Document> {
		doc.__modified = true;

		const obs = this.__http.post(
			`${this._url}/update${options.name || ''}`,
			doc
		);

		obs.subscribe({
			next: (resp: unknown) => {
				if (resp) {
					doc.__modified = false;

					const storedDoc = this.doc(doc._id);

					this.__core.copy(resp, storedDoc);

					this.__core.copy(resp, doc);

					if (options.callback) {
						options.callback(doc);
					}

					if (options.alert) {
						this.__alert.show({
							unique: `${this._config.name}update`,
							text: options.alert,
						});
					}
				} else {
					if (options.errCallback) {
						options.errCallback(resp);
					}
				}

				this.__core.emit(`${this._config.name}_update`, doc);

				this.__core.emit(`${this._config.name}_changed`, doc);
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
		options: CrudOptions<Document> = {}
	): Observable<Document> {
		doc.__modified = true;

		const obs = this.__http.post(
			`${this._url}/unique${options.name || ''}`,
			doc
		);

		obs.subscribe({
			next: (resp: unknown) => {
				if (resp) {
					doc.__modified = false;

					(doc as any)[options.name as string] = resp;

					if (options.callback) {
						options.callback(doc);
					}

					if (options.alert) {
						this.__alert.show({
							unique: `${this._config.name}unique`,
							text: options.alert,
						});
					}
				} else {
					if (options.errCallback) {
						options.errCallback(resp);
					}
				}

				this.__core.emit(`${this._config.name}_unique`, doc);

				this.__core.emit(`${this._config.name}_changed`, doc);
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
		options: CrudOptions<Document> = {}
	): Observable<Document> {
		const obs = this.__http.post(
			`${this._url}/delete${options.name || ''}`,
			doc
		);

		obs.subscribe({
			next: (resp: unknown) => {
				if (resp) {
					this._docs.splice(
						this._docs.findIndex(
							(d) => this._id(d) === this._id(doc)
						),
						1
					);

					this.setDocs();

					this._filterDocuments();

					if (options.callback) {
						options.callback(doc);
					}

					if (options.alert) {
						this.__alert.show({
							unique: `${this._config.name}delete`,
							text: options.alert,
						});
					}
				} else {
					if (options.errCallback) {
						options.errCallback(resp);
					}
				}

				this.__core.emit(`${this._config.name}_delete`, doc);

				this.__core.emit(`${this._config.name}_list`, doc);

				this.__core.emit(`${this._config.name}_changed`, doc);
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
	 * Filters documents based on specific conditions and stores the result in a provided object.
	 *
	 * @param storeObject - Object to store filtered documents.
	 * @param field - The field to filter by or a function to extract the field.
	 * @param valid - Optional function to check the validity of a document.
	 * @param sort - Function to sort the filtered documents.
	 * @returns A callback function that triggers the filtering process.
	 */
	filteredDocuments(
		storeObject: Record<string, Document[]>,
		field: string | ((doc: Document) => string) = 'author',
		valid?: (doc: Document) => boolean,
		sort: (a: Document, b: Document) => number = (
			a: Document,
			b: Document
		) => {
			if ((a as any)[this._id(a)] < (b as any)[this._id(b)]) return -1;

			if ((a as any)[this._id(a)] > (b as any)[this._id(b)]) return 1;

			return 0;
		}
	): () => void {
		const callback = (): void => {
			/* remove docs if they were removed */
			for (const parentId in storeObject) {
				for (let i = storeObject[parentId].length - 1; i >= 0; i--) {
					const _field =
						typeof field === 'function'
							? field(storeObject[parentId][i])
							: field;
					const _doc: any = storeObject[parentId][i];

					if (
						!this._docs.find((doc: any) =>
							Array.isArray(doc[_field])
								? doc[_field].includes(_doc[this._id(doc)])
								: doc[_field] === _doc[this._id(doc)]
						)
					) {
						storeObject[parentId].splice(i, 1);
					}
				}
			}

			/* add docs if they are not added */
			for (const doc of this._docs) {
				const _field = typeof field === 'function' ? field(doc) : field;

				if (
					typeof valid === 'function'
						? !valid(doc)
						: Array.isArray((doc as any)[_field])
						? !(doc as any)[_field]?.length
						: !(doc as any)[_field]
				) {
					continue;
				}

				if (typeof field === 'function') {
					if (
						field(doc) &&
						!storeObject[(doc as any)[_field]].find(
							(c) => c._id === doc._id
						)
					) {
						storeObject[(doc as any)[_field]].push(doc);
					}
				} else if (Array.isArray((doc as any)[_field])) {
					(doc as any)[_field].forEach((_field: string) => {
						storeObject[_field] = storeObject[_field] || [];

						if (
							!storeObject[_field].find((c) => c._id === doc._id)
						) {
							storeObject[_field].push(doc);
						}
					});
				} else {
					storeObject[(doc as any)[_field]] =
						storeObject[(doc as any)[_field]] || [];

					if (
						!storeObject[(doc as any)[_field]].find(
							(c) => c._id === doc._id
						)
					) {
						storeObject[(doc as any)[_field]].push(doc);
					}
				}
			}

			/* sort the array's */
			for (const parentId in storeObject) {
				storeObject[parentId].sort(sort);
			}
		};

		this._filteredDocumentsCallbacks.push(callback);

		return callback;
	}

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

		this.__core.emit(`${this._config.name}_filtered`);
	}

	private _fetchingId: Record<string, boolean> = {};
}
