/* modules */
import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
/* filters */
import { OtaPipe } from './filters/ota.pipe';
import { SafePipe } from './filters/safe.pipe';
import { SearchPipe } from './filters/search.pipe';
import { EachPipe } from './filters/each.pipe';
/* config */
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from './interfaces/config';
/* components */
import { AlertComponent } from './components/alert/alert.component';
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
@NgModule({
	declarations: [OtaPipe, SafePipe, SearchPipe, EachPipe, AlertComponent, WrapperComponent, PickerComponent, TextComponent, NumberComponent, DateComponent, TimeComponent, ColorComponent, HtmlComponent, FilesComponent, ClickOutsideDirective],
	exports: [OtaPipe, SafePipe, SearchPipe, EachPipe, AlertComponent, PickerComponent, ClickOutsideDirective],
	entryComponents: [AlertComponent, WrapperComponent, FilesComponent],
	providers: [{
		provide: CONFIG_TOKEN,
		useValue: DEFAULT_CONFIG
	}],
	imports: [CommonModule, FormsModule]
})
export class WacomModule {
	static forRoot(config: Config = DEFAULT_CONFIG): ModuleWithProviders {
		return {
			ngModule: WacomModule,
			providers: [{
				provide: CONFIG_TOKEN,
				useValue: config
			}]
		}
	}
}