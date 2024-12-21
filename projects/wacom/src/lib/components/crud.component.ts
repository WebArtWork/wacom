import { CrudDocument } from '../interfaces/crud.interface';
import { CoreService } from '../services/core.service';
import { CrudService } from '../services/crud.service';
import { BaseComponent } from './base.component';

/**
 * Form interface defines the structure for a form that handles document operations.
 * It includes a method `modalDocs` that processes an array of documents and returns a promise.
 */
interface Form {
	/**
	 * Processes an array of documents and returns a promise with processed documents.
	 *
	 * @param docs The documents to be processed.
	 * @returns A promise that resolves with the processed documents.
	 */
	modalDocs<Document>(docs: Document[]): Promise<Document[]>;
}

/**
 * CrudComponent is an abstract class that extends BaseComponent and provides CRUD functionality for managing documents.
 * It interacts with a CrudService to create, read, update, or delete documents.
 *
 * @template Service - The service class that extends CrudService for managing documents.
 * @template Document - The type of the document that the component works with.
 */
export abstract class CrudComponent<
	Service extends CrudService<Document>,
	Document extends CrudDocument
> extends BaseComponent {
	/**
	 * A getter that returns the list of documents by calling `getDocs()` from the service.
	 *
	 * @returns An array of documents.
	 */
	get rows(): Document[] {
		return this.__service.getDocs();
	}

	/**
	 * Columns to be displayed for the document list, defaulting to 'name' and 'description'.
	 */
	columns = ['name', 'description'];

	/**
	 * Constructor for initializing the CrudComponent.
	 *
	 * @param __service The service instance for interacting with the document data (e.g., CRUD operations).
	 * @param __core The core service providing utility methods.
	 * @param __form The form interface used for handling document processing.
	 */
	constructor(
		private __service: Service,
		private __core: CoreService,
		private __form: unknown
	) {
		super();
	}

	/**
	 * Performs bulk management of documents by creating, updating, or deleting them.
	 *
	 * If `create` is true, it creates new documents. If false, it compares documents
	 * and deletes or updates them accordingly.
	 *
	 * @param create If true, new documents will be created; otherwise, updates or deletions will be performed.
	 * @returns A function that handles bulk document operations.
	 */
	bulkManagement(create = true): () => void {
		return (): void => {
			// Call the modalDocs method from the __form interface to process the documents.
			(this.__form as Form)
				.modalDocs<Document>(create ? [] : this.rows)
				.then((docs: Document[]) => {
					if (create) {
						// Create new documents
						for (const doc of docs) {
							this.preCreate(doc); // Prepare document for creation

							this.__service.create(doc); // Call the service to create the document
						}
					} else {
						// Delete documents that are no longer present
						for (const doc of this.rows) {
							if (
								!docs.find(
									(localDoc) => localDoc._id === doc._id
								)
							) {
								this.__service.delete(doc); // Delete document from the service
							}
						}

						// Update existing documents or create new ones if not found
						for (const doc of docs) {
							const localDoc = this.rows.find(
								(localDoc) => localDoc._id === doc._id
							);

							if (localDoc) {
								// Update the document if it exists locally
								this.__core.copy(doc, localDoc);

								this.__service.update(localDoc); // Call the service to update the document
							} else {
								this.preCreate(doc); // Prepare document for creation

								this.__service.create(doc); // Call the service to create the new document
							}
						}
					}
				});
		};
	}

	/**
	 * Prepares a document before creation by deleting the `__created` property.
	 *
	 * @param doc The document to be prepared for creation.
	 */
	preCreate(doc: Document): void {
		delete doc.__created;
	}
}
