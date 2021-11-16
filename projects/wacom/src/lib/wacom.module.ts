/* modules */
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
/* pipes */
import { OtaPipe } from './pipes/ota.pipe';
import { ArrPipe } from './pipes/arr.pipe';
import { SplicePipe } from './pipes/splice.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { EachPipe } from './pipes/each.pipe';
import { MongodatePipe } from './pipes/mongodate.pipe';
import { PaginationPipe } from './pipes/pagination.pipe';
/* config */
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from './interfaces/config';
/* components */
import { ModalComponent } from './components/modal/modal.component';
import { AlertComponent } from './components/alert/alert.component';
import { LoaderComponent } from './components/loader/loader.component';
import { WrapperComponent } from './components/alert/wrapper/wrapper.component';
import { FilesComponent } from './components/files/files.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { PickerSelectOptionsDirective } from './directives/picker.directive';
import { CellDirective, SortDirective, ActionsDirective, CustomEditDirective} from './directives/table.directive';
import { MetaGuard } from './guard/meta.guard';
import { MetaService } from './services/meta.service';
@NgModule({
	declarations: [
		OtaPipe,
		ArrPipe,
		SplicePipe,
		SafePipe,
		SearchPipe,
		EachPipe,
		AlertComponent,
		LoaderComponent,
		WrapperComponent,
		FilesComponent,
		ClickOutsideDirective,
		PickerSelectOptionsDirective,
		CellDirective,
		ModalComponent,
		SortDirective,
		ActionsDirective,
		CustomEditDirective,
		MongodatePipe,
		PaginationPipe,
	],
	exports: [
		OtaPipe,
		ArrPipe,
		SplicePipe,
		SafePipe,
		SearchPipe,
		EachPipe,
		MongodatePipe,
		PaginationPipe,
		AlertComponent,
		LoaderComponent,
		ClickOutsideDirective,
		PickerSelectOptionsDirective,
		CellDirective,
		SortDirective,
		CustomEditDirective,
		ActionsDirective,
	],
	entryComponents: [
		AlertComponent,
		LoaderComponent,
		ModalComponent,
		WrapperComponent,
		FilesComponent
	],
	providers: [
		{ provide: CONFIG_TOKEN, useValue: DEFAULT_CONFIG },
		MetaGuard,
		MetaService
	],
	imports: [CommonModule, FormsModule, HttpClientModule]
})
export class WacomModule {
	static forRoot(config: Config = DEFAULT_CONFIG): ModuleWithProviders<any> {
		return {
			ngModule: WacomModule,
			providers: [{
				provide: CONFIG_TOKEN,
				useValue: config
			}]
		}
	}
}
