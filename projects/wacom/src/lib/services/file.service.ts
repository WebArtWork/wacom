import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { DomService } from './dom.service';
import { CoreService } from './core.service';
import { FilesComponent } from '../components/files/files.component';

interface FileOptions {
	id: string;
	type?: string;
	resize?: number | { width: number; height: number };
	multiple?: boolean;
	multiple_cb?: (files: { dataUrl: string; file: File }[]) => void;
	cb?: (dataUrl: string | false, file: File) => void;
	save?: boolean;
	complete?: () => void;
	api?: string;
	part?: string;
	name?: string;
	body?: () => object | object;
	resp?: (response: any) => void;
	append?: (formData: FormData, files: File[]) => void;
	multiple_files?: { dataUrl: string; file: File }[];
	multiple_counter?: number;
	url?: string;
}

@Injectable({
	providedIn: 'root',
})
export class FileService {
	private added: Record<string, FileOptions> = {};
	private files: FileOptions[] = [];

	constructor(
		private dom: DomService,
		private core: CoreService,
		private http: HttpService
	) {
		this.dom.appendComponent(FilesComponent, {
			fs: this,
		});
	}

	/**
	 * Adds a file input configuration.
	 *
	 * @param opts - The file options.
	 */
	public add(opts: FileOptions | string): void | (() => void) {
		if (typeof opts === 'string') {
			opts = { id: opts };
		}

		if (!opts.id) {
			console.log('You have to pass ID into file object');
			return;
		}

		opts.type = opts.type || 'image';

		if (typeof opts.resize === 'number') {
			opts.resize = { width: opts.resize, height: opts.resize };
		}

		if (this.added[opts.id]) {
			this.files = this.files.filter((file) => file.id !== opts.id);
		}

		this.files.push(opts);
		this.added[opts.id] = opts;

		if (opts.save) {
			return () => {
				opts.complete?.();
			};
		}
	}

	/**
	 * Handles file input change event.
	 *
	 * @param event - The input change event.
	 * @param info - The file options.
	 */
	public change(event: Event, info: FileOptions): void {
		const input = event.target as HTMLInputElement;
		if (!input.files) return;

		if (info.type === 'image') {
			if (info.multiple) {
				if (info.multiple_cb) {
					info.multiple_files = [];
					info.multiple_counter = input.files.length;
				}
				Array.from(input.files).forEach((file) => this.process(file, info));
			} else {
				this.process(input.files[0], info);
			}
		} else if (info.type === 'file') {
			if (info.multiple) {
				info.multiple_cb?.(Array.from(input.files).map(file => ({ dataUrl: '', file })));
			}
			Array.from(input.files).forEach((file) => info.cb?.('', file));
			if (info.part || info.url) {
				this.uploadFiles(info, input.files as File[]);
			}
		} else {
			console.log('Provide type `image` or `file`');
		}
	}

	/**
	 * Removes a file.
	 *
	 * @param part - The part of the API.
	 * @param url - The URL of the file.
	 * @param opts - Additional options.
	 * @param cb - The callback function.
	 */
	public remove(part: string, url: string, opts: any = {}, cb: (resp: any) => void = () => { }): void | (() => void) {
		opts.url = url;
		if (opts.save) {
			return () => {
				this.http.post(opts.api || `/api/${part}/file/delete`, opts, cb);
			};
		} else {
			this.http.post(opts.api || `/api/${part}/file/delete`, opts, cb);
		}
	}

	/**
	 * Uploads files to the server.
	 *
	 * @param info - The file options.
	 * @param files - The files to upload.
	 * @param cb - The callback function.
	 */
	public uploadFiles(info: FileOptions, files: File[], cb: (resp: any) => void = () => { }): void {
		const formData = new FormData();

		if (info.append) {
			info.append(formData, files);
		} else {
			files.forEach((file, index) => formData.append(`file[${index}]`, file));
		}

		const body = typeof info.body === 'function' ? info.body() : (info.body || {});
		Object.entries(body).forEach(([key, value]) => formData.append(key, value));

		if (info.save) {
			info.complete = () => {
				this.http.post(info.api || `/api/${info.part}/file${info.name ? `/${info.name}` : ''}`, formData, (resp) => {
					info.resp?.(resp);
					cb(resp);
				});
			};
		} else {
			this.http.post(info.api || `/api/${info.part}/file${info.name ? `/${info.name}` : ''}`, formData, (resp) => {
				info.resp?.(resp);
				cb(resp);
			});
		}
	}

	/**
	 * Uploads an image to the server.
	 *
	 * @param info - The file options.
	 * @param cb - The callback function.
	 */
	public image(info: FileOptions, cb: (resp: any) => void = () => { }): void | (() => void) {
		if (info.save) {
			return () => {
				this.http.post(info.api || `/api/${info.part}/file${info.name ? `/${info.name}` : ''}`, info, cb);
			};
		} else {
			this.http.post(info.api || `/api/${info.part}/file${info.name ? `/${info.name}` : ''}`, info, cb);
		}
	}

	/**
	 * Updates the file information after processing.
	 *
	 * @param dataUrl - The data URL of the processed file.
	 * @param info - The file options.
	 * @param file - The file object.
	 */
	private update(dataUrl: string, info: FileOptions, file: File): void {
		info.cb?.(dataUrl, file);
		if (info.multiple_cb) {
			info.multiple_files.push({ dataUrl, file });
			if (--info.multiple_counter === 0) info.multiple_cb(info.multiple_files);
		}

		if (!info.part) return;

		const obj = typeof info.body === 'function' ? info.body() : (info.body || {});
		obj['dataUrl'] = dataUrl;

		if (info.save) {
			info.complete = () => {
				this.http.post(info.api || `/api/${info.part}/file${info.name ? `/${info.name}` : ''}`, obj, (resp) => {
					info.cb?.(resp);
				});
			};
		} else {
			this.http.post(info.api || `/api/${info.part}/file${info.name ? `/${info.name}` : ''}`, obj, (resp) => {
				info.cb?.(resp);
			});
		}
	}

	/**
	 * Processes an image file for resizing.
	 *
	 * @param file - The file object.
	 * @param info - The file options.
	 */
	private process(file: File, info: FileOptions): void {
		if (!file.type.startsWith('image/')) {
			info.cb?.(false, file);
			if (info.multiple_cb) {
				info.multiple_files.push({ dataUrl: '', file });
				if (--info.multiple_counter === 0) info.multiple_cb(info.multiple_files);
			}
			return;
		}

		if (info.resize) {
			info.resize.width = info.resize.width || 1920;
			info.resize.height = info.resize.height || 1080;
		}

		const reader = new FileReader();
		reader.onload = (loadEvent) => {
			if (!info.resize) {
				return this.update(loadEvent.target?.result as string, info, file);
			}

			const canvas = this.core.document.createElement('canvas');
			const img = this.core.document.createElement('img');
			img.onload = () => {
				if (img.width <= info.resize.width && img.height <= info.resize.height) {
					return this.update(loadEvent.target?.result as string, info, file);
				}

				const infoRatio = info.resize.width / info.resize.height;
				const imgRatio = img.width / img.height;
				let width, height;
				if (imgRatio > infoRatio) {
					width = Math.min(info.resize.width, img.width);
					height = width / imgRatio;
				} else {
					height = Math.min(info.resize.height, img.height);
					width = height * imgRatio;
				}

				canvas.width = width;
				canvas.height = height;
				const context = canvas.getContext('2d');
				context.drawImage(img, 0, 0, width, height);
				const dataUrl = canvas.toDataURL('image/jpeg', 1);
				this.update(dataUrl, info, file);
			};
			img.src = loadEvent.target?.result as string;
		};
		reader.readAsDataURL(file);
	}
}
