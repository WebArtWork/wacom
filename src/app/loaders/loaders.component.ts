import { Component, DestroyRef, inject, signal } from '@angular/core';
import { LoaderService } from 'projects/wacom/public-api';

@Component({
	templateUrl: './loaders.component.html',
})
export class LoadersComponent {
	constructor() {
		// dummy example
		this._loaderService.show();

		// static example, which close after timeout
		this._loaderService.show({
			text: 'Loading based on progress and timeout, 50 seconds',
			progress: true,
			timeout: 50000,
		});

		// flexible example, which developer handle
		const progressPercentage = signal(0);

		const loader = this._loaderService.show({
			text: 'Loading based on progressPercentage signal',
			progressPercentage,
		});

		const intervalId = setInterval(() => {
			const perc = progressPercentage();

			if (perc >= 100) {
				clearInterval(intervalId);

				loader.close?.();
			} else {
				progressPercentage.set(perc + 5);
			}
		}, 500);

		this._destroyRef.onDestroy(() => {
			this._loaderService.destroy();
		});
	}

	private _destroyRef = inject(DestroyRef);

	private _loaderService = inject(LoaderService);
}
