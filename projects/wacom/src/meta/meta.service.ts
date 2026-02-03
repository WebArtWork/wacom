import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Optional, PLATFORM_ID, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import {
	CONFIG_TOKEN,
	Config,
	DEFAULT_CONFIG,
} from '../interfaces/config.interface';
import { isDefined } from './meta.const';
import { MetaConfig, MetaDefaults, MetaPage } from './meta.interface';
import { TagAttr } from './meta.type';

/**
 * Centralized page meta management for SPA navigation.
 *
 * Goals:
 * - Static SEO pages: route-driven meta via `data.meta`
 * - Dynamic/id pages: manual meta via `applyMeta(...)`
 * - No stale meta: tags set for one page must not "leak" to another page
 * - Simple inputs: only title/description/image/index/robots (everything else auto-generated)
 * - Links handled separately: `setLink({ canonical: '...' })` updates, never duplicates
 *
 * Generated tags:
 * - Title:
 *   - <title>
 *   - <meta itemprop="name" ...>
 *   - <meta property="og:title" ...>
 *   - <meta name="twitter:title" ...>
 * - Description:
 *   - <meta name="description" ...>
 *   - <meta itemprop="description" ...>
 *   - <meta property="og:description" ...>
 *   - <meta name="twitter:description" ...>
 * - Image:
 *   - <meta itemprop="image" ...>
 *   - <meta property="og:image" ...>
 *   - <meta name="twitter:image:src" ...>
 * - Robots:
 *   - <meta name="robots" ...> (derived from `robots` or `index`)
 */
@Injectable({ providedIn: 'root' })
export class MetaService {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	/**
	 * Effective configuration (from CONFIG_TOKEN + DEFAULT_CONFIG fallback).
	 */
	private _metaConfig: MetaConfig;

	/**
	 * Meta tags that are "owned" by this service.
	 * We remove these on every `applyMeta()` so stale tags never survive SPA navigation.
	 *
	 * Stored as selectors compatible with Angular Meta.removeTag(), e.g.:
	 * - name="description"
	 * - property="og:title"
	 * - itemprop="image"
	 */
	private _managedTagSelectors = new Set<string>();

	/**
	 * Link rels that are managed by this service.
	 * Used to update links without duplicates and optionally remove them via resetLinks().
	 */
	private _managedLinkRels = new Set<string>();

	constructor(
		@Inject(CONFIG_TOKEN) @Optional() private _config: Config,
		private _router: Router,
		private _activatedRoute: ActivatedRoute,
		private _meta: Meta,
		private _titleService: Title,
	) {
		this._config = this._config || DEFAULT_CONFIG;
		this._metaConfig = this._config.meta || {};

		// Recommended default: keep meta in sync with route changes automatically.
		const applyFromRoutes =
			!isDefined(this._metaConfig.applyFromRoutes) ||
			!!this._metaConfig.applyFromRoutes;

		if (applyFromRoutes) {
			this._router.events
				.pipe(filter((e) => e instanceof NavigationEnd))
				.subscribe(() => {
					const page = this._readDeepestRouteMeta();
					if (page) this.applyMeta(page);
					else this.reset();
				});
		}
	}

	/**
	 * Merge and set defaults.
	 *
	 * Defaults are used when a page does not provide a given field.
	 * This affects:
	 * - applyMeta() fallbacks
	 * - reset()
	 */
	setDefaults(defaults: MetaDefaults): void {
		this._metaConfig.defaults = {
			...(this._metaConfig.defaults || {}),
			...defaults,
		};
	}

	/**
	 * Apply metadata for the current page.
	 *
	 * Use cases:
	 * - Static SEO pages: route data (`data.meta`) when applyFromRoutes = true
	 * - Dynamic / id pages: call manually after loading entity data
	 *
	 * Rules:
	 * 1) remove tags previously managed by this service
	 * 2) start from defaults
	 * 3) override with page values
	 * 4) generate OG/Twitter/itemprop variants
	 */
	applyMeta(page: MetaPage = {}): void {
		if (page.disableUpdate) return;

		// 1) Clean managed tags to prevent leaks between pages.
		this._removeManagedTags();

		// 2) Resolve values with defaults.
		const defaults = this._metaConfig.defaults || {};

		const title = this._resolveTitle(page, defaults);
		const description = this._resolveValue(
			page.description,
			defaults.description,
		);
		const image = this._resolveValue(page.image, defaults.image);
		const robots = this._resolveRobots(page, defaults);

		// 3) Apply generated tags.
		this._setTitleTriplet(title);
		this._setDescriptionTriplet(description);
		this._setImageTriplet(image);

		// 4) Robots support (index/noindex).
		if (isDefined(robots)) {
			this._updateTag('robots', robots as string, 'name');
		}

		// Links are intentionally not applied here.
		// Canonical strategy depends on your routing/domain policy, so use setLink(...) explicitly.
	}

	/**
	 * Reset page meta back to defaults.
	 *
	 * Removes all managed tags and re-applies defaults-only meta.
	 */
	reset(): void {
		this.applyMeta({});
	}

	/**
	 * Sets link tags (canonical, alternate, etc.) without duplicates.
	 *
	 * For each rel:
	 * - if link[rel=rel] exists -> update href
	 * - else -> create it
	 * - if duplicates exist -> remove extras
	 */
	setLink(links: Record<string, string>): void {
		if (!this._isBrowser) return;
		if (!links || !Object.keys(links).length) return;

		for (const rel of Object.keys(links)) {
			const href = links[rel];

			const all = Array.from(
				this._doc.head.querySelectorAll<HTMLLinkElement>(
					`link[rel="${rel}"]`,
				),
			);

			let link = all[0];
			if (!link) {
				link = this._doc.createElement('link');
				link.setAttribute('rel', rel);
				this._doc.head.appendChild(link);
			} else if (all.length > 1) {
				for (let i = 1; i < all.length; i++) all[i].remove();
			}

			link.setAttribute('href', href);
			this._managedLinkRels.add(rel);
		}
	}

	/**
	 * Removes link tags that were managed by this service via setLink().
	 *
	 * Note:
	 * - Not called by reset() because canonical often should persist for the whole app shell.
	 * - Call explicitly if you want to remove canonical/alternate links.
	 */
	resetLinks(): void {
		if (!this._isBrowser) return;
		for (const rel of this._managedLinkRels) {
			const all = Array.from(
				this._doc.head.querySelectorAll<HTMLLinkElement>(
					`link[rel="${rel}"]`,
				),
			);
			all.forEach((it) => it.remove());
		}
		this._managedLinkRels.clear();
	}

	// ---------------------------------------------------------------------------
	// Internals: route meta extraction
	// ---------------------------------------------------------------------------

	/**
	 * Reads `data.meta` from the deepest activated route.
	 * This matches the common Angular pattern where child routes override parent routes.
	 */
	private _readDeepestRouteMeta(): MetaPage | null {
		let route: ActivatedRoute | null = this._activatedRoute;

		while (route?.firstChild) route = route.firstChild;

		const data: any = route?.snapshot?.data;
		const meta = data && data['meta'];

		return meta || null;
	}

	// ---------------------------------------------------------------------------
	// Internals: resolving values
	// ---------------------------------------------------------------------------

	/**
	 * Resolves title with optional suffix behavior.
	 */
	private _resolveTitle(page: MetaPage, defaults: MetaDefaults): string {
		let titleContent = this._resolveValue(page.title, defaults.title) || '';

		if (this._metaConfig.useTitleSuffix) {
			const suffix = isDefined(page.titleSuffix)
				? page.titleSuffix
				: defaults.titleSuffix;
			titleContent += suffix || '';
		}

		return titleContent;
	}

	/**
	 * Resolves robots value.
	 *
	 * Precedence:
	 * - explicit robots (page) > explicit robots (defaults)
	 * - index flag (page/defaults) -> generates "index, follow" or "noindex, follow"
	 * - undefined -> no robots tag set by this service
	 */
	private _resolveRobots(
		page: MetaPage,
		defaults: MetaDefaults,
	): string | undefined {
		if (isDefined(page.robots)) return (page.robots || '') + '';
		if (isDefined(defaults.robots)) return (defaults.robots || '') + '';

		const index = isDefined(page.index) ? page.index : defaults.index;
		if (!isDefined(index)) return undefined;

		return index ? 'index, follow' : 'noindex, follow';
	}

	/**
	 * Resolves value with "undefined means missing" semantics.
	 * - undefined -> fallback
	 * - empty string -> explicit empty
	 */
	private _resolveValue(val?: string, fallback?: string): string | undefined {
		if (isDefined(val)) return (val || '') + '';
		if (isDefined(fallback)) return (fallback || '') + '';
		return undefined;
	}

	// ---------------------------------------------------------------------------
	// Internals: generated tag groups
	// ---------------------------------------------------------------------------

	/**
	 * Applies title to:
	 * - document <title>
	 * - itemprop="name"
	 * - og:title
	 * - twitter:title
	 */
	private _setTitleTriplet(title: string): void {
		this._titleService.setTitle(title);

		this._updateTag('og:title', title, 'property');
		this._updateTag('twitter:title', title, 'name');
		this._updateTag('name', title, 'itemprop');
	}

	/**
	 * Applies description to:
	 * - name="description"
	 * - itemprop="description"
	 * - og:description
	 * - twitter:description
	 */
	private _setDescriptionTriplet(description?: string): void {
		if (!isDefined(description)) return;

		const content = description as string;

		this._updateTag('description', content, 'name');
		this._updateTag('og:description', content, 'property');
		this._updateTag('twitter:description', content, 'name');
		this._updateTag('description', content, 'itemprop');
	}

	/**
	 * Applies image to:
	 * - itemprop="image"
	 * - og:image
	 * - twitter:image:src
	 */
	private _setImageTriplet(image?: string): void {
		if (!isDefined(image)) return;

		const content = image as string;

		this._updateTag('og:image', content, 'property');
		this._updateTag('twitter:image:src', content, 'name');
		this._updateTag('image', content, 'itemprop');
	}

	// ---------------------------------------------------------------------------
	// Internals: tag update + ownership tracking
	// ---------------------------------------------------------------------------

	/**
	 * Update a meta tag with deterministic selector.
	 *
	 * Why selector:
	 * - prevents duplicates
	 * - ensures updates target the correct attribute variant (name/property/itemprop)
	 *
	 * Ownership tracking:
	 * - Every selector we touch is remembered in managedTagSelectors.
	 * - On next apply/reset we remove them to avoid stale meta across pages.
	 */
	private _updateTag(key: string, content: string, attr: TagAttr): void {
		const selector =
			attr === 'itemprop' ? `itemprop="${key}"` : `${attr}="${key}"`;

		const tagDef =
			attr === 'itemprop'
				? ({ itemprop: key, content } as any)
				: ({ [attr]: key, content } as any);

		this._meta.updateTag(tagDef, selector);
		this._managedTagSelectors.add(selector);
	}

	/**
	 * Remove all meta tags managed by this service.
	 * Called on each apply/reset to prevent tags from a previous page persisting.
	 */
	private _removeManagedTags(): void {
		for (const selector of this._managedTagSelectors) {
			this._meta.removeTag(selector);
		}
		this._managedTagSelectors.clear();
	}

	private _doc = inject(DOCUMENT);
}
