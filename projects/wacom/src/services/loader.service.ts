import { Inject, Injectable, Optional } from '@angular/core';
import { LoaderComponent } from '../components/loader/loader.component';
import { CONFIG_TOKEN, Config } from '../interfaces/config.interface';
import { DomComponent } from '../interfaces/dom.interface';
import {
	DEFAULT_LOADER_CONFIG,
	Loader,
	LoaderConfig,
} from '../interfaces/loader.interface';
import { DomService } from './dom.service';

@Injectable({
	providedIn: 'root',
})
export class LoaderService {
	constructor(
		@Inject(CONFIG_TOKEN) @Optional() config: Config,
		private _dom: DomService,
	) {
		this._config = {
			...DEFAULT_LOADER_CONFIG,
			...(config?.loader || {}),
		};
	}

	show(opts: Loader | string = 'Loading...'): Loader {
		opts = {
			...this._config,
			...(typeof opts === 'object' ? opts : { text: opts }),
		};

		if (
			opts.unique &&
			this._loaders.find((m) => m.unique === opts.unique)
		) {
			return this._loaders.find(
				(m) => m.unique === opts.unique,
			) as Loader;
		}

		this._loaders.push(opts);

		let component!: DomComponent<LoaderComponent> | undefined;

		opts.close = () => {
			component?.remove();

			component = undefined;

			if (typeof opts.onClose === 'function') opts.onClose();

			this._loaders.splice(
				this._loaders.findIndex((m) => m.id === opts.id),
				1,
			);
		};

		if (opts.append) {
			component = this._dom.appendComponent(
				LoaderComponent,
				opts,
				opts.append,
			)!;
		} else {
			component = this._dom.appendComponent(LoaderComponent, opts)!;
		}

		if (opts.unique) {
			if (this._uniques[opts.unique]) this._uniques[opts.unique].remove();

			this._uniques[opts.unique] = component;
		}

		this._loaders.push(opts);

		return opts;
	}

	destroy() {
		for (let i = this._loaders.length - 1; i >= 0; i--) {
			this._loaders[i].close?.();
		}
	}

	/** Merged configuration applied to new alerts. */
	private _config: LoaderConfig;

	/** References to alerts that must remain unique by identifier. */
	private _uniques: Record<string, DomComponent<any>> = {};

	private _loaders: Loader[] = [];
}
