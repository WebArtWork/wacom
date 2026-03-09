import {
	EnvironmentProviders,
	inject,
	makeEnvironmentProviders,
	provideEnvironmentInitializer,
} from '@angular/core';
import { Translate } from './translate.interface';
import { TranslateService } from './translate.service';

export function provideTranslate(translations: Translate[] = []): EnvironmentProviders {
	return makeEnvironmentProviders([
		provideEnvironmentInitializer(() => {
			if (!translations.length) {
				return;
			}

			inject(TranslateService).setMany(translations);
		}),
	]);
}
