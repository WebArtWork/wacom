import { Pipe } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
@Pipe({
	name: 'safe',
	standalone: true,
})
export class SafePipe {
	constructor(private sanitizer: DomSanitizer) {}
	transform(html: any) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(html);
	}
}
