import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AppCrudService } from './app-crud.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [CommonModule, RouterOutlet, RouterLink],
})
export class AppComponent {
	router = inject(Router);

	private _appCrudService = inject(AppCrudService);
}
