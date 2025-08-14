import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
	providers: [importProvidersFrom(BrowserModule, FormsModule)],
}).catch((err) => console.error(err));
