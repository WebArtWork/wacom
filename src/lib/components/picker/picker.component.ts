import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
	inputs: ['type', 'id', 'name', 'placeholder', 'min', 'max', 'step'],
	selector: 'picker',
	templateUrl: './picker.component.html',
	styleUrls: ['./picker.component.scss']
})
export class PickerComponent  {
	public type = 'text';
	public id;
	public name = 'default';
	public placeholder;
	public min;
	public max;
	public step;
	@Input() ngModel;
  	@Output() ngModelChange = new EventEmitter();
	constructor() {
	}
}
