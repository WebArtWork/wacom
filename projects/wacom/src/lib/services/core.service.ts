import {
	Injectable,
	Inject,
	PLATFORM_ID,
	Signal,
	WritableSignal,
	signal,
} from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Selectitem } from '../interfaces/select.item.interface';

// Add capitalize method to String prototype if it doesn't already exist
if (!String.prototype.capitalize) {
	String.prototype.capitalize = function (): string {
		if (this.length > 0) {
			return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
		}
		return '';
	};
}

// Extend the String interface to include the new method
declare global {
	interface String {
		capitalize(): string;
	}
}

@Injectable({
	providedIn: 'root',
})
export class CoreService {
	deviceID =
		localStorage.getItem('deviceID') ||
		(typeof crypto?.randomUUID === 'function'
			? crypto.randomUUID()
			: this.UUID());

	constructor(@Inject(PLATFORM_ID) private platformId: boolean) {
		localStorage.setItem('deviceID', this.deviceID);

		this.detectDevice();
	}

	/**
	 * Generates a UUID (Universally Unique Identifier) version 4.
	 *
	 * This implementation uses `Math.random()` to generate random values,
	 * making it suitable for general-purpose identifiers, but **not** for
	 * cryptographic or security-sensitive use cases.
	 *
	 * The format follows the UUID v4 standard: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
	 * where:
	 * - `x` is a random hexadecimal digit (0–f)
	 * - `4` indicates UUID version 4
	 * - `y` is one of 8, 9, A, or B
	 *
	 * Example: `f47ac10b-58cc-4372-a567-0e02b2c3d479`
	 *
	 * @returns A string containing a UUID v4.
	 */
	UUID(): string {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
			/[xy]/g,
			(c: string) => {
				const r = (Math.random() * 16) | 0;
				const v = c === 'x' ? r : (r & 0x3) | 0x8;
				return v.toString(16);
			}
		);
	}

	/**
	 * Converts an object to an array. Optionally holds keys instead of values.
	 *
	 * @param {any} obj - The object to be converted.
	 * @param {boolean} [holder=false] - If true, the keys will be held in the array; otherwise, the values will be held.
	 * @returns {any[]} The resulting array.
	 */
	ota(obj: any, holder: boolean = false): any[] {
		if (Array.isArray(obj)) return obj;
		if (typeof obj !== 'object' || obj === null) return [];
		const arr = [];
		for (const each in obj) {
			if (
				obj.hasOwnProperty(each) &&
				(obj[each] ||
					typeof obj[each] === 'number' ||
					typeof obj[each] === 'boolean')
			) {
				if (holder) {
					arr.push(each);
				} else {
					arr.push(obj[each]);
				}
			}
		}
		return arr;
	}

	/**
	 * Removes elements from `fromArray` that are present in `removeArray` based on a comparison field.
	 *
	 * @param {any[]} removeArray - The array of elements to remove.
	 * @param {any[]} fromArray - The array from which to remove elements.
	 * @param {string} [compareField='_id'] - The field to use for comparison.
	 * @returns {any[]} The modified `fromArray` with elements removed.
	 */
	splice(
		removeArray: any[],
		fromArray: any[],
		compareField: string = '_id'
	): any[] {
		if (!Array.isArray(removeArray) || !Array.isArray(fromArray)) {
			return fromArray;
		}

		const removeSet = new Set(
			removeArray.map((item) => item[compareField])
		);
		return fromArray.filter((item) => !removeSet.has(item[compareField]));
	}

	/**
	 * Unites multiple _id values into a single unique _id.
	 * The resulting _id is unique regardless of the order of the input _id values.
	 *
	 * @param {...string[]} args - The _id values to be united.
	 * @returns {string} The unique combined _id.
	 */
	ids2id(...args: string[]): string {
		args.sort((a, b) => {
			if (
				Number(a.toString().substring(0, 8)) >
				Number(b.toString().substring(0, 8))
			) {
				return 1;
			}
			return -1;
		});

		return args.join();
	}

	// After While
	private _afterWhile: Record<string, number> = {};
	/**
	 * Delays the execution of a callback function for a specified amount of time.
	 * If called again within that time, the timer resets.
	 *
	 * @param {string | object | (() => void)} doc - A unique identifier for the timer, an object to host the timer, or the callback function.
	 * @param {() => void} [cb] - The callback function to execute after the delay.
	 * @param {number} [time=1000] - The delay time in milliseconds.
	 */
	afterWhile(
		doc: string | object | (() => void),
		cb?: () => void,
		time: number = 1000
	): void {
		if (typeof doc === 'function') {
			cb = doc as () => void;
			doc = 'common';
		}

		if (typeof cb === 'function' && typeof time === 'number') {
			if (typeof doc === 'string') {
				clearTimeout(this._afterWhile[doc]);
				this._afterWhile[doc] = window.setTimeout(cb, time);
			} else if (typeof doc === 'object') {
				clearTimeout((doc as { __afterWhile: number }).__afterWhile);
				(doc as { __afterWhile: number }).__afterWhile =
					window.setTimeout(cb, time);
			} else {
				console.warn('badly configured after while');
			}
		}
	}

	/**
	 * Recursively copies properties from one object to another.
	 * Handles nested objects, arrays, and Date instances appropriately.
	 *
	 * @param from - The source object from which properties are copied.
	 * @param to - The target object to which properties are copied.
	 */
	copy(from: any, to: any) {
		for (const each in from) {
			if (
				typeof from[each] !== 'object' ||
				from[each] instanceof Date ||
				Array.isArray(from[each]) ||
				from[each] === null
			) {
				to[each] = from[each];
			} else {
				if (
					typeof to[each] !== 'object' ||
					to[each] instanceof Date ||
					Array.isArray(to[each]) ||
					to[each] === null
				) {
					to[each] = {};
				}

				this.copy(from[each], to[each]);
			}
		}
	}

	// Device management
	device = '';
	/**
	 * Detects the device type based on the user agent.
	 */
	detectDevice(): void {
		const userAgent =
			navigator.userAgent || navigator.vendor || (window as any).opera;
		if (/windows phone/i.test(userAgent)) {
			this.device = 'Windows Phone';
		} else if (/android/i.test(userAgent)) {
			this.device = 'Android';
		} else if (
			/iPad|iPhone|iPod/.test(userAgent) &&
			!(window as any).MSStream
		) {
			this.device = 'iOS';
		} else {
			this.device = 'Web';
		}
	}

	/**
	 * Checks if the device is a mobile device.
	 * @returns {boolean} - Returns true if the device is a mobile device.
	 */
	isMobile(): boolean {
		return (
			this.device === 'Windows Phone' ||
			this.device === 'Android' ||
			this.device === 'iOS'
		);
	}

	/**
	 * Checks if the device is a tablet.
	 * @returns {boolean} - Returns true if the device is a tablet.
	 */
	isTablet(): boolean {
		return this.device === 'iOS' && /iPad/.test(navigator.userAgent);
	}

	/**
	 * Checks if the device is a web browser.
	 * @returns {boolean} - Returns true if the device is a web browser.
	 */
	isWeb(): boolean {
		return this.device === 'Web';
	}

	/**
	 * Checks if the device is an Android device.
	 * @returns {boolean} - Returns true if the device is an Android device.
	 */
	isAndroid(): boolean {
		return this.device === 'Android';
	}

	/**
	 * Checks if the device is an iOS device.
	 * @returns {boolean} - Returns true if the device is an iOS device.
	 */
	isIos(): boolean {
		return this.device === 'iOS';
	}

	// Version management
	version = '1.0.0';

	appVersion = '';

	dateVersion = '';

	/**
	 * Sets the combined version string based on appVersion and dateVersion.
	 */
	setVersion(): void {
		this.version = this.appVersion || '';

		this.version += this.version && this.dateVersion ? ' ' : '';

		this.version += this.dateVersion || '';
	}

	/**
	 * Sets the app version and updates the combined version string.
	 *
	 * @param {string} appVersion - The application version to set.
	 */
	setAppVersion(appVersion: string): void {
		this.appVersion = appVersion;

		this.setVersion();
	}

	/**
	 * Sets the date version and updates the combined version string.
	 *
	 * @param {string} dateVersion - The date version to set.
	 */
	setDateVersion(dateVersion: string): void {
		this.dateVersion = dateVersion;

		this.setVersion();
	}

	// Signal management
	private _signals: Record<string, Subject<any>> = {};

	/**
	 * Emits a signal, optionally passing data to the listeners.
	 * @param signal - The name of the signal to emit.
	 * @param data - Optional data to pass to the listeners.
	 */
	emit(signal: string, data?: any): void {
		if (!this._signals[signal]) {
			this._signals[signal] = new Subject<any>();
		}

		this._signals[signal].next(data);
	}

	/**
	 * Returns an Observable that emits values when the specified signal is emitted.
	 * Multiple components or services can subscribe to this Observable to be notified of the signal.
	 * @param signal - The name of the signal to listen for.
	 * @returns An Observable that emits when the signal is emitted.
	 */
	on(signal: string): Observable<any> {
		if (!this._signals[signal]) {
			this._signals[signal] = new Subject<any>();
		}

		return this._signals[signal].asObservable();
	}

	/**
	 * Completes the Subject for a specific signal, effectively stopping any future emissions.
	 * This also unsubscribes all listeners for the signal.
	 * @param signal - The name of the signal to stop.
	 */
	off(signal: string): void {
		if (!this._signals[signal]) return;
		this._signals[signal].complete();
		delete this._signals[signal];
	}

	// Await management
	private _completed: Record<string, unknown> = {};

	private _completeResolvers: Record<string, ((doc: unknown) => void)[]> = {};

	/**
	 * Marks a task as complete.
	 * @param task - The task to mark as complete, identified by a string.
	 */
	complete(task: string, document: unknown = true): void {
		this._completed[task] = document;

		if (this._completeResolvers[task]) {
			this._completeResolvers[task].forEach((resolve) =>
				resolve(document)
			);

			this._completeResolvers[task] = [];
		}
	}

	/**
	 * Returns a Promise that resolves when the specified task is complete.
	 * @param task - The task to watch for completion, identified by a string.
	 * @returns A Promise that resolves when the task is complete.
	 */
	onComplete(task: string): Promise<unknown> {
		if (this._completed[task]) {
			return Promise.resolve(this._completed[task]);
		}

		return new Promise((resolve) => {
			if (!this._completeResolvers[task]) {
				this._completeResolvers[task] = [];
			}

			this._completeResolvers[task].push(resolve);
		});
	}

	/**
	 * Checks if a task is completed.
	 * @param task - The task to check, identified by a string.
	 * @returns True if the task is completed, false otherwise.
	 */
	completed(task: string): unknown {
		return this._completed[task];
	}

	/**
	 * Clears the completed state for a specific task.
	 *
	 * This removes the task from the internal `_completed` store,
	 * allowing it to be awaited again in the future if needed.
	 * It does not affect pending resolvers or trigger any callbacks.
	 *
	 * @param task - The task identifier to clear from completed state.
	 */
	clearCompleted(task: string) {
		delete this._completed[task];
	}

	// Locking management
	private _locked: Record<string, boolean> = {};
	private _unlockResolvers: Record<string, (() => void)[]> = {};

	/**
	 * Locks a resource to prevent concurrent access.
	 * @param which - The resource to lock, identified by a string.
	 */
	lock(which: string): void {
		this._locked[which] = true;

		if (!this._unlockResolvers[which]) {
			this._unlockResolvers[which] = [];
		}
	}

	/**
	 * Unlocks a resource, allowing access.
	 * @param which - The resource to unlock, identified by a string.
	 */
	unlock(which: string): void {
		this._locked[which] = false;

		if (this._unlockResolvers[which]) {
			this._unlockResolvers[which].forEach((resolve) => resolve());

			this._unlockResolvers[which] = [];
		}
	}

	/**
	 * Returns a Promise that resolves when the specified resource is unlocked.
	 * @param which - The resource to watch for unlocking, identified by a string.
	 * @returns A Promise that resolves when the resource is unlocked.
	 */
	onUnlock(which: string): Promise<void> {
		if (!this._locked[which]) {
			return Promise.resolve();
		}

		return new Promise((resolve) => {
			if (!this._unlockResolvers[which]) {
				this._unlockResolvers[which] = [];
			}

			this._unlockResolvers[which].push(resolve);
		});
	}

	/**
	 * Checks if a resource is locked.
	 * @param which - The resource to check, identified by a string.
	 * @returns True if the resource is locked, false otherwise.
	 */
	locked(which: string): boolean {
		return !!this._locked[which];
	}

	// Linking management
	linkCollections: string[] = [];
	linkRealCollectionName: Record<string, string> = {};
	linkIds: Record<string, Selectitem[]> = {};

	addLink(name: string, reset: () => Selectitem[], realName = ''): void {
		this.linkCollections.push(name);

		this.linkRealCollectionName[name] = realName || name;

		this.onComplete(name.toLowerCase() + '_loaded').then(() => {
			this.linkIds[name] = reset();
		});

		this.on(name.toLowerCase() + '_changed').subscribe(() => {
			this.linkIds[name].splice(0, this.linkIds[name].length);

			this.linkIds[name].push(...reset());
		});
	}

	// Angular Signals
	/**
	 * Converts an array of objects to an array of Angular signals.
	 * @template Document
	 * @param {Document[]} arr - Array of objects to convert.
	 * @returns {Signal<Document>[]} Array of signals wrapping each object.
	 */
	toSignalsArray<Document>(arr: Document[]): Signal<Document>[] {
		return arr.map((obj) => signal(obj));
	}

	/**
	 * Returns a generic trackBy function for *ngFor, tracking by the specified object field.
	 * @template Document
	 * @param {string} field - The object field to use for tracking (e.g., '_id').
	 * @returns {(index: number, sig: Signal<Document>) => unknown} TrackBy function for Angular.
	 */
	trackBySignalField<Document extends Record<string, unknown>>(
		field: string
	) {
		return (_: number, sig: Signal<Document>) => sig()[field];
	}

	/**
	 * Finds the first signal in the array whose object's field matches the provided value.
	 * @template Document
	 * @param {Signal<Document>[]} signals - Array of signals to search.
	 * @param {unknown} value - The value to match.
	 * @param {string} [field='_id'] - The object field to match against.
	 * @returns {Signal<Document> | undefined} The found signal or undefined if not found.
	 */
	findSignalByField<Document extends Record<string, unknown>>(
		signals: Signal<Document>[],
		value: unknown,
		field = '_id'
	): Signal<Document> | undefined {
		return signals.find(
			(sig) => sig()[field] === value
		) as Signal<Document>;
	}

	/**
	 * Updates the first writable signal in the array whose object's field matches the provided value.
	 * @template Document
	 * @param {WritableSignal<Document>[]} signals - Array of writable signals to search.
	 * @param {unknown} value - The value to match.
	 * @param {(val: Document) => Document} updater - Function to produce the updated object.
	 * @param {string} field - The object field to match against.
	 * @returns {void}
	 */
	updateSignalByField<Document extends Record<string, unknown>>(
		signals: WritableSignal<Document>[],
		value: unknown,
		updater: (val: Document) => Document,
		field: string
	): void {
		const sig = this.findSignalByField<Document>(
			signals,
			value,
			field
		) as WritableSignal<Document>;

		if (sig) sig.update(updater);
	}

	/**
	 * Adds a new object as a writable signal to the signals array.
	 * @template Document
	 * @param {WritableSignal<Document>[]} signals - The signals array to modify.
	 * @param {Document} item - The object to wrap and push as a writable signal.
	 * @returns {void}
	 */
	pushSignal<Document>(
		signals: WritableSignal<Document>[],
		item: Document
	): void {
		signals.push(signal(item));
	}

	/**
	 * Removes the first signal from the array whose object's field matches the provided value.
	 * @template Document
	 * @param {WritableSignal<Document>[]} signals - The signals array to modify.
	 * @param {unknown} value - The value to match.
	 * @param {string} [field='_id'] - The object field to match against.
	 * @returns {void}
	 */
	removeSignalByField<Document extends Record<string, unknown>>(
		signals: WritableSignal<Document>[],
		value: unknown,
		field: string = '_id'
	): void {
		const idx = signals.findIndex((sig) => sig()[field] === value);

		if (idx > -1) signals.splice(idx, 1);
	}
}
