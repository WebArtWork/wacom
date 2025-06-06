import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';
import {
	CrudDocument,
	CrudOptions,
	CrudServiceInterface,
} from '../interfaces/crud.interface';
import { CoreService } from '../services/core.service';
import { AlertService } from '../services/alert.service';

interface TableConfig<Document> {
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

/**
 * Interface representing the shape of a form service used by the CrudComponent.
 * The consuming app must provide a service that implements this structure.
 */
interface FormServiceInterface<FormInterface> {
	prepareForm: (form: FormInterface) => any;
	modal: <T>(form: any, options?: any, doc?: T) => Promise<T>;
	modalDocs: <T>(docs: T[]) => Promise<T[]>;
	modalUnique: <T>(collection: string, key: string, doc: T) => void;
	alert?: {
		question: (config: {
			text: string;
			buttons: { text: string; callback?: () => void }[];
		}) => void;
	};
}

/**
 * Abstract reusable base class for CRUD list views.
 * It encapsulates pagination, modals, and document handling logic.
 *
 * @template Service - A service implementing CrudServiceInterface for a specific document type
 * @template Document - The data model extending CrudDocument
 */
export abstract class CrudComponent<
	Service extends CrudServiceInterface<Document>,
	Document extends CrudDocument,
	FormInterface
> {
	/** Service responsible for data fetching, creating, updating, deleting */
	protected service: Service;

	/** The array of documents currently loaded and shown */
	protected documents: Document[] = [];

	/** The reactive form instance generated from the provided config */
	protected form: any;

	/** Current pagination page */
	protected page = 1;

	/** CoreService handles timing and copying helpers */
	private __core = inject(CoreService);

	/** AlertService handles alerts */
	private __alert = inject(AlertService);

	/** Internal reference to form service matching FormServiceInterface */
	private __form: FormServiceInterface<FormInterface>;

	/**
	 * Constructor
	 *
	 * @param formConfig - Object describing form title and its component structure
	 * @param formService - Any service that conforms to FormServiceInterface (usually casted)
	 * @param translate - An object providing a translate() method for i18n
	 * @param service - CRUD service implementing get/create/update/delete
	 */
	constructor(
		formConfig: unknown,
		protected formService: unknown,
		protected translate: { translate: (key: string) => string },
		service: Service
	) {
		this.service = service;

		this.__form = formService as FormServiceInterface<FormInterface>;

		const form = formConfig as FormInterface;

		this.form = this.__form.prepareForm(form);
	}

	/**
	 * Loads documents for a given page.
	 */
	protected setDocuments(page = this.page): void {
		if (this.configType === 'server') {
			this.page = page;

			this.__core.afterWhile(
				this,
				() => {
					this.service
						.get({ page }, this.getOptions())
						.subscribe((docs: Document[]) => {
							this.documents.splice(0, this.documents.length);

							this.documents.push(...docs);
						});
				},
				250
			);
		} else {
			this.documents = this.service.getDocs();
		}
	}

	protected updatableFields = ['_id', 'name', 'description', 'data'];

	/**
	 * Clears temporary metadata before document creation.
	 */
	protected preCreate(doc: Document): void {
		delete doc.__created;
	}

	/**
	 * Funciton which controls whether the create functionality is available.
	 */
	protected allowCreate(): boolean {
		return true;
	}

	/**
	 * Funciton which controls whether the update and delete functionality is available.
	 */
	protected allowMutate(): boolean {
		return true;
	}

	/**
	 * Funciton which controls whether the unique url functionality is available.
	 */
	protected allowUrl(): boolean {
		return true;
	}

	/**
	 * Funciton which prepare get crud options.
	 */
	protected getOptions(): CrudOptions<Document> {
		return {} as CrudOptions<Document>;
	}

	/**
	 * Handles bulk creation and updating of documents.
	 * In creation mode, adds new documents.
	 * In update mode, syncs changes and deletes removed entries.
	 */
	protected bulkManagement(create = true): () => void {
		return (): void => {
			this.__form
				.modalDocs<Document>(
					create
						? []
						: this.documents.map(
								(obj: any) =>
									Object.fromEntries(
										this.updatableFields.map((key) => [
											key,
											obj[key],
										])
									) as Document
						  )
				)
				.then(async (docs: Document[]) => {
					if (create) {
						for (const doc of docs) {
							this.preCreate(doc);

							await firstValueFrom(this.service.create(doc));
						}
					} else {
						for (const document of this.documents) {
							if (!docs.find((d) => d._id === document._id)) {
								await firstValueFrom(
									this.service.delete(document)
								);
							}
						}

						for (const doc of docs) {
							const local = this.documents.find(
								(d) => d._id === doc._id
							);

							if (local) {
								this.__core.copy(doc, local);

								await firstValueFrom(
									this.service.update(local)
								);
							} else {
								this.preCreate(doc);

								await firstValueFrom(this.service.create(doc));
							}
						}
					}

					this.setDocuments();
				});
		};
	}

	protected configType: 'server' | 'local' = 'server';

	/**
	 * Configuration object used by the UI for rendering table and handling actions.
	 */
	protected getConfig(): TableConfig<Document> {
		const config = {
			create: this.allowCreate()
				? (): void => {
						this.__form.modal<Document>(this.form, {
							label: 'Create',
							click: async (
								created: unknown,
								close: () => void
							) => {
								close();
								this.preCreate(created as Document);

								await firstValueFrom(
									this.service.create(created as Document)
								);

								this.setDocuments();
							},
						});
				  }
				: null,

			update: this.allowMutate()
				? (doc: Document): void => {
						this.__form
							.modal<Document>(this.form, [], doc)
							.then((updated: Document) => {
								this.__core.copy(updated, doc);

								this.service.update(doc);
							});
				  }
				: null,

			delete: this.allowMutate()
				? (doc: Document): void => {
						this.__alert.question({
							text: this.translate.translate(
								'Common.Are you sure you want to delete this bird?'
							),
							buttons: [
								{ text: this.translate.translate('Common.No') },
								{
									text: this.translate.translate(
										'Common.Yes'
									),
									callback: async (): Promise<void> => {
										await firstValueFrom(
											this.service.delete(doc)
										);

										this.setDocuments();
									},
								},
							],
						});
				  }
				: null,

			buttons: [
				this.allowUrl()
					? {
							icon: 'cloud_download',
							click: (doc: Document): void => {
								this.__form.modalUnique<Document>(
									'bird',
									'url',
									doc
								);
							},
					  }
					: null,
			],

			headerButtons: [
				this.allowCreate()
					? {
							icon: 'playlist_add',
							click: this.bulkManagement(),
							class: 'playlist',
					  }
					: null,
				this.allowMutate()
					? {
							icon: 'edit_note',
							click: this.bulkManagement(false),
							class: 'edit',
					  }
					: null,
			],
		};

		return this.configType === 'server'
			? {
					...config,
					paginate: this.setDocuments.bind(this),
					perPage: 20,
					setPerPage: this.service.setPerPage?.bind(this.service),
					allDocs: false,
			  }
			: config;
	}
}
