import {
	importProvidersFrom,
	provideZonelessChangeDetection,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';

import { provideRouter } from '@angular/router';
import { provideWacom } from 'projects/wacom/src/public-api';
import { AlertsComponent } from './app/alerts/alerts.component';
import { AppComponent } from './app/app.component';
import { MenuComponent } from './app/menu/menu.component';

bootstrapApplication(AppComponent, {
	providers: [
		importProvidersFrom(BrowserModule, FormsModule),
		provideZonelessChangeDetection(),
		provideWacom({}),
		provideRouter([
			{
				path: '',
				component: MenuComponent,
			},
			{
				path: 'alerts',
				component: AlertsComponent,
			},
		]),
	],
}).catch((err) => console.error(err));
