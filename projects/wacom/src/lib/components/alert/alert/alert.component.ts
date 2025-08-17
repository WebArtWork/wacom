import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
	AlertButton,
	AlertPosition,
	AlertType,
} from '../../../interfaces/alert.interface';

@Component({
	selector: 'alert',
	templateUrl: './alert.component.html',
	styleUrls: ['./alert.component.scss'],
	imports: [CommonModule],
})
export class AlertComponent implements OnInit {
	@ViewChild('alertRef', { static: false }) alertRef: any;

	close: () => void = () => {};

	text: string = '';

	class: string = '';

	type: AlertType = 'info';

	position: AlertPosition = 'bottomRight';

	progress: boolean = true;

	icon: string = '';

	timeout: number = 5000;

	closable: boolean = true;

	delete_animation = false;

	buttons: AlertButton[] = [];

	ngOnInit(): void {
		if (this.timeout) {
			let remaining = JSON.parse(JSON.stringify(this.timeout));

			let timer: number = window.setTimeout(() => {
				this.remove();
			}, remaining);

			let start = new Date();

			this.alertRef.nativeElement.addEventListener(
				'mouseenter',
				() => {
					clearTimeout(timer);

					remaining -= new Date().getTime() - start.getTime();
				},
				false
			);

			this.alertRef.nativeElement.addEventListener(
				'mouseleave',
				() => {
					start = new Date();

					clearTimeout(timer);

					timer = window.setTimeout(() => {
						this.remove();
					}, remaining);
				},
				false
			);
		}
	}

	remove() {
		this.delete_animation = true;

		setTimeout(() => {
			this.close();

			this.delete_animation = false;
		}, 350);
	}
}
