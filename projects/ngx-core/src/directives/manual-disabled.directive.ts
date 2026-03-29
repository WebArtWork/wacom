import { Directive, ElementRef, effect, inject, input } from '@angular/core';

@Directive({
	selector: 'input[manualDisabled], textarea[manualDisabled]',
})
export class ManualDisabledDirective {
	private readonly _el = inject(ElementRef) as ElementRef<HTMLInputElement>;

	// Bind as: [manualDisabled]="isDisabled"
	readonly manualDisabled = input<boolean | null>(null, {
		alias: 'manualDisabled',
	});

	private readonly _syncDisabledEffect = effect(() => {
		const disabled = this.manualDisabled();
		if (disabled == null) return;

		const native = this._el.nativeElement;
		if (!native) return;

		native.disabled = !!disabled;
	});
}
