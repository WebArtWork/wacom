import { Component, ViewChild, Input, ContentChildren, TemplateRef, OnInit, Output, QueryList, AfterContentInit, EventEmitter} from '@angular/core';
import { CellDirective, SortDirective } from '../../directives/table.directive';
import { toArray } from 'rxjs/operators';
@Component({
    selector: 'wtable',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],

})

export class TableComponent implements OnInit, AfterContentInit {
	//Intitalize
	@Input('columns') columns = [];
	@Input('rows') rows;
	@ContentChildren(CellDirective) cell: QueryList<CellDirective>;
	@ContentChildren(SortDirective) sortHeaders: QueryList<SortDirective>;
 	public custom_cell:any = {};
 	public sortable:any = {};
    public selected_opt:any = {};
    public config:any = {};
    //Pagination
	@Output('paginate') paginate = new EventEmitter();
    public select_page_size = false;

    //Search
	@Output('onSearch') onSearch = new EventEmitter();
	public searching_text = '';
    constructor() {}
    ngOnInit() {
    	if(Array.isArray(this.rows)) {
    		this.config.rows = this.rows;
    	} else if(typeof this.rows == 'object'){
    		this.config = JSON.parse(JSON.stringify(this.rows));
    	}
    	for (let i = 0; i < this.columns.length; i++){
    	    if(typeof this.columns[i] == 'string') this.columns[i] = {title: this.columns[i], field: this.columns[i]}
    	}
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
    	if(this.config.page*this.config.perPage < this.config.rows.length) this.config.page +=1;
    }
    previous() {
    	if(this.config.page > 1) this.config.page -= 1;
    }
    changePerPage(row) {
    	this.config.perPage = row;
    	if(((this.config.page-1)*this.config.perPage) > this.config.rows.length) this.lastPage();
    	this.select_page_size = false;
    }
    lastPage() {
    	this.config.page = Math.ceil(this.config.rows.length/this.config.perPage);
    }
    sort(column) {
    	for (let i = 0; i < this.columns.length; i++){
    		if(this.columns[i].title != column.title) delete this.columns[i].sort;
    	}
    	if(this.sortable[column.field]) {
    		if(typeof column.sort != 'string') {
    			column.sort = 'asc';
    			for (let i = 0; i < this.config.rows.length; i++){
    			    if(typeof this.config.rows[i][column.field] == 'number') {
    			    	this.config.rows.sort((a, b)=> {
							if (a[column.field] > b[column.field]) {
							    return 1;
							}
							if (a[column.field] < b[column.field]) {
							    return -1;
							}
							return 0;
    			    	})
    			    }
    			}
    		} else if (column.sort == 'asc') {
    			column.sort = 'desc';
    			for (let i = 0; i < this.config.rows.length; i++){
	    			if(typeof this.config.rows[i][column.field] == 'number') {
				    	this.config.rows.sort((a, b)=> {
				    		if (a[column.field] < b[column.field]) {
							    return 1;
							}
							if (a[column.field] > b[column.field]) {
							    return -1;
							}
							return 0;
				    	})
				    }
				}
    		} else if (column.sort == 'desc') {
    			delete column.sort;
    			console.log(this.rows);
    		}
    	}
    }
}
