import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { WacomModule } from 'wacom';

import { AppComponent } from './app/app.component';
import { TestalertComponent } from './app/testalert/testalert.component';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      WacomModule.forRoot({
        socket: false,
        alert: {
          alerts: { test: TestalertComponent }
        }
      })
    )
  ]
}).catch(err => console.error(err));

