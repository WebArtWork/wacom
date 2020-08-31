import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
	inputs: ['type', 'id', 'name', 'placeholder', 'min', 'max', 'step', 'field', 'config', 'list', 'disabled', 'multiple', 'size', 'label'],
	selector: 'picker',
	templateUrl: './picker.component.html',
	styleUrls: ['./picker.component.scss']
})
export class PickerComponent  {
	public type = 'text';
	public id;
	public name = 'default';
	public placeholder = 'Placeholder';
	public min;
	public max;
	public step;
	public field;
	public count;
	public config;
	public disabled = false;
	public multiple = false;
	public size;
	public list = [];
	public label = 'Select';
	@Input() ngModel;
  	@Output() ngModelChange = new EventEmitter();
	constructor() {
	}
}
