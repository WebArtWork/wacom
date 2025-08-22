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
	/**
	 * Creates a new alert service.
	 *
	 * @param config Optional global configuration provided via the
	 * `CONFIG_TOKEN` injection token.
	 * @param _dom Service responsible for DOM manipulation and dynamic
	 * component creation.
	 */
	constructor(
		@Inject(CONFIG_TOKEN) @Optional() config: Config,
		private _dom: DomService
	) {
		this._config = {
			...DEFAULT_ALERT_CONFIG,
			...(config?.alert || {}),
		};

		this._container = this._dom.appendComponent(WrapperComponent)!;
	}

	/**
	 * Displays an alert. Accepts either an options object or a simple string
	 * which will be used as the alert text.
	 *
	 * @returns Reference to the created alert or embedded component
	 *          element.
	 */
	show(opts: Alert | string) {
		if (typeof opts === 'string') {
			opts = {
				...this._config,
				text: opts,
			};
		} else {
			opts = {
				...this._config,
				...opts,
			};
		}

		if (!opts.type) opts.type = 'info';

		if (!opts.position) opts.position = 'bottomRight';

		let alertComponent: DomComponent<AlertComponent> | undefined;

		let content: DomComponent<any> | undefined;

		opts.close = () => {
			content?.remove();

			alertComponent?.remove();

			content = undefined;

			alertComponent = undefined;

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

	/**
	 * Convenience alias for `show`.
	 */
	open(opts: Alert) {
		this.show(opts);
	}

	/**
	 * Displays an informational alert.
	 */
	info(opts: Alert) {
		opts.type = 'info';

		this.show(opts);
	}

	/**
	 * Displays a success alert.
	 */
	success(opts: Alert) {
		opts.type = 'success';

		this.show(opts);
	}

	/**
	 * Displays a warning alert.
	 */
	warning(opts: Alert) {
		opts.type = 'warning';

		this.show(opts);
	}

	/**
	 * Displays an error alert.
	 */
	error(opts: Alert) {
		opts.type = 'error';

		this.show(opts);
	}

	/**
	 * Displays a question alert.
	 */
	question(opts: Alert) {
		opts.type = 'question';

		this.show(opts);
	}

	/**
	 * Removes all alert elements from the document.
	 */
	destroy() {
		for (const id of ALERT_POSITIONS) {
			const el = document.getElementById(id);

			if (el) el.innerHTML = '';
		}
	}

	/** Merged configuration applied to new alerts. */
	private _config: AlertConfig;

	/** Wrapper component that contains all alert placeholders. */
	private _container: DomComponent<WrapperComponent>;

	/** References to alerts that must remain unique by identifier. */
	private _uniques: Record<string, DomComponent<any>> = {};

	/** Mapping of alert positions to wrapper child indexes. */
	private _positionNumber: any = {
		topLeft: 0,
		top: 1,
		topRight: 2,
		left: 3,
		center: 4,
		right: 5,
		bottomLeft: 6,
		bottom: 7,
		bottomRight: 8,
	};
}
