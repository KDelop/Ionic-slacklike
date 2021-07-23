import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChatRoutingModule } from './chat-routing.module'
// import { ChatComponent } from './chat/chat.component'
// import { ChatHeaderComponent } from './chat-header/chat-header.component'
import { ChatListComponent } from './chat-list/chat-list.component'
import { ChatFooterComponent } from './chat-footer/chat-footer.component'
import { QuillModule } from 'ngx-quill'
import { FormsModule } from '@angular/forms'
// import {
//   PerfectScrollbarConfigInterface,
//   PerfectScrollbarModule,
//   PERFECT_SCROLLBAR_CONFIG,
// } from 'ngx-perfect-scrollbar'
import { ChatPreviewComponent } from './chat-preview/chat-preview.component'
import { ChatService } from './store/services/chat.service'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { ChatEffects } from './store/effects/chat.effects'
import { chatReducer } from './store/reducers/chat.reducer'
import { ChatActionsComponent } from './chat-actions/chat-actions.component'
import { MarkdownModule } from 'ngx-markdown'
import { OrgModule } from '../+org/org.module'
import { AvatarModule } from 'ngx-avatar'
import { NgScrollbarModule } from 'ngx-scrollbar'
import { NgScrollbarReachedModule } from 'ngx-scrollbar/reached-event'
import { ReactionsModule } from '../reactions/reactions.module'

// import { ChatSettingsComponent } from './chat-settings/chat-settings.component'
import {
  NgbAccordionModule,
  NgbDropdownModule,
  NgbPopoverModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap'
// import { AngularSplitModule } from 'angular-split'
// import { ProfilePopoverComponent } from './profile-popover/profile-popover.component'
// import { ShowTeamAttachementsComponent } from './show-team-attachements/show-team-attachements.component'
import { ScrollingModule } from '@angular/cdk/scrolling'
// import { VirtualScrollerModule } from 'ngx-virtual-scroller'
import { TypeTrackerService } from './store/services/type-tracker.service'
import { TypeTrackerEffects } from './store/effects/type-tracker.effects'
import { typeTrackerReducer } from './store/reducers/type-tracker.reducer'
import { IonicModule } from '@ionic/angular'
// import { PhotoViewer } from '@ionic-native/photo-viewer/ngx'
import { ChatSettingsComponent } from './chat-settings/chat-settings.component'
// import { ChatListNewComponent } from './chat-list-new/chat-list-new.component'
// const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {}

@NgModule({
  declarations: [
    // ChatComponent,
    // ChatHeaderComponent,
    ChatListComponent,
    // ChatListNewComponent,
    // ChatFooterComponent,
    ChatPreviewComponent,
    // ChatActionsComponent,
    // ChatSettingsComponent
    // ChatSettingsComponent,
    // ProfilePopoverComponent,
    // ShowTeamAttachementsComponent,
  ],
  exports: [
    // ChatPreviewComponent
  ],
  imports: [
    CommonModule,
    ChatRoutingModule,
    QuillModule.forRoot(),
    FormsModule,
    IonicModule,
    // PerfectScrollbarModule,
    NgScrollbarModule,
    NgScrollbarReachedModule,
    // OrgModule,
    // EffectsModule.forFeature([ChatEffects, TypeTrackerEffects]),
    // StoreModule.forFeature('chat', chatReducer),
    // StoreModule.forFeature('typeTracker', typeTrackerReducer),
    MarkdownModule.forChild(),
    AvatarModule,
    ReactionsModule,
    NgbAccordionModule,
    NgbPopoverModule,
    NgbDropdownModule,
    NgbTooltipModule,
    // AngularSplitModule,
    // ScrollingModule,
    // VirtualScrollerModule,
  ],
  providers: [
    // {
    //   provide: PERFECT_SCROLLBAR_CONFIG,
    //   useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    // },
    // ChatService,
    // TypeTrackerService,
    // PhotoViewer,
  ],
})
export class ChatModule {}
