import { Inject, Injectable, Optional } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {
	CONFIG_TOKEN,
	Config,
	DEFAULT_CONFIG,
} from '../interfaces/config.interface';
import { MetaService } from '../services/meta.service';

@Injectable({ providedIn: 'root' })
export class MetaGuard {
	public static IDENTIFIER = 'MetaGuard';
	private _meta: any;
	public constructor(
		private metaService: MetaService,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config
	) {
		this._meta = config.meta;
		if (!this.config) this.config = DEFAULT_CONFIG;
	}
	public canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot
	): boolean {
		this._processRouteMetaTags(route.data && route.data['meta']);
		return true;
	}
	private _processRouteMetaTags(meta: any = {}) {
		if (meta.disableUpdate) {
			return;
		}
		if (meta.title) {
			this.metaService.setTitle(meta.title, meta.titleSuffix);
		}
		if (Array.isArray(meta.links)) {
			this.metaService.setLink(meta.links);
		} else if (typeof meta.links === 'string') {
			this.metaService.setLink(meta.links.split(' '));
		}
		if (Array.isArray(this._meta.defaults?.links)) {
			this.metaService.setLink(this._meta.defaults?.links);
		} else if (typeof this._meta.defaults?.links === 'string') {
			this.metaService.setLink(this._meta.defaults?.links.split(' '));
		}
		Object.keys(meta).forEach((prop) => {
			if (
				prop === 'title' ||
				prop === 'titleSuffix' ||
				prop === 'links'
			) {
				return;
			}
			Object.keys(meta[prop]).forEach((key) => {
				this.metaService.setTag(key, meta[prop][key], prop);
			});
		});
		Object.keys(this._meta.defaults).forEach((key) => {
			if (
				key in meta ||
				key === 'title' ||
				key === 'titleSuffix' ||
				key === 'links'
			) {
				return;
			}
			this.metaService.setTag(key, this._meta.defaults[key]);
		});
	}
}
