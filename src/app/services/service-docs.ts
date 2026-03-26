export interface ServiceMethodDoc {
	name: string;
	signature: string;
	description: string;
	details?: string[];
	example?: string;
	category?: string;
	docType?: 'Service' | 'Component' | 'Interface';
}

export interface ServiceSectionDoc {
	title: string;
	items: string[];
	example?: string;
}

export interface ServiceDoc {
	slug: string;
	name: string;
	description: string;
	summary: string;
	highlights: string[];
	config?: string[];
	properties?: ServiceMethodDoc[];
	methods: ServiceMethodDoc[];
	sections?: ServiceSectionDoc[];
	code: string;
}

export const serviceDocs: ServiceDoc[] = [
	{
		slug: 'core-service',
		name: 'CoreService',
		description:
			'Low-level SSR-safe helpers for ids, copy, viewport, device, locks, and signals.',
		summary:
			'CoreService is the base utility layer used by the library itself. It wraps browser-sensitive detection, document-independent helpers, and signal utilities that other services build on.',
		highlights: [
			'Generates a persistent device id on the client and a temporary id on the server.',
			'Detects device type and responsive viewport using guarded browser APIs.',
			'Provides object copying, debounce-like afterWhile(), lock management, and signal helpers.',
		],
		config: [
			'No explicit provideWacom() config is required.',
			'Browser-only features such as device detection and viewport listeners run only on the client.',
		],
		properties: [
			{
				name: 'deviceID',
				signature: 'deviceID: string',
				description:
					'Stable per-device identifier persisted to localStorage when available.',
				category: 'Device and viewport',
				example: `import { CoreService } from 'wacom';

constructor(private core: CoreService) {}

ngOnInit() {
\tconsole.log('device id', this.core.deviceID);
}`,
			},
			{
				name: 'device',
				signature: "device: '' | 'Windows Phone' | 'Android' | 'iOS' | 'Web'",
				description: 'Detected platform classification after detectDevice().',
				category: 'Device and viewport',
				example: `import { CoreService } from 'wacom';

constructor(private core: CoreService) {}

ngOnInit() {
\tthis.core.detectDevice();
\tconsole.log('platform', this.core.device);
}`,
			},
			{
				name: 'viewport',
				signature: "viewport: Signal<'mobile' | 'tablet' | 'desktop'>",
				description: 'Responsive breakpoint signal driven by matchMedia listeners.',
				category: 'Device and viewport',
				example: `import { CoreService } from 'wacom';

readonly core = inject(CoreService);

ngOnInit() {
\tthis.core.detectViewport();
}

viewportLabel() {
\treturn this.core.viewport();
}`,
			},
			{
				name: 'isViewportMobile / Tablet / Desktop',
				signature: 'computed signals',
				description: 'Convenience computed signals derived from viewport().',
				category: 'Device and viewport',
				example: `import { CoreService } from 'wacom';

readonly core = inject(CoreService);

isCompactLayout() {
\treturn this.core.isViewportMobile() || this.core.isViewportTablet();
}`,
			},
			{
				name: 'version / appVersion / dateVersion',
				signature: 'string fields',
				description: 'Simple version state for combining app and date versions.',
				category: 'Versioning',
				example: `import { CoreService } from 'wacom';

constructor(private core: CoreService) {}

setBuildInfo() {
\tthis.core.setAppVersion('1.4.0');
\tthis.core.setDateVersion('2026-03-21');
\tconsole.log(this.core.version);
}`,
			},
		],
		methods: [
			{
				name: 'UUID',
				signature: 'UUID(): string',
				description: 'Generates a UUID v4-like identifier using Math.random().',
				details: [
					'Good for local ids and general runtime identifiers, not for cryptographic use.',
				],
				category: 'Data helpers',
				example: `import { CoreService } from 'wacom';

constructor(private core: CoreService) {}

createDraft() {
\treturn { _id: this.core.UUID(), title: 'Untitled' };
}`,
			},
			{
				name: 'ota',
				signature: 'ota(obj: any, holder = false): any[]',
				description: 'Converts an object to an array of values or keys.',
				details: [
					'Returns the input unchanged for arrays and an empty array for non-objects.',
				],
				category: 'Data helpers',
			},
			{
				name: 'splice',
				signature:
					"splice(removeArray: any[], fromArray: any[], compareField = '_id'): any[]",
				description:
					'Removes items from one array when their compareField exists in another array.',
				category: 'Data helpers',
			},
			{
				name: 'ids2id',
				signature: 'ids2id(...args: string[]): string',
				description: 'Creates a deterministic combined id by sorting ids and joining them.',
				category: 'Data helpers',
			},
			{
				name: 'afterWhile',
				signature:
					'afterWhile(doc: string | object | (() => void), cb?: () => void, time = 1000): void',
				description:
					'Debounce-like helper that delays a callback and resets the timer if called again.',
				details: [
					'Can key the timer by string, store it on an object, or default to a shared "common" key.',
				],
				category: 'Flow control',
				example: `import { CoreService } from 'wacom';

constructor(private core: CoreService) {}

queueSave(doc: { _id: string }) {
\tthis.core.afterWhile(doc._id, () => {
\t\tconsole.log('save once user stops typing');
\t}, 400);
}`,
			},
			{
				name: 'copy',
				signature: 'copy(from: any, to: any): void',
				description:
					'Recursively copies plain object data while preserving arrays, dates, and null values.',
				category: 'Data helpers',
			},
			{
				name: 'detectDevice',
				signature: 'detectDevice(): void',
				description: 'Updates device based on the current user agent.',
				category: 'Device and viewport',
				example: `import { CoreService } from 'wacom';

constructor(private core: CoreService) {}

ngOnInit() {
\tthis.core.detectDevice();

\tif (this.core.isIos()) {
\t\tconsole.log('show iOS-specific hint');
\t}
}`,
			},
			{
				name: 'isMobile / isTablet / isWeb / isAndroid / isIos',
				signature: 'boolean helpers',
				description: 'Convenience methods for checking the detected device classification.',
				category: 'Device and viewport',
			},
			{
				name: 'detectViewport',
				signature: 'detectViewport(): void',
				description:
					'Starts responsive breakpoint tracking with automatic cleanup on service destroy.',
				category: 'Device and viewport',
				example: `import { CoreService } from 'wacom';

readonly core = inject(CoreService);

ngOnInit() {
\tthis.core.detectViewport();
}`,
			},
			{
				name: 'setVersion / setAppVersion / setDateVersion',
				signature: 'version setters',
				description:
					'Build and update a combined version string from appVersion and dateVersion.',
				category: 'Versioning',
			},
			{
				name: 'lock / unlock / onUnlock / locked',
				signature: 'resource locking helpers',
				description:
					'Coordinate async workflows by locking named resources and awaiting their release.',
				category: 'Flow control',
			},
			{
				name: 'toSignal / toSignalsArray',
				signature: 'signal conversion helpers',
				description:
					'Wrap plain objects or arrays into Angular signals, optionally making selected fields signals too.',
				category: 'Signals',
				example: `import { CoreService } from 'wacom';

constructor(private core: CoreService) {}

user = this.core.toSignal({
\tname: 'Anna',
\tstatus: 'active',
}, ['status']);

updateStatus() {
\tthis.user.status.set('invited');
}`,
			},
			{
				name: 'pushSignal / removeSignalByField / findSignalByField / updateSignalByField / trackBySignalField',
				signature: 'signal collection helpers',
				description:
					'Manage arrays of document signals without re-implementing common lookup and update logic.',
				category: 'Signals',
			},
		],
		code: `import { CoreService } from 'wacom';

constructor(private core: CoreService) {}

queueSave(doc: { _id: string }) {
\tthis.core.afterWhile(doc._id, () => {
\t\tconsole.log('save once user stops typing');
\t}, 400);
}`,
	},
	{
		slug: 'http-service',
		name: 'HttpService',
		description:
			'Shared base URL, header management, callbacks, and Observable requests on top of HttpClient.',
		summary:
			'HttpService wraps Angular HttpClient with shared URL and header state, retry-aware error hooks, optional response shaping, and a simple request lock to serialize calls when needed.',
		highlights: [
			'Supports get/post/put/patch/delete with both callback and Observable usage.',
			'Persists base URL and headers in localStorage on the client.',
			'Can reject responses through acceptance(), reshape payloads through replace(), and extract only specific fields.',
		],
		config: [
			'Configure defaults with provideWacom({ http: { url, headers } }).',
			'Client-side overrides persist in localStorage under wacom-http.url and wacom-http.headers.',
			'errors is a global array of callbacks invoked for every request failure.',
		],
		properties: [
			{
				name: 'url',
				signature: 'url: string',
				description: 'Current base URL prepended to relative request paths.',
			},
			{
				name: 'locked',
				signature: 'locked: boolean',
				description:
					'When true, requests queue until unlock() unless opts.skipLock is set.',
			},
			{
				name: 'errors',
				signature: '((err: HttpErrorResponse, retry?: () => void) => {})[]',
				description:
					'Global error hooks triggered in addition to per-request opts.err callbacks.',
			},
		],
		methods: [
			{
				name: 'setUrl',
				signature: 'setUrl(url: string): void',
				description: 'Sets the base URL and persists it in the browser.',
			},
			{
				name: 'removeUrl',
				signature: 'removeUrl(): void',
				description: 'Clears the runtime override and falls back to configured url.',
			},
			{
				name: 'set',
				signature: 'set(key: any, value: any): void',
				description: 'Adds or updates a shared HTTP header and persists it in the browser.',
			},
			{
				name: 'header',
				signature: 'header(key: any): any',
				description: 'Reads the current value for a shared header.',
			},
			{
				name: 'remove',
				signature: 'remove(key: any): void',
				description:
					'Deletes a shared header and updates the in-memory HttpHeaders instance.',
			},
			{
				name: 'post / put / patch / delete / get',
				signature: 'request helpers returning Observable<any>',
				description:
					'Execute HTTP requests against the current base URL using shared headers.',
				details: [
					'Each helper accepts a legacy callback and an opts object.',
					'opts.err can handle failures for one call.',
					'opts.url can override the base URL per request.',
					'opts.skipLock bypasses service-level locking.',
					'opts.acceptance(resp) can reject a successful HTTP response as invalid.',
					'opts.replace(item) mutates the payload or nested payload at opts.data.',
					'opts.fields limits the response payload to selected fields.',
				],
			},
			{
				name: 'clearLocked',
				signature: 'clearLocked(): void',
				description: 'Cancels queued retry timers created while the service was locked.',
			},
			{
				name: 'lock / unlock',
				signature: 'lock(): void / unlock(): void',
				description: 'Pause or resume requests globally within this service instance.',
			},
		],
		sections: [
			{
				title: 'Opts object',
				items: [
					'err(err): per-request error callback.',
					'acceptance(resp): reject unexpected payloads even when the HTTP status was successful.',
					'replace(item): mutate returned object(s) before subscribers receive them.',
					'fields: build a reduced object containing only the listed fields.',
					'data: dot-path pointing at the nested response object/array used by replace and fields.',
					'skipLock: ignore the locked flag for a specific request.',
					'url: temporary base URL override.',
				],
			},
		],
		code: `import { HttpService } from 'wacom';

constructor(private http: HttpService) {}

loadProjects() {
\tthis.http.set('Authorization', 'Bearer token');
\treturn this.http.get('/projects', (resp) => console.log(resp), {
\t\tacceptance: (resp) => Array.isArray(resp),
\t});
}`,
	},
	{
		slug: 'store-service',
		name: 'StoreService',
		description:
			'Async-first persistence wrapper for localStorage or a custom storage provider.',
		summary:
			'StoreService keeps storage access behind one SSR-safe API. It can use the built-in localStorage implementation or delegate to custom set/get/remove/clear handlers provided through config.',
		highlights: [
			'Works with strings and JSON payloads.',
			'Supports success/error callbacks plus Promise-based consumption.',
			'Can auto-clear broken JSON payloads and return a default fallback.',
		],
		config: [
			'Set a global prefix with provideWacom({ store: { prefix: "waStore" } }).',
			'Provide custom store.set/get/remove/clear handlers to back the service with another persistence layer.',
			'setPrefix() adds an additional runtime prefix on top of the configured prefix.',
		],
		methods: [
			{
				name: 'setPrefix',
				signature: 'setPrefix(prefix: string): void',
				description: 'Adds a runtime prefix applied after any configured prefix.',
			},
			{
				name: 'set',
				signature:
					'set(key: string, value: string, options?: StoreOptions): Promise<boolean>',
				description: 'Stores a raw string value.',
				details: [
					'Returns true on success, false on failure, and is SSR-safe when no browser storage exists.',
				],
			},
			{
				name: 'get',
				signature:
					'get(key: string, options?: StoreOptions<string>): Promise<string | null>',
				description: 'Reads a raw string value and returns null when it does not exist.',
			},
			{
				name: 'setJson',
				signature:
					'setJson<T>(key: string, value: T, options?: StoreOptions): Promise<boolean>',
				description: 'Serializes and stores structured JSON data.',
			},
			{
				name: 'getJson',
				signature: 'getJson<T>(key: string, options?: StoreOptions<T>): Promise<T | null>',
				description: 'Reads and parses JSON with fallback and optional auto-healing.',
				details: [
					'clearOnError defaults to true and removes malformed JSON automatically.',
					'defaultValue is returned when storage is missing or parsing fails.',
				],
			},
			{
				name: 'remove',
				signature: 'remove(key: string, options?: StoreOptions): Promise<boolean>',
				description: 'Deletes one storage key.',
			},
			{
				name: 'clear',
				signature: 'clear(options?: StoreOptions): Promise<boolean>',
				description: 'Clears the entire storage provider.',
			},
		],
		sections: [
			{
				title: 'StoreOptions',
				items: [
					'onSuccess(value?): callback invoked after successful completion.',
					'onError(error): callback invoked when the operation fails.',
					'defaultValue: fallback used by getJson().',
					'clearOnError: controls whether malformed JSON is removed.',
				],
			},
		],
		code: `import { StoreService } from 'wacom';

constructor(private store: StoreService) {}

async saveSettings() {
\tawait this.store.setJson('settings', { compact: true, mode: 'dark' });
\treturn this.store.getJson('settings', { defaultValue: {} });
}`,
	},
	{
		slug: 'meta-service',
		name: 'MetaService',
		description: 'Centralized page meta handling for route-driven and manual SEO updates.',
		summary:
			'MetaService owns the page title and managed meta tags so single-page navigation does not leak stale SEO state across routes.',
		highlights: [
			'Can auto-apply route data.meta on every NavigationEnd.',
			'Generates standard, Open Graph, Twitter, and itemprop variants from a small input model.',
			'Manages canonical and other link tags without duplicates.',
		],
		config: [
			'Recommended setup: provideWacom({ meta: { applyFromRoutes: true, defaults: { ... } } }).',
			'useTitleSuffix appends defaults.titleSuffix or page.titleSuffix to page titles.',
			'defaults.links are stored in config, but link tags are intentionally managed separately through setLink().',
		],
		methods: [
			{
				name: 'setDefaults',
				signature: 'setDefaults(defaults: MetaDefaults): void',
				description: 'Merges new defaults into the existing meta configuration.',
			},
			{
				name: 'applyMeta',
				signature: 'applyMeta(page?: MetaPage): void',
				description:
					'Applies title, description, image, and robots metadata for the current page.',
				details: [
					'Removes previously managed tags first to prevent stale metadata.',
					'Uses defaults as fallbacks for missing page values.',
					'Skips all work when page.disableUpdate is true.',
				],
			},
			{
				name: 'reset',
				signature: 'reset(): void',
				description: 'Clears managed tags and reapplies defaults-only metadata.',
			},
			{
				name: 'setLink',
				signature: 'setLink(links: Record<string, string>): void',
				description:
					'Creates or updates canonical and other link rel tags without duplication.',
			},
			{
				name: 'resetLinks',
				signature: 'resetLinks(): void',
				description: 'Removes only the link tags previously managed via setLink().',
			},
		],
		sections: [
			{
				title: 'Meta inputs',
				items: [
					'MetaPage: title, titleSuffix, description, image, index, robots, disableUpdate.',
					'MetaDefaults: same content fields plus links for canonical/alternate defaults.',
					'robots wins over index when both are present.',
					'When applyFromRoutes is enabled, the service reads data.meta from the deepest active route.',
				],
			},
			{
				title: 'Generated tags',
				items: [
					'Title updates: <title>, itemprop="name", og:title, twitter:title.',
					'Description updates: description, itemprop="description", og:description, twitter:description.',
					'Image updates: itemprop="image", og:image, twitter:image:src.',
					'Robots updates: name="robots".',
				],
			},
		],
		code: `provideWacom({
\tmeta: {
\t\tapplyFromRoutes: true,
\t\tuseTitleSuffix: true,
\t\tdefaults: {
\t\t\ttitle: 'Wacom',
\t\t\ttitleSuffix: ' | Web Art Work',
\t\t\tdescription: 'Angular utility library',
\t\t},
\t},
});`,
	},
	{
		slug: 'crud-service',
		name: 'CrudService',
		description:
			'Reusable document data layer with local cache, signals, offline queueing, and lifecycle hooks.',
		summary:
			'CrudService is the heaviest abstraction in the library. Extend it for document collections that need cached reads, create/update/delete calls, offline retries, filtered list projections, and signal-based access patterns.',
		highlights: [
			'Restores cached docs from storage and replays pending mutations when the app comes back online.',
			'Exposes Observable workflows plus per-document and per-query Angular signals.',
			'Supports lifecycle middleware hooks before and after every CRUD operation.',
		],
		config: [
			'CrudConfig controls collection name, identity field, appId injection, unauthorized cache behavior, replace(doc) normalization, and signalFields.',
			'By default the collection URL is /api/<name> with get/create/fetch/update/unique/delete endpoints.',
			'When unauthorized is false, cache restore is tied to the current waw_user id in localStorage.',
		],
		properties: [
			{
				name: 'loaded',
				signature: 'Observable<unknown>',
				description: 'Completes when cached documents are restored from storage.',
				category: 'Lifecycle',
				docType: 'Service',
			},
			{
				name: 'getted',
				signature: 'Observable<unknown>',
				description: 'Completes after the first full get() without page pagination.',
				category: 'Lifecycle',
				docType: 'Service',
			},
			{
				name: 'documents',
				signature: 'protected documents = signal<Signal<Document>[]>([])',
				description:
					'CrudComponent stores the currently displayed document signals here for table and list rendering.',
				category: 'Component state',
				docType: 'Component',
			},
			{
				name: 'page / perPage / configType',
				signature: 'pagination and mode fields',
				description:
					'CrudComponent tracks pagination state and whether it loads from the server or local memory.',
				category: 'Component state',
				docType: 'Component',
			},
			{
				name: 'CrudDocument',
				signature: 'interface CrudDocument<Document>',
				description:
					'Base document contract with identity, ordering, and offline mutation metadata used by CrudService.',
				details: [
					'Includes _id, _localId, appId, order, __modified, __deleted, and __options.',
					'Use it as the base generic constraint for your app document model.',
				],
				category: 'Interfaces',
				docType: 'Interface',
			},
			{
				name: 'CrudOptions',
				signature: 'interface CrudOptions<Document>',
				description:
					'Options passed into CRUD operations for callbacks and request naming.',
				details: ['Supports name, callback, and errCallback.'],
				category: 'Interfaces',
				docType: 'Interface',
			},
			{
				name: 'CrudServiceInterface',
				signature: 'interface CrudServiceInterface<Document>',
				description: 'Contract that CrudComponent expects from a CRUD-backed data service.',
				category: 'Interfaces',
				docType: 'Interface',
			},
			{
				name: 'TableConfig / TableConfigButton',
				signature: 'table configuration interfaces',
				description:
					'Describe row actions, header buttons, pagination handlers, and CRUD callbacks used by CrudComponent UIs.',
				category: 'Interfaces',
				docType: 'Interface',
			},
			{
				name: 'CrudConfig / GetConfig',
				signature: 'configuration interfaces',
				description:
					'Define the CrudService constructor config and read-query options for collection requests.',
				category: 'Interfaces',
				docType: 'Interface',
			},
		],
		methods: [
			{
				name: 'restoreDocs',
				signature: 'restoreDocs(): Promise<void>',
				description:
					'Loads cached docs, hydrates memory, and replays pending create/update/unique/delete work.',
				category: 'Lifecycle',
				docType: 'Service',
			},
			{
				name: 'setDocs / getDocs / getDoc / clearDocs',
				signature: 'cache management helpers',
				description: 'Persist, retrieve, or reset the local in-memory document cache.',
				category: 'Cache',
				docType: 'Service',
			},
			{
				name: 'addDoc / addDocs',
				signature: 'addDoc(doc: Document): void / addDocs(docs: Document[]): void',
				description: 'Insert or merge documents into the cache and keep signals in sync.',
				category: 'Cache',
				docType: 'Service',
			},
			{
				name: 'new',
				signature: 'new(doc?: Document): Document',
				description: 'Creates a local-first document with _localId and mutation flags.',
				category: 'Documents',
				docType: 'Service',
			},
			{
				name: 'doc',
				signature: 'doc(_id: string): Document',
				description:
					'Returns a cached document, creates a placeholder if missing, and fetches the server copy in the background.',
				category: 'Documents',
				docType: 'Service',
			},
			{
				name: 'setPerPage',
				signature: 'setPerPage(_perPage: number): void',
				description: 'Controls skip/limit generation for paginated get() calls.',
				category: 'Pagination',
				docType: 'Service',
			},
			{
				name: 'get',
				signature:
					'get(config?: GetConfig, options?: CrudOptions<Document>): Observable<Document[]>',
				description:
					'Fetches collection documents, fills the cache, emits collection events, and supports pagination.',
				category: 'Requests',
				docType: 'Service',
			},
			{
				name: 'create',
				signature:
					'create(doc: Document, options?: CrudOptions<Document>): Observable<Document>',
				description:
					'Creates a document, stores local intent first, and retries automatically when offline.',
				category: 'Requests',
				docType: 'Service',
			},
			{
				name: 'fetch',
				signature:
					'fetch(query?: object, options?: CrudOptions<Document>): Observable<Document>',
				description: 'Fetches one document by query and merges it into the cache.',
				category: 'Requests',
				docType: 'Service',
			},
			{
				name: 'updateAfterWhile',
				signature:
					'updateAfterWhile(doc: Document, options?: CrudOptions<Document>): Observable<Document>',
				description:
					'Debounces update() through CoreService.afterWhile() for typing-heavy flows.',
				category: 'Requests',
				docType: 'Service',
			},
			{
				name: 'update',
				signature:
					'update(doc: Document, options?: CrudOptions<Document>): Observable<Document>',
				description:
					'Marks the document modified, posts to /update, clears the modification mark on success, and syncs signals.',
				category: 'Requests',
				docType: 'Service',
			},
			{
				name: 'unique',
				signature:
					'unique(doc: Document, options?: CrudOptions<Document>): Observable<Document>',
				description:
					'Runs a unique-field style update through /unique and stores the returned field value on the document.',
				category: 'Requests',
				docType: 'Service',
			},
			{
				name: 'delete',
				signature:
					'delete(doc: Document, options?: CrudOptions<Document>): Observable<Document>',
				description:
					'Marks the document deleted, queues offline if needed, and removes it from the cache on success.',
				category: 'Requests',
				docType: 'Service',
			},
			{
				name: 'getSignal / getSignals / getFieldSignals / removeSignals',
				signature: 'signal helpers',
				description:
					'Expose per-document signals, field/value grouped signals, and cache cleanup for signal instances.',
				category: 'Signals',
				docType: 'Service',
			},
			{
				name: 'filteredDocuments',
				signature: 'filteredDocuments(storeObjectOrArray, config): () => void',
				description:
					'Registers a live projection callback for arrays or grouped maps of documents.',
				details: [
					'Supports grouping by a field name or a custom field resolver.',
					'Supports valid(), sort(), and filtered() callbacks.',
					'Triggered whenever _filterDocuments() runs after cache mutations.',
				],
				category: 'Signals',
				docType: 'Service',
			},
			{
				name: 'before*/after* hooks',
				signature:
					'beforeCreate, afterCreate, beforeUpdate, afterUpdate, beforeUnique, afterUnique, beforeDelete, afterDelete, beforeFetch, afterFetch',
				description:
					'Override these in child services to normalize input, inject context, or react after server success.',
				category: 'Extensibility',
				docType: 'Service',
			},
			{
				name: 'setDocuments',
				signature: "setDocuments(page = this.page, query = ''): Promise<void>",
				description:
					'CrudComponent loads rows for the current page and updates its internal documents signal.',
				category: 'Loading and pagination',
				docType: 'Component',
			},
			{
				name: 'setDocumentsQuery / localDocumentsFilter / getOptions',
				signature: 'customization hooks',
				description:
					'CrudComponent lets feature components customize list queries, local filtering, and CRUD request options.',
				category: 'Customization hooks',
				docType: 'Component',
			},
			{
				name: 'create / update / delete / mutateUrl',
				signature: 'modal and mutation handlers',
				description:
					'CrudComponent wires modal workflows to create, update, delete, and unique-url actions.',
				category: 'Mutations',
				docType: 'Component',
			},
			{
				name: 'bulkManagement',
				signature: 'bulkManagement(isCreateFlow = true): () => void',
				description:
					'Handles batch create and batch update flows through modalDocs() and the CRUD service.',
				category: 'Mutations',
				docType: 'Component',
			},
			{
				name: 'moveUp / allowSort',
				signature: 'sorting helpers',
				description:
					'Provide optional manual ordering controls for list views backed by an `order` field.',
				category: 'List controls',
				docType: 'Component',
			},
			{
				name: 'getConfig',
				signature: 'getConfig(): TableConfig<Document>',
				description:
					'Builds the action and pagination configuration consumed by CRUD table UIs.',
				category: 'List controls',
				docType: 'Component',
			},
		],
		sections: [
			{
				title: 'Events emitted through EmitterService',
				items: [
					'<name>_loaded after cached restore.',
					'<name>_getted after initial full get().',
					'<name>_filtered after filteredDocuments projections recompute.',
					'<name>_get, _create, _update, _unique, _delete, _list, _changed during CRUD workflows.',
					'Responds to global wipe by clearing docs and to wacom_online by replaying queued operations.',
				],
			},
			{
				title: 'Offline behavior',
				items: [
					'create/update/unique/delete queue themselves when NetworkService reports offline.',
					'Pending changes are persisted to storage in __modified / __deleted / __options.',
					'When connectivity returns, the constructor drains queued callbacks registered in _onOnline.',
				],
			},
		],
		code: `import { CrudService, type CrudDocument } from 'wacom';

interface Project extends CrudDocument<Project> {
\t_id?: string;
\tname?: string;
}

export class ProjectService extends CrudService<Project> {
\tconstructor() {
\t\tsuper({ name: 'project' });
\t}
}`,
	},
	{
		slug: 'emitter-service',
		name: 'EmitterService',
		description:
			'Hot event channels and task-completion coordination built on signals and RxJS.',
		summary:
			'EmitterService acts as a small app-wide bus. It is useful for loose coupling between services, route workflows, and bootstrap steps without adding a larger state system.',
		highlights: [
			'emit()/on() creates Subject-like event channels with no replay on subscribe.',
			'complete()/onComplete() tracks one-off tasks separately from event channels.',
			'Supports waiting for all or any of several tasks, plus timeout and AbortSignal cancellation.',
		],
		methods: [
			{
				name: 'emit',
				signature: 'emit<T>(id: string, data?: T): void',
				description: 'Publishes an event on a named hot channel.',
			},
			{
				name: 'on',
				signature: 'on<T>(id: string): Observable<T>',
				description:
					'Subscribes to a named channel. Existing value is not replayed to new subscribers.',
			},
			{
				name: 'off / offAll',
				signature: 'off(id: string): void / offAll(): void',
				description:
					'Completes channels and removes their internal signal, closer, and stream state.',
			},
			{
				name: 'has',
				signature: 'has(id: string): boolean',
				description: 'Checks whether an event channel has been created.',
			},
			{
				name: 'complete',
				signature: 'complete<T>(task: string, value: T = true): void',
				description: 'Marks a named task as completed with a payload.',
			},
			{
				name: 'clearCompleted / completed / isCompleted',
				signature: 'task completion helpers',
				description: 'Reset and inspect the current completion state for a task.',
			},
			{
				name: 'onComplete',
				signature:
					"onComplete(tasks: string | string[], opts?: { mode?: 'all' | 'any'; timeoutMs?: number; abort?: AbortSignal; }): Observable<any | any[]>",
				description: 'Waits for one or more tasks to be completed.',
				details: [
					'Single task waits for the first completed payload.',
					'mode: "any" resolves on the first completed task from the list.',
					'Default mode waits for all tasks and returns combineLatest-style payloads.',
				],
			},
		],
		code: `import { EmitterService } from 'wacom';

constructor(private emitter: EmitterService) {}

ngOnInit() {
\tthis.emitter.on('user:login').subscribe((user) => console.log(user));
}

markReady() {
\tthis.emitter.complete('bootstrap:ready');
}`,
	},
	{
		slug: 'network-service',
		name: 'NetworkService',
		description: 'Signal-driven connectivity classification with active endpoint probing.',
		summary:
			'NetworkService does more than mirror navigator.onLine. It periodically pings configured endpoints, measures latency, classifies the result as good/poor/none, and emits online/offline events for the rest of the library.',
		highlights: [
			'Tracks status, latencyMs, and isOnline as Angular signals.',
			'Combines browser online/offline events with active fetch-based checks.',
			'Emits wacom_online and wacom_offline through EmitterService when classification changes.',
		],
		config: [
			'Configure with provideWacom({ network: { endpoints, timeoutMs, intervalMs, goodLatencyMs, maxConsecutiveFails } }).',
			'endpoints are checked in order until one responds successfully.',
			'Public fallback endpoints use no-cors mode unless the URL contains api.webart.work.',
		],
		properties: [
			{
				name: 'status',
				signature: "readonly Signal<'good' | 'poor' | 'none'>",
				description:
					'Connectivity classification based on browser state and measured latency.',
			},
			{
				name: 'latencyMs',
				signature: 'readonly Signal<number | null>',
				description:
					'Measured latency for the first reachable endpoint or null when no check succeeded.',
			},
			{
				name: 'isOnline',
				signature: 'readonly Signal<boolean>',
				description:
					'Current online state, influenced by browser online/offline events and successful checks.',
			},
		],
		methods: [
			{
				name: 'recheckNow',
				signature: 'recheckNow(): Promise<void>',
				description:
					'Immediately probes endpoints, updates latency, and recalculates the connectivity classification.',
			},
		],
		sections: [
			{
				title: 'Classification rules',
				items: [
					'none when browser is offline or failures reach maxConsecutiveFails.',
					'good when latency is available and <= goodLatencyMs.',
					'poor when the browser is online but latency is slow or unavailable without reaching none.',
				],
			},
			{
				title: 'Runtime behavior',
				items: [
					'Binds online/offline browser events.',
					'Listens to navigator.connection change when available.',
					'Runs one check on startup and continues polling on an interval.',
				],
			},
		],
		code: `provideWacom({
\tnetwork: {
\t\tintervalMs: 15000,
\t\tgoodLatencyMs: 250,
\t\tendpoints: ['https://api.webart.work/ping'],
\t},
});`,
	},
	{
		slug: 'theme-service',
		name: 'ThemeService',
		description: 'Appearance preference manager for mode, density, radius, and theme cycling.',
		summary:
			'ThemeService stores UI appearance choices on the document root and in localStorage, while exposing the current values as Angular signals for reactive UI controls.',
		highlights: [
			'Supports light/dark mode, comfortable/compact density, and rounded/square radius.',
			'Persists all values on the client and restores them through init().',
			'Provides nextTheme() to cycle all combinations from one action.',
		],
		properties: [
			{
				name: 'mode / density / radius',
				signature: 'Writable signals',
				description: 'Current appearance selections.',
			},
			{
				name: 'modes / densities / radiuses',
				signature: 'Writable signals of option arrays',
				description: 'Available values used by setters and nextTheme().',
			},
			{
				name: 'themeIndex',
				signature: 'signal<number>',
				description:
					'Linear index representing the current combination of mode, density, and radius.',
			},
		],
		methods: [
			{
				name: 'setMode',
				signature: "setMode(mode: 'light' | 'dark'): void",
				description:
					'Updates the mode signal, data-mode attribute, and localStorage value.',
			},
			{
				name: 'setDensity',
				signature: "setDensity(density: 'comfortable' | 'compact'): void",
				description:
					'Updates the density signal, data-density attribute, and localStorage value.',
			},
			{
				name: 'setRadius',
				signature: "setRadius(radius: 'rounded' | 'square'): void",
				description:
					'Updates the radius signal, data-radius attribute, and localStorage value.',
			},
			{
				name: 'nextTheme',
				signature: 'nextTheme(): void',
				description:
					'Cycles through every mode/density/radius combination and persists the resulting themeIndex.',
			},
			{
				name: 'init',
				signature: 'init(): void',
				description:
					'Loads persisted values or defaults and applies them to the document root.',
			},
		],
		code: `import { ThemeService } from 'wacom';

constructor(private theme: ThemeService) {}

ngOnInit() {
\tthis.theme.init();
}

toggleTheme() {
\tthis.theme.nextTheme();
}`,
	},
	{
		slug: 'translate-service',
		name: 'TranslateService',
		description:
			'Runtime translation registry backed by signals with config-based language bootstrapping.',
		summary:
			'TranslateService is the library’s runtime i18n layer. It exposes a signal per source text, supports per-language loading (inline or file-based), updates the UI reactively, and optionally persists the selected language.',
		highlights: [
			'translate(text) lazily creates a signal that falls back to the source text.',
			'setMany() resets missing translations back to source text and updates the provided ones.',
			'setLanguage() lazy-loads and applies a language without stale cross-language state.',
		],
		config: [
			'Register translation bootstrap with provideTranslate({ language, defaultLanguage, translations?, folder? }).',
			'With folder mode, language files are loaded as /i18n/{lang}.json by default.',
			'Language persistence uses StoreService under the translate.language key when enabled.',
			'This service manages runtime translation state; the translate pipe and directive build on top of it.',
		],
		methods: [
			{
				name: 'translate',
				signature: 'translate(text: string): WritableSignal<string>',
				description:
					'Returns the translation signal for a source text, creating it lazily if needed.',
			},
			{
				name: 'setLanguage',
				signature: 'setLanguage(language: string): Promise<void>',
				description:
					'Switches current language, lazy-loads the translation payload, and applies it reactively.',
			},
			{
				name: 'loadTranslations',
				signature: 'loadTranslations(language: string): Promise<Translate[]>',
				description:
					'Loads translation payload for a language from inline config or JSON file loader and caches it per language.',
			},
			{
				name: 'setMany',
				signature: 'setMany(translations: Translate[]): void',
				description: 'Bulk-replaces translations for the current language.',
				details: [
					'Existing signals not present in the new set reset to their original source text.',
					'Provided translations update their matching signals.',
				],
			},
			{
				name: 'setOne',
				signature: 'setOne(translation: Translate): void',
				description: 'Updates one translation entry and persists the new state.',
			},
			{
				name: 'get',
				signature: 'get(): Translates',
				description: 'Returns the internal sourceText -> WritableSignal<string> registry.',
			},
		],
		sections: [
			{
				title: 'Bootstrap behavior',
				items: [
					'Initial language resolves from language ?? stored language (optional) ?? defaultLanguage.',
					'If inline translations exist for a language they are used directly; otherwise the file loader is used.',
					'Missing language files fail safely and translations fall back to source text.',
					'Signals are created lazily; there is no need to pre-register every possible text.',
				],
			},
		],
		code: `import { TranslateService } from 'wacom';

private readonly t = inject(TranslateService);

title = this.t.translate('Create project');

switchLanguage() {
	void this.t.setLanguage('es');
}`,
	},
];

export const serviceDocMap = new Map(serviceDocs.map(doc => [doc.slug, doc]));
