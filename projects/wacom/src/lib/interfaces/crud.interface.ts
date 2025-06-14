export interface CrudDocument {
	_id: string;
	appId?: string;
	order?: number;
	__created?: boolean;
	__modified?: boolean;
}

export interface CrudOptions<Document> {
	name?: string;
	alert?: string;
	callback?: (resp: Document | Document[]) => void;
	errCallback?: (resp: unknown) => void;
}

export interface CrudServiceInterface<Document> {
	get: (params: { page: number }, options: CrudOptions<Document>) => any;
	getDocs: () => Document[];
	create: (doc: Document) => any;
	update: (doc: Document) => any;
	delete: (doc: Document) => any;
	setPerPage?: (count: number) => void;
}

export interface TableConfig<Document> {
	paginate?: (page?: number) => void;
	perPage?: number;
	setPerPage?: ((count: number) => void) | undefined;
	allDocs?: boolean;
	create: (() => void) | null;
	update: ((doc: Document) => void) | null;
	delete: ((doc: Document) => void) | null;
	buttons: ({
		icon?: string;
		click?: (doc: Document) => void;
		hrefFunc?: (doc: Document) => string;
	} | null)[];
	headerButtons: ({
		icon?: string;
		click?: () => void;
		hrefFunc?: (doc: Document) => string;
		class?: string;
	} | null)[];
}
