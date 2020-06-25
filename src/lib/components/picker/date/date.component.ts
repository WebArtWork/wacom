import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
	inputs: ['id', 'name', 'placeholder', 'min', 'max', 'step'],
	selector: 'waw-date',
	templateUrl: './date.component.html',
	styleUrls: ['./date.component.scss']
})
export class DateComponent {
	@Input() inputModel;
  	@Output() inputModelChange = new EventEmitter();
	public id;
	public name;
	public placeholder = 'Your placeholder...';
	public min;
	public max;
	public step;
	constructor() { }
}
