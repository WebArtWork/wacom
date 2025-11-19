
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { EmitterService } from 'projects/wacom/src/services/emitter.service';
import { AppCrudService } from './app-crud.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [RouterOutlet, RouterLink],
})
export class AppComponent {
	router = inject(Router);

	private _appCrudService = inject(AppCrudService);

	private _emitterService = inject(EmitterService);

	constructor() {
		this._emitterService
			.onComplete('task')
			.subscribe((v) => console.log('first:', v));

		this._emitterService.complete('task', 123);

		this._emitterService.complete('task', 456);

		setTimeout(() => {
			this._emitterService
				.onComplete('task')
				.subscribe((v) => console.log('second:', v));
		}, 5000);
	}
}
