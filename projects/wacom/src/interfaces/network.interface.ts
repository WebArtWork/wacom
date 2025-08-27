import { InjectionToken } from '@angular/core';

export type NetworkStatus = 'good' | 'poor' | 'none';

export interface NetworkConfig {
	/** Ordered list of endpoints to probe (first that succeeds wins). */
	endpoints: string[];
	/** Periodic re-check interval (ms). */
	intervalMs: number;
	/** Per-request timeout (ms). */
	timeoutMs: number;
	/** Latency threshold (ms) to classify as "good". */
	goodLatencyMs: number;
	/** Consecutive failures to flip status to "none". */
	maxConsecutiveFails: number;
}

export const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
	endpoints: [
		'https://api.webart.work/status',
		// Opaque but useful reachability fallbacks:
		'https://www.google.com/generate_204',
		'https://www.gstatic.com/generate_204',
		'https://www.cloudflare.com/cdn-cgi/trace',
	],
	intervalMs: 30_000,
	timeoutMs: 2_500,
	goodLatencyMs: 300,
	maxConsecutiveFails: 3,
};

export const NETWORK_CONFIG = new InjectionToken<NetworkConfig>(
	'NETWORK_CONFIG',
	{
		factory: () => DEFAULT_NETWORK_CONFIG,
	},
);
