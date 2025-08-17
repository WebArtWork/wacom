import { Inject, Injectable, Optional } from '@angular/core';
import { LoaderComponent } from '../components/loader/loader.component';
import { CONFIG_TOKEN, Config } from '../interfaces/config.interface';
import { DomComponent } from '../interfaces/dom.interface';
import { DomService } from './dom.service';

@Injectable({
	providedIn: 'root',
})
export class LoaderService {
	public loaders: Array<DomComponent<LoaderComponent>> = [];
	constructor(
		private dom: DomService,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config
	) {}
	show(
		opts: Partial<LoaderComponent> & {
			append?: HTMLElement;
			onClose?: () => void;
			close?: () => void;
		} = {}
	) {
		let component!: DomComponent<LoaderComponent>;
		opts.close = () => {
			component?.remove();
			if (typeof opts.onClose == 'function') opts.onClose();
		};
		if (opts.append) {
			component = this.dom.appendComponent(
				LoaderComponent,
				opts,
				opts.append
			)!;
		} else {
			component = this.dom.appendComponent(LoaderComponent, opts)!;
		}
		this.loaders.push(component);
		return component.nativeElement;
	}
	destroy() {
		for (let i = this.loaders.length - 1; i >= 0; i--) {
			this.loaders[i].remove();
			this.loaders.splice(i, 1);
		}
	}
}
