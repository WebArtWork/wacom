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
	/*
		doc should be able to:
		1) stored locally
		2) add sockets
		3) have temporary id {MODULE_Date.now()}
		4) work as MongoService via read function
	*/
	private _url = '/api/';
	_id(doc: Document): string {
		return (doc as unknown as Record<string, unknown>)[
			this._config._id || '_id'
		]?.toString() as string;
	}
	new(): Document {
		return {
			_id: Date.now().toString(),
			__created: false,
			__modified: false
		} as Document;
	}
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
	private docs: Document[] = [];
	doc(_id: string): Document {
		return this.docs.find((d) => this._id(d) === _id) || this.new();
	}
	addDoc(doc: Document) {
		if (typeof this._config.replace === 'function') {
			this._config.replace(doc);
		}
		const docs = this.docs.map((d) => this._id(d));
		if (docs.includes(this._id(doc))) {
			const document = this.docs.find(
				(d) => this._id(d) === this._id(doc)
			);
			if (document) {
				this._core.copy(doc, document);
				this._core.copy(document, doc);
			}
		} else {
			this.docs.push(doc);
		}
		// review arrays
		this.setDocs();
	}
	setDocs() {
		this._store.setJson('docs_' + this._config.name, this.docs);
	}
	private _names: string[] = [];
	private _configuredDocs: Record<string, unknown> = {};
	private _docsConfiguration: Record<
		string,
		(doc: Document, container: unknown) => void
	> = {};
	private _docsReset: Record<string, () => unknown> = {};
	configDocs(
		name: string,
		config: (doc: Document, container: unknown) => void,
		reset: () => unknown
	) {
		if (this._names.includes(name)) {
			return this.getConfigedDocs(name);
		}
		this._names.push(name);
		this._docsReset[name] = reset;
		this._docsConfiguration[name] = config;
		this.reconfigureDocs(name);
		return this.getConfigedDocs(name);
	}
	getConfigedDocs(name: string) {
		return this._configuredDocs[name];
	}
	reconfigureDocs(name: string = '') {
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
	private _perPage = 20;
	setPerPage(_perPage: number) {
		this._perPage = _perPage;
	}
	get(
		config: GetConfig = {},
		options: CrudOptions<Document> = {}
	): Observable<Document[]> {
		if (typeof config.page === 'number') {
			const obs = this._http.get(
				`${this._url}/get${options.name || ''}?skip=${this._perPage * (config.page - 1)
				}&limit=${this._perPage}`
			);
			obs.subscribe(
				(resp: Document[]) => {
					for (const doc of resp) {
						this.addDoc(doc);
					}
					if (typeof options.callback === 'function') {
						options.callback(resp);
					}
				},
				(resp: unknown) => {
					if (typeof options.errCallback === 'function') {
						options.errCallback(resp);
					}
				}
			);
			return obs;
		} else {
			const obs = this._http.get(`${this._url}/get${options.name || ''}`);
			obs.subscribe(
				(resp: Document[]) => {
					for (const doc of resp) {
						this.addDoc(doc);
					}
					if (typeof options.callback === 'function') {
						options.callback(resp);
					}
				},
				(resp: unknown) => {
					if (typeof options.errCallback === 'function') {
						options.errCallback(resp);
					}
				}
			);
			return obs;
		}
	}

	create(
		doc: Document,
		options: CrudOptions<Document> = {}
	): Observable<Document> | void {
		if (doc.__created) {
			return;
		}
		doc.__created = true;
		const obs = this._http.post(
			this._url + '/create' + (options.name || ''),
			doc
		);
		obs.subscribe(
			(resp: Document) => {
				if (typeof resp === 'object') {
					this._core.copy(resp, doc);
					this.addDoc(doc);
					if (typeof options.callback === 'function') {
						options.callback(doc);
					}
					this.reconfigureDocs();
					if (options.alert) {
						this._alert.show({
							unique: this._config.name + 'create',
							text: options.alert
						});
					}
				} else {
					doc.__created = false;
					if (typeof options.errCallback === 'function') {
						options.errCallback(resp);
					}
				}
			},
			(resp: unknown) => {
				doc.__created = false;
				if (typeof options.errCallback === 'function') {
					options.errCallback(resp);
				}
			}
		);
		return obs;
	}

	fetch(
		query: object = {},
		options: CrudOptions<Document> = {}
	): Observable<Document> {
		const obs = this._http.post(
			this._url + '/fetch' + (options.name || ''),
			query || {}
		);
		obs.subscribe(
			(resp: Document) => {
				if (typeof resp === 'object') {
					this.addDoc(resp);
					if (typeof options.callback === 'function') {
						options.callback(resp);
					}
					this.reconfigureDocs();
					if (options.alert) {
						this._alert.show({
							unique: this._config.name + 'create',
							text: options.alert
						});
					}
				} else {
					if (typeof options.errCallback === 'function') {
						options.errCallback(resp);
					}
				}
			},
			(resp: unknown) => {
				if (typeof options.errCallback === 'function') {
					options.errCallback(resp);
				}
			}
		);
		return obs;
	}

	updateAfterWhile(doc: Document, options: CrudOptions<Document> = {}): void {
		doc.__modified = true;
		this._core.afterWhile(this._id(doc), () => {
			this.update(doc, options);
		});
	}
	update(
		doc: Document,
		options: CrudOptions<Document> = {}
	): Observable<Document> {
		doc.__modified = true;
		const obs = this._http.post(
			this._url + '/update' + (options.name || ''),
			doc
		);
		obs.subscribe(
			(resp: Document) => {
				if (typeof resp === 'object') {
					doc.__modified = false;
					this._core.copy(resp, doc);
					if (typeof options.callback === 'function') {
						options.callback(doc);
					}
					if (options.alert) {
						this._alert.show({
							unique: this._config.name + 'create',
							text: options.alert
						});
					}
				} else {
					if (typeof options.errCallback === 'function') {
						options.errCallback(resp);
					}
				}
			},
			(resp: unknown) => {
				if (typeof options.errCallback === 'function') {
					options.errCallback(resp);
				}
			}
		);
		return obs;
	}

	delete(
		doc: Document,
		options: CrudOptions<Document> = {}
	): Observable<Document> {
		const obs = this._http.post(
			this._url + '/delete' + (options.name || ''),
			doc
		);
		obs.subscribe(
			(resp: boolean) => {
				if (resp) {
					this.docs = this.docs.filter(
						(d) => this._id(d) !== this._id(doc)
					);
					this.setDocs();
					this.reconfigureDocs();
					if (typeof options.callback === 'function') {
						options.callback(doc);
					}
					if (options.alert) {
						this._alert.show({
							unique: this._config.name + 'create',
							text: options.alert
						});
					}
				} else {
					if (typeof options.errCallback === 'function') {
						options.errCallback(resp);
					}
				}
			},
			(resp: unknown) => {
				if (typeof options.errCallback === 'function') {
					options.errCallback(resp);
				}
			}
		);
		return obs;
	}
}
