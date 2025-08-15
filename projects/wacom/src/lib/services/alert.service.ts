import { ComponentRef, Inject, Injectable, Optional } from '@angular/core';
import { AlertComponent } from '../components/alert/alert.component';
import { WrapperComponent } from '../components/alert/wrapper/wrapper.component';
import { Alert, DEFAULT_Alert } from '../interfaces/alert.interface';
import {
	CONFIG_TOKEN,
	Config,
	DEFAULT_CONFIG,
} from '../interfaces/config.interface';
import { DomService } from './dom.service';

@Injectable({
	providedIn: 'root',
})
export class AlertService {
	private alert: any;
	private _container: {
		nativeElement: HTMLElement;
		componentRef: ComponentRef<WrapperComponent>;
	};
	constructor(
		private dom: DomService,
		@Inject(CONFIG_TOKEN) @Optional() private config: Config
	) {
		if (!this.config) this.config = DEFAULT_CONFIG;
		this.alert = this.config.alert;
		if (!this.alert) {
			this.alert = DEFAULT_Alert;
		} else {
			for (let each in DEFAULT_Alert) {
				if (this.alert[each]) continue;
				this.alert[each] = DEFAULT_Alert[each];
			}
		}
		this._container = this.dom.appendComponent(WrapperComponent)!;
	}
	private uniques: any = {};
	private shortcuts: any = {
		tl: 'topLeft',
		tc: 'topCenter',
		tr: 'topRight',
		r: 'right',
		br: 'bottomRight',
		bc: 'bottomCenter',
		bl: 'bottomLeft',
		l: 'left',
		c: 'center',
	};
	private positionNumber: any = {
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

	show(opts: any | Alert) {
		if (typeof opts === 'string') {
			opts = {
				text: opts,
			};
		}
		if (!opts) opts = {};
		if (!opts['type']) opts['type'] = 'info';
		for (let each in this.alert) {
			if (each == 'class')
				opts[each] = opts[each] + ' ' + this.alert[each];
			else if (typeof opts[each] == 'undefined')
				opts[each] = this.alert[each];
		}
		if (this.shortcuts[opts.position])
			opts.position = this.shortcuts[opts.position];
		if (!opts.position) opts.position = 'bottomRight';
		let content: {
			nativeElement: HTMLElement;
			componentRef: ComponentRef<any>;
		};
		opts.close = () => {
			if (content) content.componentRef.destroy();
			opts.component.nativeElement.remove();
			if (typeof (opts as Alert).onClose == 'function')
				(opts as Alert).onClose();
		};
		// let component = this.dom.appendById(AlertComponent, opts, opts.position);
		let customElement = false;

		if (
			typeof opts.component == 'string' &&
			this.alert.alerts[opts.component]
		) {
			opts.component = this.alert.alerts[opts.component];
			customElement = true;
		} else {
			opts.component = this.dom.appendById(
				AlertComponent,
				opts,
				opts.position
			);
		}

		if (typeof opts.component === 'function') {
			content = this.dom.appendComponent(
				opts.component,
				opts,
				this._container.nativeElement.children[0].children[
					this.positionNumber[opts.position] || 0
				] as HTMLElement
				// component.nativeElement.children[0].children[0].children[0] as HTMLElement
			)!;
		}

		if (opts.unique) {
			if (this.uniques[opts.unique]) this.uniques[opts.unique].remove();
			this.uniques[opts.unique] = opts.component.nativeElement;
		}

		if (typeof opts.timeout !== 'number') {
			opts.timeout = 2000;
		}

		if (opts.timeout) {
			setTimeout(() => {
				opts.close();
			}, opts.timeout);
		}

		return opts.component.nativeElement;
	}

	open(opts: Alert) {
		this.show(opts);
	}

	info(opts: Alert) {
		opts['type'] = 'info';
		this.show(opts);
	}

	success(opts: Alert) {
		opts['type'] = 'success';
		this.show(opts);
	}

	warning(opts: Alert) {
		opts['type'] = 'warning';
		this.show(opts);
	}

	error(opts: Alert) {
		opts['type'] = 'error';
		this.show(opts);
	}

	question(opts: Alert) {
		opts['type'] = 'question';
		this.show(opts);
	}

	destroy() {
		[
			'bottomRight',
			'bottomLeft',
			'bottomCenter',
			'topRight',
			'topLeft',
			'topCenter',
			'center',
		].forEach((id) => {
			const el = document.getElementById(id);

			if (el) el.innerHTML = '';
		});
	}
}
