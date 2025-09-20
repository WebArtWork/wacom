import {
	ChangeDetectorRef,
	inject,
	Signal,
	signal,
	WritableSignal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
	CrudDocument,
	CrudOptions,
	CrudServiceInterface,
	TableConfig,
} from '../interfaces/crud.interface';
import { AlertService } from '../services/alert.service';
import { CoreService } from '../services/core.service';

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
	Document extends CrudDocument<Document>,
	FormInterface,
> {
	/** Service responsible for data fetching, creating, updating, deleting */
	protected crudService: Service;

	/** The array of documents currently loaded and shown */
	protected documents = signal<Signal<Document>[]>([]);

	/** The reactive form instance generated from the provided config */
	protected form: any;

	/** Current pagination page */
	protected page = 1;

	/** CoreService handles timing and copying helpers */
	private __core = inject(CoreService);

	/** AlertService handles alerts */
	private __alert = inject(AlertService);

	/** ChangeDetectorRef handles on push strategy */
	private __cdr = inject(ChangeDetectorRef);

	/** Internal reference to form service matching FormServiceInterface */
	private __form: FormServiceInterface<FormInterface>;

	/**
	 * Constructor
	 *
	 * @param formConfig - Object describing form title and its component structure
	 * @param formService - Any service that conforms to FormServiceInterface (usually casted)
	 * @param translateService - An object providing a translate() method for i18n
	 * @param crudService - CRUD service implementing get/create/update/delete
	 */
	constructor(
		formConfig: unknown,
		protected formService: unknown,
		protected translateService: {
			translate: (key: string) => WritableSignal<string>;
		},
		crudService: Service,
		module = '',
	) {
		const form = formConfig as FormInterface;

		this.__form = formService as FormServiceInterface<FormInterface>;

		this.form = this.__form.prepareForm(form);

		this.crudService = crudService;

		this._module = module;
	}

	/**
	 * Loads documents for a given page.
	 */
	protected setDocuments(page = this.page, query = ''): Promise<void> {
		return new Promise((resolve) => {
			if (this.configType === 'server') {
				this.page = page;

				this.__core.afterWhile(
					this,
					() => {
						this.crudService
							.get({ page, query }, this.getOptions())
							.subscribe((docs: Document[]) => {
								this.documents.update(() =>
									this.__core.toSignalsArray(docs),
								);

								resolve();

								this.__cdr.markForCheck();
							});
					},
					250,
				);
			} else {
				this.documents.update(() =>
					this.__core.toSignalsArray(this.crudService.getDocs()),
				);

				this.crudService.loaded.subscribe(() => {
					resolve();

					this.__cdr.markForCheck();
				});
			}
		});
	}

	/** Fields considered when performing bulk updates. */
	protected updatableFields = ['_id', 'name', 'description', 'data'];

	/**
	 * Clears temporary metadata before document creation.
	 */
	protected preCreate(doc: Document): void {
		delete doc.__creating;
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

	/** Determines whether manual sorting controls are available. */
	protected allowSort(): boolean {
		return false;
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
						: this.documents().map(
								(obj: any) =>
									Object.fromEntries(
										this.updatableFields.map((key) => [
											key,
											obj()[key],
										]),
									) as Document,
							),
				)
				.then(async (docs: Document[]) => {
					if (create) {
						for (const doc of docs) {
							this.preCreate(doc);

							await firstValueFrom(this.crudService.create(doc));
						}
					} else {
						for (const document of this.documents()) {
							if (!docs.find((d) => d._id === document()._id)) {
								await firstValueFrom(
									this.crudService.delete(document()),
								);
							}
						}

						for (const doc of docs) {
							const local = this.documents().find(
								(document) => document()._id === doc._id,
							);

							if (local) {
								(local as WritableSignal<Document>).update(
									(document) => {
										this.__core.copy(doc, document);

										return document;
									},
								);

								await firstValueFrom(
									this.crudService.update(local()),
								);
							} else {
								this.preCreate(doc);

								await firstValueFrom(
									this.crudService.create(doc),
								);
							}
						}
					}

					this.setDocuments();
				});
		};
	}

	/** Opens a modal to create a new document. */
	protected create() {
		this.__form.modal<Document>(this.form, {
			label: 'Create',
			click: async (created: unknown, close: () => void) => {
				close();

				this.preCreate(created as Document);

				await firstValueFrom(
					this.crudService.create(created as Document),
				);

				this.setDocuments();
			},
		});
	}

	/** Displays a modal to edit an existing document. */
	protected update(doc: Document) {
		this.__form.modal<Document>(
			this.form,
			{
				label: 'Update',
				click: (updated: unknown) => {
					this.__core.copy(updated, doc);

					this.crudService.update(doc);

					this.__cdr.markForCheck();
				},
			},
			doc,
		);
	}

	/** Requests confirmation before deleting the provided document. */
	protected delete(doc: Document) {
		this.__alert.question({
			text: `Are you sure you want to delete this${this._module ? ' ' + this._module : ''}?`,
			buttons: [
				{ text: 'No' },
				{
					text: 'Yes',
					callback: async (): Promise<void> => {
						await firstValueFrom(this.crudService.delete(doc));

						this.setDocuments();
					},
				},
			],
		});
	}

	/** Opens a modal to edit the document's unique URL. */
	protected mutateUrl(doc: Document) {
		this.__form.modalUnique<Document>(this._module, 'url', doc);
	}

	/** Moves the given document one position up and updates ordering. */
	protected moveUp(doc: Document) {
		const index = this.documents().findIndex(
			(document) => document()._id === doc._id,
		);

		if (index) {
			this.documents.update((documents) => {
				documents.splice(index, 1);

				documents.splice(index - 1, 0, this.__core.toSignal(doc));

				return documents;
			});
		}

		for (let i = 0; i < this.documents().length; i++) {
			if (this.documents()[i]().order !== i) {
				this.documents()[i]().order = i;

				this.crudService.update(this.documents()[i]());
			}
		}

		this.__cdr.markForCheck();
	}

	/** Data source mode used for document retrieval. */
	protected configType: 'server' | 'local' = 'server';

	/** Number of documents fetched per page when paginating. */
	protected perPage = 20;

	/**
	 * Configuration object used by the UI for rendering table and handling actions.
	 */
	protected getConfig(): TableConfig<Document> {
		const config: TableConfig<Document> = {
			create: this.allowCreate()
				? (): void => {
						this.create();
					}
				: null,

			update: this.allowMutate()
				? (doc: Document): void => {
						this.update(doc);
					}
				: null,

			delete: this.allowMutate()
				? (doc: Document): void => {
						this.delete(doc);
					}
				: null,

			buttons: [],
			headerButtons: [],
			allDocs: true,
		};

		if (this.allowUrl()) {
			config.buttons.push({
				icon: 'cloud_download',
				click: (doc: Document) => {
					this.mutateUrl(doc);
				},
			});
		}

		if (this.allowSort()) {
			config.buttons.push({
				icon: 'arrow_upward',
				click: (doc: Document) => {
					this.moveUp(doc);
				},
			});
		}

		if (this.allowCreate()) {
			config.headerButtons.push({
				icon: 'playlist_add',
				click: this.bulkManagement(),
				class: 'playlist',
			});
		}
		if (this.allowMutate()) {
			config.headerButtons.push({
				icon: 'edit_note',
				click: this.bulkManagement(false),
				class: 'edit',
			});
		}

		return this.configType === 'server'
			? {
					...config,
					paginate: this.setDocuments.bind(this),
					perPage: this.perPage,
					setPerPage: this.crudService.setPerPage?.bind(
						this.crudService,
					),
					allDocs: false,
				}
			: config;
	}

	/** Name of the collection or module used for contextual actions. */
	private _module = '';
}
