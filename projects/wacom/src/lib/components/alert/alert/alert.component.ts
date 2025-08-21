import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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
/**
 * Displays an individual alert message with optional icon, actions and
 * auto‑dismiss behaviour. All inputs are configured by the service when the
 * component is created dynamically.
 */
export class AlertComponent implements AfterViewInit {
	/** Reference to the DOM element hosting the alert. */
	@ViewChild('alertRef') alertRef!: ElementRef<HTMLDivElement>;

	/** Callback invoked to remove the alert from the DOM. */
	close!: () => void;

	/** Text content displayed inside the alert. */
	text!: string;

	/** Additional CSS classes applied to the alert container. */
	class!: string;

	/** Type of alert which determines styling and icon. */
	type: AlertType = 'info';

	/** Position on the screen where the alert appears. */
	position: AlertPosition = 'bottom';

	/** Whether a progress bar indicating remaining time is shown. */
	progress!: boolean;

	/** Icon name displayed alongside the message. */
	icon!: string;

	/** Time in milliseconds before the alert auto closes. */
	timeout!: number;

	/** Determines if a manual close button is visible. */
	closable!: boolean;

	/** Flag used to trigger the deletion animation. */
	delete_animation = false;

	/** Optional action buttons rendered within the alert. */
	buttons: AlertButton[] = [];

	/**
	 * Starts the auto‑dismiss timer and pauses it while the alert is
	 * hovered, resuming when the mouse leaves.
	 */
	ngAfterViewInit(): void {
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

		console.log(this);
	}

	/**
	 * Triggers the closing animation and invokes the provided close
	 * callback once finished.
	 */
	remove() {
		this.delete_animation = true;

		setTimeout(() => {
			this.close();

			this.delete_animation = false;
		}, 350);
	}
}
