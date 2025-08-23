import { Inject, Injectable, Optional } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Route, Router } from '@angular/router';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config.interface';
import { MetaConfig, MetaDefaults } from '../interfaces/meta.interface';

const isDefined = (val: any) => typeof val !== 'undefined';

@Injectable({
	providedIn: 'root',
})
export class MetaService {
	private _meta: MetaConfig;

	constructor(
		@Inject(CONFIG_TOKEN) @Optional() private config: Config,
		private router: Router,
		private meta: Meta,
		private titleService: Title,
	) {
		this.config = this.config || DEFAULT_CONFIG;

		this._meta = this.config.meta || {};

		this._warnMissingGuard();
	}

	/**
	 * Sets the default meta tags.
	 *
	 * @param defaults - The default meta tags.
	 */
	setDefaults(defaults: MetaDefaults) {
		this._meta.defaults = {
			...this._meta.defaults,
			...defaults,
		};
	}

	/**
	 * Sets the title and optional title suffix.
	 *
	 * @param title - The title to set.
	 * @param titleSuffix - The title suffix to append.
	 * @returns The MetaService instance.
	 */
	setTitle(title?: string, titleSuffix?: string): MetaService {
		let titleContent = isDefined(title) ? title || '' : this._meta.defaults?.['title'] || '';

		if (this._meta.useTitleSuffix) {
			titleContent += isDefined(titleSuffix) ? titleSuffix : this._meta.defaults?.['titleSuffix'] || '';
		}

		this._updateMetaTag('title', titleContent);

		this._updateMetaTag('og:title', titleContent);

		this._updateMetaTag('twitter:title', titleContent);

		this.titleService.setTitle(titleContent);

		return this;
	}

	/**
	 * Sets link tags.
	 *
	 * @param links - The links to set.
	 * @returns The MetaService instance.
	 */
	setLink(links: { [key: string]: string }): MetaService {
		Object.keys(links).forEach((rel) => {
			let link: HTMLLinkElement = document.createElement('link');

			link.setAttribute('rel', rel);

			link.setAttribute('href', links[rel]);

			document.head.appendChild(link);
		});

		return this;
	}

	/**
	 * Sets a meta tag.
	 *
	 * @param tag - The meta tag name.
	 * @param value - The meta tag value.
	 * @param prop - The meta tag property.
	 */
	setTag(tag: string, value: string, prop?: string) {
		if (tag === 'title' || tag === 'titleSuffix') {
			throw new Error(
				`Attempt to set ${tag} through 'setTag': 'title' and 'titleSuffix' are reserved. Use 'MetaService.setTitle' instead.`,
			);
		}

		const content = (isDefined(value) ? value || '' : this._meta.defaults?.[tag] || '') + '';

		this._updateMetaTag(tag, content, prop);

		if (tag === 'description') {
			this._updateMetaTag('og:description', content, prop);

			this._updateMetaTag('twitter:description', content, prop);
		}
	}

	/**
	 * Updates a meta tag.
	 *
	 * @param tag - The meta tag name.
	 * @param value - The meta tag value.
	 * @param prop - The meta tag property.
	 */
	private _updateMetaTag(tag: string, value: string, prop?: string): void {
		prop = prop || (tag.startsWith('og:') || tag.startsWith('twitter:') ? 'property' : 'name');

		this.meta.updateTag({ [prop]: tag, content: value });
	}

	/**
	 * Removes a meta tag.
	 *
	 * @param tag - The meta tag name.
	 * @param prop - The meta tag property.
	 */
	removeTag(tag: string, prop?: string): void {
		prop = prop || (tag.startsWith('og:') || tag.startsWith('twitter:') ? 'property' : 'name');

		this.meta.removeTag(`${prop}="${tag}"`);
	}

	/**
	 * Warns about missing meta guards in routes.
	 */
	private _warnMissingGuard(): void {
		if (isDefined(this._meta.warnMissingGuard) && !this._meta.warnMissingGuard) {
			return;
		}

		const hasDefaultMeta = !!Object.keys(this._meta.defaults ?? {}).length;

		const hasMetaGuardInArr = (it: any) => it && it.IDENTIFIER === 'MetaGuard';

		let hasShownWarnings = false;

		const checkRoute = (route: Route) => {
			const hasRouteMeta = route.data && route.data['meta'];

			const showWarning =
				!isDefined(route.redirectTo) && (hasDefaultMeta || hasRouteMeta) && !(route.canActivate || []).some(hasMetaGuardInArr);

			if (showWarning) {
				console.warn(
					`Route with path "${route.path}" has ${
						hasRouteMeta ? '' : 'default '
					}meta tags, but does not use MetaGuard. Please add MetaGuard to the canActivate array in your route configuration`,
				);
				hasShownWarnings = true;
			}

			(route.children || []).forEach(checkRoute);
		};

		this.router.config.forEach(checkRoute);

		if (hasShownWarnings) {
			console.warn(
				`To disable these warnings, set metaConfig.warnMissingGuard: false in your MetaConfig passed to MetaModule.forRoot()`,
			);
		}
	}
}
