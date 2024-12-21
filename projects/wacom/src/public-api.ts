/*
 *	Interfaces
 */
export * from './lib/interfaces/config';
export * from './lib/interfaces/alert.interface';
export * from './lib/interfaces/crud.interface';
/*
 *	Guard
 */
export * from './lib/guard/meta.guard';
/*
 *	Components
 */
export * from './lib/components/alert/alert.component';
export * from './lib/components/modal/modal.component';
export * from './lib/components/loader/loader.component';
export * from './lib/components/crud.component';
/*
 *	Directives
 */
export * from './lib/directives/click-outside.directive';
/*
 *	Pipes
 */
export * from './lib/pipes/arr.pipe';
export * from './lib/pipes/mongodate.pipe';
export * from './lib/pipes/pagination.pipe';
export * from './lib/pipes/safe.pipe';
export * from './lib/pipes/search.pipe';
export * from './lib/pipes/splice.pipe';
/*
 *	Services
 */
export * from './lib/services/base.service';
export * from './lib/services/crud.service';
export * from './lib/services/meta.service';
export * from './lib/services/store.service';
export * from './lib/services/http.service';
export * from './lib/services/mongo.service';
export * from './lib/services/render.service';
export * from './lib/services/hash.service';
export * from './lib/services/dom.service';
export * from './lib/services/alert.service';
export * from './lib/services/loader.service';
export * from './lib/services/socket.service';
export * from './lib/services/modal.service';
export * from './lib/services/file.service';
export * from './lib/services/ui.service';
export * from './lib/services/core.service';
export * from './lib/services/time.service';
/*
 *	Initial
 *
 *	make different kind of modules, one which import all, other for piece by piece
 */
export * from './lib/wacom.module';
/*
 *	End of Support
 */
