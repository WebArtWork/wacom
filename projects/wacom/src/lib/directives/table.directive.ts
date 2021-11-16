import { Directive, TemplateRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: 'ng-template[cell]'
})
export class CellDirective implements OnInit{  
	@Input('cell') cell:any; 
	constructor(public template: TemplateRef<any>) {

	}
	ngOnInit() {
	}
}

@Directive({
  selector: 'ng-template[sort]'
})
export class SortDirective implements OnInit{
	@Input('cell') cell:any; 
	constructor(public template: TemplateRef<any>) {

	}
	ngOnInit() {
	}
}

@Directive({
  selector: 'ng-template[actions]'
})
export class ActionsDirective implements OnInit{
	constructor(public template: TemplateRef<any>) {

	}
	ngOnInit() {
	}
}
@Directive({
  selector: 'ng-template[customEdit]'
})
export class CustomEditDirective implements OnInit{
	constructor(public template: TemplateRef<any>) {

	}
	ngOnInit() {
	}
}
