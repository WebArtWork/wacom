import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';

@Component({
	inputs: ['id', 'name', 'list', 'config', 'disabled', 'multiple', 'size', 'label', 'search'],
	selector: 'waw-select',
	templateUrl: './select.component.html',
	styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {
	@Input() inputModel;
  	@Output() inputModelChange = new EventEmitter();
	public id;
	public class;
	public name;
	public list = [];
	public disabled = false;
	public multiple = false;
	public size;
	public config:any = {};
	public options = false;
	public label;
	public search = false;
	public text_search = '';
	constructor() {
	}
	ngOnInit() {
		if(!this.multiple) this.inputModel = '';
		for (var i = 0; i < this.list.length; i++){
		    if(this.list[i].selected) {
		    	if(this.multiple) {
		    		this.inputModel = [this.list[i].value];
		    	} else {
		    		this.inputModel = this.list[i].value;
		    	}
		    	
				this.list[i].is_selected = true;
		    }
		}
	}
	selected(option) {
		if(!this.multiple) {
			this.inputModel = option.value;
			option.is_selected = true;
			this.options = false;
			this.inputModelChange.emit(this.inputModel)
		} else {
			if(!Array.isArray(this.inputModel)) this.inputModel = [];
			let flag = false;
			for (var i = 0; i < this.inputModel.length; i++){
			    if(this.inputModel[i] == option.value) {
			    	flag = true;
			    	option.is_selected = false;
			    	this.inputModel.splice(i, 1);
			    }
			}
			if(!flag) {
				option.is_selected = true;
				this.inputModel.push(option.value)
			}
			this.inputModelChange.emit(this.inputModel)
		}
	}
}
