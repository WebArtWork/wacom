import { Directive, TemplateRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: 'ng-template[cell]'
})
export class CellDirective implements OnInit{  
	@Input('cell') cell; 
	constructor(public template: TemplateRef<any>) {

	}
	ngOnInit() {
	}
}

@Directive({
  selector: 'ng-template[sort]'
})
export class SortDirective implements OnInit{
	@Input('cell') cell; 
	constructor(public template: TemplateRef<any>) {

	}
	ngOnInit() {
	}
}
