import { DOCUMENT, inject, provideEnvironmentInitializer } from '@angular/core';
import { Config, CONFIG_TOKEN, DEFAULT_CONFIG } from '../public-api';

export const themeProvider = () => {
	return provideEnvironmentInitializer(() => {
		const doc = inject(DOCUMENT);

		const config = inject<Config>(CONFIG_TOKEN);

		doc?.documentElement?.style.setProperty('--wacom-primary', config.theme?.primary || DEFAULT_CONFIG.theme?.primary || '');

		doc?.documentElement?.style.setProperty('--wacom-secondary', config.theme?.secondary || DEFAULT_CONFIG.theme?.secondary || '');

		doc?.documentElement?.style.setProperty('--wacom-info', config.theme?.info || DEFAULT_CONFIG.theme?.info || '');

		doc?.documentElement?.style.setProperty('--wacom-error', config.theme?.error || DEFAULT_CONFIG.theme?.error || '');

		doc?.documentElement?.style.setProperty('--wacom-success', config.theme?.success || DEFAULT_CONFIG.theme?.success || '');

		doc?.documentElement?.style.setProperty('--wacom-warning', config.theme?.warning || DEFAULT_CONFIG.theme?.warning || '');

		doc?.documentElement?.style.setProperty('--wacom-question', config.theme?.question || DEFAULT_CONFIG.theme?.question || '');
	});
};
