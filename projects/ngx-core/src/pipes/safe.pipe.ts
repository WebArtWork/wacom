import { inject, Pipe } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
@Pipe({
	name: 'safe',
})
export class SafePipe {
	transform(html: any) {
		return this._sanitizer.bypassSecurityTrustResourceUrl(html);
	}

	private _sanitizer = inject(DomSanitizer);
}
