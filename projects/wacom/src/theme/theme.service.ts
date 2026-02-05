import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { ThemeDensity, ThemeMode, ThemeRadius } from './theme.type';

@Injectable({ providedIn: 'root' })
export class ThemeService {
	private readonly _doc = inject(DOCUMENT);
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	mode = signal<ThemeMode | undefined>(undefined);
	modes = signal<ThemeMode[]>(['light', 'dark']);
	setMode(mode: ThemeMode) {
		if (this._isBrowser) {
			this._doc.documentElement.dataset['mode'] = mode;
			localStorage.setItem('theme.mode', mode);
		}
		this.mode.set(mode);
	}

	density = signal<ThemeDensity | undefined>(undefined);
	densities = signal<ThemeDensity[]>(['comfortable', 'compact']);
	setDensity(density: ThemeDensity) {
		if (this._isBrowser) {
			this._doc.documentElement.dataset['density'] = density;
			localStorage.setItem('theme.density', density);
		}
		this.density.set(density);
	}

	radius = signal<ThemeRadius | undefined>(undefined);
	radiuses = signal<ThemeRadius[]>(['rounded', 'square']);
	setRadius(radius: ThemeRadius) {
		if (this._isBrowser) {
			this._doc.documentElement.dataset['radius'] = radius;
			localStorage.setItem('theme.radius', radius);
		}
		this.radius.set(radius);
	}

	themeIndex = signal<number>(0);
	nextTheme() {
		const modes = this.modes().length;
		const densities = this.densities().length;
		const radiuses = this.radiuses().length;

		const maxIndex = modes * densities * radiuses;

		const nextIndex = (this.themeIndex() + 1) % maxIndex;
		this.themeIndex.set(nextIndex);

		const block = densities * radiuses;

		const modeIndex = Math.floor(nextIndex / block);
		const rem = nextIndex % block;
		const densityIndex = Math.floor(rem / radiuses);
		const radiusIndex = rem % radiuses;

		this.setMode(this.modes()[modeIndex] as ThemeMode);
		this.setDensity(this.densities()[densityIndex] as ThemeDensity);
		this.setRadius(this.radiuses()[radiusIndex] as ThemeRadius);

		if (this._isBrowser) {
			localStorage.setItem('theme.index', String(nextIndex));
		}
	}

	init() {
		const mode = this._isBrowser
			? (localStorage.getItem('theme.mode') as ThemeMode) || 'light'
			: 'light';
		const density = this._isBrowser
			? (localStorage.getItem('theme.density') as ThemeDensity) ||
				'comfortable'
			: 'comfortable';
		const radius = this._isBrowser
			? (localStorage.getItem('theme.radius') as ThemeRadius) || 'rounded'
			: 'rounded';

		this.mode.set(mode);
		this.density.set(density);
		this.radius.set(radius);

		this.themeIndex.set(
			this._isBrowser
				? Number(localStorage.getItem('theme.index')) || 0
				: 0,
		);

		if (this._isBrowser) {
			this._doc.documentElement.dataset['mode'] = mode;
			this._doc.documentElement.dataset['density'] = density;
			this._doc.documentElement.dataset['radius'] = radius;
		}
	}
}
