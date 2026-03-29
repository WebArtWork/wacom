import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideTheme, provideTranslation, provideWacom } from 'ngx-core';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZonelessChangeDetection(),
		provideRouter(
			routes,
			withInMemoryScrolling({
				scrollPositionRestoration: 'top',
			}),
		),
		provideTheme(),
		provideTranslation({
			defaultLanguage: 'en',
			folder: '/assets/i18n/',
		}),
		provideWacom({
			meta: {
				applyFromRoutes: true,
				defaults: {
					title: 'ngx-core',
					titleSuffix: ' | Web Art Work',
					description:
						'Angular utility library from Web Art Work for shared services, directives, pipes, and app-level configuration.',
					image: 'https://wawjs.wiki/logo.png',
					links: {
						canonical: 'https://wawjs.wiki/',
					},
				},
				useTitleSuffix: true,
			},
		}),
	],
};

