// network.service.ts — Angular 20+ (zoneless) signal-based connectivity checker
import { inject, Inject, Injectable, Optional, signal } from '@angular/core';
import { Config, CONFIG_TOKEN } from '../interfaces/config.interface';
import {
	DEFAULT_NETWORK_CONFIG,
	NetworkConfig,
	NetworkStatus,
} from '../interfaces/network.interface';
import { EmitterService } from './emitter.service';

@Injectable({ providedIn: 'root' })
export class NetworkService {
	/** Internal mutable signals. */
	private _status = signal<NetworkStatus>(navigator.onLine ? 'poor' : 'none');
	private _latencyMs = signal<number | null>(null);
	private _isOnline = signal<boolean>(navigator.onLine);

	/** Public read-only signals. */
	readonly status = this._status.asReadonly();
	readonly latencyMs = this._latencyMs.asReadonly();
	readonly isOnline = this._isOnline.asReadonly();

	/** Failure counter to decide "none". */
	private fails = 0;

	/**
	 * Creates the network monitor, binds browser/Capacitor events,
	 * performs an immediate check, and starts periodic polling.
	 */
	constructor(@Inject(CONFIG_TOKEN) @Optional() config: Config) {
		this._config = {
			...DEFAULT_NETWORK_CONFIG,
			...(config.network || ({} as NetworkConfig)),
		};

		this._bindEvents();

		this.recheckNow(); // fire once on start

		window.setInterval(() => this.recheckNow(), this._config.intervalMs);
	}

	/**
	 * Manually trigger a connectivity check.
	 * - Measures latency against the first reachable endpoint.
	 * - Updates `isOnline`, `latencyMs`, and `status` accordingly.
	 */
	async recheckNow(): Promise<void> {
		const res = await this._pingAny();

		if (res.ok && res.latency != null) {
			this.fails = 0;

			this._latencyMs.set(res.latency);

			this._isOnline.set(true);
		} else {
			this.fails++;

			this._latencyMs.set(null);
			// `isOnline` may still be true per OS; we let online/offline events keep it in sync.
		}

		this._updateClassification();
	}

	// ─────────────────────────── Internals ───────────────────────────

	/**
	 * Classifies current state into 'good' | 'poor' | 'none'.
	 * - 'none' if offline or too many consecutive failures.
	 * - 'good' if latency ≤ goodLatencyMs.
	 * - otherwise 'poor'.
	 */
	private _updateClassification(): void {
		if (
			!this._isOnline() ||
			this.fails >= this._config.maxConsecutiveFails
		) {
			if (this._status() !== 'none') {
				this._status.set('none');

				this._emitterService.emit('wacom_offline');
			}

			return;
		}

		const l = this._latencyMs();

		if (l != null && l <= this._config.goodLatencyMs) {
			if (this._status() !== 'good') {
				this._status.set('good');

				this._emitterService.emit('wacom_online');
			}
		} else if (this._status() !== 'poor') {
			this._status.set('poor');

			this._emitterService.emit('wacom_online');
		}
	}

	/**
	 * Binds browser events that can affect connectivity:
	 * - online/offline (OS connectivity)
	 * - visibilitychange (recheck on focus)
	 * - NetworkInformation 'change' (if supported)
	 */
	private _bindEvents(): void {
		window.addEventListener('online', () => {
			this._isOnline.set(true);

			this.recheckNow();
		});

		window.addEventListener('offline', () => {
			this._isOnline.set(false);

			this._updateClassification();
		});

		(navigator as any).connection?.addEventListener?.('change', () =>
			this.recheckNow(),
		);
	}

	/**
	 * Tries endpoints in order until one responds (CORS or opaque).
	 * Returns success with measured latency, or a failure result.
	 */
	private async _pingAny(): Promise<{ ok: boolean; latency: number | null }> {
		for (const url of this._config.endpoints) {
			const noCors = !url.includes('api.webart.work'); // treat public fallbacks as opaque checks

			const r = await this._measure(
				url,
				this._config.timeoutMs,
				noCors,
			).catch(() => null);

			if (r?.ok) return r;
		}

		return { ok: false, latency: null };
	}

	/**
	 * Measures a single fetch:
	 * - Appends a timestamp to bypass caches.
	 * - Uses `no-store` to avoid intermediaries caching.
	 * - When `noCors` is true, uses `mode:'no-cors'` and treats a resolved fetch as reachable.
	 */
	private async _measure(
		url: string,
		timeoutMs: number,
		noCors = false,
	): Promise<{ ok: boolean; latency: number | null }> {
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), timeoutMs);
		const t0 = performance.now();

		try {
			const res = await fetch(
				url + (url.includes('?') ? '&' : '?') + 't=' + Date.now(),
				{
					method: 'GET',
					cache: 'no-store',
					credentials: 'omit',
					signal: ctrl.signal,
					mode: noCors ? 'no-cors' : 'cors',
				},
			);

			clearTimeout(timer);

			const latency = Math.round(performance.now() - t0);

			// In no-cors, Response is opaque; treat as success if the fetch resolved.
			const ok = noCors ? true : res.ok;

			return { ok, latency };
		} catch {
			clearTimeout(timer);

			return { ok: false, latency: null };
		}
	}

	private _config: NetworkConfig;

	private _emitterService = inject(EmitterService);
}
