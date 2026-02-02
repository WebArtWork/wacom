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
    provideWacom()
  ]
});
```

For a full list of services and APIs see [projects/wacom/README.md](projects/wacom/README.md).
