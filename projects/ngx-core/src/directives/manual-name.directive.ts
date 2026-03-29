import { Directive, ElementRef, effect, inject, input } from '@angular/core';

@Directive({
	selector: 'input[manualName], textarea[manualName]',
})
export class ManualNameDirective {
	private readonly _el = inject(ElementRef) as ElementRef<HTMLInputElement>;

	// Bind as: manualName="email" or [manualName]="expr"
	readonly manualName = input<string | null>(null, { alias: 'manualName' });

	private readonly _syncNameEffect = effect(() => {
		const name = this.manualName();
		if (name == null) return;

		const native = this._el.nativeElement;
		if (!native) return;

		if (native.name !== name) {
			native.name = name;
		}
	});
}
