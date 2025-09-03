import {
	importProvidersFrom,
	provideZonelessChangeDetection,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';

import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideWacom } from 'projects/wacom/public-api';
import { AlertsComponent } from './app/alerts/alerts.component';
import { AppComponent } from './app/app.component';
import { LoadersComponent } from './app/loaders/loaders.component';
import { MenuComponent } from './app/menu/menu.component';
import { ModalsComponent } from './app/modals/modals.component';

bootstrapApplication(AppComponent, {
	providers: [
		importProvidersFrom(BrowserModule, FormsModule),
		provideZonelessChangeDetection(),
		provideHttpClient(),
		provideWacom(),
		provideRouter([
			{
				path: '',
				component: MenuComponent,
			},
			{
				path: 'alerts',
				component: AlertsComponent,
			},
			{
				path: 'modals',
				component: ModalsComponent,
			},
			{
				path: 'loaders',
				component: LoadersComponent,
			},
		]),
	],
}).catch((err) => console.error(err));
