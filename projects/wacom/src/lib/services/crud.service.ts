import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { StoreService } from './store.service';
import { AlertService } from './alert.service';
import { CoreService } from './core.service';
import { CrudDocument } from '../interfaces/crud.interface';
import { BaseService } from './base.service';

interface CrudOptions<Document> {
	name?: string;
	alert?: string;
	callback?: (resp: Document | Document[]) => void;
	errCallback?: (resp: unknown) => void;
}

interface CrudConfig<Document> {
	name: string;
	_id?: string;
	replace?: (doc: Document) => void;
}

interface GetConfig {
	page?: number;
	perPage?: number;
}

export abstract class CrudService<
	Document extends CrudDocument
> extends BaseService {
	constructor(
		private _config: CrudConfig<Document>,
		private _http: HttpService,
		private _store: StoreService,
		private _alert: AlertService,
		private _core: CoreService
	) {
		super();

		this._url += this._config.name;

		this._store.getJson('docs_' + this._config.name, (docs) => {
			if (Array.isArray(docs)) {
				this._docs.push(...docs);
			}
		});
	}

	/**
	 * Sets the documents in the local storage.
	 */
	setDocs(): void {
		this._store.setJson('docs_' + this._config.name, this._docs);
	}

	/**
	 * Get docs from crud service
	 */
	getDocs(): Document[] {
		return this._docs;
	}

	/**
	 * Adds documents to crud service.
	 *
	 * @param doc - The document to add.
	 */
	addDocs(docs: Document[]): void {
		if (Array.isArray(docs)) {
			for (const doc of docs) {
				this.addDoc(doc);
			}
		}
	}

	/**
	 * Adds a document to crud service.
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
			this._core.copy(doc, existingDoc);
			this._core.copy(existingDoc, doc);
		} else {
			this._docs.push(doc);
		}

		this.setDocs();
	}

	/**
	 * Creates a new document with a temporary ID.
	 *
	 * @returns A new document instance.
	 */
	new(doc: Document = {} as Document): Document {
		return {
			...doc,
			_id: Date.now().toString(),
			__created: false,
			__modified: false,
		} as Document;
	}

	/**
	 * Retrieves a document by its ID.
	 *
	 * @param _id - The document ID.
	 * @returns The document instance.
	 */
	doc(_id: string): Document {
		return this._docs.find((d) => this._id(d) === _id) || this.new();
	}

	/**
	 * Sets the number of documents per page.
	 *
	 * @param _perPage - The number of documents per page.
	 */
	setPerPage(_perPage: number): void {
		this._perPage = _perPage;
	}

	/**
	 * Retrieves documents from the API.
	 *
	 * @param config - The get configuration.
	 * @param options - The CRUD options.
	 * @returns An observable of the retrieved documents.
	 */
	get(
		config: GetConfig = {},
		options: CrudOptions<Document> = {}
	): Observable<Document[]> {
		const url = `${this._url}/get${options.name || ''}`;

		const params =
			typeof config.page === 'number'
				? `?skip=${this._perPage * (config.page - 1)}&limit=${
						this._perPage
				  }`
				: '';

		const obs = this._http.get(`${url}${params}`);

		obs.subscribe(
			(resp: unknown) => {
				(resp as Document[]).forEach((doc) => this.addDoc(doc));

				if (options.callback) options.callback(resp as Document[]);
			},
			(err: unknown) => {
				if (options.errCallback) options.errCallback(err);
			}
		);

		return obs as Observable<Document[]>;
	}

	/**
	 * Creates a new document in the API.
	 *
	 * @param doc - The document to create.
	 * @param options - The CRUD options.
	 * @returns An observable of the created document or void if the document was already created.
	 */
	create(
		doc: Document,
		options: CrudOptions<Document> = {}
	): Observable<Document> | void {
		if (doc.__created) return;

		doc.__created = true;

		const obs = this._http.post(
			`${this._url}/create${options.name || ''}`,
			doc
		);

		obs.subscribe(
			(resp: unknown) => {
				if (resp) {
					this._core.copy(resp, doc);

					this.addDoc(doc);

					this._filterDocuments();

					if (options.callback) options.callback(doc);

					if (options.alert) {
						this._alert.show({
							unique: `${this._config.name}create`,
							text: options.alert,
						});
					}
				} else {
					doc.__created = false;

					if (options.errCallback) options.errCallback(resp);
				}

				this._core.emit(`${this._config.name}_create`, doc);
			},
			(err: unknown) => {
				doc.__created = false;

				if (options.errCallback) options.errCallback(err);
			}
		);
		return obs as Observable<Document>;
	}

	/**
	 * Fetches a document from the API based on a query.
	 *
	 * @param query - The query object.
	 * @param options - The CRUD options.
	 * @returns An observable of the fetched document.
	 */
	fetch(
		query: object = {},
		options: CrudOptions<Document> = {}
	): Observable<Document> {
		const obs = this._http.post(
			`${this._url}/fetch${options.name || ''}`,
			query
		);

		obs.subscribe(
			(resp: unknown) => {
				if (resp) {
					this.addDoc(resp as Document);

					this._filterDocuments();

					if (options.callback) options.callback(resp as Document);

					if (options.alert) {
						this._alert.show({
							unique: `${this._config.name}create`,
							text: options.alert,
						});
					}
				} else {
					if (options.errCallback) {
						options.errCallback(resp as Document);
					}
				}
			},
			(err: unknown) => {
				if (options.errCallback) {
					options.errCallback(err);
				}
			}
		);
		return obs as Observable<Document>;
	}

	/**
	 * Updates a document after a specified delay.
	 *
	 * @param doc - The document to update.
	 * @param options - The CRUD options.
	 */
	updateAfterWhile(doc: Document, options: CrudOptions<Document> = {}): void {
		doc.__modified = true;

		this._core.afterWhile(this._id(doc), () => {
			this.update(doc, options);
		});
	}

	/**
	 * Updates a document in the API.
	 *
	 * @param doc - The document to update.
	 * @param options - The CRUD options.
	 * @returns An observable of the updated document.
	 */
	update(
		doc: Document,
		options: CrudOptions<Document> = {}
	): Observable<Document> {
		doc.__modified = true;

		const obs = this._http.post(
			`${this._url}/update${options.name || ''}`,
			doc
		);

		obs.subscribe(
			(resp: unknown) => {
				if (resp) {
					doc.__modified = false;

					this._core.copy(resp, doc);

					if (options.callback) {
						options.callback(doc);
					}

					if (options.alert)
						this._alert.show({
							unique: `${this._config.name}update`,
							text: options.alert,
						});
				} else {
					if (options.errCallback) options.errCallback(resp);
				}

				this._core.emit(`${this._config.name}_update`, doc);
			},
			(err: unknown) => {
				if (options.errCallback) {
					options.errCallback(err);
				}
			}
		);

		return obs as Observable<Document>;
	}

	/**
	 * Deletes a document from the API.
	 *
	 * @param doc - The document to delete.
	 * @param options - The CRUD options.
	 * @returns An observable of the deleted document.
	 */
	delete(
		doc: Document,
		options: CrudOptions<Document> = {}
	): Observable<Document> {
		const obs = this._http.post(
			`${this._url}/delete${options.name || ''}`,
			doc
		);

		obs.subscribe(
			(resp: unknown) => {
				if (resp) {
					this._docs = this._docs.filter(
						(d) => this._id(d) !== this._id(doc)
					);

					this.setDocs();

					this._filterDocuments();

					if (options.callback) {
						options.callback(doc);
					}

					if (options.alert) {
						this._alert.show({
							unique: `${this._config.name}delete`,
							text: options.alert,
						});
					}
				} else {
					if (options.errCallback) {
						options.errCallback(resp);
					}
				}

				this._core.emit(`${this._config.name}_delete`, doc);
			},
			(err: unknown) => {
				if (options.errCallback) {
					options.errCallback(err);
				}
			}
		);

		return obs as Observable<Document>;
	}

	private _url = '/api/';

	private _docs: Document[] = [];

	private _perPage = 20;

	private _filteredDocumentsCallbacks: (() => void)[] = [];

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

	private _filterDocuments(): void {
		for (const callback of this._filteredDocumentsCallbacks) {
			callback();
		}
	}

	private _filteredDocuments(
		storeObject: Record<string, Document[]>,
		field: string | ((doc: Document) => boolean) = 'author',
		sort: (a: Document, b: Document) => number = (
			a: Document,
			b: Document
		) => {
			if (a[this._id(a)] < b[this._id(b)]) return -1;

			if (a[this._id(a)] > b[this._id(b)]) return 1;

			return 0;
		}
	): () => void {
		const callback = (): void => {
			/* remove docs if they were removed */
			for (const parentId in storeObject) {
				for (let i = storeObject[parentId].length - 1; i >= 0; i--) {
					if (typeof field === 'function') {
						for (const doc of storeObject[parentId]) {
							if (!field(doc)) {
								storeObject[parentId].splice(i, 1);
							}
						}
					} else if (
						!this._docs.find((doc: Document) =>
							Array.isArray(doc[field])
								? doc[field].includes(
										storeObject[parentId][i][this._id(doc)]
								  )
								: doc[field] ===
								  storeObject[parentId][i][this._id(doc)]
						)
					) {
						storeObject[parentId].splice(i, 1);
					}
				}
			}

			/* add docs if they are not added */
			for (const doc of this._docs) {
				if (!doc[field] || !doc[field]?.length) {
					continue;
				}

				if (typeof field === 'function') {
					if (field(doc)) {

					}
				} else if (Array.isArray(doc[field])) {
					doc[field].forEach((_field: string) => {
						storeObject[_field] = storeObject[_field] || [];

						if (
							!storeObject[_field].find(
								(c) => c._id === doc._id
							)
						) {
							storeObject[_field].push(doc);
						}
					});
				} else {
					storeObject[doc[field]] = storeObject[doc[field]] || [];

					if (
						!storeObject[doc[field]].find(
							(c) => c._id === doc._id
						)
					) {
						storeObject[doc[field]].push(doc);
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
}
