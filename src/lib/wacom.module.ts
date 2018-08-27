import { NgModule } from '@angular/core';
import { ModalComponent } from './components/modal/modal.component';
import { InputComponent } from './components/input/input.component';
import { CommonModule } from '@angular/common'; 
@NgModule({
  imports: [ 
  	CommonModule 
  ],
  declarations: [
  	ModalComponent, 
  	InputComponent
  ],
  exports: [
  	ModalComponent,
  	InputComponent
  ],
  entryComponents:[
    ModalComponent,
    InputComponent
  ]
})
export class WacomModule { }
