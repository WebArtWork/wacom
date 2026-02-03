import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
	ChangeDetectorRef,
	DestroyRef,
	Directive,
	ElementRef,
	PLATFORM_ID,
	inject,
	output,
} from '@angular/core';

/**
 * Stand-alone “click outside” directive (zoneless-safe).
 *
 * Usage:
 * <div (clickOutside)="close()">…</div>
 */
@Directive({
	selector: '[clickOutside]',
})
export class ClickOutsideDirective {
	readonly clickOutside = output<MouseEvent>();

	constructor() {
		if (this._isBrowser) {
			this._doc.addEventListener('pointerdown', this.handler, true);
		}

		// cleanup
		this._dref.onDestroy(() =>
			this._doc.removeEventListener('pointerdown', this.handler, true),
		);
	}

	private _host = inject(ElementRef<HTMLElement>);

	private _cdr = inject(ChangeDetectorRef);

	private _dref = inject(DestroyRef);

	private _doc = inject(DOCUMENT);

	private _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

	private handler = (e: MouseEvent): void => {
		if (!this._host.nativeElement.contains(e.target as Node)) {
			this.clickOutside.emit(e); // notify parent
			this._cdr.markForCheck(); // trigger CD for OnPush comps
		}
	};
}
