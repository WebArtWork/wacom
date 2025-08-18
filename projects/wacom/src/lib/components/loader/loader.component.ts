import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
	templateUrl: './loader.component.html',
	imports: [CommonModule],
})
export class LoaderComponent {
	close!: () => void;

	text!: string;

	class!: string;

	progress!: boolean;

	timeout!: number;

	closable!: boolean;

	constructor() {
		if (this.timeout) {
			setTimeout(() => {
				this.close();
			}, this.timeout);
		}
	}
}
