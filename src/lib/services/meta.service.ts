import { Inject, Injectable, Optional } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
const isDefined = (val: any) => typeof val !== 'undefined';

@Injectable()
export class MetaService {
	public constructor(private router: Router, private meta: Meta,
		private titleService: Title, private activatedRoute: ActivatedRoute,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config) {
		if(!this.config) this.config = DEFAULT_CONFIG;
		this._warnMissingGuard();
	}
	public setTitle(title?: string, titleSuffix?: string): MetaService {
		let titleContent = isDefined(title) ? title : (this.config.meta.defaults['title'] || '');
		if (this.config.meta.useTitleSuffix) {
			titleContent += isDefined(titleSuffix) ? titleSuffix : (this.config.meta.defaults['titleSuffix'] || '');
		}
		this._updateMetaTag('title', titleContent);
		this._updateMetaTag('og:title', titleContent);
		this.titleService.setTitle(titleContent);
		return this;
	}
	public setTag(tag: string, value: string): MetaService {
		if (tag === 'title' || tag === 'titleSuffix') {
			throw new Error(`Attempt to set ${tag} through 'setTag': 'title' and 'titleSuffix' are reserved tag names.
				Please use 'MetaService.setTitle' instead`);
		}
		let content = isDefined(value) ? value : (this.config.meta.defaults[tag] || '');
		this._updateMetaTag(tag, content);
		if (tag === 'description') {
			this._updateMetaTag('og:description', content);
		}
		return this;
	}
	private _updateMetaTag(tag: string, value: string) {
		let prop = 'name';
		if (tag.startsWith(`og:`)) {
			prop = 'property';
		}

		this.meta.updateTag({
			[prop]: tag,
			content: value
		});
	}
	private _warnMissingGuard() {
		if (isDefined(this.config.meta.warnMissingGuard) && !this.config.meta.warnMissingGuard) {
			return;
		}
		const hasDefaultMeta = !!Object.keys(this.config.meta.defaults).length;
		const hasMetaGuardInArr = (it: any) => (it && it.IDENTIFIER === 'MetaGuard');
		let hasShownWarnings = false;
		this.router.config.forEach((route: Route) => {
			const hasRouteMeta = route.data && route.data.meta;
			const showWarning = !isDefined(route.redirectTo)
			&& (hasDefaultMeta || hasRouteMeta)
			&& !(route.canActivate || []).some(hasMetaGuardInArr);

			if (showWarning) {
				console.warn(`Route with path "${route.path}" has ${hasRouteMeta ? '' : 'default '}meta tags, but does not use MetaGuard. \
					Please add MetaGuard to the canActivate array in your route configuration`);
				hasShownWarnings = true;
			}
		});
		if (hasShownWarnings) {
			console.warn(`To disable these warnings, set metaConfig.warnMissingGuard: false \
				in your ng2-meta MetaConfig passed to MetaModule.forRoot()`);
		}
	}
}