/**
 * Utility helpers for meta management.
 *
 * We intentionally treat `undefined` as "missing" and everything else as "provided".
 * This lets callers pass empty strings to intentionally clear a value:
 * - isDefined(undefined) -> false  (use defaults)
 * - isDefined('')        -> true   (explicitly set empty string)
 * - isDefined(null)      -> true   (explicitly provided, will stringify if used)
 */
export const isDefined = (val: unknown): val is Exclude<unknown, undefined> =>
	typeof val !== 'undefined';
