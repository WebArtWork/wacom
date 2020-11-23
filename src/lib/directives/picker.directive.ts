import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[select-options]'
})
export class PickerSelectOptionsDirective {   
	constructor(public template: TemplateRef<any>) {}
}