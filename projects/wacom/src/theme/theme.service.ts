import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { ThemeDensity, ThemeMode, ThemeRadius } from './theme.type';

@Injectable({ providedIn: 'root' })
export class ThemeService {
	private readonly doc = inject(DOCUMENT);

	setRadius(radius: ThemeRadius | string) {
		this.doc.documentElement.dataset['radius'] = radius;
		localStorage.setItem('theme.radius', radius);
	}

	setMode(mode: ThemeMode) {
		this.doc.documentElement.dataset['mode'] = mode;
		localStorage.setItem('theme.mode', mode);
	}

	setDensity(density: ThemeDensity) {
		this.doc.documentElement.dataset['density'] = density;
		localStorage.setItem('theme.density', density);
	}

	init() {
		this.doc.documentElement.dataset['mode'] =
			(localStorage.getItem('theme.mode') as ThemeMode) || 'light';
		this.doc.documentElement.dataset['density'] =
			(localStorage.getItem('theme.density') as ThemeDensity) ||
			'comfortable';
		this.doc.documentElement.dataset['radius'] =
			(localStorage.getItem('theme.radius') as ThemeRadius) || 'rounded';
	}
}
