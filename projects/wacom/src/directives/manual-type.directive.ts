import { Directive, ElementRef, effect, inject, input } from '@angular/core';

@Directive({
	selector: 'input[manualType]',
})
export class ManualTypeDirective {
	private readonly el = inject(ElementRef) as ElementRef<HTMLInputElement>;

	// Bind as: manualType="password" or [manualType]="expr"
	readonly manualType = input<string | null>(null, { alias: 'manualType' });

	private readonly syncTypeEffect = effect(() => {
		const t = this.manualType();
		if (!t) return;

		const native = this.el.nativeElement;
		if (!native) return;

		if (native.type !== t) {
			native.type = t;
		}
	});
}
