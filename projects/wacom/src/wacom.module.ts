/* initialize */
import { CommonModule } from '@angular/common';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
	Config,
	CONFIG_TOKEN,
	DEFAULT_CONFIG,
} from './interfaces/config.interface';

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

@NgModule({
	imports: [CommonModule, FormsModule, ...PIPES, ...DIRECTIVES],
	exports: [...PIPES, ...DIRECTIVES],
	providers: [
		{ provide: CONFIG_TOKEN, useValue: DEFAULT_CONFIG },
		provideHttpClient(withInterceptorsFromDi()),
	],
})
/**
 * @deprecated Use provideWacom instead.
 */
export class WacomModule {
	static forRoot(
		config: Config = DEFAULT_CONFIG,
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
