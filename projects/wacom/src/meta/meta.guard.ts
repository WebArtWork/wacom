import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { MetaPage } from './meta.interface';
import { MetaService } from './meta.service';

/**
 * Applies route-level metadata from `route.data.meta`.
 *
 * Usage:
 * - Add this guard to routes that define `data.meta` to ensure meta is applied
 *   as early as possible during activation.
 *
 * Note:
 * - If `MetaConfig.applyFromRoutes` is enabled (recommended), the service will
 *   also apply route meta automatically on NavigationEnd — even if this guard
 *   is missing from some route definitions.
 */
@Injectable({ providedIn: 'root' })
export class MetaGuard {
	constructor(private metaService: MetaService) {}

	canActivate(route: ActivatedRouteSnapshot): boolean {
		const pageMeta =
			(route.data && (route.data['meta'] as MetaPage)) || null;

		if (pageMeta) this.metaService.applyMeta(pageMeta);
		else this.metaService.reset();

		return true;
	}
}
