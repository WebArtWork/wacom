import { InjectionToken } from '@angular/core';
import { PopupOptions } from './popup-options.interface';

/**
 * This is not a real service, but it looks like it from the outside.
 * It's just an InjectionToken used to import the config (initOptions) object, provided from the outside
 */
export const PopupOptionsService = new InjectionToken<PopupOptions>('PopupOptions');
