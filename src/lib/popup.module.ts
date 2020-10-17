import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopupDirective } from './directives/popup/popup.directive';
import { PopupComponent } from './directives/popup/popup.component';
import { PopupOptions } from './directives/popup/popup-options.interface';
import { PopupOptionsService } from './directives/popup/popup-options.service';

@NgModule({
    declarations: [
        PopupDirective,
        PopupComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        PopupDirective
    ],
    entryComponents: [
        PopupComponent
    ]
})
export class PopupModule {

    static forRoot(initOptions: PopupOptions): ModuleWithProviders<PopupModule> {
        return {
            ngModule: PopupModule,
            providers: [
                {
                    provide: PopupOptionsService,
                    useValue: initOptions
                }
            ]
        };
    }
}
