import { Injectable, Inject, Optional } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MetaService } from '../services/meta.service';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';

@Injectable()
export class MetaGuard  {
	public static IDENTIFIER = 'MetaGuard';
	private _meta: any ;
	public constructor(private metaService: MetaService,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config) {
		this._meta = config.meta;
		if(!this.config) this.config = DEFAULT_CONFIG;
	}
	public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		this._processRouteMetaTags(route.data && route.data['meta']);
		return true;
	}
	private _processRouteMetaTags(meta: any = {}) {
		if (meta.disableUpdate) {
			return;
		}
		this.metaService.setTitle(meta.title, meta.titleSuffix);
		this.metaService.setLink(meta.link);
		Object.keys(meta).forEach(prop => {
			if (prop === 'title' || prop === 'titleSuffix'|| prop === 'link') {
				return;
			}
			Object.keys(meta[prop]).forEach(key => {
				this.metaService.setTag(key, meta[prop][key], prop);
			});
		});
		Object.keys(this._meta.defaults).forEach(key => {
			if (key in meta || key === 'title' || key === 'titleSuffix' || key === 'link') {
				return;
			}
			this.metaService.setTag(key, this._meta.defaults[key]);
		});
	}
}
