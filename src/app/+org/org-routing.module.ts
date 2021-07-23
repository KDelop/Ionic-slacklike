import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from '../+chat/chat/chat.component';
import { ChannelListComponent } from './channel/channel-list/channel-list.component';
import { CreateChannelComponent } from './channel/create-channel/create-channel.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { OrgTabsComponent } from './org-tabs/org-tabs.component';
import { OrgComponent } from './org/org.component';
import { PeopleComponent } from './people/people.component';
import { RecentComponent } from './recent/recent.component';

const ROUTES: Routes = [
  {
    path: '',
    component: OrgComponent,
    children: [
      // {
      //   path: '',
      //   component: OrgTabsComponent,
      //   children: [
      //     {
      //       path: 'recent',
      //       component: RecentComponent
      //     },
      //     {
      //       path: 'channel',
      //       component: ChannelListComponent
      //     },
      //     {
      //       path: 'people',
      //       component: PeopleComponent
      //     },
      //     {
      //       path: '',
      //       redirectTo: 'recent',
      //       pathMatch: 'full'
      //     },
      //   ]
      // },
      {
        path: 'recent',
        component: RecentComponent
      },
      {
        path: 'channel',
        component: ChannelListComponent
      },
      {
        path: 'people',
        component: PeopleComponent
      },
      // {
      //   path: '',
      //   redirectTo: 'recent',
      //   pathMatch: 'full'
      // },
      // {
      //   path: 'newchat',
      //   loadChildren: () =>
      //     import(`../+chat/chat.module`).then((m) => m.ChatModule),
      // },
      // {
      //   path: 'chat',
      //   loadChildren: () =>
      //     import(`../+chat/chat.module`).then((m) => m.ChatModule),
      // },
      {
        path: 'chat/:chatId',
        component: ChatComponent
      },
      {
        path: 'edit-profile',
        component: EditProfileComponent
      },
      {
        path: 'create-channel',
        component: CreateChannelComponent
      },
      {
        path: '**',
        redirectTo: 'recent',
        pathMatch: 'full'
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTES)],
  exports: [RouterModule],
})
export class OrgRoutingModule {}
