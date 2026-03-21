import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { serviceDocs } from '../../services/service-docs';

@Component({
	imports: [RouterLink],
	templateUrl: './landing.component.html',
	styleUrl: './landing.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
	private readonly _platformId = inject(PLATFORM_ID);

	protected readonly copiedKey = signal('');
	protected readonly installCommand = 'npm i --save wacom';

	protected readonly services = serviceDocs;

	protected copy(key: string, value: string): void {
		if (!isPlatformBrowser(this._platformId) || !navigator?.clipboard) {
			return;
		}

		navigator.clipboard.writeText(value).then(() => {
			this.copiedKey.set(key);
			setTimeout(() => {
				if (this.copiedKey() === key) {
					this.copiedKey.set('');
				}
			}, 1500);
		});
	}

	protected readonly usageCopy = `import { provideWacom } from 'wacom';

export const appConfig = {
\tproviders: [provideWacom()],
};`;

	protected readonly configCopy = `import { provideWacom } from 'wacom';

export const appConfig = {
\tproviders: [
\t\tprovideWacom({
\t\t\thttp: { url: 'https://api.example.com' },
\t\t\tstore: { prefix: 'waStore' },
\t\t\tmeta: {
\t\t\t\tuseTitleSuffix: false,
\t\t\t\tapplyFromRoutes: true,
\t\t\t\tdefaults: { links: {} },
\t\t\t},
\t\t\tnetwork: {},
\t\t\tsocket: false,
\t\t\tio: undefined,
\t\t}),
\t],
};`;
}
