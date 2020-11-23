import {  Component, Output, EventEmitter, Input, ContentChild, TemplateRef } from '@angular/core';
import { PickerSelectOptionsDirective } from '../../directives/picker.directive';

@Component({
	selector: 'picker',
	templateUrl: './picker.component.html',
	styleUrls: ['./picker.component.scss']
})
export class PickerComponent  {
	@Input() ngModel;
  	@Output() ngModelChange = new EventEmitter();
  	@ContentChild(PickerSelectOptionsDirective, { read: TemplateRef, static: false}) optionsTemplate: TemplateRef<any>;
	@Input('type') type = 'text';
	@Input('id') id;
	@Input('name') name;
	@Input('placeholder') placeholder;
	@Input('min') min;
	@Input('max') max;
	@Input('step') step;
	@Input('field') field;
	@Input('config') config;
	@Input('list') list = [];
	@Input('disabled') disabled = false;
	@Input('multiple') multiple = false;
	@Input('size') size;
	@Input('label') label;
	@Input('search') search = false;
	@Input('clearable') clearable = true;
	@Input('dropdownPosition') dropdownPosition = 'auto';
	@Input('maxSelected') maxSelected = 'all';
	@Input('dropdownClose') dropdownClose = true;
	@Input('searchPlaceholder') searchPlaceholder;
	@Input('searchField') searchField;
	@Input('searchLimit') searchLimit = 10;
	@Input('noResults') noResults;
	@Input('bindValue') bindValue;
	@Input('bindLabel') bindLabel = '';
	@Output() onAdd = new EventEmitter();
	constructor() {
	}
}
