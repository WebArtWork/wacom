import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[tableHeaders]'
})
export class TableHeadersDirective {   
	constructor(public template: TemplateRef<any>) {}
}

@Directive({
  selector: '[tableRows]'
})
export class TableRowsDirective {   
	constructor(public template: TemplateRef<any>) {}
}