import { Inject, Injectable, Optional } from '@angular/core';
import { AlertComponent } from '../components/alert/alert/alert.component';
import { WrapperComponent } from '../components/alert/wrapper/wrapper.component';
import { Alert, AlertConfig, DEFAULT_ALERT_CONFIG } from '../interfaces/alert.interface';
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
		private _dom: DomService,
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
	show(opts: Alert | string): Alert {
		opts = this._opts(opts);

		if (opts.unique && this._alerts.find((m) => m.unique === opts.unique)) {
			return this._alerts.find((m) => m.unique === opts.unique) as Alert;
		}

		this._alerts.push(opts);

		opts.id ||= Math.floor(Math.random() * Date.now()) + Date.now();

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

			this._alerts.splice(
				this._alerts.findIndex((m) => m.id === opts.id),
				1,
			);
		};

		alertComponent = this._dom.appendById(AlertComponent, opts, opts.position);

		if (typeof opts.component === 'function') {
			content = this._dom.appendComponent(
				opts.component,
				opts as Partial<{ providedIn?: string | undefined }>,
				this._container.nativeElement.children[0].children[this._positionNumber[opts.position] || 0] as HTMLElement,
			)!;
		}

		if (typeof opts.timeout !== 'number') {
			opts.timeout = 3000;
		}

		if (opts.timeout) {
			setTimeout(() => {
				opts.close?.();
			}, opts.timeout);
		}

		return opts;
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
		opts = this._opts(opts);

		opts.type = 'info';

		this.show(opts);
	}

	/**
	 * Displays a success alert.
	 */
	success(opts: Alert) {
		opts = this._opts(opts);

		opts.type = 'success';

		this.show(opts);
	}

	/**
	 * Displays a warning alert.
	 */
	warning(opts: Alert) {
		opts = this._opts(opts);

		opts.type = 'warning';

		this.show(opts);
	}

	/**
	 * Displays an error alert.
	 */
	error(opts: Alert) {
		opts = this._opts(opts);

		opts.type = 'error';

		this.show(opts);
	}

	/**
	 * Displays a question alert.
	 */
	question(opts: Alert) {
		opts = this._opts(opts);

		opts.type = 'question';

		this.show(opts);
	}

	/**
	 * Removes all alert elements from the document.
	 */
	destroy() {
		for (let i = this._alerts.length - 1; i >= 0; i--) {
			this._alerts[i].close?.();
		}
	}
	private _alerts: Alert[] = [];

	/** Merged configuration applied to new alerts. */
	private _config: AlertConfig;

	/** Wrapper component that contains all alert placeholders. */
	private _container: DomComponent<WrapperComponent>;

	/** Mapping of alert positions to wrapper child indexes. */
	private _positionNumber: Record<string, number> = {
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

	private _opts(opts: Alert | string): Alert {
		return typeof opts === 'string'
			? {
					...this._config,
					text: opts,
				}
			: {
					...this._config,
					...opts,
				};
	}
}
