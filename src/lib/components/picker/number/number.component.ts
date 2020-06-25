import { Component, Output, EventEmitter, Input  } from '@angular/core';

@Component({
	inputs: ['id', 'name', 'placeholder', 'min', 'max', 'step'],
	selector: 'waw-number',
	templateUrl: './number.component.html',
	styleUrls: ['./number.component.scss']
})
export class NumberComponent {
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
