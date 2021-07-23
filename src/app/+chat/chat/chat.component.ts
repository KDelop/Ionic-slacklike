import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  NgZone,
  ViewChild,
} from '@angular/core'
import {
  createMessage,
  loadChat, loadMoreChat, loadThreads, unsetNewMessageRecieved
} from '../store/actions/chat.actions'
import { Store, select } from '@ngrx/store'
import { ReplaySubject, Observable, combineLatest } from 'rxjs'
import { distinctUntilChanged, map, scan, take, takeUntil, tap } from 'rxjs/operators'
import {
  isMessageSent,
  isMessageRecieved,
  selectActiveChatMessages,
} from '../store/selectors/chat.selectors'
import { IMessageResponse } from '@app/src/app/models/interfaces/message.interfaces'
// import { selectActiveChat } from '../../store/reducers'
import {
  IListRootResponse,
  IProfileResponse,
  ITeamResponse,
} from '../../models'
import { IonInfiniteScroll, Platform } from '@ionic/angular'
import { isEqual } from 'lodash'
// import { selectCurrentUser, selectUserList } from '../../store/selectors/user.selectors'
// import { updateReadReceipt } from '../../store/actions/read-receipt.actions'
// import { selectReadReceiptsEntities } from '../../store/selectors/read-receipt.selectors'
// declare var cordova;
import {
  ITeamUserResponse,
  ITypeTrackerRes,
  RealTimeResponse,
} from '../../models'
import { DOCUMENT } from '@angular/common'
import {
  selectDMTeamEntities,
  selectPersonalTeam,
  selectTeamListEntities,
} from '../../store/selectors/team.selectors'
import { selectActiveChatTypers } from '../store/selectors/type-tracker.selectors'
import { v4 as uuidv4 } from 'uuid'
import moment from 'moment';
import { Dictionary } from '@ngrx/entity'
import { AnimationController, ModalController } from '@ionic/angular'
import { ActivatedRoute, Route } from '@angular/router'
import { ChatSettingsComponent } from '../chat-settings/chat-settings.component'
import { ChatService } from '../store/services/chat.service'

import { KeyboardResize, Plugins } from '@capacitor/core';
import 'capacitor-jitsi-meet';
import { selectDraftHistoryEntities } from '../../+org/store/selectors/draft-history.selectors'
import { selectActiveChat } from '../../store/reducers'
import { selectUserList, selectCurrentUser, selectUserEntities } from '../../store/selectors/user.selectors'
import { LocalService } from '../../store/services/local.service'
import { UploadFileService } from '../../store/services/upload.service'
import { updateRecentItems, upsertRecentItem } from '../../+org/store/actions/recent-items.actions'
import { selectActiveOrgId } from '../../store/selectors/org.selectors'
import { selectRecentItemsArray, selectRecentItemsEntities } from '../../+org/store/selectors/recent-items.selectors'
import { selectOnlineUserEntities } from '../../+org/store/selectors/online-users.selectors'
const { Jitsi, Keyboard } = Plugins;

// const CHAT_MESSAGE_LIMIT = 30

declare var cordova;

// const cordovaCall = cordova.plugins.CordovaCall;
const CHAT_MESSAGE_LIMIT = 30
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {

  // @ViewChild('threadElement') public threadElement;
  // @ViewChild('threadsText') public threadsText;
  // @ViewChild('threadsCloseBtn') public threadsCloseBtn;
  // @ViewChild('backBtn') public backBtn;

  // @ViewChild('chatFooter') public chatFooter;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  public chatList$: Observable<IMessageResponse[]>
  public chatList: IMessageResponse[]
  public moreMessages: IMessageResponse[]
  // public draftHistoryEntities$: Observable<{ [id: string]: string }>
  // public activeTypeTracker$: Observable<{ [id: number]: ITypeTrackerRes }>
  public draftHistoryEntities$: Observable<{ [id: string]: ITeamUserResponse }>
  public activeChat$: Observable<ITeamResponse>
  public teamEntities$: Observable<{ [id: number]: ITeamResponse }>
  public personalTeam$: Observable<ITeamResponse>
  public currentUser$: Observable<IProfileResponse>
  public userEntities$: Observable<{ [id: number]: IProfileResponse }>
  public DMTeamEntities$: Observable<{ [userId: number]: number }>
  public userList$: Observable<IProfileResponse[]>
  public isMessageSent$: Observable<boolean>
  public isMessageRecieved$: Observable<boolean>
  public activeChat: ITeamResponse
  public currentUser: IProfileResponse
  // public isLoaded: boolean
  public receiver: IProfileResponse
  public showFileUploadLoader = false
  public progressBarMsg = 'Uploading file...'
  public activeTypers: string
  private messagesPagination = 1
  // public showInfo: boolean
  // public channelUnreadCount = 0
  // public selectedUserId: number
  // public fileUploadObj: any
  // public attachmentData: any[] = []
  // public chatListEntities: Dictionary<IMessageResponse>
  // public activeThreadMessages$: Observable<IMessageResponse[]>
  // public activeThreadId: number
  // public profileModal: boolean;
  public showFooter: boolean;
  public showInfo: boolean
  public channelUnreadCount = 0
  public selectedUserId: number
  public fileUploadObj: any
  public attachmentData: any[] = []
  public chatListEntities: Dictionary<IMessageResponse>
  public activeThreadMessages$: Observable<IMessageResponse[]>
  public activeThreadId: string
  public profileModal: boolean;
  public activeOrgId$: Observable<string>
  public activeOrgId: string
  public recentItemsArray$: Observable<ITeamUserResponse[]>
  public onlineUsers: { [id: string]: string }
  public totalUnread: number = 0;
  private activeTypeTracker: { [id: number]: ITypeTrackerRes }
  private userEntities: { [id: number]: IProfileResponse }
  private isMobile = !this.platform.platforms().includes('desktop') && !this.platform.platforms().includes('mobileweb');
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1)

  // @HostBinding('class.fileover') fileOver: boolean

  constructor(
    // @Inject(DOCUMENT) private document: any,
    public store: Store,
    private cdRef: ChangeDetectorRef,
    private modalController: ModalController,
    private chatService: ChatService,
    private uploadFileService: UploadFileService,
    private zone: NgZone,
    private elementRef: ElementRef,
    private platform: Platform,
    private localService: LocalService,
    private route: ActivatedRoute
    // private cordovaCall = cordova.plugins.CordovaCall

  ) {
    // this.document.addEventListener(
    //   'mentionEvent',
    //   (e: CustomEvent) => {
    //     e.preventDefault()
    //     const a = e.detail.split('-')
    //     const id = atob(a[1].trim())
    //     this.selectedUserId = +id
    //     this.showInfo = true
    //   },
    //   false
    // )

  }

  // public threadAnimationEnter() {
  //   if (!this.cdRef['destroyed']) {
  //     this.cdRef.detectChanges();
  //   }
  //   const threadsWrapperEnter = this.animationCtrl.create()
  //   .addElement(this.threadElement.nativeElement)
  //   .fromTo('transform', 'translateX(100%)', 'translateX(0px)')

  //   const threadsTitleEnter = this.animationCtrl.create()
  //   .addElement(this.threadsText.nativeElement)
  //   .fromTo('height', '0', '16px')

  //   const threadsBtnEnter = this.animationCtrl.create()
  //   .addElement(this.threadsCloseBtn.el)
  //   .fromTo('transform', 'scale(0)', 'scale(1)')

  //   const chatFooterEnter = this.animationCtrl.create()
  //   .addElement(this.chatFooter.elementRef.nativeElement)
  //   .fromTo('transform', 'translateY(48px)', 'translateY(0)')

  //   const enterAnimation = this.animationCtrl.create()
  //   .duration(300)
  //   .easing('ease-out')
  //   .addAnimation([threadsWrapperEnter, threadsTitleEnter, threadsBtnEnter, chatFooterEnter])

  //   enterAnimation.play();
  // }

  // public threadAnimationLeave() {
  //   if (this.threadElement?.nativeElement) {
  //     const threadsWrapperLeave = this.animationCtrl.create()
  //     .addElement(this.threadElement.nativeElement)
  //     .fromTo('transform', 'translateX(0)', 'translateX(100%)')

  //     const threadsTitleLeave = this.animationCtrl.create()
  //     .addElement(this.threadsText.nativeElement)
  //     .fromTo('height', '16px', '0')

  //     const threadsBtnLeave = this.animationCtrl.create()
  //     .addElement(this.threadsCloseBtn.el)
  //     .fromTo('transform', 'scale(1)', 'scale(0)')

  //     const chatFooterLeave = this.animationCtrl.create()
  //     .addElement(this.chatFooter.elementRef.nativeElement)
  //     .fromTo('transform', 'translateY(0)', 'translateY(48px)')

  //     const leaveAnimation = this.animationCtrl.create()
  //     .duration(300)
  //     .easing('ease-in')
  //     .addAnimation([threadsWrapperLeave, threadsTitleLeave, threadsBtnLeave, chatFooterLeave])

  //     leaveAnimation.play().then(res => {
  //       this.closeThread();
  //     });
  //   }
  // }

  // public backBtnAnimation() {
  //   this.activeThreadId = null;
  //   if (!this.cdRef['destroyed']) {
  //     this.cdRef.detectChanges();
  //   }
  //   if (this.backBtn?.el) {
  //     const backBtnEnter = this.animationCtrl.create()
  //     .addElement(this.backBtn.el)
  //     .duration(300)
  //     .easing('ease-in')
  //     .fromTo('transform', 'scale(0)', 'scale(1)')
  //     backBtnEnter.play();
  //   }
  // }

  ionViewDidLeave() {
    // this.destroyed$.next(true)
    // this.destroyed$.complete()
  }

  ionViewDidEnter() {
    if (this.isMobile && this.platform.is('ios')) {
      Keyboard.setResizeMode({
        mode: KeyboardResize.None
      })
      Keyboard.addListener('keyboardWillShow', info => {
        document.querySelector<HTMLElement>('.chat-main').style.transform = `translate(0px, -${info.keyboardHeight}px`;
        document.querySelector<HTMLElement>('ion-footer').style.transform = `translate(0px, -${info.keyboardHeight}px`;

        document.querySelector<HTMLElement>('.reaction-popover').style.transform = `translate(0px, -${info.keyboardHeight}px`;
        document.querySelector<HTMLElement>('app-reaction-picker ngx-emoj-category-content').style.maxHeight = `calc(100vh - ${(info.keyboardHeight + 150)}px)`;
      });
      Keyboard.addListener('keyboardWillHide', () => {
        document.querySelector<HTMLElement>('.chat-main').style.transform = '';
        document.querySelector<HTMLElement>('ion-footer').style.transform = '';
        document.querySelector<HTMLElement>('.reaction-popover').style.transform = '';
        document.querySelector<HTMLElement>('app-reaction-picker ngx-emoj-category-content').style.maxHeight = '';
      });
    }
  }

  ionViewWillEnter(): void {
    // console.log('chatComponent ionViewDidEnter');
    this.activeChat$ = this.store.pipe(
      select(selectActiveChat),
      takeUntil(this.destroyed$)
    )


    this.userList$ = this.store.pipe(
      select(selectUserList),
      takeUntil(this.destroyed$)
    )

    this.chatList$ = this.store.pipe(
      select(selectActiveChatMessages),
      takeUntil(this.destroyed$),
      // distinctUntilChanged((curr, next) => JSON.stringify(curr) === JSON.stringify(next))
      distinctUntilChanged()
    )

    // this.chatList$.subscribe(chatList => {
    //   console.log('chatList', chatList);
    // })

    // this.chatList$.subscribe(chat => {
    //   console.log('chat', chat);
    //   // this.chatList = cloneDeep(chat);
    //   this.chatList = chat;
    // })

    // this.store.pipe(select(selectActiveLoadMoreMessages), distinctUntilChanged((curr, next) => isEqual(curr, next)), takeUntil(this.destroyed$)).subscribe(moreMessages => {
    //   console.log('moreMessages', moreMessages);
    //   this.moreMessages = moreMessages;
    // })

    // combineLatest([
    //   this.chatList$.pipe(distinctUntilChanged((curr, next) => isEqual(curr, next))),
    //   this.store.pipe(select(selectActiveLoadMoreMessages), distinctUntilChanged((curr, next) => isEqual(curr, next)), takeUntil(this.destroyed$))
    // ])
    // .subscribe(resp => {
    //   this.chatList = resp[0];
    //   let loadMoreMessages = resp[1];
    //   console.log('loadMoreMessages', loadMoreMessages);
    //   // this.chatList.push(loadMoreMessages[0])

    //   loadMoreMessages?.forEach(message => {

    //     this.chatList?.push(message)
    //     this.cdRef.detectChanges();
    //   })
    //   // this.chatList.concat(loadMoreMessages)
    //   console.log('this.chatList', this.chatList);
    // })
    this.recentItemsArray$ = this.store.pipe(
      select(selectRecentItemsArray),
      takeUntil(this.destroyed$)
    )

    this.currentUser$ = this.store.pipe(
      select(selectCurrentUser),
      takeUntil(this.destroyed$)
    )
    this.userEntities$ = this.store.pipe(
      select(selectUserEntities),
      takeUntil(this.destroyed$)
    )
    this.isMessageSent$ = this.store.pipe(
      select(isMessageSent),
      takeUntil(this.destroyed$)
    )
    this.isMessageRecieved$ = this.store.pipe(
      select(isMessageRecieved),
      takeUntil(this.destroyed$)
    )
    // this.readReceiptEntities$ = this.store.pipe(
    //   select(selectReadReceiptsEntities),
    //   takeUntil(this.destroyed$)
    // )
    // this.draftHistoryEntities$ = this.store.pipe(
    //   select(selectDraftHistoryEntities),
    //   takeUntil(this.destroyed$)
    // )
    // this.DMTeamEntities$ = this.store.pipe(
    //   select(selectDMTeamEntities),
    //   takeUntil(this.destroyed$)
    // )
    // this.personalTeam$ = this.store.pipe(
    //   select(selectPersonalTeam),
    //   takeUntil(this.destroyed$)
    // )
    this.teamEntities$ = this.store.pipe(
      select(selectTeamListEntities),
      takeUntil(this.destroyed$)
    )
    this.draftHistoryEntities$ = this.store.pipe(
      select(selectDraftHistoryEntities),
      takeUntil(this.destroyed$)
    )
    this.DMTeamEntities$ = this.store.pipe(
      select(selectDMTeamEntities),
      takeUntil(this.destroyed$)
    )
    this.personalTeam$ = this.store.pipe(
      select(selectPersonalTeam),
      takeUntil(this.destroyed$)
    )
    // this.teamEntities$ = this.store.pipe(
    //   select(selectTeamListEntities),
    //   takeUntil(this.destroyed$)
    // )
    // this.activeTypeTracker$ = this.store.pipe(
    //   select(selectActiveChatTypers),
    //   takeUntil(this.destroyed$)
    // )

    // this.activeThreadMessages$ = this.store.pipe(
    //   select(selectActiveThreadMessages),
    //   takeUntil(this.destroyed$)
    // )

    this.activeOrgId$ = this.store.pipe(
      select(selectActiveOrgId),
      takeUntil(this.destroyed$)
    )

    this.activeOrgId$.subscribe((orgId) => {
      this.activeOrgId = orgId
    })

    this.store.pipe(select(selectOnlineUserEntities), takeUntil(this.destroyed$)).subscribe((onlineUsers) => {
      this.onlineUsers = onlineUsers
    })

    this.store.pipe(
      select(selectActiveChatTypers),
      takeUntil(this.destroyed$)
    ).subscribe((res) => {
      this.activeTypeTracker = res;
      this.findActiveTypers();
    })

    this.store.pipe(
      select(selectRecentItemsArray),
      takeUntil(this.destroyed$)
    ).subscribe(recentItems => {
      this.totalUnread = 0;
      recentItems.forEach(item => {
        this.totalUnread = this.totalUnread + item.unreadCount;
      })
    })


    // combineLatest([
    //   this.activeChat$,
    //   this.store.pipe(select(selectActiveThreadId), takeUntil(this.destroyed$)),
    // ]).subscribe((resp) => {
    //   if (resp[0] && resp[1]) {
    //     const threadId = resp[1]
    //     if (
    //       threadId &&
    //       resp[0]._id &&
    //       (!this.activeThreadId || threadId !== this.activeThreadId)
    //     ) {
    //       this.store.dispatch(
    //         loadThreads({
    //           teamId: resp[0]._id,
    //           threadId,
    //         })
    //       )
    //       this.activeThreadId = threadId
    //     }
    //   } else {
    //     this.activeThreadId = null
    //   }
    // })


    // this.activeThreadMessages$ = this.store.pipe(
    //   select(selectActiveThreadMessages),
    //   takeUntil(this.destroyed$)
    // )

    combineLatest([
      this.activeChat$,
      this.currentUser$,
      // this.readReceiptEntities$,
      this.userEntities$,
      this.store.pipe(select(selectRecentItemsEntities),takeUntil(this.destroyed$))
      // this.store.pipe(select(selectStarredItems), takeUntil(this.destroyed$))
    ]).subscribe((resp) => {
      const activeChat = resp[0]
      const currentUser = resp[1]
      this.currentUser = currentUser
      // const readReceiptEntities = resp[2]
      this.userEntities = resp[2]
      const userEntities = resp[2]
      const recentItemEntities = resp[3]

      if (activeChat) {
        if (
          (activeChat?._id !== this.activeChat?._id || recentItemEntities[activeChat._id]?.unreadCount) &&
          recentItemEntities[activeChat._id] &&
          recentItemEntities[activeChat._id].unreadCount
        ) {
          setTimeout(() => {
            this.resetUnreadCount(
              recentItemEntities[activeChat._id],
              activeChat
            )
          }, 2000);
        }
        if (activeChat?._id !== this.activeChat?._id) {
          if (
            activeChat?.type === 'DIRECT_MESSAGE' ||
            activeChat?.type === 'PERSONAL'
          ) {
            let receiverId = null
            if (activeChat?.type === 'PERSONAL') {
              receiverId = currentUser?.id
            } else {
              if (activeChat?.users?.length && activeChat?.users[0].userId === currentUser?.id) {
                receiverId = activeChat?.users[1]?.userId
              } else {
                receiverId = activeChat?.users[0]?.userId
              }
            }
            this.receiver = userEntities[receiverId]
          }
          this.store.dispatch(
            loadChat({
              // orgId: activeChat?.orgId,
              // channelId: activeChat?.name,
              teamId: activeChat?._id,
            })
          )
          // const utcMoment = new Date().toISOString()
          // this.store.dispatch(
          //   upsertRecentItem({
          //     orgId: this.activeOrgId,
          //     userId: this.currentUser.id,
          //     teamId: activeChat?._id,
          //     model: {
          //       teamId: activeChat._id,
          //       userId: this.currentUser.id,
          //       orgId: this.activeOrgId,
          //       lastUpdatedAt: utcMoment,
          //       // isPinned:
          //       //   starredItems && starredItems[activeChat?._id]?.isPinned,
          //     },
          //   })
          // )
          this.activeChat = activeChat
        }
      } else if (!activeChat) {
        this.activeChat = null
      }
    })



    // combineLatest([
    //   this.activeChat$,
    //   this.currentUser$,
    //   this.readReceiptEntities$,
    //   this.userEntities$,
    // ]).subscribe((resp) => {
    //   const activeChat = resp[0]
    //   const currentUser = resp[1]
    //   this.currentUser = currentUser
    //   const readReceiptEntities = resp[2]
    //   const userEntities = resp[3]
    //   if (activeChat) {
    //     if (
    //       readReceiptEntities[activeChat.id] &&
    //       readReceiptEntities[activeChat.id].unreadCount
    //     ) {
    //       this.resetUnreadCount(readReceiptEntities[activeChat.id], activeChat)
    //     }
    //     if (activeChat?.id !== this.activeChat?.id) {
    //       if (
    //         activeChat?.type === 'DIRECT_MESSAGE' ||
    //         activeChat?.type === 'PERSONAL'
    //       ) {
    //         let receiverId = null
    //         if (activeChat?.type === 'PERSONAL') {
    //           receiverId = currentUser?.id
    //         } else {
    //           if (activeChat?.users?.length && activeChat?.users[0].id === currentUser?.id) {
    //             receiverId = activeChat?.users[1]?.id
    //           } else {
    //             receiverId = activeChat?.users[0]?.id
    //           }
    //         }
    //         this.receiver = userEntities[receiverId]
    //       }
    //       this.store.dispatch(
    //         loadChat({
    //           orgId: activeChat?.orgId,
    //           channelId: activeChat?.name,
    //           teamId: activeChat?.id,
    //         })
    //       )
    //       this.activeChat = activeChat
    //     }
    //   } else if (!activeChat) {
    //     this.activeChat = null
    //   }
    // })

    // this.store
    //   .pipe(takeUntil(this.destroyed$), select(isChatsLoaded))
    //   .subscribe((isLoaded) => {
    //     this.isLoaded = isLoaded
    //   })

    this.route.queryParamMap.subscribe((paramsMap) => {
      const isDetails = paramsMap.get('details')
      if (isDetails) {
        this.presentModal();
      } else {
        if (this.profileModal) {
          this.modalController.dismiss();
        }
      }
    })

    // window.addEventListener('onConferenceJoined', () => {
    //   console.log('\n\n\n')
    //   console.log('--JITSI chatComponent onConferenceJoined')
    //   // console.log('Jitsi', Jitsi);
    //   console.log('\n\n\n')
    //   // do things here
    // });
    // window.addEventListener('onConferenceLeft', () => {
    //   console.log('--JITSI onConferenceLeft')
    //     // do things here
    // });
  }

  public resetUnreadCount(receipt, activeChat) {
    // if (document[this.isHidden]) {
    //   this.hiddenActiveChat = activeChat
    //   this.hiddenReadreceipt = receipt
    //   return
    // }
    if (activeChat !== this.activeChat) {
      this.channelUnreadCount = receipt.unreadCount
    }
    this.store.dispatch(
      updateRecentItems({
        userId: this.currentUser.id,
        orgId: activeChat?.orgId,
        teamId: activeChat?._id,
        model: {
          unreadCount: 0,
          badgeCount: 0,
        }
      })
    )
    // this.hiddenActiveChat = null
    // this.hiddenReadreceipt = null
  }

  public openChatDetails() {
    this.localService.changeQueryParam({
      thread: null,
      details: true,
    })
  }

  async presentModal() {

    let self = this;
    let currentUser = this.currentUser;
    let activeChat = this.activeChat;
    let personalTeam;
    let receiver = this.receiver;
    this.personalTeam$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
      personalTeam = res;
    });
    let userEntities;
    this.userEntities$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
      userEntities = res;
    });
    let DMTeamEntities;
    this.DMTeamEntities$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
      DMTeamEntities = res;
    });
    const modal = await self.modalController.create({
      component: ChatSettingsComponent,
      componentProps: {
        userInfo: receiver,
        currentUser: currentUser,
        activeChat: activeChat,
        personalTeam: personalTeam,
        userEntities: userEntities,
        selectedUserId: null,
        DMTeamEntities: DMTeamEntities,
        activeOrgId: this.activeChat.orgId,
        onlineUsers: this.onlineUsers
      },
      swipeToClose: true,
      presentingElement: this.elementRef.nativeElement,
      backdropDismiss: true
    })
    await modal.present().then(() => {
      this.profileModal = true;
    });
    modal.onDidDismiss().then(() => {
      this.profileModal = false;
    })
  }

  public ngOnDestroy() {
    this.destroyed$.next(true)
    this.destroyed$.complete()
  }

  // public ngOnDestroy() {
  //   this.destroyed$.next(true)
  //   this.destroyed$.complete()
  // }

  // // public toggleSideBar() {
  // //   this.showInfo = !this.showInfo
  // //   this.selectedUserId = null
  // // }
  public onFileUploading(ev: { inProgress: boolean; msg: string }) {
    this.showFileUploadLoader = ev.inProgress
    this.progressBarMsg = ev.msg
  }

  public loadMoreMessages(event) {
    const skip = CHAT_MESSAGE_LIMIT * this.messagesPagination
    this.store.dispatch(
      loadMoreChat({
        // orgId: this.activeChat?.orgId,
        // channelId: this.activeChat?.name,
        teamId: this.activeChat?._id,
        skip,
        limit: CHAT_MESSAGE_LIMIT,
      })
    )


    this.messagesPagination++
  }

  public unsetNewMessageRecieved() {
    this.store.dispatch(unsetNewMessageRecieved())
  }

  public async initiateTeamCall() {
    const authToken = window.localStorage.getItem('feathers-jwt');
    console.log('initiateTeamCall this.activeChat', this.activeChat);
    console.log('initiateTeamCall authToken', authToken);
    await Jitsi.joinConference({
      roomName: this.activeChat?._id ? String(this.activeChat?._id) : 'space-test-room', // room identifier for the conference
      url: `https://meet.intospace.io/${this.activeChat?._id}`, // endpoint of the Jitsi Meet video bridge,
      token: authToken, // jwt authentication token
      displayName: `${this.currentUser.firstName} ${this.currentUser.lastName}`, // user's display name
      email: this.currentUser.email, // user's email
      avatarURL: this.currentUser.avatar, // user's avatar url
      chatEnabled: true, // enable Chat feature
      inviteEnabled: true // enable Invitation feature
    });
    if (this.activeChat?.type !== 'DIRECT_MESSAGE') {
      const message: IMessageResponse = {
        channelId: this.activeChat?.name,
        content: `<span class="mention" data-index="0" data-denotation-char="@" data-id="0" data-username="channel" data-value="channel" data-identifier="@all"><span contenteditable="false">**<span class="ql-mention-denotation-char">@</span>channel**</span></span> [Join](https://meet.intospace.io/${this.activeChat?._id})<br>`,
        mentions: ['@all'],
        teamId: this.activeChat?._id,
        requestId: uuidv4(),
        senderId: this.currentUser?.id,
        createdAt: this.getCurrentDateTime(),
      }
      this.store.dispatch(
        createMessage({
          // orgId: this.activeChat.orgId,
          message,
        })
      )
    }
    this.chatService
    .startCallSession({teamId: this.activeChat?._id})
    .then((res: RealTimeResponse<IListRootResponse<any>>) => {
      if (res && res.successful) {
        console.log('--JITSI service response call initiated successfully res', res);
      }
    })
  }

  // public closeThread() {
  //   this.localService.changeQueryParam({
  //     thread: null,
  //     details: null,
  //   })
  //   this.backBtnAnimation();
  // }

  private findActiveTypers() {
    this.activeTypers = ''
    const typersArray = []
    if (this.activeTypeTracker && Object.keys(this.activeTypeTracker)?.length) {
      Object.keys(this.activeTypeTracker).map((id) => {
        if (
          this.activeTypeTracker[id].isTyping &&
          !this.isXSecodsAgo(this.activeTypeTracker[id].createdAt, 30) &&
          id !== `${this.currentUser?.id}`
        ) {
          typersArray.push(this.activeTypeTracker[id])
        }
      })
      const typers: string[] = typersArray.map(
        (tracker: ITypeTrackerRes) =>
        this.userEntities[tracker.userId].firstName +
        ' ' +
        this.userEntities[tracker.userId]?.lastName
      )
      if (typers.length) {
        this.activeTypers = `${typers.join(', ')} ${
          typers.length === 1 ? 'is' : 'are'
        } typing`
      }
    }
  }

  private isXSecodsAgo(date: string | Date, seconds) {
    return new Date().getTime() - new Date(date).getTime() > seconds * 1000
  }

  private uploadFilesToS3(e) {
    let message: IMessageResponse = Object.assign(e)
    if (message.content.split('\n').length > 3) {
      const str = message.content.replace(/\n\n/gi, '<br>')
      message = { ...message, content: str }
    }
    message = {
      ...message,
      teamId: this.activeChat._id,
      channelId: this.activeChat.name,
      requestId: uuidv4(),
      senderId: this.currentUser.id,
    }

    let totalUploads = 0
    const attachmentData = []
    // for (let i = 0; i < this.fileUploadObj.length; i++) {
    this.fileUploadObj.forEach((item) => {
      const obj = {
        content: item.file,
        key: item.key,
        file: {
          type: item.type,
        },
      }
      const ref = this.uploadFileService.uploadfile(obj)
      ref
        .then((res: any) => {
          this.zone.run(() => {
            totalUploads++
            const resourceKey = res.Key || res.key
            const attachment = {
              title: item.name,
              key: resourceKey,
              resourceUrl: `https://kiss-uploads.sokt.io/${encodeURI(
                resourceKey
              )}`,
              contentType: obj.file.type,
              size: item.file.size,
              encoding: '',
            }
            attachmentData.push(attachment)
            if (totalUploads === this.fileUploadObj.length) {
              this.showFileUploadLoader = true
              this.progressBarMsg = 'Your file is successfully uploaded'
              message = { ...message, attachment: attachmentData }
              this.sendMessagewithAttachment(message)
            }
          })
        })
        .catch((err: any) => {
          this.showFileUploadLoader = true
          this.progressBarMsg =
            'There is some issue with file uploading. please try again'
          totalUploads++
          if (totalUploads === this.fileUploadObj.length) {
            message = { ...message, attachment: attachmentData }
            this.sendMessagewithAttachment(message)
          }
        })
    })
  }

  // public async initiateTeamCall() {
  //   const authToken = window.localStorage.getItem('feathers-jwt');
  //   console.log('initiateTeamCall this.activeChat', this.activeChat);
  //   console.log('initiateTeamCall authToken', authToken);
  //   await Jitsi.joinConference({
  //     roomName: this.activeChat?.id ? String(this.activeChat?.id) : 'space-test-room', // room identifier for the conference
  //     url: `https://meet.intospace.io/${this.activeChat?.id}`, // endpoint of the Jitsi Meet video bridge,
  //     token: authToken, // jwt authentication token
  //     displayName: `${this.currentUser.firstName} ${this.currentUser.lastName}`, // user's display name
  //     email: this.currentUser.email, // user's email
  //     avatarURL: this.currentUser.googleId, // user's avatar url
  //     chatEnabled: true, // enable Chat feature
  //     inviteEnabled: true // enable Invitation feature
  //   });
  //   if (this.activeChat?.type !== 'DIRECT_MESSAGE') {
  //     const message: IMessageResponse = {
  //       channelId: this.activeChat?.name,
  //       content: `<span class="mention" data-index="0" data-denotation-char="@" data-id="0" data-username="channel" data-value="channel" data-identifier="@all"><span contenteditable="false">**<span class="ql-mention-denotation-char">@</span>channel**</span></span> [Join](https://meet.intospace.io/${this.activeChat?.id})<br>`,
  //       mentions: ['@all'],
  //       teamId: this.activeChat?.id,
  //       requestId: uuidv4(),
  //       senderId: this.currentUser?.id,
  //       createdAt: this.getCurrentDateTime(),
  //     }
  //     this.store.dispatch(
  //       createMessage({
  //         orgId: this.activeChat.orgId,
  //         message,
  //       })
  //     )
  //   }
  //   this.chatService
  //   .startCallSession(this.activeChat?.orgId, this.activeChat?.id)
  //   .then((res: RealTimeResponse<IListRootResponse<any>>) => {
  //     if (res && res.successful) {
  //       console.log('--JITSI service response call initiated successfully res', res);
  //     }
  //   })
  // }

  // private onFileUploadTrigger(files: File[]) {
  //   this.fileUploadObj = []
  //   if (files) {
  //     for (let i = 0; i < files.length; i++) {
  //       const name = files[i].name.replace(/[^\w\s\.\_\-]/gi, '')
  //       this.fileUploadObj[i] = {
  //         key: `${uuidv4()}_${name}`,
  //         name,
  //         comment: '',
  //         path: (files[i] as any).path,
  //         // handle for zip and dmg and few other types
  //         type: files[i].type || `application/${name.split('.').pop()}`,
  //         isShared: true,
  //         file: files[i],
  //       }
  //     }
  //   }
  //   if (this.fileUploadObj?.length) {
  //     this.showFileUploadLoader = true
  //     this.progressBarMsg = 'Uploading file...'
  //     const contentObj: any = {
  //       content: 'Shared attachment from mobile.',
  //       mentions: [],
  //     }
  //     this.uploadFilesToS3(contentObj)
  //   }
  // }

  private createMessage(message) {
    message = { ...message, createdAt: this.getCurrentDateTime() }
    this.store.dispatch(
      createMessage({
        // orgId: this.activeChat.orgId,
        message,
      })
    )
    this.fileUploadObj = []
    setTimeout(() => {
      this.showFileUploadLoader = false
      this.progressBarMsg = ''
    }, 2000)
  }

  private sendMessagewithAttachment(message) {
    this.attachmentData = []
    message.attachment.forEach((attachment) => {
      this.feedImageDimensions(message, attachment)
    })
  }

  private feedImageDimensions(message, attachment) {
    if (
      attachment.contentType &&
      attachment.contentType.startsWith('image') &&
      attachment.contentType !== 'image/vnd.adobe.photoshop'
    ) {
      const image = new Image()
      image.src = attachment.resourceUrl
      image.onload = (scope) => {
        this.zone.run(() => {
          attachment = {
            ...attachment,
            metaData: {
              height: image.height,
              width: image.width,
            },
          }
          this.attachmentData.push(attachment)
          if (this.attachmentData.length === message.attachment.length) {
            message = { ...message, attachment: this.attachmentData }
            this.createMessage(message)
          }
        })
      }
    } else {
      this.attachmentData.push(attachment)
      if (this.attachmentData.length === message.attachment.length) {
        message = { ...message, attachment: this.attachmentData }
        this.createMessage(message)
      }
    }
  }

  // private createMessage(message) {
  //   message = { ...message, createdAt: this.getCurrentDateTime() }
  //   this.store.dispatch(
  //     createMessage({
  //       orgId: this.activeChat.orgId,
  //       message,
  //     })
  //   )
  //   this.fileUploadObj = []
  //   setTimeout(() => {
  //     this.showFileUploadLoader = false
  //     this.progressBarMsg = ''
  //   }, 2000)
  // }

  private getCurrentDateTime() {
    // const m = require('moment')
    const utcMoment = moment.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    return utcMoment
  }
}