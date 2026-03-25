import {
	EnvironmentProviders,
	inject,
	makeEnvironmentProviders,
	provideEnvironmentInitializer,
} from '@angular/core';
import { ProvideTranslateConfig } from './translate.interface';
import { TranslateService } from './translate.service';

export function provideTranslate(config: ProvideTranslateConfig = {}): EnvironmentProviders {
	return makeEnvironmentProviders([
		provideEnvironmentInitializer(() => {
			void inject(TranslateService).init(config);
		}),
	]);
}
