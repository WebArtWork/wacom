import { Component } from '@angular/core';

@Component({
    selector: 'lib-files',
    templateUrl: './files.component.html',
    styleUrls: ['./files.component.scss'],
    standalone: false
})
export class FilesComponent{
	public fs:any;
	constructor() {}
}
