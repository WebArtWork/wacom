import { NgModule } from '@angular/core';
import { OtaPipe } from './ota.pipe';
import { SafePipe } from './safe.pipe';
import { SearchPipe } from './search.pipe';

@NgModule({
  declarations: [OtaPipe, SafePipe, SearchPipe],
  exports: [OtaPipe, SafePipe, SearchPipe]
})
export class PipesModule { }
