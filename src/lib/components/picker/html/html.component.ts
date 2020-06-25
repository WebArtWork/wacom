import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
	inputs: ['id', 'name', 'placeholder'],
	selector: 'waw-html',
	templateUrl: './html.component.html',
	styleUrls: ['./html.component.scss']
})
export class HtmlComponent {
	@Input() inputModel;
  	@Output() inputModelChange = new EventEmitter();
	public id;
	public name;
	public placeholder = 'Your placeholder...';
	constructor() { }

}
