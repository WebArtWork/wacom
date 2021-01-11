/* modules */
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
/* pipes */
import { OtaPipe } from './pipes/ota.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { EachPipe } from './pipes/each.pipe';
import { MongodatePipe } from './pipes/mongodate.pipe';
/* config */
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from './interfaces/config';
/* components */
import { ModalComponent } from './components/modal/modal.component';
import { AlertComponent } from './components/alert/alert.component';
import { TableComponent } from './components/table/table.component';
import { LoaderComponent } from './components/loader/loader.component';
import { WrapperComponent } from './components/alert/wrapper/wrapper.component';
import { PickerComponent } from './components/picker/picker.component';
import { TextComponent } from './components/picker/text/text.component';
import { NumberComponent } from './components/picker/number/number.component';
import { DateComponent } from './components/picker/date/date.component';
import { TimeComponent } from './components/picker/time/time.component';
import { ColorComponent } from './components/picker/color/color.component';
import { HtmlComponent } from './components/picker/html/html.component';
import { FilesComponent } from './components/files/files.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { PickerSelectOptionsDirective } from './directives/picker.directive';
import { CellDirective, SortDirective} from './directives/table.directive';
import { CheckboxComponent } from './components/picker/checkbox/checkbox.component';
import { RadioComponent } from './components/picker/radio/radio.component';
import { SelectComponent } from './components/picker/select/select.component';
import { MetaGuard } from './guard/meta.guard';
import { MetaService } from './services/meta.service';
import { WframeComponent } from './components/wframe/wframe.component';
@NgModule({
	declarations: [
		OtaPipe,
		SafePipe,
		SearchPipe,
		EachPipe,
		AlertComponent,
		LoaderComponent,
		WrapperComponent,
		PickerComponent,
		TableComponent,
		TextComponent,
		NumberComponent,
		DateComponent,
		TimeComponent,
		ColorComponent,
		HtmlComponent,
		FilesComponent,
		ClickOutsideDirective,
		PickerSelectOptionsDirective,
		CellDirective,
		CheckboxComponent,
		RadioComponent,
		SelectComponent,
		ModalComponent,
		WframeComponent,
		MongodatePipe,
		SortDirective
	],
	exports: [
		OtaPipe,
		SafePipe,
		SearchPipe,
		EachPipe,
		MongodatePipe,
		AlertComponent,
		LoaderComponent,
		PickerComponent,
		TableComponent,
		ClickOutsideDirective,
		PickerSelectOptionsDirective,
		CellDirective,
		SortDirective
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