import { Component, NgZone, OnInit } from '@angular/core';
import { DB } from '@app/models/db'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IOrgResponse, IProfileResponse, ITeamResponse, ITeamUserResponse, ITypeTrackerRes } from '../../models';
import { select, Store } from '@ngrx/store';
import { Storage } from '@ionic/storage-angular';
import { filter, take, takeUntil, takeWhile } from 'rxjs/operators';
import { combineLatest, ReplaySubject } from 'rxjs';
import { IMessageResponse } from '../../models/interfaces/message.interfaces';
import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
  LocalNotificationActionPerformed,
} from '@capacitor/core';
import { NavController, Platform } from '@ionic/angular';
import 'capacitor-jitsi-meet';
import { loadOrg, loadUserOrgs, setActiveOrgId, updateOrgViaEvent } from '../../store/actions/org.actions';
import { loadAllTeams, loadTeam, addTeamUserViaEvent, removeTeamUserViaEvent, upsertTeamViaEvent } from '../../store/actions/team.actions';
import { loadUser, upsertUserViaEvent } from '../../store/actions/user.actions';
import { selectActiveChat } from '../../store/reducers';
import { selectTeamListEntities } from '../../store/selectors/team.selectors';
import { selectCurrentUser, selectUserEntities } from '../../store/selectors/user.selectors';
import { FeathersService } from '../../store/services/feathers.service';
import { UserService } from '../../store/services/user.service';
import { loadRecentItems, removeRecentItemViaEvent, updateRecentItems, upsertRecentItemViaEvent } from '../store/actions/recent-items.actions';
import { upsertMessageViaEvent, deleteMessageViaEvent, loadRecentChatLastMessage, updateMessageViaEvent, removeChats } from '../../+chat/store/actions/chat.actions';
import { upsertPinnedMessages } from '../../+chat/store/actions/pinned-messages.actions';
import { upsertTypeTrackerViaEvent } from '../../+chat/store/actions/type-tracker.actions';
import { loadDraftHistoryList, upsertDraftHistoryViaEvent } from '../store/actions/draft-history.actions';
import { upsertOnlineUserViaEvent, removeOnlineUserViaEvent, loadOnlineUsers } from '../store/actions/online-users.actions';
import { selectActiveOrgId } from '../../store/selectors/org.selectors';
import { WSEventType } from '../../models/constants/websocket';

const { PushNotifications, LocalNotifications, Network, App, Jitsi, UXCamPlugin } = Plugins;

declare var cordova;
// const cordovaCall = cordova.plugins.CordovaCall;

@Component({
  selector: 'app-org',
  templateUrl: './org.component.html',
  styleUrls: ['./org.component.scss'],
})
export class OrgComponent implements OnInit {

  public dataLoader = { loading: true, errored: false }
  public activeOrg: IOrgResponse
  public currentUser: IProfileResponse

  public teamEntities: { [id: number]: ITeamResponse }
  public userEntities: { [id: number]: IProfileResponse }
  public unreadTeams: any = []
  public activeChat: ITeamResponse
  public DMCallId: number;
  public activeOrgId: string
  public canSwipeSidebar: boolean = false;
  private isMobile = !this.platform.platforms().includes('desktop') && !this.platform.platforms().includes('mobileweb');
  private cordovaCall = this.isMobile ? cordova?.plugins?.CordovaCall : null;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1)
  // public webWorker;
  constructor(
    private feathersService: FeathersService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private storage: Storage,
    private zone: NgZone,
    private userService: UserService,
    private navController: NavController,
    private platform: Platform,
  ) {
    // this.webWorker = new Worker('../../../assets/worker.js')
  }

  public reload() {
    console.log('reload')
    window.location.reload()
  }
  public clearLocalDB() {
    console.log('clearLocalDB')
    // this.webWorker.postMessage('remove');
    this.store.dispatch(removeChats())
  }

  ngOnInit() {

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/org/recent') {
          this.canSwipeSidebar = true;
        } else {
          this.canSwipeSidebar = false;
        }
      })

    // this.store.dispatch(setActiveOrgId({orgId: 'n2b6ilrwv7izgf67uq3g'})) // space-team org
    // this.store.dispatch(setActiveOrgId({orgId: 'h06mx3n8311iyf5j6vfj'})) // test-3 org
    // this.storage.set('feathers-jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJlbWFpbCI6ImFyaXNoQHdhbGtvdmVyLmluIiwiaWF0IjoxNjIxMzUwMDMxLCJleHAiOjE2NTI5MDc2MzEsImF1ZCI6Imh0dHBzOi8veW91cmRvbWFpbi5jb20iLCJpc3MiOiJmZWF0aGVycyIsInN1YiI6IllyWmZoTXJPU3dqOTNlWUsiLCJqdGkiOiJmZmZkNWM1My01NDAwLTQzYmUtYmJmNS0xYmVmYTNhNjUwYWIifQ.i0l_mbVsU7jglREKvH3QpoDPXA9fAJy7elsPe2M5Hxk');
    this.platform.pause.subscribe(async () => {
      this.feathersService.disconnectSocket();
      this.feathersService.removeListeners();
    });
    this.platform.resume.subscribe(async () => {
      this.reconnectToWS();
    });

    Network.addListener('networkStatusChange', (status) => {
      App.getState().then(state => {
        if (state.isActive && status.connected) {
          this.reconnectToWS();
        }
      })
    });


    this.authenticateWebsocket()
    this.initializeFeathersEvents()

    this.store
      .pipe(select(selectActiveChat), takeUntil(this.destroyed$))
      .subscribe((activeChat: ITeamResponse) => {
        if (activeChat) {
          this.activeChat = activeChat
        } else {
          this.activeChat = null
        }
      })

      combineLatest([
        this.store.pipe(select(selectCurrentUser), takeUntil(this.destroyed$)),
        this.store.pipe(select(selectActiveOrgId), takeUntil(this.destroyed$))
      ])
      .subscribe(resp => {
        const currentUser = resp[0];
        const activeOrgId = resp[1];
        if (
          currentUser && (!this.currentUser || this.currentUser.id !== currentUser.id) && activeOrgId
        ) {
          this.currentUser = currentUser
          UXCamPlugin.setUserIdentity(`${this.currentUser.firstName} ${this.currentUser.lastName}`)
          UXCamPlugin.setUserProperty('email', this.currentUser.email)
          UXCamPlugin.setUserProperty('username', this.currentUser.username)
          UXCamPlugin.setUserProperty('activeOrgId', activeOrgId)
          this.activeOrgId = activeOrgId
          this.initApiCalls()
        }
      })

      this.store.pipe(select(selectTeamListEntities),takeUntil(this.destroyed$)).subscribe(teamEntities => {
        this.teamEntities = teamEntities;
      })
      this.store.pipe(select(selectUserEntities),takeUntil(this.destroyed$)).subscribe(userEntities => {
        this.userEntities = userEntities;
      })

    // combineLatest([
    //   this.store.pipe(select(selectReadReceipts), takeUntil(this.destroyed$)),
    //   this.store.pipe(
    //     select(selectTeamListEntities),
    //     takeUntil(this.destroyed$)
    //   ),
    //   this.store.pipe(select(selectCurrentUser), takeUntil(this.destroyed$)),
    //   this.store.pipe(select(selectUserEntities), takeUntil(this.destroyed$)),
    //   this.store.pipe(select(selectActiveOrgId), takeUntil(this.destroyed$)),
    // ]).subscribe((resp) => {
    //   if (
    //     resp[2] &&
    //     (!this.currentUser || this.currentUser.id !== resp[2].id) &&
    //     resp[4]
    //   ) {
    //     this.currentUser = resp[2]
    //     this.activeOrgId = resp[4]
    //     this.initApiCalls()
    //   }
    //   if (resp && resp[0] && resp[1] && resp[2] && resp[3]) {
    //     const readReceipts = resp[0]
    //     const teamEntities = resp[1]
    //     this.teamEntities = teamEntities
    //     // this.currentUser = resp[2]
    //     const userEntities = resp[3]
    //     this.userEntities = userEntities
    //     let receiverId = null
    //     this.unreadTeams = []
    //     readReceipts.forEach((receipt) => {
    //       if (
    //         receipt.unreadCount &&
    //         teamEntities[receipt?.teamId]
    //       ) {
    //         if (teamEntities[receipt.teamId]?.type === 'DIRECT_MESSAGE') {
    //           if (
    //             teamEntities[receipt.teamId]?.users[0].userId ===
    //             this.currentUser?.id
    //           ) {
    //             receiverId = teamEntities[receipt.teamId]?.users[1].userId
    //           } else {
    //             receiverId = teamEntities[receipt.teamId]?.users[0].userId
    //           }
    //           const unreadTeam = {
    //             type: 'USER',
    //             teamId: receipt.teamId,
    //             value: userEntities[receiverId],
    //           }
    //           this.unreadTeams.push(unreadTeam)
    //         } else {
    //           const unreadTeam = {
    //             type: 'TEAM',
    //             teamId: receipt.teamId,
    //             value: teamEntities[receipt.teamId],
    //           }
    //           this.unreadTeams.push(unreadTeam)
    //         }
    //       }
    //     })
    //   }
    // })

    this.pushNotificationInit();
    let authToken;
    setTimeout(() => {
      authToken = window.localStorage.getItem('feathers-jwt');
    }, 0);
    if (this.isMobile) {
      this.cordovaCall.on('answer', (e) => {

        Jitsi.joinConference({
          roomName: this.DMCallId ? String(this.DMCallId) : 'space-test-room', // room identifier for the conference
          url: `https://meet.intospace.io/${this.DMCallId}`, // endpoint of the Jitsi Meet video bridge,
          token: authToken, // jwt authentication token
          displayName: `${this.currentUser.firstName} ${this.currentUser.lastName}`, // user's display name
          email: this.currentUser.email, // user's email
          avatarURL: this.currentUser.avatar, // user's avatar url
          chatEnabled: true, // enable Chat feature
          inviteEnabled: true, // enable Invitation feature
          callIntegrationEnabled: false
        }).then(res => {
        });
      });

      this.cordovaCall.on('hangup', async (e) => {
        console.log('---this.cordovaCall event hangup e', e);
        await Jitsi.leaveConference();
      })

      this.cordovaCall.on('reject', (e) => {
        console.log('---this.cordovaCall event reject e', e);
      })

      this.cordovaCall.on('mute', (e) => {
        console.log('---this.cordovaCall event mute e', e);
        // Jitsi.mute();
      })

      this.cordovaCall.on('unmute', (e) => {
        console.log('---this.cordovaCall event unmute e', e);
        // Jitsi.unmute();
      })

      this.cordovaCall.on('speakerOn', (e) => {
        console.log('---this.cordovaCall event speakerOn e', e);
      })

      this.cordovaCall.on('speakerOff', (e) => {
        console.log('---this.cordovaCall event speakerOff e', e);
      })
    }

    window.addEventListener('onConferenceLeft', () => {
      console.log('--JITSI onConferenceLeft')
      this.cordovaCall.endCall();
    });

  }

  private reconnectToWS() {
    this.storage.get('feathers-jwt').then(token => {
      if (token) {
        this.feathersService.authentication({ strategy: 'jwt', accessToken: token, orgId: this.activeOrgId })
        this.feathersService.reconnectSocket();
        this.initApiCalls();
        this.initializeFeathersEvents();
      }
    })
  }

  private pushNotificationInit() {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    if(this.isMobile) {
      PushNotifications.requestPermission().then(result => {
        if (result.granted) {
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register();
        } else {
          // Show some error
        }
      });

      PushNotifications.addListener(
        'registration',
        (token: PushNotificationToken) => {
          console.log('fcmm token.value', token.value);
          this.userService
          .addDeviceToken(token.value)
          .then((data) => {
          })
          .catch((err) => {
          })
        },
      );

      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotification) => {
          if (notification.data.channelId !== this.activeChat?.name) {
            LocalNotifications.schedule({notifications: [{
              id: +notification.data.id,
              title: notification.title,
              body: notification.body,
              sound: 'default',
              extra: notification.data
            }]});
          }
        },
      );

      PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification: PushNotificationActionPerformed) => {
          this.handlePushInfoResponse(notification.notification.data);
        },
      );

      LocalNotifications.addListener('localNotificationActionPerformed', (localNotification: LocalNotificationActionPerformed) => {
        this.handlePushInfoResponse(localNotification.notification.extra);
      })
    }
  }

  private handlePushInfoResponse(pushInfo: any) {
    const message: IMessageResponse = pushInfo
    // send a new message if has replied
    this.zone.run(() => {
      this.redirectToChat(message)
    })
  }

  private redirectToChat(message: IMessageResponse) {
    const url = `/org/chat/${message.teamId}`
    // this.router.navigateByUrl(url)
    this.navController.navigateForward(url);
  }

  private authenticateWebsocket() {
    // this.store.dispatch(setActiveOrgId({orgId: '5zvduevwhn1w7zdv2bd3'}));
    this.storage.get('feathers-jwt').then(token => {
      if (token) {
        this.store.pipe(select(selectActiveOrgId), takeWhile(e => e?.length >  0)).subscribe(activeOrgId => {
          if (activeOrgId) {
            this.feathersService
              .authentication({ strategy: 'jwt', accessToken: token, orgId: activeOrgId, })
              .then((res) => {
                // this.store.dispatch(setActiveOrgId({orgId: 'vs15uc2n05cb5fkca4bg'}));
                this.dataLoader.errored = false
                this.dataLoader.loading = false
                this.store.dispatch(loadUser())
              })
              .catch((e) => {
                if (e.code === 401) {
                  console.log('[ERROR] OrgComponent::loadAppData 401', e)
                  if (this.activeOrg) {
                    DB.delOrgById(this.activeOrg.id)
                  }
                  this.router.navigateByUrl(`/`)
                } else {
                  this.dataLoader.loading = false
                  console.log('[ERROR] OrgComponent::loadAppData', e)
                }
              })
          }
        })
      } else {
        this.router.navigateByUrl(`/`)
      }
    })
  }

  public initApiCalls() {
    console.log('initApiCalls this.activeOrgId', this.activeOrgId);
    // const urlSnapshot = this.router.routerState.snapshot.url
    // if (urlSnapshot === '/orgs') {
    //   const orgId = this.activeOrgId
    //   this.redirectToHomeComponent(orgId)
    // }
    this.store.dispatch(
      loadOrg({
        orgId: this.activeOrgId,
      })
    )
    this.store.dispatch(
      loadAllTeams({
        orgId: this.activeOrgId,
      })
    )

    this.store.dispatch(loadUserOrgs())

    // this.store.dispatch(
    //   loadAllReadReceipts({
    //     orgId: this.activeOrgId
    //   })
    // )
    // this.store.dispatch(
    //   loadRecentChannelsList({ orgId: this.activeOrgId })
    // )
    // this.store.dispatch(loadRecentUsersList({ orgId: this.activeOrgId }))
    this.store.dispatch(
      loadRecentItems({
        orgId: this.activeOrgId,
        userId: this.currentUser?.id,
      })
    )
    this.store.dispatch(
      loadOnlineUsers({
        orgId: this.activeOrgId,
      })
    )
    this.store.dispatch(
      loadDraftHistoryList({
        orgId: this.activeOrgId,
        userId: this.currentUser?.id,
      })
    )
    this.store.dispatch(
      loadRecentChatLastMessage({
        orgId: this.activeOrgId,
      })
    )
  }


  private initCall(teamId: any) {
    if (teamId) {
      this.DMCallId = teamId;
      let callDisplayName;
      if (this.teamEntities[teamId].type === 'DIRECT_MESSAGE') {
        // if (this.teamEntities[teamId]?.users[0].userId === this.currentUser.id) {
        //   callDisplayName = `${this.teamEntities[teamId]?.users[1].firstName} ${this.teamEntities[teamId]?.users[1].lastName}`
        // } else {
        //   callDisplayName = `${this.teamEntities[teamId]?.users[0].firstName} ${this.teamEntities[teamId]?.users[0].lastName}`
        // }
        callDisplayName = 'space'
      } else {
        callDisplayName = this.teamEntities[teamId].name;
      }
      this.cordovaCall.setAppName(callDisplayName);
      this.cordovaCall.receiveCall('SPACE', teamId);
    }
  }


  private initializeFeathersEvents() {
    console.log('initializeFeathersEvents')

    // new events

    this.feathersService.service('orgs').on('patched', (org: any) => {
      this.zone.run(() => {
        this.store.dispatch(updateOrgViaEvent({ org }))
      })
    })

    this.feathersService.service('orgUser').on('created', (user: any) => {
      this.zone.run(() => {
        this.store.dispatch(upsertUserViaEvent({ user }))
      })
    })

    this.feathersService.service('orgUser').on('patched', (user: any) => {
      this.zone.run(() => {
        if (!user?.org_user?.isEnabled && user?.id === this.currentUser?.id) {
          console.log('current user has been deactivated')
        } else {
          this.store.dispatch(upsertUserViaEvent({ user }))
        }
      })
    })

    this.feathersService.service('users').on('patched', (user: any) => {
      this.zone.run(() => {
        this.store.dispatch(upsertUserViaEvent({ user }))
      })
    })

    this.feathersService.service('onlineUsers').on('created', (user: any) => {
      this.zone.run(() => {
        this.store.dispatch(upsertOnlineUserViaEvent({ user }))
      })
    })

    this.feathersService.service('onlineUsers').on('updated', (user: any) => {
      this.zone.run(() => {
        this.store.dispatch(removeOnlineUserViaEvent({ user }))
      })
    })

    this.feathersService.service('chat/team').on('created', (team: any) => {
      this.zone.run(() => {
        this.store.dispatch(upsertTeamViaEvent({ team }))
      })
    })

    this.feathersService.service('chat/team').on('patched', (team: any) => {
      this.zone.run(() => {
        this.store.dispatch(upsertTeamViaEvent({ team }))
      })
    })

    this.feathersService.service('chat/team').on('updated', (team: any) => {
      this.zone.run(() => {
        this.store.dispatch(upsertTeamViaEvent({ team }))
      })
    })

    this.feathersService
      .service('chat/teamUser')
      .on('created', (teamUser: any) => {
        this.zone.run(() => {
          if (teamUser?.userId === this.currentUser?.id) {
            this.store.dispatch(upsertRecentItemViaEvent({ teamUser }))
          }
          if (this.teamEntities[teamUser.teamId]) {
            this.store.dispatch(
              addTeamUserViaEvent({
                teamUser,
              })
            )
          } else {
            this.store.dispatch(
              loadTeam({
                teamId: teamUser.teamId,
              })
            )
          }
        })
      })

    this.feathersService
      .service('chat/teamUser')
      .on('patched', (teamUserData: any) => {
        if (teamUserData?.eventType !== 'DraftHistoryUpdate') {
          if (
            teamUserData?.teamId === this.activeChat?._id &&
            (teamUserData?.unreadCount || teamUserData?.badgeCount)
          ) {
            let isHidden = null
            if (typeof document.hidden !== 'undefined') {
              isHidden = 'hidden'
            } else if (typeof (document as any).msHidden !== 'undefined') {
              isHidden = 'msHidden'
            } else if (typeof (document as any).webkitHidden !== 'undefined') {
              isHidden = 'webkitHidden'
            }
            if (document[isHidden]) {
              this.store.dispatch(
                upsertRecentItemViaEvent({ teamUser: teamUserData })
              )
            } else {
              this.store.dispatch(
                updateRecentItems({
                  orgId: this.activeChat?.orgId,
                  teamId: this.activeChat?._id,
                  userId: this.currentUser.id,
                  model: {
                    unreadCount: 0,
                    badgeCount: 0,
                  },
                })
              )
              teamUserData = { ...teamUserData, unreadCount: 0, badgeCount: 0 }
              this.store.dispatch(
                upsertRecentItemViaEvent({ teamUser: teamUserData })
              )
            }
          } else {
            this.store.dispatch(
              upsertRecentItemViaEvent({ teamUser: teamUserData })
            )
          }
        } else {
          this.store.dispatch(
            upsertDraftHistoryViaEvent({ teamUser: teamUserData })
          )
        }
      })

    this.feathersService
      .service('chat/teamUser')
      .on('updated', (teamUser: any) => {
        if (teamUser && teamUser?.teamId) {
          this.zone.run(() => {
            let removeTeam = false
            if (teamUser?.userId === this.currentUser?.id) {
              this.store.dispatch(removeRecentItemViaEvent({ teamUser }))
              if (this.teamEntities[teamUser?.teamId]?.type === 'PRIVATE') {
                removeTeam = true
                if (teamUser?.teamId === this.activeChat?._id) {
                  this.navController.back()
                }
              }
            }
            this.store.dispatch(
              removeTeamUserViaEvent({ teamUser, removeTeam })
            )
          })
        }
      })

      this.feathersService
      .service('chat/message')
      .on('created', (message: any) => {
        this.zone.run(() => {
          if (
            (message?.mentions?.length ||
              this.teamEntities[message?.teamId]?.type === 'DIRECT_MESSAGE') &&
              message?.senderId !== this.currentUser.id
          ) {
            const mentions = message.mentions
            let toNotify =
              this.teamEntities[message?.teamId]?.type === 'DIRECT_MESSAGE'
                ? true
                : false
            if (!toNotify) {
              mentions.forEach((user) => {
                if (user === '@all') {
                  toNotify = true
                  return
                } else if (user === this.currentUser.id) {
                  toNotify = true
                  return
                }
              })
            }
            if (toNotify) {
              const html = message?.content
              const div = document.createElement('div')
              div.innerHTML = html
              const body = div.textContent || div.innerText || ''
              const notificationData = {
                message,
                notification: {
                  body,
                  title: `
                ${this.userEntities[message?.senderId]?.username} says`,
                },
              }
              this.pushNotify(notificationData)
            }
          }
          this.store.dispatch(
            upsertMessageViaEvent({
              message,
              activeChatId: this.activeChat?._id,
              currentUserId: this.currentUser?.id,
              eventType: WSEventType.CREATED

            })
          )
        })
      })

    this.feathersService
      .service('chat/message')
      .on('patched', (message: any) => {
        this.zone.run(() => {
          this.store.dispatch(
            upsertMessageViaEvent({
              message,
              activeChatId: this.activeChat?._id,
              currentUserId: this.currentUser?.id,
              eventType: WSEventType.PATCHED
            })
          )
          this.store.dispatch(
            upsertPinnedMessages({ teamId: message.teamId, model: message })
          )
        })
      })

    this.feathersService
      .service('chat/message')
      .on('updated', (message: any) => {
        this.zone.run(() => {
          this.store.dispatch(deleteMessageViaEvent({ message }))
        })
      })

    this.feathersService
      .service('chat/typeTracker')
      .on('created', (typeTracker: any) => {
        this.zone.run(() => {
          if (typeTracker?.userId !== this.currentUser?.id) {
            this.store.dispatch(
              upsertTypeTrackerViaEvent({
                model: typeTracker,
              })
            )
          }
        })
      })

    // this.feathersService
    //   .service('chat/session')
    //   .on('created', (sessionData: any) => {
    //     if (
    //       sessionData &&
    //       sessionData.type === 'DIRECT_MESSAGE' &&
    //       sessionData.webrtcSessionInfo.hostId !== this.currentUser.id
    //     ) {
    //       this.zone.run(() => console.log('ringing'))
    //       const modalRef = this.modalService.open(CommonModalComponent, {
    //         size: 'md',
    //         keyboard: false,
    //         backdrop: false,
    //       })
    //       modalRef.componentInstance.dialogType = 'incoming_call'
    //       modalRef.componentInstance.team = this.teamEntities[sessionData._id]
    //       modalRef.componentInstance.currentUser = this.currentUser
    //       modalRef.componentInstance.userEntities = this.userEntities
    //     }
    //   })
  }

  private pushNotify(pushInfo) {
    console.log('pushNotify');
  }

  public ngOnDestroy() {
    console.log('orgComponent ngOnDestroy');
    this.destroyed$.next(true)
    this.destroyed$.complete()
  }

}