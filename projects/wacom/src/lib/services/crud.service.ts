import { Observable } from 'rxjs';
import { HttpService } from './http.service';
import { StoreService } from './store.service';
import { AlertService } from './alert.service';
import { CoreService } from './core.service';
import { CrudDocument } from '../interfaces/crud.interface';

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

export abstract class CrudService<Document extends CrudDocument> {
	private _url = '/api/';
	private docs: Document[] = [];
	private _perPage = 20;
	private _names: string[] = [];
	private _configuredDocs: Record<string, unknown> = {};
	private _docsConfiguration: Record<
		string,
		(doc: Document, container: unknown) => void
	> = {};
	private _docsReset: Record<string, () => unknown> = {};

	constructor(
		private _config: CrudConfig<Document>,
		private _http: HttpService,
		private _store: StoreService,
		private _alert: AlertService,
		private _core: CoreService
	) {
		this._url += this._config.name;
		this._store.getJson('docs_' + this._config.name, (docs) => {
			if (docs) {
				this.docs = docs;
			}
		});
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
	 * Sets the documents in the local storage.
	 */
	private setDocs(): void {
		this._store.setJson('docs_' + this._config.name, this.docs);
	}

	/**
	 * Adds a document to the local storage.
	 *
	 * @param doc - The document to add.
	 */
	private addDoc(doc: Document): void {
		if (this._config.replace) {
			this._config.replace(doc);
		}
		const existingDoc = this.docs.find(
			(d) => this._id(d) === this._id(doc)
		);
		if (existingDoc) {
			this._core.copy(doc, existingDoc);
			this._core.copy(existingDoc, doc);
		} else {
			this.docs.push(doc);
		}
		this.setDocs();
	}

	/**
	 * Creates a new document with a temporary ID.
	 *
	 * @returns A new document instance.
	 */
	new(): Document {
		return {
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
		return this.docs.find((d) => this._id(d) === _id) || this.new();
	}

	/**
	 * Configures documents for a specific name.
	 *
	 * @param name - The configuration name.
	 * @param config - The configuration function.
	 * @param reset - The reset function.
	 * @returns The configured documents.
	 */
	configDocs(
		name: string,
		config: (doc: Document, container: unknown) => void,
		reset: () => unknown
	): unknown {
		if (this._names.includes(name)) {
			return this.getConfigedDocs(name);
		}
		this._names.push(name);
		this._docsReset[name] = reset;
		this._docsConfiguration[name] = config;
		this.reconfigureDocs(name);
		return this.getConfigedDocs(name);
	}

	/**
	 * Retrieves the configured documents for a specific name.
	 *
	 * @param name - The configuration name.
	 * @returns The configured documents.
	 */
	getConfigedDocs(name: string): unknown {
		return this._configuredDocs[name];
	}

	/**
	 * Reconfigures documents for a specific name or all names.
	 *
	 * @param name - The configuration name (optional).
	 */
	reconfigureDocs(name: string = ''): void {
		const names = name ? [name] : this._names;
		for (const _name of names) {
			this._configuredDocs[_name] = this._docsReset[_name]();
			for (const doc of this.docs) {
				this._docsConfiguration[_name](
					doc,
					this._configuredDocs[_name]
				);
			}
		}
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
					this.reconfigureDocs();
					if (options.callback) options.callback(doc);
					if (options.alert)
						this._alert.show({
							unique: `${this._config.name}create`,
							text: options.alert,
						});
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
					this.reconfigureDocs();
					if (options.callback) options.callback(resp as Document);
					if (options.alert)
						this._alert.show({
							unique: `${this._config.name}create`,
							text: options.alert,
						});
				} else {
					if (options.errCallback) options.errCallback(resp as Document);
				}
			},
			(err: unknown) => {
				if (options.errCallback) options.errCallback(err);
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
					if (options.callback) options.callback(doc);
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
				if (options.errCallback) options.errCallback(err);
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
					this.docs = this.docs.filter(
						(d) => this._id(d) !== this._id(doc)
					);
					this.setDocs();
					this.reconfigureDocs();
					if (options.callback) options.callback(doc);
					if (options.alert)
						this._alert.show({
							unique: `${this._config.name}delete`,
							text: options.alert,
						});
				} else {
					if (options.errCallback) options.errCallback(resp);
				}
				this._core.emit(`${this._config.name}_delete`, doc);
			},
			(err: unknown) => {
				if (options.errCallback) options.errCallback(err);
			}
		);
		return obs as Observable<Document>;
	}
}
