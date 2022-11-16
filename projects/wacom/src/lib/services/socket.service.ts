import { CONFIG_TOKEN, Config, DEFAULT_CONFIG } from '../interfaces/config';
import { Injectable, Inject, Optional } from '@angular/core';
import { CoreService } from './core.service';
import * as io from "socket.io-client";

@Injectable({
	providedIn: 'root'
})
export class SocketService {
	private _url = '';

	setUrl(url: string): void {
		this._url = url;

		if (!this._config.socket) {
			this._config.socket = true;
		}

		this.load();
	}

	private _io:any;

	private _connected = false;

	private _opts: any = {};

	load(){
		if (io) {
			const ioFunc = (io as any).default ? (io as any).default : io;

			this._io = ioFunc(this._url, this._opts);

			this._io.on('connect', (socket:any) => {
				this._connected = true;
			});
		}
	}

	constructor(
		@Inject(CONFIG_TOKEN) @Optional() private _config: Config,
		private _core: CoreService
	){
		this._core.done('socket', this);

		this._url = this._core.window.location.origin.replace('4200', '8080');

		if(!this._config) this._config = DEFAULT_CONFIG;

		if (typeof this._config.socket === 'object') {
			if (this._config.socket.url) {
				this._url = this._config.socket.url;
			}

			if (this._config.socket.opts) {
				this._opts = this._config.socket.opts;
			}
		}

		if(this._config.socket){
			this.load();
		}
	}

	on(to:any, cb = (message:any)=>{}):any{
		if(!this._config.socket) {
			return;
		}

		if(!this._connected){
			return setTimeout(()=>{
				this.on(to, cb);
			}, 100);
		}

		this._io.on(to, cb);
	}

	emit(to:any, message:any, room:any = false):any{
		if(!this._config.socket) {
			return;
		}

		if(!this._connected){
			return setTimeout(()=>{
				this.emit(to, message, room);
			}, 100);
		}

		this._io.emit(to, message, room);
	}
}
