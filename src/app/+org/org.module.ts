import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { OrgRoutingModule } from './org-routing.module'
import { RouterModule } from '@angular/router'
import { OrgComponent } from './org/org.component'
// import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
// import { AvatarModule } from 'ngx-avatar'
import { EffectsModule } from '@ngrx/effects'
import { StoreModule } from '@ngrx/store'
import { RecentItemsEffects } from './store/effects/recent-items.effects'
import { RecentItemsService } from './store/services/recent-items.service'
import { recentChannelsReducer } from './store/reducers/recent-channels.reducer'
import { FormsModule } from '@angular/forms'
import { IonicModule, IonRouterOutlet } from '@ionic/angular'
import { RecentComponent } from './recent/recent.component'
import { RenderListComponent } from './render-list/render-list.component'
import { ChannelListComponent } from './channel/channel-list/channel-list.component'
import { PeopleComponent } from './people/people.component'
import { OrgTabsComponent } from './org-tabs/org-tabs.component'
import { ForwardListComponent } from './forward-list/forward-list.component'
import { SidebarComponent } from './sidebar/sidebar.component'
import { EditProfileComponent } from './edit-profile/edit-profile.component'
import { CreateChannelComponent } from './channel/create-channel/create-channel.component'
import { ChatComponent } from '../+chat/chat/chat.component'
import { ChatListNewComponent } from '../+chat/chat-list-new/chat-list-new.component'
import { ChatEffects } from '../+chat/store/effects/chat.effects'
import { TypeTrackerEffects } from '../+chat/store/effects/type-tracker.effects'
import { chatReducer } from '../+chat/store/reducers/chat.reducer'
import { typeTrackerReducer } from '../+chat/store/reducers/type-tracker.reducer'
import { ChatService } from '../+chat/store/services/chat.service'
import { TypeTrackerService } from '../+chat/store/services/type-tracker.service'
import { MarkdownModule } from 'ngx-markdown'
import { ChatFooterComponent } from '../+chat/chat-footer/chat-footer.component'
import { QuillModule } from 'ngx-quill'
import { ReactionsModule } from '../reactions/reactions.module'
import { LocalService } from '../store/services/local.service'
import { DraftHistoryService } from './store/services/draft-history.service'
import { OnlineUsersService } from './store/services/online-users.service'
import { recentItemsReducer } from './store/reducers/recent-items.reducer'
import { pinnedMessagesReducer } from '../+chat/store/reducers/pinned-messages.reducer'
import { draftHistoryReducer } from './store/reducers/draft-history.reducer'
import { onlineUsersReducer } from './store/reducers/online-users.reducer'
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx'
import { ChatActionsComponent } from '../+chat/chat-actions/chat-actions.component'
import { DelveService } from '../store/services/delve.service'
import { SearchService } from 'universal-search-engine-angular'
import { ChatSettingsComponent } from '../+chat/chat-settings/chat-settings.component'
import { OnlineUsersEffects } from './store/effects/online-users.effects'
import { ScrollAssistDirective } from '../frameworks/directives/scroll-assist.directive'
import { VisibilityDirective } from '../frameworks/directives/visibility.directive'
import { MediaClassDirective } from '../frameworks/directives/media-class.directive'
import { HTTP } from '@ionic-native/http/ngx'
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx'

@NgModule({
  declarations: [
    OrgComponent,
    OrgTabsComponent,
    RecentComponent,
    ChannelListComponent,
    PeopleComponent,
    RenderListComponent,
    ForwardListComponent,
    SidebarComponent,
    EditProfileComponent,
    CreateChannelComponent,
    ChatComponent,
    ChatListNewComponent,
    ChatFooterComponent,
    ChatActionsComponent,
    ChatSettingsComponent,
    ScrollAssistDirective,
    VisibilityDirective,
    MediaClassDirective
  ],
  imports: [
    CommonModule,
    OrgRoutingModule,
    RouterModule,
    FormsModule,
    IonicModule,
    // NgbModule,
    // AvatarModule,
    ReactionsModule,
    QuillModule.forRoot(),
    EffectsModule.forFeature([
      RecentItemsEffects,
      ChatEffects,
      TypeTrackerEffects,
      OnlineUsersEffects
    ]),
    StoreModule.forFeature('recentChannelsList', recentChannelsReducer),
    // StoreModule.forFeature('recentUsersList', recentUsersReducer),
    // EffectsModule.forFeature([ChatEffects, TypeTrackerEffects]),
    StoreModule.forFeature('chat', chatReducer),
    StoreModule.forFeature('typeTracker', typeTrackerReducer),

    // StoreModule.forFeature('recentChannelsList', recentChannelsReducer),
    StoreModule.forFeature('recentItemsList', recentItemsReducer),
    StoreModule.forFeature('draftHistoryList', draftHistoryReducer),
    StoreModule.forFeature('onlineUsers', onlineUsersReducer),
    StoreModule.forFeature('chat', chatReducer),
    StoreModule.forFeature('pinnedMessages', pinnedMessagesReducer),
    StoreModule.forFeature('typeTracker', typeTrackerReducer),
    MarkdownModule.forChild(),
  ],
  exports: [
  ],
  providers: [
    RecentItemsService,
    LocalService,
    DraftHistoryService,
    OnlineUsersService,

    ChatService,
    TypeTrackerService,
    PhotoViewer,
    SearchService,
    DelveService,
    HTTP,
    File,
    FileOpener
  ],
})
export class OrgModule {}
