import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
	templateUrl: './loader.component.html',
	styleUrls: ['./loader.component.scss'],
	imports: [CommonModule],
})
export class LoaderComponent implements OnInit {
	close!: () => void;

	text!: string;

	class!: string;

	progress!: boolean;

	timeout!: number;

	closable!: boolean;

	ngOnInit(): void {
		if (this.timeout) {
			setTimeout(() => {
				this.close();
			}, this.timeout);
		}
	}
}
