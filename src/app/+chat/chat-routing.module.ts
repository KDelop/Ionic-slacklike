import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
// import { ChatSettingsComponent } from './chat-settings/chat-settings.component'
import { ChatComponent } from './chat/chat.component'
// import { ShowTeamAttachementsComponent } from './show-team-attachements/show-team-attachements.component'

const ROUTES: Routes = [
  { path: ':chatId', component: ChatComponent },
  // { path: ':chatId/:threadId', component: ChatComponent },
  // {
  //   path: ':chatId/attachments',
  //   component: ShowTeamAttachementsComponent,
  // },
]

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class ChatRoutingModule {}
