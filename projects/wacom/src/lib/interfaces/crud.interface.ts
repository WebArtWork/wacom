export interface CrudDocument {
	_id: string;
	appId?: string;
	__created?: boolean;
	__modified?: boolean;
}

export interface CrudServiceInterface<Document> {
	get: (params: { page: number }) => any;
	create: (doc: Document) => any;
	update: (doc: Document) => any;
	delete: (doc: Document) => any;
	setPerPage?: (count: number) => void;
}
