import { Injectable, Inject, Optional } from '@angular/core';
import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { CoreService } from './core.service';
import * as io from 'socket.io-client';

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
		this._url = this._core.window.location.origin.replace('4200', '8080');
		if (!this._config) this._config = DEFAULT_CONFIG;

		if (typeof this._config.socket === 'object') {
			if (this._config.socket.url) {
				this._url = this._config.socket.url;
			}

			if (this._config.socket.opts) {
				this._opts = this._config.socket.opts;
			}
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
	private load(): void {
		if (io) {
			const ioFunc = (io as any).default ? (io as any).default : io;
			this._io = ioFunc(this._url, this._opts);
			this._io.on('connect', () => {
				this._connected = true;
				this._core.complete('socket');
			});
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

		if (!this._connected) {
			setTimeout(() => {
				this.emit(to, message, room);
			}, 100);
			return;
		}

		this._io.emit(to, message, room);
	}
}
