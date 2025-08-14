/* initialize */
import { CommonModule } from '@angular/common';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from './interfaces/config';

/* directives */
import { ClickOutsideDirective } from './directives/click-outside.directive';
const DIRECTIVES = [ClickOutsideDirective];

/* pipes */
import { ArrPipe } from './pipes/arr.pipe';
import { MongodatePipe } from './pipes/mongodate.pipe';
import { PaginationPipe } from './pipes/pagination.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { SplicePipe } from './pipes/splice.pipe';
const PIPES = [
	ArrPipe,
	SafePipe,
	SplicePipe,
	SearchPipe,
	MongodatePipe,
	PaginationPipe,
];

/* components */
import { AlertComponent } from './components/alert/alert.component';
import { WrapperComponent } from './components/alert/wrapper/wrapper.component';
import { FilesComponent } from './components/files/files.component';
import { LoaderComponent } from './components/loader/loader.component';
import { ModalComponent } from './components/modal/modal.component';
const LOCAL_COMPONENTS = [WrapperComponent, FilesComponent];
const COMPONENTS = [LoaderComponent, ModalComponent, AlertComponent];

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		...LOCAL_COMPONENTS,
		...PIPES,
		...COMPONENTS,
		...DIRECTIVES,
	],
	exports: [...PIPES, ...COMPONENTS, ...DIRECTIVES],
	providers: [
		{ provide: CONFIG_TOKEN, useValue: DEFAULT_CONFIG },
		provideHttpClient(withInterceptorsFromDi()),
	],
})
export class WacomModule {
	static forRoot(
		config: Config = DEFAULT_CONFIG
	): ModuleWithProviders<WacomModule> {
		return {
			ngModule: WacomModule,
			providers: [
				{
					provide: CONFIG_TOKEN,
					useValue: config,
				},
			],
		};
	}
}
