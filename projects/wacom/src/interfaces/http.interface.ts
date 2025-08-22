export interface HttpConfig {
	headers?: Record<string, unknown>;
	url?: string;
}

export const DEFAULT_HTTP_CONFIG: HttpConfig = {
	headers: {},
	url: '',
};
