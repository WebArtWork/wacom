import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [CommonModule, FormsModule, RouterOutlet, RouterLink],
})
export class AppComponent {
	router = inject(Router);
}
