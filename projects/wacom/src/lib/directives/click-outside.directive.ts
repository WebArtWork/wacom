import {
	Directive,
	ElementRef,
	EventEmitter,
	Output,
	HostListener,
} from '@angular/core';

@Directive({
	selector: '[clickOutside]',
	standalone: false,
})
export class ClickOutsideDirective {
	@Output() clickOutside: EventEmitter<Event> = new EventEmitter<Event>();

	constructor(private elementRef: ElementRef) {}

	@HostListener('document:click', ['$event'])
	onClick(event: Event): void {
		const clickedInside = this.elementRef.nativeElement.contains(
			event.target
		);
		if (!clickedInside) {
			this.clickOutside.emit(event);
		}
	}
}
