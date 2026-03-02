import {
	EnvironmentProviders,
	inject,
	makeEnvironmentProviders,
	provideEnvironmentInitializer,
} from '@angular/core';
import { Translation } from './translation.interface';
import { TranslationService } from './translation.service';

export function provideTranslation(
	translations: Translation[] = [],
): EnvironmentProviders {
	return makeEnvironmentProviders([
		provideEnvironmentInitializer(() => {
			if (!translations.length) {
				return;
			}

			inject(TranslationService).setMany(translations);
		}),
	]);
}
