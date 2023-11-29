import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { WacomModule } from 'wacom';
import { LocalComponent } from './modals/local/local.component';
import { AlertComponent } from './doc/service/alert/alert.component';
import { CoreComponent } from './doc/service/core/core.component';
import { DomComponent } from './doc/service/dom/dom.component';
import { FileComponent } from './doc/service/file/file.component';
import { HashComponent } from './doc/service/hash/hash.component';
import { HttpComponent } from './doc/service/http/http.component';
import { LoaderComponent } from './doc/service/loader/loader.component';
import { MetaComponent } from './doc/service/meta/meta.component';
import { ModalComponent } from './doc/service/modal/modal.component';
import { MongoComponent } from './doc/service/mongo/mongo.component';
import { RenderComponent } from './doc/service/render/render.component';
import { SocialComponent } from './doc/service/social/social.component';
import { SocketComponent } from './doc/service/socket/socket.component';
import { StoreComponent } from './doc/service/store/store.component';
import { TimeComponent } from './doc/service/time/time.component';
import { UiComponent } from './doc/service/ui/ui.component';
import { ArrComponent } from './doc/pipe/arr/arr.component';
import { MongodateComponent } from './doc/pipe/mongodate/mongodate.component';
import { PaginationComponent } from './doc/pipe/pagination/pagination.component';
import { SafeComponent } from './doc/pipe/safe/safe.component';
import { SearchComponent } from './doc/pipe/search/search.component';
import { SpliceComponent } from './doc/pipe/splice/splice.component';
import { ConfigComponent } from './doc/interface/config/config.component';
import { ClickOutsideComponent } from './doc/directive/click-outside/click-outside.component';
import { FilesComponent } from './doc/component/files/files.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestalertComponent } from './testalert/testalert.component';

@NgModule({
	declarations: [
		AppComponent,
		LocalComponent,
		AlertComponent,
		CoreComponent,
		DomComponent,
		FileComponent,
		HashComponent,
		HttpComponent,
		LoaderComponent,
		MetaComponent,
		ModalComponent,
		MongoComponent,
		RenderComponent,
		SocialComponent,
		SocketComponent,
		StoreComponent,
		TimeComponent,
		UiComponent,
		ArrComponent,
		MongodateComponent,
		PaginationComponent,
		SafeComponent,
		SearchComponent,
		SpliceComponent,
		ConfigComponent,
		ClickOutsideComponent,
		FilesComponent,
	],
	imports: [
		CommonModule,
		FormsModule,
		BrowserModule,
		WacomModule.forRoot({
			socket: false,
			alert: {
				alerts: {
					test: TestalertComponent
				}
			}
		}),
	],
	bootstrap: [AppComponent],
})
export class AppModule { }
