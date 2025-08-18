import { Component, DestroyRef, inject } from '@angular/core';
import { LoaderService } from 'projects/wacom/src/public-api';

@Component({
	templateUrl: './loaders.component.html',
})
export class LoadersComponent {
	constructor() {
		this._loaderService.show();

		this._destroyRef.onDestroy(() => {
			this._loaderService.destroy();
		});
	}

	private _destroyRef = inject(DestroyRef);

	private _loaderService = inject(LoaderService);
}
