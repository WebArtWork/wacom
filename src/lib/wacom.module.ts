import { NgModule } from '@angular/core';
import { ModalComponent } from './components/modal/modal.component';
import { InputComponent } from './components/input/input.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { CommonModule } from '@angular/common'; 
@NgModule({
  imports: [ 
  	CommonModule 
  ],
  declarations: [
  	ModalComponent, 
  	InputComponent,
    SpinnerComponent
  ],
  exports: [
  	ModalComponent,
  	InputComponent,
    SpinnerComponent
  ],
  entryComponents:[
    ModalComponent,
    InputComponent,
    SpinnerComponent
  ]
})
export class WacomModule { }
