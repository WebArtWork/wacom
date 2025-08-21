import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [CommonModule, RouterOutlet, RouterLink],
})
export class AppComponent {
	router = inject(Router);
}
