import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
@Component({
	selector: 'waw-select',
	templateUrl: './select.component.html',
	styleUrls: ['./select.component.scss']
})

export class SelectComponent implements OnInit {
	@Input() inputModel;
  	@Output() inputModelChange = new EventEmitter();
  	@Output() onAddEvent = new EventEmitter();
  	@Input('id') id;
	@Input('class') class;
	@Input('name') name;
	@Input('list') list;
	@Input('config') config;
	@Input('disabled') disabled;
	@Input('multiple') multiple;
	@Input('size') size;
	@Input('label') label;
	@Input('search') search;
	@Input('tmplOptions') tmplOptions;
	@Input('clearable') clearable = true;
	@Input('dropdownPosition') dropdownPosition = 'auto';
	@Input('maxSelected') maxSelected = 'all';
	@Input('dropdownClose') dropdownClose = true;
	@Input('searchPlaceholder') searchPlaceholder;
	@Input('searchField') searchField;
	@Input('searchLimit') searchLimit;
	@Input('noResults') noResults;
	@Input('bindValue') bindValue;
	@Input('bindLabel') bindLabel;
	public count = 0;
	public options = false;
	public text_search = '';
	constructor() {
		
	}
	ngOnInit() {
		if(!this.multiple) this.inputModel = '';
		for (var i = 0; i < this.list.length; i++){
		    if(this.list[i].selected) {
		    	if(this.multiple) {
		    		this.inputModel = [this.bindValue&&this.list[i][this.bindValue]||this.list[i]];
		    	} else {
		    		this.inputModel = this.bindValue&&this.list[i][this.bindValue]||this.list[i];
		    	}
		    	
				this.list[i].is_selected = true;
		    }
		}
	}
	selected(option) {
		if(!this.multiple) {
			this.inputModel = this.bindValue&&option[this.bindValue]||option;
			option.is_selected = true;
			this.count += 1;
			if(this.dropdownClose) this.options = false;
			this.onAddEvent.emit(option);
			this.inputModelChange.emit(this.inputModel)
		} else {
			if(!Array.isArray(this.inputModel)) this.inputModel = [];
			let flag = false;
			for (var i = 0; i < this.inputModel.length; i++){
			    if(this.inputModel[i] == (this.bindValue&&option.value||option)) {
			    	flag = true;
			    	option.is_selected = false;
			    	this.count -= 1;
			    	this.inputModel.splice(i, 1);
			    }
			}
			if(!flag) {
				option.is_selected = true;
				this.count += 1;
				this.inputModel.push(this.bindValue&&option[this.bindValue]||option)
			}
			if(this.dropdownClose) this.options = false;
			this.onAddEvent.emit(option);
			this.inputModelChange.emit(this.inputModel)
		}
	}
}
