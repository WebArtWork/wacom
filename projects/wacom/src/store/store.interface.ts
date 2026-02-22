/**
 * Configuration for the storage abstraction used by the library.
 */
export interface StoreConfig {
	/** Key prefix applied to all stored values. */
	prefix?: string;
	/** Persist a value under the given field name. */
	set?: (
		field: string,
		value: string | number,
		cb?: () => void,
		errCb?: (err: unknown) => void,
	) => Promise<boolean>;
	/** Retrieve a value by field name. */
	get?: (
		field: string,
		cb?: (value: string) => void,
		errCb?: (err: unknown) => void,
	) => Promise<string>;
	/** Remove a stored value. */
	remove?: (
		field: string,
		cb?: () => void,
		errCb?: (err: unknown) => void,
	) => Promise<boolean>;
	/** Clear all stored values created by the library. */
	clear?: (
		cb?: () => void,
		errCb?: (err: unknown) => void,
	) => Promise<boolean>;
}

export interface StoreOptions<T = unknown> {
	onSuccess?: (value?: T | null) => void;
	onError?: (err: unknown) => void;
	defaultValue?: T;
	clearOnError?: boolean;
}
