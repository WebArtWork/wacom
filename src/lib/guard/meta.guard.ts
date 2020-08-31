import { Injectable, Inject, Optional } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { MetaService } from '../services/meta.service';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';

@Injectable()
export class MetaGuard implements CanActivate {
	public static IDENTIFIER = 'MetaGuard';
	public constructor(private metaService: MetaService,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config) {
		if(!this.config) this.config = DEFAULT_CONFIG;
	}
	public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		this._processRouteMetaTags(route.data && route.data.meta);
		return true;
	}
	private _processRouteMetaTags(meta: any = {}) {
		if (meta.disableUpdate) {
			return;
		}
		this.metaService.setTitle(meta.title, meta.titleSuffix);
		Object.keys(meta).forEach(key => {
			if (key === 'title' || key === 'titleSuffix') {
				return;
			}
			this.metaService.setTag(key, meta[key]);
		});
		Object.keys(this.config.meta.defaults).forEach(key => {
			if (key in meta || key === 'title' || key === 'titleSuffix') {
				return;
			}
			this.metaService.setTag(key, this.config.meta.defaults[key]);
		});
	}
}