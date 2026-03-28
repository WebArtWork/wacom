import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService, TranslateDirective, TranslatePipe, TranslateService } from 'wacom';
import { serviceDocs } from './services/service-docs';

@Component({
	selector: 'app-root',
	imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslateDirective, TranslatePipe],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
	protected readonly themeService = inject(ThemeService);
	protected readonly translateService = inject(TranslateService);
	protected readonly services = serviceDocs;

	protected topbarLabel(name: string): string {
		return name.replace(/Service$/, '');
	}

	protected setLanguage(language: 'en' | 'ua'): void {
		void this.translateService.setLanguage(language);
	}

	protected isLanguage(language: 'en' | 'ua'): boolean {
		const current =
			this.translateService.language() || this.translateService.defaultLanguage() || 'en';
		return current === language;
	}

	protected toggleTheme(): void {
		const nextMode = this.themeService.mode() === 'light' ? 'dark' : 'light';
		this.themeService.setMode(nextMode);
	}
}
