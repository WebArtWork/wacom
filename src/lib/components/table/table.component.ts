import { Component, ViewChild, Input, ContentChildren, TemplateRef, OnInit, Output, QueryList, AfterContentInit, EventEmitter, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, ContentChild} from '@angular/core';
import { CellDirective, SortDirective, ActionsDirective, CustomEditDirective} from '../../directives/table.directive';
import { toArray } from 'rxjs/operators';
@Component({
	selector: 'wtable',
	templateUrl: './table.component.html',
	styleUrls: ['./table.component.scss'],

})

export class TableComponent implements OnInit, AfterContentInit {
	//Intitalize
	@Input('columns') columns = [];
	@Input('config') config:any;
	@Input('rows') rows:any = [];
	@ContentChildren(CellDirective) cell: QueryList<CellDirective>;
	@ContentChildren(SortDirective) sortHeaders: QueryList<SortDirective>;
	@ContentChild(ActionsDirective, { static: false }) action;
	@ContentChild(CustomEditDirective, { static: false }) editForm;
	public custom_cell:any = {};
	public sortable:any = {};
	public searchShow:any;
	public select_page_size = false;
	public searching_text = '';
	public sort_type:any = {};
	@Output('onSearch') onSearch = new EventEmitter();
	constructor() {}
	ngOnInit() {
        this.default_config();
		for (let i = 0; i < this.columns.length; i++){
			if(typeof this.columns[i] == 'string') this.columns[i] = {title: this.columns[i], field: this.columns[i]}
		}
		this.init_doc_config();
	}
    default_config() {
        if(!this.config.pageSizeOptions) this.config.pageSizeOptions = [5, 10, 25]
        if(!this.config.perPage) this.config.perPage = 5;
        if(!this.config.page) this.config.page = 1;
        if(!this.config.searchable) this.config.searchable = false;
    }
	ngAfterContentInit() {
		if(this.sortHeaders) {
			for (let i = 0; i < this.sortHeaders.toArray().length; i++){
				this.sortable[this.sortHeaders.toArray()[i].cell] = true;
			}
		}
		if(this.cell) {
			for (let i = 0; i < this.cell.toArray().length; i++){
				this.custom_cell[this.cell.toArray()[i].cell] = this.cell.toArray()[i].template
			}
		}
	}
	next() {
		if(this.config.page*this.config.perPage < this.rows.length) this.config.page +=1;
	}
	previous() {
		if(this.config.page > 1) this.config.page -= 1;
	}
	changePerPage(row) {
		this.config.perPage = row;
		if(((this.config.page-1)*this.config.perPage) > this.rows.length) this.lastPage();
		this.select_page_size = false;
	}
	lastPage() {
		this.config.page = Math.ceil(this.rows.length/this.config.perPage);
	}
	isLast() {
		return this.rows&&(this.config.page == Math.ceil(this.rows.length/this.config.perPage))||false;
	}
	sort(column) {
		if(this.sort_type.title != column.title) this.sort_type = {};
		if(this.sortable[column.field]) {
			this.sort_type = {
				title: column.field,
				direction: (typeof this.sort_type.direction != 'string'&&'asc')||(this.sort_type.direction == 'asc'&&'desc')||undefined
			}
		}
	}
	// Document Management
	init_doc_config(){
		if(typeof this.config.doc == 'string') this.config.doc = this.config.doc.split(' ');
		if(Array.isArray(this.config.doc)){
			for (let i = 0; i < this.config.doc.length; i++){
				if(typeof this.config.doc[i] == 'string'){
					this.config.doc[i] = {
						name: this.config.doc[i]
					};
				}
			}
		}
	}
	public doc:any;
	edit(doc?) {
		this.doc = doc||{};	
		console.log(this.doc);	
	}
	submit(){
		if(this.doc._id && typeof this.config.update == 'function'){
			this.config.update(this.doc);
		}else if(typeof this.config.create == 'function'){
			this.config.create(this.doc);
		}
		this.doc = null;
	}
	// End of table
}
