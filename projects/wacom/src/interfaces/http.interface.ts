/**
 * Configuration values used by the HTTP service when
 * issuing requests to a backend API.
 */
export interface HttpConfig {
	/** Map of default headers appended to each request. */
	headers?: Record<string, unknown>;
	/** Base URL for all HTTP requests. */
	url?: string;
}

export const DEFAULT_HTTP_CONFIG: HttpConfig = {
	headers: {},
	url: '',
};
