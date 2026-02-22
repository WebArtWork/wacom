import { isPlatformBrowser } from '@angular/common';
import {
	afterNextRender,
	Directive,
	effect,
	ElementRef,
	inject,
	input,
	PLATFORM_ID,
	signal,
	WritableSignal,
} from '@angular/core';
import { TranslationService } from './translation.service';

@Directive({
	selector: '[translate]',
	standalone: true,
})
export class TranslateDirective {
	private readonly _platformId = inject(PLATFORM_ID);
	private readonly _isBrowser = isPlatformBrowser(this._platformId);

	/**
	 * Optional explicit translation key.
	 *
	 * - If provided, this key is used to look up a translation.
	 * - If empty, the directive uses the element's initial rendered `textContent`
	 *   (captured after render) as the key.
	 *
	 * Note:
	 * This directive writes to `textContent`, which replaces all child text/markup
	 * inside the host element.
	 */
	readonly translate = input<string>('');

	private readonly _el = inject(ElementRef<HTMLElement>);
	private readonly _translationService = inject(TranslationService);

	/**
	 * Captures the element's original rendered text (trimmed) after the first render.
	 *
	 * Used as the implicit key when no explicit `translate` input is provided.
	 * This is captured only in the browser (SSR-safe guard).
	 */
	private readonly _original = signal<string>(''); // set after render

	private _lastKey = '';
	private _lastSignal: WritableSignal<string> = signal('');

	constructor() {
		if (!this._isBrowser) return;

		// capture origin text once the element content is actually rendered
		afterNextRender(() => {
			const text = (this._el.nativeElement.textContent ?? '').trim();
			this._original.set(text);
		});

		effect(() => {
			if (!this._isBrowser) return;

			const origin = this._original().trim();
			const explicit = (this.translate() || '').trim();

			// If no explicit key and origin is still empty, don't overwrite DOM.
			// This prevents blanking the content.
			const key = (explicit || origin).trim();
			if (!key) return;

			// Only swap signal when key changes
			if (key !== this._lastKey) {
				this._lastKey = key;
				this._lastSignal = this._translationService.translate(key);
			}

			// If no translation exists, service returns key (origin), so this keeps origin text.
			this._el.nativeElement.textContent = this._lastSignal();
		});
	}
}
