import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class RenderService {
	/**
	 * A dictionary to store event callbacks.
	 * Each event has an array of callback functions that will be executed when the event is triggered.
	 */
	private _pipes: Record<string, ((param: unknown) => void)[]> = {};

	/**
	 * Registers a callback function to an event.
	 *
	 * @param event - The name of the event to listen for.
	 * @param cb - The callback function to execute when the event is triggered.
	 * @returns A function to unregister the callback from the event.
	 */
	on(event: string, cb: () => void): () => void {
		this._pipes[event] = this._pipes[event] || [];
		this._pipes[event].push(cb);

		const index = this._pipes[event].length - 1;

		return () => {
			this._pipes[event][index] = () => {};
		};
	}

	/**
	 * Triggers an event and executes all registered callback functions for that event.
	 *
	 * @param event - The name of the event to trigger.
	 * @param param - An optional parameter to pass to the callback functions.
	 */
	render(event: string = '', param: unknown = null): void {
		if (!this._pipes[event]) return;

		for (let i = 0; i < this._pipes[event].length; i++) {
			if (typeof this._pipes[event][i] === 'function') {
				this._pipes[event][i](param);
			}
		}
	}
}
