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
	providers: [provideWacom()],
});
```

For a full list of services and APIs see [projects/wacom/README.md](projects/wacom/README.md).

## AGENTS.md

Copy this into `AGENTS.md`.

```md
Wacom is an Angular utility library that provides shared services, directives, pipes, interfaces, and configuration for apps. It is SSR-safe by design: the library guards browser-only APIs so Angular Universal / SSR can render normally, while browser-specific features degrade gracefully on the server or activate only in the browser runtime. Bootstrap via `provideWacom()` (or legacy `WacomModule`), configure `http`, `store`, `meta`, `network`, and optional `socket/io`; core capabilities include `CoreService` helpers (device detection, ids, debounce, signals), `HttpService` with headers and CRUD-style callbacks/observables, `StoreService` storage helpers, `MetaService` with route-driven and manual SEO tags plus link management and optional `MetaGuard`, `CrudService` for offline-aware data syncing with signals, `EmitterService` for app-wide events and completion tasks, `DomService` for dynamic component rendering, `NetworkService` for connectivity monitoring, `SocketService` for realtime messaging, `RtcService` for browser WebRTC flows, `TimeService` for date utilities, `UtilService` for assorted helpers, `ThemeService` and `TranslateService`, and common directives/pipes like click-outside, manual-* attributes, and array/search/safe/pagination helpers.
```
