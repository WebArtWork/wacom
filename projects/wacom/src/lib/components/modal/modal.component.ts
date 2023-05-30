import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'lib-modal',
	templateUrl: './modal.component.html',
	styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
	class: string = '';
	size: string = 'flex';
	closable: boolean = true;
	close: any;
	onOpen: any;
	onClickOutside: any;
	timestart: any;
	timeout: any;
	showModal = false;
	allowClose = true;
	ngOnInit() {
		if (typeof this.onClickOutside !== 'function') {
			this.onClickOutside = () => {
				if (this.allowClose) {
					this.close();
				}
				this.allowClose = true;
			};
		}
		if (typeof this.onOpen == 'function') this.onOpen();
	}
	ngAfterViewInit() {
		setTimeout(() => {
			this.showModal = true;
		}, this.timestart || 0);
	}
}
