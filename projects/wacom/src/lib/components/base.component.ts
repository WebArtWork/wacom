
/**
 * BaseComponent is an abstract class that provides basic functionality for managing the current timestamp.
 */
export abstract class BaseComponent {
	/**
	 * The current timestamp in milliseconds since the Unix epoch.
	 */
	now = new Date().getTime();

	/**
	 * Refreshes the `now` property with the current timestamp.
	 */
	refreshNow(): void {
		this.now = new Date().getTime();
	}
}
