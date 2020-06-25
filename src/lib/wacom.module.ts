import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OtaPipe } from './pipes/ota.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { AlertComponent } from './components/alert/alert.component';
import { WrapperComponent } from './components/alert/wrapper/wrapper.component';
import { PickerComponent } from './components/picker/picker.component';
import { TextComponent } from './components/picker/text/text.component';
import { NumberComponent } from './components/picker/number/number.component';
import { DateComponent } from './components/picker/date/date.component';
import { TimeComponent } from './components/picker/time/time.component';
import { ColorComponent } from './components/picker/color/color.component';
import { HtmlComponent } from './components/picker/html/html.component';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from './interfaces/config';
@NgModule({
	declarations: [OtaPipe, SafePipe, SearchPipe, AlertComponent, WrapperComponent, PickerComponent, TextComponent, NumberComponent, DateComponent, TimeComponent, ColorComponent, HtmlComponent],
	exports: [OtaPipe, SafePipe, SearchPipe, AlertComponent, WrapperComponent, PickerComponent],
	entryComponents: [AlertComponent, WrapperComponent],
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