import { Inject, Injectable, Optional } from '@angular/core';
import { AlertComponent } from '../components/alert/alert/alert.component';
import { WrapperComponent } from '../components/alert/wrapper/wrapper.component';
import {
	Alert,
	ALERT_POSITIONS,
	AlertConfig,
	DEFAULT_ALERT_CONFIG,
} from '../interfaces/alert.interface';
import { Config, CONFIG_TOKEN } from '../interfaces/config.interface';
import { DomComponent } from '../interfaces/dom.interface';
import { DomService } from './dom.service';

@Injectable({
	providedIn: 'root',
})
export class AlertService {
	constructor(
		@Inject(CONFIG_TOKEN) @Optional() private config: Config,
		private _dom: DomService
	) {
		this._config = {
			...DEFAULT_ALERT_CONFIG,
			...(this.config.alert || {}),
		};

		this._container = this._dom.appendComponent(WrapperComponent)!;
	}

	show(opts: Alert | string) {
		if (typeof opts === 'string') {
			opts = {
				...this._config,
				text: opts,
			};
		}

		if (!opts.type) opts.type = 'info';

		if (!opts.position) opts.position = 'bottomRight';

		let alertComponent: DomComponent<AlertComponent> | undefined;

		let content: DomComponent<any> | undefined;

		opts.close = () => {
			content?.remove();

			alertComponent?.remove();

			if (typeof (opts as Alert).onClose == 'function') {
				(opts as Alert).onClose?.();
			}
		};

		alertComponent = this._dom.appendById(
			AlertComponent,
			opts,
			opts.position
		);

		if (typeof opts.component === 'function') {
			content = this._dom.appendComponent(
				opts.component,
				opts,
				this._container.nativeElement.children[0].children[
					this._positionNumber[opts.position] || 0
				] as HTMLElement
			)!;
		}

		const main = content ? content! : alertComponent!;

		if (opts.unique) {
			if (this._uniques[opts.unique]) this._uniques[opts.unique].remove();

			this._uniques[opts.unique] = main;
		}

		if (typeof opts.timeout !== 'number') {
			opts.timeout = 3000;
		}

		if (opts.timeout) {
			setTimeout(() => {
				opts.close?.();
			}, opts.timeout);
		}

		return main.nativeElement;
	}

	open(opts: Alert) {
		this.show(opts);
	}

	info(opts: Alert) {
		opts.type = 'info';

		this.show(opts);
	}

	success(opts: Alert) {
		opts.type = 'success';

		this.show(opts);
	}

	warning(opts: Alert) {
		opts.type = 'warning';

		this.show(opts);
	}

	error(opts: Alert) {
		opts.type = 'error';

		this.show(opts);
	}

	question(opts: Alert) {
		opts.type = 'question';

		this.show(opts);
	}

	destroy() {
		for (const id of ALERT_POSITIONS) {
			const el = document.getElementById(id);

			if (el) el.innerHTML = '';
		}
	}

	private _config: AlertConfig;

	private _container: DomComponent<WrapperComponent>;

	private _uniques: Record<string, DomComponent<any>> = {};

	private _positionNumber: any = {
		topLeft: 3,
		topCenter: 4,
		topRight: 2,
		right: '',
		bottomRight: 0,
		bottomCenter: 5,
		bottomLeft: 1,
		left: '',
		center: 6,
	};
}
