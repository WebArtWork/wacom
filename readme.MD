# Wacom

Angular utility library providing common services, components and utilities for your applications.

## Installation

```bash
npm i --save wacom
```

## Quick start

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideWacom } from 'wacom';

bootstrapApplication(AppComponent, {
  providers: [
    provideWacom({
      // optional configuration
      theme: {
        primary: '#1976d2',
        secondary: '#424242',
        info: '#29b6f6',
        error: '#ef5350',
        success: '#66bb6a',
        warning: '#ffa726',
        question: '#fff59d'
      }
    })
  ]
});
```

### Theming

The `theme` section of the configuration lets you customise the colours used by built‑in Wacom components. The values are exposed as CSS custom properties on the document root:

- `--wacom-primary`
- `--wacom-secondary`
- `--wacom-info`
- `--wacom-error`
- `--wacom-success`
- `--wacom-warning`
- `--wacom-question`

Use these variables in your global styles to keep your application consistent with the library theme.

For a full list of services and APIs see [projects/wacom/README.md](projects/wacom/README.md).
