/**
 * Basic fields expected on a document managed by the CRUD service.
 */
export interface CrudDocument<Document> {
	/** Unique identifier of the document. */
	_id?: string;
	/** Temporary unique identifier of the document for offline use */
	_localId?: number;
	/** Optional application identifier to which the document belongs. */
	appId?: string;
	/** Numerical position used for manual ordering. */
	order?: number;
	/** Flag indicating the document is creating */
	__creating?: boolean;
	/** Flag set when the document has been modified locally. */
	__modified?: string[];
	/** Flag set when the document has been deleted locally. */
	__deleted?: boolean;
	__options?: Record<string, CrudOptions<Document>>;
}

/**
 * Options that can be supplied to CRUD operations.
 */
export interface CrudOptions<Document> {
	/** Logical name of the collection or resource. */
	name?: string;
	/** Message to display when the operation completes. */
	alert?: string;
	/** Callback invoked with the server response. */
	callback?: (resp: Document | Document[]) => void;
	/** Callback invoked if the request fails. */
	errCallback?: (resp: unknown) => void;
}

/**
 * Contract implemented by services performing CRUD requests.
 */
export interface CrudServiceInterface<Document> {
	/** Retrieve a page of documents from the server. */
	get: (params: { page: number }, options: CrudOptions<Document>) => any;
	/** Return the current in‑memory documents. */
	getDocs: () => Document[];
	/** Create a new document. */
	create: (doc: Document) => any;
	/** Update an existing document. */
	update: (doc: Document) => any;
	/** Delete the provided document. */
	delete: (doc: Document) => any;
	/** Change the number of documents retrieved per page. */
	setPerPage?: (count: number) => void;
	/** Resolves when the initial data load has completed. */
	loaded: Promise<unknown>;
}

/**
 * Configuration describing how a CRUD table should behave.
 */
export interface TableConfig<Document> {
	/** Callback to paginate to a given page. */
	paginate?: (page?: number) => void;
	/** Number of documents shown per page. */
	perPage?: number;
	/** Function used to update the page size. */
	setPerPage?: ((count: number) => void) | undefined;
	/** When true, fetch all documents instead of paginating. */
	allDocs?: boolean;
	/** Handler invoked to create a new record. */
	create: (() => void) | null;
	/** Handler invoked to edit a record. */
	update: ((doc: Document) => void) | null;
	/** Handler invoked to delete a record. */
	delete: ((doc: Document) => void) | null;
	/** Row‑level action buttons. */
	buttons: ({
		icon?: string;
		click?: (doc: Document) => void;
		hrefFunc?: (doc: Document) => string;
	} | null)[];
	/** Buttons displayed in the table header. */
	headerButtons: ({
		icon?: string;
		click?: () => void;
		hrefFunc?: (doc: Document) => string;
		class?: string;
	} | null)[];
}
