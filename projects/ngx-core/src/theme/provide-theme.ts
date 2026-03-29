import {
	EnvironmentProviders,
	inject,
	makeEnvironmentProviders,
	provideEnvironmentInitializer,
} from '@angular/core';
import { ThemeService } from './theme.service';

export function provideTheme(): EnvironmentProviders {
	return makeEnvironmentProviders([
		provideEnvironmentInitializer(() => {
			void inject(ThemeService).init();
		}),
	]);
}
