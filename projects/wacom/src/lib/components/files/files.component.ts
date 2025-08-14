import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'lib-files',
        templateUrl: './files.component.html',
        styleUrls: ['./files.component.scss'],
        standalone: true,
        imports: [CommonModule],
})
export class FilesComponent {
	public fs: any;
	constructor() {}
}
