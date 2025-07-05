import { ChangeDetectorRef, inject } from '@angular/core';
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

	/** ChangeDetectorRef handles on push strategy */
	private __cdr = inject(ChangeDetectorRef);

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
		service: Service,
		module = ''
	) {
		this.service = service;

		this.__form = formService as FormServiceInterface<FormInterface>;

		const form = formConfig as FormInterface;

		this.form = this.__form.prepareForm(form);

		this._module = module;
	}

	/**
	 * Loads documents for a given page.
	 */
	protected setDocuments(page = this.page): Promise<void> {
		return new Promise((resolve) => {
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

								resolve();

								this.__cdr.markForCheck();
							});
					},
					250
				);
			} else {
				this.documents = this.service.getDocs();

				this.service.loaded.then(() => {
					resolve();

					this.__cdr.markForCheck();
				});
			}
		});
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

								this.__cdr.markForCheck();
							});
				  }
				: null,

			delete: this.allowMutate()
				? (doc: Document): void => {
						this.__alert.question({
							text: this.translate.translate(
								`Common.Are you sure you want to delete this${
									this._module ? ' ' + this._module : ''
								}?`
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
				this.allowUrl() && this._module
					? {
							icon: 'cloud_download',
							click: (doc: Document): void => {
								this.__form.modalUnique<Document>(
									this._module,
									'url',
									doc
								);
							},
					  }
					: null,
				this.allowSort()
					? {
							icon: 'arrow_upward',
							click: (doc: Document): void => {
								const index = this.documents.findIndex(
									(d) => d._id === doc._id
								);

								if (index) {
									this.documents.splice(index, 1);

									this.documents.splice(index - 1, 0, doc);
								}

								for (
									let i = 0;
									i < this.documents.length;
									i++
								) {
									if (this.documents[i].order !== i) {
										this.documents[i].order = i;

										this.service.update(this.documents[i]);
									}
								}

								this.__cdr.markForCheck();
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
			allDocs: true,
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

	private _module = '';
}
