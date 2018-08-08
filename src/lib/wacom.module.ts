import { NgModule } from '@angular/core';
import { WacomComponent } from './wacom.component';
import { HttpClientModule } from '@angular/common/http';
@NgModule({
  imports: [
    HttpClientModule
  ],
  declarations: [WacomComponent],
  exports: [WacomComponent]
})
export class WacomModule { }
