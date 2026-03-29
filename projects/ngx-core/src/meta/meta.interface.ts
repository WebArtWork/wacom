/**
 * High-level page metadata (route-driven or manual).
 *
 * Keep it simple:
 * - title, description, image are the only "content" fields you set.
 * - everything else (og/twitter/itemprop variants) is generated automatically.
 * - links are managed separately via MetaService.setLink().
 */
export interface MetaPage {
	/** Document title (without suffix). */
	title?: string;

	/** Optional per-page suffix override (used only when useTitleSuffix = true). */
	titleSuffix?: string;

	/** Standard description (mirrored to OG/Twitter + itemprop). */
	description?: string;

	/** Absolute URL to image (mirrored to OG/Twitter + itemprop). */
	image?: string;

	/**
	 * Indexing flag.
	 * - index: true  -> "index, follow" (unless robots is explicitly provided)
	 * - index: false -> "noindex, follow" (unless robots is explicitly provided)
	 */
	index?: boolean;

	/**
	 * Explicit robots directive (takes precedence over index if provided).
	 * Example: "noindex, nofollow" or "index, follow, max-image-preview:large"
	 */
	robots?: string;

	/**
	 * Disable any updates for this page.
	 * Useful for pages that fully manage meta themselves.
	 */
	disableUpdate?: boolean;
}

/**
 * Defaults applied to every route/page, and used for reset().
 */
export interface MetaDefaults extends MetaPage {
	/**
	 * Default link tags (e.g. canonical).
	 * This is not auto-generated because canonical depends on domain + route policy.
	 */
	links?: Record<string, string>;
}

/**
 * Options controlling behavior of the meta management.
 */
export interface MetaConfig {
	/**
	 * Whether to append configured titleSuffix to titles.
	 * - If true: title = (page.title ?? defaults.title) + (page.titleSuffix ?? defaults.titleSuffix)
	 * - If false: title = (page.title ?? defaults.title)
	 */
	useTitleSuffix?: boolean;

	/**
	 * Automatically apply route meta on each NavigationEnd.
	 * Recommended: true (prevents "forgot MetaGuard" issues).
	 */
	applyFromRoutes?: boolean;

	/** Default metadata applied to all routes/pages. */
	defaults?: MetaDefaults;
}
