import { Directive, ElementRef, effect, inject, input } from '@angular/core';

@Directive({
	selector: 'input[manualReadonly]',
})
export class ManualReadonlyDirective {
	private readonly el = inject(ElementRef) as ElementRef<HTMLInputElement>;

	// Bind as: [manualReadonly]="true"
	readonly manualReadonly = input<boolean | null>(null, {
		alias: 'manualReadonly',
	});

	private readonly syncReadonlyEffect = effect(() => {
		const readonly = this.manualReadonly();
		if (readonly == null) return;

		const native = this.el.nativeElement;
		if (!native) return;

		native.readOnly = !!readonly;
	});
}
