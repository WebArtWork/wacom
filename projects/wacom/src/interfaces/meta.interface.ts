/**
 * Default metadata values applied to every route.
 */
export interface MetaDefaults {
	/** Base document title. */
	title?: string;
	/** Suffix appended to titles when {@link MetaConfig.useTitleSuffix} is true. */
	titleSuffix?: string;
	/** Map of link tags (e.g. canonical URLs). */
	links?: Record<string, string>;
	[key: string]: string | Record<string, string> | undefined;
}

/**
 * Options controlling the behavior of the meta service.
 */
export interface MetaConfig {
	/** Whether to append the configured titleSuffix to page titles. */
	useTitleSuffix?: boolean;
	/** Emit console warnings when routes are missing a guard. */
	warnMissingGuard?: boolean;
	/** Default metadata applied to all routes. */
	defaults?: MetaDefaults;
}
