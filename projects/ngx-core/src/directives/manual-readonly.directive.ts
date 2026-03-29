import { Directive, ElementRef, effect, inject, input } from '@angular/core';

@Directive({
	selector: 'input[manualReadonly], textarea[manualReadonly]',
})
export class ManualReadonlyDirective {
	private readonly _el = inject(ElementRef) as ElementRef<HTMLInputElement>;

	// Bind as: [manualReadonly]="true"
	readonly manualReadonly = input<boolean | null>(null, {
		alias: 'manualReadonly',
	});

	private readonly _syncReadonlyEffect = effect(() => {
		const readonly = this.manualReadonly();
		if (readonly == null) return;

		const native = this._el.nativeElement;
		if (!native) return;

		native.readOnly = !!readonly;
	});
}
