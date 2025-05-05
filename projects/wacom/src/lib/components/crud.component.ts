import { firstValueFrom } from 'rxjs';
import {
	CrudDocument,
	CrudServiceInterface,
} from '../interfaces/crud.interface';
import { CoreService } from '../services/core.service';
import { inject } from '@angular/core';

/**
 * Interface representing the shape of a form service used by the CrudComponent.
 * The consuming app must provide a service that implements this structure.
 */
interface FormServiceInterface {
	getForm: (name: string, components: any[]) => any;
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
	Document extends CrudDocument
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

	/** Internal reference to form service matching FormServiceInterface */
	private __form: FormServiceInterface;

	/**
	 * Constructor
	 *
	 * @param formConfig - Object describing form title and its component structure
	 * @param formService - Any service that conforms to FormServiceInterface (usually casted)
	 * @param translate - An object providing a translate() method for i18n
	 * @param service - CRUD service implementing get/create/update/delete
	 */
	constructor(
		formConfig: { title: string; components: any[] },
		protected formService: unknown,
		protected translate: { translate: (key: string) => string },
		service: Service
	) {
		this.service = service;

		this.__form = formService as FormServiceInterface;

		this.form = this.__form.getForm(
			formConfig.title,
			formConfig.components
		);
	}

	/**
	 * Loads documents for a given page.
	 */
	protected setDocuments(page = this.page): void {
		this.page = page;

		this.__core.afterWhile(
			this,
			() => {
				this.service.get({ page }).subscribe((docs: Document[]) => {
					this.documents.splice(0, this.documents.length);

					this.documents.push(...docs);
				});
			},
			250
		);
	}

	/**
	 * Clears temporary metadata before document creation.
	 */
	protected preCreate(doc: Document): void {
		delete doc.__created;
	}

	/**
	 * Handles bulk creation and updating of documents.
	 * In creation mode, adds new documents.
	 * In update mode, syncs changes and deletes removed entries.
	 */
	protected bulkManagement(create = true): () => void {
		return (): void => {
			this.__form
				.modalDocs<Document>(create ? [] : this.documents)
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

	/**
	 * Configuration object used by the UI for rendering table and handling actions.
	 */
	protected getConfig() {
		return {
			paginate: this.setDocuments.bind(this),
			perPage: 20,
			setPerPage: this.service.setPerPage?.bind(this.service),
			allDocs: false,

			create: (): void => {
				this.__form.modal<Document>(this.form, {
					label: 'Create',
					click: async (created: unknown, close: () => void) => {
						close();
						this.preCreate(created as Document);
						await firstValueFrom(
							this.service.create(created as Document)
						);
						this.setDocuments();
					},
				});
			},

			update: (doc: Document): void => {
				this.__form
					.modal<Document>(this.form, [], doc)
					.then((updated: Document) => {
						this.__core.copy(updated, doc);
						this.service.update(doc);
					});
			},

			delete: (doc: Document): void => {
				this.__form.alert?.question({
					text: this.translate.translate(
						'Common.Are you sure you want to delete this bird?'
					),
					buttons: [
						{ text: this.translate.translate('Common.No') },
						{
							text: this.translate.translate('Common.Yes'),
							callback: async (): Promise<void> => {
								await firstValueFrom(this.service.delete(doc));
								this.setDocuments();
							},
						},
					],
				});
			},

			buttons: [
				{
					icon: 'cloud_download',
					click: (doc: Document): void => {
						this.__form.modalUnique<Document>('bird', 'url', doc);
					},
				},
			],

			headerButtons: [
				{
					icon: 'playlist_add',
					click: this.bulkManagement(),
					class: 'playlist',
				},
				{
					icon: 'edit_note',
					click: this.bulkManagement(false),
					class: 'edit',
				},
			],
		};
	}
}
