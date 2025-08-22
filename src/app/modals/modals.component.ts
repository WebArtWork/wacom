import { Component, DestroyRef, inject } from '@angular/core';
import { ModalService } from 'projects/wacom/public-api';
import { SmallComponent } from './small/small.component';

@Component({
	templateUrl: './modals.component.html',
})
export class ModalsComponent {
	constructor() {
		this._modalService.show({
			component: SmallComponent,
		});

		this._destroyRef.onDestroy(() => {
			this._modalService.destroy();
		});
	}

	private _destroyRef = inject(DestroyRef);

	private _modalService = inject(ModalService);
}
