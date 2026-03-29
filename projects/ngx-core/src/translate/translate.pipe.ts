import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from './translate.service';

@Pipe({
	name: 'translate',
})
export class TranslatePipe implements PipeTransform {
	/**
	 * Transforms a translation key into the currently resolved translated string.
	 *
	 * - If the key has no translation yet, the service returns the key itself
	 *   (fallback behavior), so the UI remains readable.
	 * - The returned value is reactive via signals: when `setMany()` / `setOne()`
	 *   updates the underlying signal, templates re-render automatically.
	 *
	 * @param text - Translate key (typically the source text).
	 * @returns The translated string for the current in-memory/store state.
	 */
	transform(text: string) {
		return this._translateService.translate(text)();
	}

	private _translateService = inject(TranslateService);
}
