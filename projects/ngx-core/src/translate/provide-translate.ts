import {
	APP_INITIALIZER,
	EnvironmentProviders,
	inject,
	makeEnvironmentProviders,
} from '@angular/core';
import { ProvideTranslateConfig } from './translate.interface';
import { TranslateService } from './translate.service';

export function provideTranslate(config: ProvideTranslateConfig = {}): EnvironmentProviders {
	return makeEnvironmentProviders([
		{
			provide: APP_INITIALIZER,
			useFactory: () => {
				const service = inject(TranslateService);
				return () => service.init(config);
			},
			multi: true,
		},
	]);
}

export function provideTranslation(config: ProvideTranslateConfig = {}): EnvironmentProviders {
	return provideTranslate(config);
}
