import { Component, Output, EventEmitter, Input } from '@angular/core';
@Component({
	inputs: ['id', 'name', 'placeholder', 'min', 'max', 'step'],
	selector: 'waw-time',
	templateUrl: './time.component.html',
	styleUrls: ['./time.component.scss']
})
export class TimeComponent {
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
