import { Inject, Injectable, Optional } from '@angular/core';
import {
	CONFIG_TOKEN,
	Config,
	DEFAULT_CONFIG,
} from '../interfaces/config.interface';
import { CoreService } from './core.service';

@Injectable({
	providedIn: 'root',
})
export class SocketService {
	private _url = '';

	private _io: any;

	private _connected = false;

	private _opts: any = {};

	constructor(
		@Inject(CONFIG_TOKEN) @Optional() private _config: Config,
		private _core: CoreService
	) {
		this._config = { ...DEFAULT_CONFIG, ...(this._config || {}) };

		if (!this._config.io) {
			return;
		}

		const url = new URL(window.location.origin);

		if (typeof this._config.socket === 'object') {
			if (this._config.socket.port) {
				url.port = this._config.socket.port;
			}

			if (this._config.socket.opts) {
				this._opts = this._config.socket.opts;
			}

			this._url = this._config.socket.url ?? url.origin;
		} else {
			this._url = url.origin;
		}

		if (this._config.socket) {
			this.load();
		}
	}

	/**
	 * Sets the URL for the WebSocket connection and reloads the socket.
	 * @param url - The URL of the WebSocket server.
	 */
	setUrl(url: string): void {
		this._url = url;

		if (!this._config.socket) {
			this._config.socket = true;
		}

		this.load();
	}

	/**
	 * Loads and initializes the WebSocket connection.
	 */
	private async load(): Promise<void> {
		const init = (ioFunc: any) => {
			this._io = ioFunc(this._url, this._opts);

			this._io.on('connect', () => {
				this._connected = true;
				this._core.complete('socket');
			});
		};

		if (this._config.io) {
			const ioFunc = this._config.io.default
				? this._config.io.default
				: this._config.io;
			init(ioFunc);
			return;
		}

		try {
			const mod: any = await import('socket.io-client');
			const ioFunc = mod.default ? mod.default : mod;
			init(ioFunc);
		} catch (err) {
			console.warn('Failed to load socket.io client', err);
		}
	}

	/**
	 * Subscribes to a WebSocket event.
	 * @param to - The event to subscribe to.
	 * @param cb - The callback function to execute when the event is received.
	 */
	on(to: string, cb: (message: any) => void = () => {}): void {
		if (!this._config.socket) {
			return;
		}

		if (!this._io) {
			console.warn('Socket client not loaded.');
			return;
		}

		if (!this._connected) {
			setTimeout(() => {
				this.on(to, cb);
			}, 100);
			return;
		}

		this._io.on(to, cb);
	}

	/**
	 * Emits a message to a WebSocket event.
	 * @param to - The event to emit the message to.
	 * @param message - The message to emit.
	 * @param room - Optional room to emit the message to.
	 */
	emit(to: string, message: any, room: any = false): void {
		if (!this._config.socket) {
			return;
		}

		if (!this._io) {
			console.warn('Socket client not loaded.');
			return;
		}

		if (!this._connected) {
			setTimeout(() => {
				this.emit(to, message, room);
			}, 100);
			return;
		}

		this._io.emit(to, message, room);
	}
}
