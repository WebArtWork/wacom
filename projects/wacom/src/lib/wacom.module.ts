/* initialize */
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from './interfaces/config';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MetaService } from './services/meta.service';
import { MetaGuard } from './guard/meta.guard';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* directives */
import { ClickOutsideDirective } from './directives/click-outside.directive';
const DIRECTIVES = [ClickOutsideDirective];

/* pipes */
import { ArrPipe } from './pipes/arr.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { SplicePipe } from './pipes/splice.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { MongodatePipe } from './pipes/mongodate.pipe';
import { PaginationPipe } from './pipes/pagination.pipe';
const PIPES = [
	ArrPipe,
	SafePipe,
	SplicePipe,
	SearchPipe,
	MongodatePipe,
	PaginationPipe,
];

/* components */
import { WrapperComponent } from './components/alert/wrapper/wrapper.component';
import { LoaderComponent } from './components/loader/loader.component';
import { FilesComponent } from './components/files/files.component';
import { ModalComponent } from './components/modal/modal.component';
import { AlertComponent } from './components/alert/alert.component';
const LOCAL_COMPONENTS = [
	WrapperComponent,
	FilesComponent
];
const COMPONENTS = [
	LoaderComponent,
	ModalComponent,
	AlertComponent
];

@NgModule({
	imports: [CommonModule, FormsModule, HttpClientModule],
	declarations: [...LOCAL_COMPONENTS, ...PIPES, ...COMPONENTS, ...DIRECTIVES],
	exports: [...PIPES, ...COMPONENTS, ...DIRECTIVES],
	providers: [
		{ provide: CONFIG_TOKEN, useValue: DEFAULT_CONFIG },
		MetaGuard,
		MetaService
	]
})
export class WacomModule {
	static forRoot(config: Config = DEFAULT_CONFIG): ModuleWithProviders<WacomModule> {
		return {
			ngModule: WacomModule,
			providers: [{
				provide: CONFIG_TOKEN,
				useValue: config
			}]
		}
	}
}
