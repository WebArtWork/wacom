import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { WacomModule } from 'wacom';
import { LocalComponent } from './modals/local/local.component';
@NgModule({
	declarations: [
		AppComponent,
		LocalComponent
	],
	imports: [
		BrowserModule,
		WacomModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
