import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	effect,
	inject,
	PLATFORM_ID,
	signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { MetaService } from 'wacom';
import { serviceDocMap, type ServiceDoc, type ServiceMethodDoc } from '../../services/service-docs';

interface ServiceReferenceItem {
	id: string;
	name: string;
	group: string;
	category: string;
	signature: string;
	description: string;
	details: string[];
	example: string;
}

interface ServiceReferenceGroup {
	name: string;
	items: ServiceReferenceItem[];
}

@Component({
	imports: [RouterLink],
	templateUrl: './service-detail.component.html',
	styleUrl: './service-detail.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetailComponent {
	private readonly _route = inject(ActivatedRoute);
	private readonly _meta = inject(MetaService);
	private readonly _platformId = inject(PLATFORM_ID);
	private readonly _document = inject(DOCUMENT);

	protected readonly copied = signal(false);
	private readonly _slug = toSignal(
		this._route.paramMap.pipe(map(params => params.get('slug') || '')),
		{ initialValue: this._route.snapshot.paramMap.get('slug') || '' },
	);
	protected readonly doc = computed(() => serviceDocMap.get(this._slug()) || null);
	protected readonly items = computed(() => this._buildItems(this.doc()));
	protected readonly groups = computed(() => this._buildGroups(this.items()));

	constructor() {
		effect(() => {
			const doc = this.doc();

			if (!doc) {
				this._meta.applyMeta({
					title: 'Service not found',
					description: 'The requested service documentation page does not exist.',
				});
				return;
			}

			this._meta.applyMeta({
				title: doc.name,
				description: doc.description,
			});
		});
	}

	protected copyExample(example: string): void {
		if (!example || !isPlatformBrowser(this._platformId) || !navigator?.clipboard) {
			return;
		}

		navigator.clipboard.writeText(this.formatExample(example)).then(() => {
			this.copied.set(true);
			setTimeout(() => this.copied.set(false), 1500);
		});
	}

	protected scrollToItem(itemId: string): void {
		if (!isPlatformBrowser(this._platformId)) {
			return;
		}

		const element = this._document.getElementById(itemId);
		if (!element) {
			return;
		}

		element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		this._document.defaultView?.history?.replaceState(null, '', `#${itemId}`);
	}

	private _buildItems(doc: ServiceDoc | null): ServiceReferenceItem[] {
		if (!doc) {
			return [];
		}

		return [
			...(doc.properties || []).map(item => this._mapItem(item, 'Property', doc.code)),
			...doc.methods.map(item => this._mapItem(item, 'Method', doc.code)),
		];
	}

	private _mapItem(
		item: ServiceMethodDoc,
		group: string,
		fallbackExample: string,
	): ServiceReferenceItem {
		return {
			id: this._toId(item.name),
			name: item.name,
			group,
			category: item.category || group,
			signature: item.signature,
			description: item.description,
			details: item.details || [],
			example: this.formatExample(item.example || fallbackExample),
		};
	}

	private _buildGroups(items: ServiceReferenceItem[]): ServiceReferenceGroup[] {
		const groups = new Map<string, ServiceReferenceItem[]>();

		for (const item of items) {
			const bucket = groups.get(item.category) || [];
			bucket.push(item);
			groups.set(item.category, bucket);
		}

		return Array.from(groups.entries()).map(([name, groupedItems]) => ({
			name,
			items: groupedItems,
		}));
	}

	private _toId(value: string): string {
		return value
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	protected formatExample(example: string): string {
		return example.replace(/\t/g, '  ');
	}
}
