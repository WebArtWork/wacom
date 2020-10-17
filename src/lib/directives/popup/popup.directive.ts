import { Directive, ElementRef, HostListener, Input, ComponentFactoryResolver, EmbeddedViewRef, ApplicationRef, Injector, ComponentRef, OnInit, Output, EventEmitter, OnDestroy, Inject, Optional } from '@angular/core';
import { PopupComponent } from './popup.component';
import { PopupOptionsService } from './popup-options.service';
import { defaultOptions, backwardCompatibilityOptions } from './options';
import { PopupOptions } from './popup-options.interface';

export interface AdComponent {
    data: any;
    show: boolean;
    close: boolean;
    events: any;
}

@Directive({
    selector: '[popup]',
    exportAs: 'popup',
})

export class PopupDirective {

    hideTimeoutId: number;
    destroyTimeoutId: number;
    hideAfterClickTimeoutId: number;
    createTimeoutId: number;
    showTimeoutId: number;
    componentRef: any;
    elementPosition: any;
    _showDelay: any = 0;
    _hideDelay: number = 300;
    _id: any;
    _options: any = {};
    _defaultOptions: any;
    _destroyDelay: number;
    componentSubscribe: any;

    @Input('options') set options(value: PopupOptions) {
        if (value && defaultOptions) {
            this._options = value;
        }
    }
    get options() {
        return this._options;
    }

    @Input('popup') popupValue: string;
    @Input('placement') placement: string;
    @Input('autoPlacement') autoPlacement: boolean;
    @Input('content-type') contentType: string;
    @Input('hide-delay-mobile') hideDelayMobile: number;
    @Input('hideDelayTouchscreen') hideDelayTouchscreen: number;
    @Input('z-index') zIndex: number;
    @Input('animation-duration') animationDuration: number;
    @Input('trigger') trigger: string;
    @Input('popup-class') popupClass: string;
    @Input('display') display: boolean;
    @Input('display-mobile') displayMobile: boolean;
    @Input('displayTouchscreen') displayTouchscreen: boolean;
    @Input('shadow') shadow: boolean;
    @Input('theme') theme: boolean;
    @Input('offset') offset: number;
    @Input('width') width: number;
    @Input('max-width') maxWidth: number;
    @Input('id') id: any;
    @Input('show-delay') showDelay: number;
    @Input('hide-delay') hideDelay: number;
    @Input('hideDelayAfterClick') hideDelayAfterClick: number;
    @Input('pointerEvents') pointerEvents: 'auto' | 'none';
    @Input('position') position: {top: number, left: number};

    get isPopupDestroyed() {
        return this.componentRef && this.componentRef.hostView.destroyed;
    }

    get destroyDelay() {
        if (this._destroyDelay) {
            return this._destroyDelay;
        } else {
            return Number(this.getHideDelay()) + Number(this.options['animationDuration']);
        }
    }
    set destroyDelay(value: number) {
        this._destroyDelay = value;
    }

    get popupPosition() {
        if (this.options['position']) {
            return this.options['position'];
        } else {
            return this.elementPosition;
        }
    }

    @Output() events: EventEmitter < any > = new EventEmitter < any > ();

    constructor(
        @Optional() @Inject(PopupOptionsService) private initOptions,
        private elementRef: ElementRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector) {}

    @HostListener('focusin')
    @HostListener('mouseenter')
    onMouseEnter() {
        if (this.isDisplayOnHover == false) {
            return;
        }

        this.show();
    }

    @HostListener('focusout')
    @HostListener('mouseleave')
    onMouseLeave() {
        if (this.options['trigger'] === 'hover') {
            this.destroyPopup();
        }
    }

    @HostListener('click')
    onClick() {
        if (this.isDisplayOnClick == false) {
            return;
        }

        this.show();
        this.hideAfterClickTimeoutId = window.setTimeout(() => {
            this.destroyPopup();
        }, this.options['hideDelayAfterClick'])
    }

    ngOnInit(): void {
    }

    ngOnChanges(changes) {
        this.initOptions = this.renameProperties(this.initOptions);
        let changedOptions = this.getProperties(changes);
        changedOptions = this.renameProperties(changedOptions);

        this.applyOptionsDefault(defaultOptions, changedOptions);
    }

    ngOnDestroy(): void {
        this.destroyPopup({
            fast: true
        });

        if (this.componentSubscribe) {
            this.componentSubscribe.unsubscribe();
        }
    }

    getShowDelay() {
        return this.options['showDelay'];
    }

    getHideDelay() {
        const hideDelay = this.options['hideDelay'];
        const hideDelayTouchscreen = this.options['hideDelayTouchscreen'];

        return this.isTouchScreen ? hideDelayTouchscreen : hideDelay;
    }

    getProperties(changes){
        let directiveProperties:any = {};
        let customProperties:any = {};
        let allProperties:any = {};

        for (var prop in changes) {
            if (prop !== 'options' && prop !== 'popupValue'){
                directiveProperties[prop] = changes[prop].currentValue;
            }
            if (prop === 'options'){
                customProperties = changes[prop].currentValue;
            }
        }

        allProperties = Object.assign({}, customProperties, directiveProperties);
        return allProperties;
    }

    renameProperties(options: PopupOptions) {
        for (var prop in options) {
            if (backwardCompatibilityOptions[prop]) {
                options[backwardCompatibilityOptions[prop]] = options[prop];
                delete options[prop];
            }
        }

        return options;
    }

    getElementPosition(): void {
        this.elementPosition = this.elementRef.nativeElement.getBoundingClientRect();
    }

    createPopup(): void {
        this.clearTimeouts();
        this.getElementPosition();

        this.createTimeoutId = window.setTimeout(() => {
            this.appendComponentToBody(PopupComponent);
        }, this.getShowDelay());

        this.showTimeoutId = window.setTimeout(() => {
            this.showPopupElem();
        }, this.getShowDelay());
    }

    destroyPopup(options = {
        fast: false
    }): void {
        this.clearTimeouts();

        if (this.isPopupDestroyed == false) {
            this.hideTimeoutId = window.setTimeout(() => {
                this.hidePopup();
            }, options.fast ? 0 : this.getHideDelay());

            this.destroyTimeoutId = window.setTimeout(() => {
                if (!this.componentRef || this.isPopupDestroyed) {
                    return;
                }

                this.appRef.detachView(this.componentRef.hostView);
                this.componentRef.destroy();
                this.events.emit({
                    type: 'hidden', 
                    position: this.popupPosition
                });
            }, options.fast ? 0 : this.destroyDelay);
        }
    }

    showPopupElem(): void {
        this.clearTimeouts();
        ( < AdComponent > this.componentRef.instance).show = true;
        this.events.emit({
            type: 'show',
            position: this.popupPosition
        });
    }

    hidePopup(): void {
        if (!this.componentRef || this.isPopupDestroyed) {
            return;
        }
        ( < AdComponent > this.componentRef.instance).show = false;
        this.events.emit({
            type: 'hide',
            position: this.popupPosition
        });
    }

    appendComponentToBody(component: any, data: any = {}): void {
        this.componentRef = this.componentFactoryResolver
            .resolveComponentFactory(component)
            .create(this.injector);

        ( < AdComponent > this.componentRef.instance).data = {
            value: this.popupValue,
            element: this.elementRef.nativeElement,
            elementPosition: this.popupPosition,
            options: this.options
        }
        this.appRef.attachView(this.componentRef.hostView);
        const domElem = (this.componentRef.hostView as EmbeddedViewRef < any > ).rootNodes[0] as HTMLElement;
        document.body.appendChild(domElem);

        this.componentSubscribe = ( < AdComponent > this.componentRef.instance).events.subscribe((event: any) => {
            this.handleEvents(event);
        });
    }

    clearTimeouts(): void {
        if (this.createTimeoutId) {
            clearTimeout(this.createTimeoutId);
        }

        if (this.showTimeoutId) {
            clearTimeout(this.showTimeoutId);
        }

        if (this.hideTimeoutId) {
            clearTimeout(this.hideTimeoutId);
        }

        if (this.destroyTimeoutId) {
            clearTimeout(this.destroyTimeoutId);
        }
    }

    get isDisplayOnHover(): boolean {
        if (this.options['display'] == false) {
            return false;
        }

        if (this.options['displayTouchscreen'] == false && this.isTouchScreen) {
            return false;
        }

        if (this.options['trigger'] !== 'hover') {
            return false;
        }

        return true;
    }

    get isDisplayOnClick(): boolean {
        if (this.options['display'] == false) {
            return false;
        }

        if (this.options['displayTouchscreen'] == false && this.isTouchScreen) {
            return false;
        }

        if (this.options['trigger'] != 'click') {
            return false;
        }

        return true;
    }

    get isTouchScreen() {
        var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
        var mq = function(query) {
            return window.matchMedia(query).matches;
        }

        if (('ontouchstart' in window)) {
            return true;
        }

        // include the 'heartz' as a way to have a non matching MQ to help terminate the join
        // https://git.io/vznFH
        var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return mq(query);
    }

    applyOptionsDefault(defaultOptions, options): void {
        this.options = Object.assign({}, defaultOptions, this.initOptions || {}, options);
    }

    handleEvents(event: any) {
        if (event.type === 'shown') {
            this.events.emit({
                type: 'shown',
                position: this.popupPosition
            });
        }
    }

    public show() {
        if (!this.componentRef || this.isPopupDestroyed) {
            this.createPopup();
        } else if (!this.isPopupDestroyed) {
            this.showPopupElem();
        }
    }

    public hide() {
        this.destroyPopup();
    }
}
