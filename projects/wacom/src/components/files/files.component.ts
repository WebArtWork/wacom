import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
	selector: 'lib-files',
	templateUrl: './files.component.html',
	imports: [CommonModule],
})
export class FilesComponent {
	fs: any;
}
