import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AlertService } from 'projects/wacom/src/public-api';
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [CommonModule, FormsModule],
})
export class AppComponent {
	private _alertService = inject(AlertService);

	constructor() {
		this._alertService.show({
			text: 'Hello World',
		});
	}
}
