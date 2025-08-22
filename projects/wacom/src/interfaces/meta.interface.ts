export interface MetaDefaults {
	title?: string;
	titleSuffix?: string;
	links?: Record<string, string>;
	[key: string]: string | Record<string, string> | undefined;
}

export interface MetaConfig {
	useTitleSuffix?: boolean;
	warnMissingGuard?: boolean;
	defaults?: MetaDefaults;
}
