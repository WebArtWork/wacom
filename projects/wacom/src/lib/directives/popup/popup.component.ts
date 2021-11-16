import {Component, ElementRef, HostListener, HostBinding, Input, OnInit, EventEmitter, Renderer2} from '@angular/core';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'popup',
    templateUrl: './popup.component.html',
    host: {
        'class': 'popup'
    },
    styleUrls: ['./popup.component.sass']
})

export class PopupComponent {
    _show: boolean = false;
    events = new EventEmitter();

    @Input() data: any;

    @HostBinding('style.top') hostStyleTop: string;
    @HostBinding('style.left') hostStyleLeft: string;
    @HostBinding('style.z-index') hostStyleZIndex: number;
    @HostBinding('style.transition') hostStyleTransition: string;
    @HostBinding('style.width') hostStyleWidth: string;
    @HostBinding('style.max-width') hostStyleMaxWidth: string;
    @HostBinding('style.pointer-events') hostStylePointerEvents: string;
    @HostBinding('class.popup-show') hostClassShow: boolean;
    @HostBinding('class.popup-shadow') hostClassShadow: boolean;
    @HostBinding('class.popup-light') hostClassLight: boolean;

    @HostListener('transitionend', ['$event'])
    transitionEnd(event) {
        if (this.show) {
            this.events.emit({
                type: 'shown'
            });
        }
    }

    @Input() set show(value: boolean) {
        if (value) {
            this.setPosition();
        }
        this._show = this.hostClassShow = value;
    }
    get show(): boolean {
        return this._show;
    }

    get placement() {
        return this.data.options.placement;
    }

    get autoPlacement() {
        return this.data.options.autoPlacement;
    }

    get element() {
        return this.data.element;
    }

    get elementPosition() {
        return this.data.elementPosition;
    }

    get options() {
        return this.data.options;
    }

    get value() {
        return this.data.value;
    }

    get popupOffset(): number {
        return Number(this.data.options.offset);
    }

    get isThemeLight() {
        return this.options['theme'] === 'light';
    }

    constructor(private elementRef: ElementRef, private renderer: Renderer2, public core: CoreService) {}

    ngOnInit() {
        this.setCustomClass();
        this.setStyles();
    }

    setPosition(): void {
        if (this.setHostStyle(this.placement)) {
            this.setPlacementClass(this.placement);
            return;
        } else {
            /* Is popup outside the visible area */
            const placements = ['top', 'right', 'bottom', 'left'];
            let isPlacementSet;

            for (const placement of placements) {
                if (this.setHostStyle(placement)) {
                    this.setPlacementClass(placement);
                    isPlacementSet = true;
                    return;
                }
            }

            /* Set original placement */
            if (!isPlacementSet) {
                this.setHostStyle(this.placement, true);
                this.setPlacementClass(this.placement);
            }
        }
    }


    setPlacementClass(placement: string): void {
        this.renderer.addClass(this.elementRef.nativeElement, 'popup-' + placement);
    }

    setHostStyle(placement: string, disableAutoPlacement: boolean = false): boolean {
        const isSvg = this.element instanceof SVGElement;
        const popup = this.elementRef.nativeElement;
        const isCustomPosition = !this.elementPosition.right;

        let elementHeight = isSvg ? this.element.getBoundingClientRect().height : this.element.offsetHeight;
        let elementWidth = isSvg ? this.element.getBoundingClientRect().width : this.element.offsetWidth;
        const popupHeight = popup.clientHeight;
        const popupWidth = popup.clientWidth;
        const scrollY = this.core.window.pageYOffset;

        if (isCustomPosition) {
            elementHeight = 0;
            elementWidth = 0;
        }

        let topStyle;
        let leftStyle;

        if (placement === 'top') {
            topStyle = (this.elementPosition.top + scrollY) - (popupHeight + this.popupOffset);
        }

        if (placement === 'bottom') {
            topStyle = (this.elementPosition.top + scrollY) + elementHeight + this.popupOffset;
        }

        if (placement === 'top' || placement === 'bottom') {
            leftStyle = (this.elementPosition.left + elementWidth / 2) - popupWidth / 2;
        }

        if (placement === 'left') {
            leftStyle = this.elementPosition.left - popupWidth - this.popupOffset;
        }

        if (placement === 'right') {
            leftStyle = this.elementPosition.left + elementWidth + this.popupOffset;
        }

        if (placement === 'left' || placement === 'right') {
            topStyle = (this.elementPosition.top + scrollY) + elementHeight / 2 - popup.clientHeight / 2;
        }

        /* Is popup outside the visible area */
        if (this.autoPlacement && !disableAutoPlacement) {
            const topEdge = topStyle;
            const bottomEdge = topStyle + popupHeight;
            const leftEdge = leftStyle;
            const rightEdge = leftStyle + popupWidth;
            const bodyHeight = this.core.window.innerHeight + scrollY;
            const bodyWidth = this.core.document.body.clientWidth;

            if (topEdge < 0 || bottomEdge > bodyHeight || leftEdge < 0 || rightEdge > bodyWidth) {
                return false;
            }
        }

        this.hostStyleTop = topStyle + 'px';
        this.hostStyleLeft = leftStyle + 'px';
        return true;
    }

    setZIndex(): void {
        if (this.options['zIndex'] !== 0) {
            this.hostStyleZIndex = this.options['zIndex'];
        }
    }

    setPointerEvents(): void {
        if (this.options['pointerEvents']) {
            this.hostStylePointerEvents = this.options['pointerEvents'];
        }
    }

    setCustomClass(){
        if (this.options['popupClass']) {
            this.options['popupClass'].split(' ').forEach(className => {
                this.renderer.addClass(this.elementRef.nativeElement, className);
            });
        }
    }

    setAnimationDuration() {
        if (Number(this.options['animationDuration']) != this.options['animationDurationDefault']) {
            this.hostStyleTransition = 'opacity ' + this.options['animationDuration'] + 'ms';
        }
    }

    setStyles() {
        this.setZIndex();
        this.setPointerEvents();
        this.setAnimationDuration();

        this.hostClassShadow = this.options['shadow'];
        this.hostClassLight = this.isThemeLight;
        this.hostStyleMaxWidth = this.options['maxWidth'] + "px";
        this.hostStyleWidth = this.options['width'] ? this.options['width'] + "px" : '';
    }
}
