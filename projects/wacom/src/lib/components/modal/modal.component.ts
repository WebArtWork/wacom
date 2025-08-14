import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'lib-modal',
        templateUrl: './modal.component.html',
        styleUrls: ['./modal.component.scss'],
        standalone: true,
        imports: [CommonModule],
})
export class ModalComponent implements OnInit {
	class: string = '';
	size: string = 'flex';
	closable: boolean = true;
	close: any;
	onOpen: any;
	timestart: any;
	timeout: any;
	allowClose = true;
	onClickOutside: any;
	ngOnInit() {
		if (typeof this.onClickOutside !== 'function') {
			this.onClickOutside = this.close;
			// this.onClickOutside = () => {
			// 	if (this.allowClose) {
			// 		this.close();
			// 	}

			// 	this.allowClose = true;
			// };
		}

		if (typeof this.onOpen == 'function') this.onOpen();

		window.addEventListener('popstate', this.popStateListener.bind(this));
	}

	ngOnDestroy(): void {
		window.removeEventListener(
			'popstate',
			this.popStateListener.bind(this)
		);
	}

	popStateListener(e: Event) {
		this.close();
	}
}
