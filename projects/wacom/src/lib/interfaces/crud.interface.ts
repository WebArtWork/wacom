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
