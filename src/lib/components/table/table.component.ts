import { Component, ViewChild, Input, ContentChild, TemplateRef, OnInit} from '@angular/core';
import { TableHeadersDirective, TableRowsDirective } from '../../directives/table.directive';
@Component({
    selector: 'wtable',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.scss'],

})

export class TableComponent implements OnInit {
	@Input('headers') headers = [];
	@Input('rows') rows = [];
	@Input('perPages') perPages = [5, 10, 20];
	@Input('default_page') page_num = this.perPages[0];
	@ContentChild(TableHeadersDirective, { read: TemplateRef, static: false}) tableHeaders: TemplateRef<any>;
	@ContentChild(TableRowsDirective, { read: TemplateRef, static: false}) tableRows: TemplateRef<any>;
	title:any  = 'test';
	public sort = false;
	public perPage = false;
	public selected_opt:any = {};
    constructor() {
    }
    ngOnInit() {
    	setTimeout(()=> {
    		console.log(this.tableRows);
    	}, 5000);
    }
}
