import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { WacomModule } from 'wacom';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    WacomModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
