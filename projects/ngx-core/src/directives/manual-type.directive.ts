import { Directive, ElementRef, effect, inject, input } from '@angular/core';

@Directive({
	selector: 'input[manualType], textarea[manualType]',
})
export class ManualTypeDirective {
	private readonly _el = inject(ElementRef) as ElementRef<HTMLInputElement>;

	// Bind as: manualType="password" or [manualType]="expr"
	readonly manualType = input<string | null>(null, { alias: 'manualType' });

	private readonly _syncTypeEffect = effect(() => {
		const t = this.manualType();
		if (!t) return;

		const native = this._el.nativeElement;
		if (!native) return;

		if (native.type !== t) {
			native.type = t;
		}
	});
}
