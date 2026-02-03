import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { ThemeDensity, ThemeMode, ThemeRadius } from './theme.type';

@Injectable({ providedIn: 'root' })
export class ThemeService {
	private readonly _doc = inject(DOCUMENT);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	mode = signal<ThemeMode | string | undefined>(undefined);
	setMode(mode: ThemeMode) {
		if (this._isBrowser) {
			this._doc.documentElement.dataset['mode'] = mode;
			localStorage.setItem('theme.mode', mode);
		}
		this.mode.set(mode);
	}

	density = signal<ThemeDensity | undefined>(undefined);
	setDensity(density: ThemeDensity) {
		if (this._isBrowser) {
			this._doc.documentElement.dataset['density'] = density;
			localStorage.setItem('theme.density', density);
		}
		this.density.set(density);
	}

	radius = signal<ThemeRadius | undefined>(undefined);
	setRadius(radius: ThemeRadius) {
		if (this._isBrowser) {
			this._doc.documentElement.dataset['radius'] = radius;
			localStorage.setItem('theme.radius', radius);
		}
		this.radius.set(radius);
	}

	init() {
		const mode = this._isBrowser
			? ((localStorage.getItem('theme.mode') as ThemeMode) || 'light')
			: 'light';
		const density = this._isBrowser
			? ((localStorage.getItem('theme.density') as ThemeDensity) ||
				'comfortable')
			: 'comfortable';
		const radius = this._isBrowser
			? ((localStorage.getItem('theme.radius') as ThemeRadius) ||
				'rounded')
			: 'rounded';

		this.mode.set(mode);
		this.density.set(density);
		this.radius.set(radius);

		if (this._isBrowser) {
			this._doc.documentElement.dataset['mode'] = mode;
			this._doc.documentElement.dataset['density'] = density;
			this._doc.documentElement.dataset['radius'] = radius;
		}
	}
}
