import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from './interfaces/config';

export function provideWacom(
        config: Config = DEFAULT_CONFIG
): EnvironmentProviders {
        return makeEnvironmentProviders([
                { provide: CONFIG_TOKEN, useValue: config },
                provideHttpClient(withInterceptorsFromDi()),
        ]);
}
