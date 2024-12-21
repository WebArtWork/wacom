import { CrudDocument } from '../interfaces/crud.interface';
import { CoreService } from '../services/core.service';
import { CrudService } from '../services/crud.service';

export abstract class BaseComponent {
	now = new Date().getTime();

	refreshNow(): void {
		this.now = new Date().getTime();
	}
}

interface Form {
	modalDocs<Document>(docs: Document[]): Promise<Document[]>;
}

export abstract class CrudComponent<
	Service extends CrudService<Document>,
	Document extends CrudDocument
> extends BaseComponent {
	constructor(
		private __service: Service,
		private __core: CoreService,
		private __form: unknown
	) {
		super();
	}

	get rows(): Document[] {
		return this.__service.getDocs();
	}

	bulkManagement(create = true): () => void {
		return (): void => {
			(this.__form as Form)
				.modalDocs<Document>(create ? [] : this.rows)
				.then((docs: Document[]) => {
					if (create) {
						for (const doc of docs) {
							this.preCreate(doc);

							this.__service.create(doc);
						}
					} else {
						for (const doc of this.rows) {
							if (
								!docs.find(
									(localDoc) => localDoc._id === doc._id
								)
							) {
								this.__service.delete(doc);
							}
						}

						for (const doc of docs) {
							const localDoc = this.rows.find(
								(localDoc) => localDoc._id === doc._id
							);

							if (localDoc) {
								this.__core.copy(doc, localDoc);

								this.__service.update(localDoc);
							} else {
								this.preCreate(doc);

								this.__service.create(doc);
							}
						}
					}
				});
		};
	}

	preCreate(doc: Document): void {
		delete doc.__created;
	}
}
