import { NgModule } from '@angular/core';
import { ModalComponent } from './components/modal/modal.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { PopupComponent } from './components/popup/popup.component';
import { PopComponent } from './components/pop/pop.component';
import { CommonModule } from '@angular/common'; 
import { ClickOutsideModule } from 'ng-click-outside';
import { SearchPipe } from './pipes/search.pipe';
@NgModule({
  imports: [ 
  	CommonModule,
    ClickOutsideModule
  ],
  declarations: [
  	ModalComponent,
    SpinnerComponent,
    PopupComponent,
    SearchPipe,
    PopComponent
  ],
  exports: [
  	ModalComponent,
    SpinnerComponent,
    PopupComponent,
    PopComponent
  ],
  entryComponents:[
    ModalComponent,
    SpinnerComponent,
    PopupComponent,
    PopComponent
  ]
})
export class WacomModule { }
