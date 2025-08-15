export interface StoreConfig {
	prefix?: string;
	set?: (
		field: string,
		value: string | number,
		cb?: () => void,
		errCb?: (err: unknown) => void
	) => Promise<boolean>;
	get?: (
		field: string,
		cb?: (value: string) => void,
		errCb?: (err: unknown) => void
	) => Promise<string>;
	remove?: (
		field: string,
		cb?: () => void,
		errCb?: (err: unknown) => void
	) => Promise<boolean>;
	clear?: (
		cb?: () => void,
		errCb?: (err: unknown) => void
	) => Promise<boolean>;
}
