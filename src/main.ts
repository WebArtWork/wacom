import {
	importProvidersFrom,
	provideZonelessChangeDetection,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';

import { provideWacom } from 'projects/wacom/src/public-api';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
	providers: [
		importProvidersFrom(BrowserModule, FormsModule),
		provideWacom({}),
		provideZonelessChangeDetection(),
	],
}).catch((err) => console.error(err));
