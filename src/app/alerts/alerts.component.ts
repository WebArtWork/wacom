import { Component, DestroyRef, inject } from '@angular/core';
import { AlertService } from 'projects/wacom/src/public-api';

@Component({
	selector: 'app-alerts',
	templateUrl: './alerts.component.html',
	styleUrl: './alerts.component.scss',
})
export class AlertsComponent {
	constructor() {
		this._alertService.show({
			text: 'Hello World',
			position: 'top',
			timeout: 0,
		});

		this._alertService.show({
			text: 'Hello World',
			position: 'center',
			timeout: 0,
		});

		this._alertService.show({
			text: 'Hello World',
			timeout: 0,
		});

		this._destroyRef.onDestroy(() => {
			this._alertService.destroy();
		});
	}

	private _destroyRef = inject(DestroyRef);

	private _alertService = inject(AlertService);
}
