import { ChangeDetectorRef, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';

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
		document.addEventListener('pointerdown', this.handler, true);

		// cleanup
		this._dref.onDestroy(() => document.removeEventListener('pointerdown', this.handler, true));
	}

	private _host = inject(ElementRef<HTMLElement>);

	private _cdr = inject(ChangeDetectorRef);

	private _dref = inject(DestroyRef);

	private handler = (e: MouseEvent): void => {
		if (!this._host.nativeElement.contains(e.target as Node)) {
			this.clickOutside.emit(e); // notify parent
			this._cdr.markForCheck(); // trigger CD for OnPush comps
		}
	};
}
