import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactionPickerComponent } from './reaction-picker/reaction-picker.component';
import { ReactionTrayComponent } from './reaction-tray/reaction-tray.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxEmojModule } from 'ngx-emoj';
import { MyReactionsPipe, ReactionUsersNamesPipe } from './pipes';
import { LongPressDirective } from '../frameworks/directives/longpress.directive';
import { ReactionDetailsComponent } from './reaction-details/reaction-details.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    ReactionPickerComponent,
    ReactionTrayComponent,
    ReactionDetailsComponent,
    ReactionUsersNamesPipe,
    MyReactionsPipe,
    LongPressDirective
  ],
  imports: [
    CommonModule,
    IonicModule,
    NgbModule,
    NgxEmojModule
  ],
  exports: [ReactionPickerComponent, ReactionTrayComponent],
})
export class ReactionsModule {}
