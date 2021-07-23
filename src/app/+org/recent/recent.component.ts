import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { IOrgResponse, IProfileResponse, ITeamResponse, ITeamUserResponse } from '../../models';
import { orderBy } from 'lodash'
import { IonSearchbar, ModalController, NavController } from '@ionic/angular';
import { selectTeamListEntities, isTeamsLoaded, selectDMTeamEntities, selectPersonalTeam } from '../../store/selectors/team.selectors';
import { selectUserEntities, isUsersLoaded, selectCurrentUser } from '../../store/selectors/user.selectors';
import { selectRecentChannels, isRecentChannelsLoaded } from '../store/selectors/recent-channels.selectors';
import { isRecentItemsLoaded, selectRecentItemsArray } from '../store/selectors/recent-items.selectors';
import { selectRecentChatLastMessage } from '../../+chat/store/selectors/chat.selectors';
import { IMessageResponse } from '../../models/interfaces/message.interfaces';
import { selectTypeTrackerEntities } from '../../+chat/store/selectors/type-tracker.selectors';
import { selectOnlineUserEntities } from '../store/selectors/online-users.selectors';
import { selectActiveOrg } from '../../store/selectors/org.selectors';
import { DelveService } from '../../store/services/delve.service';
import { environment } from '@app/src/environments/environment';
import { CreateChannelComponent } from '../channel/create-channel/create-channel.component';
import { removeRecentItems, updateRecentItems } from '../store/actions/recent-items.actions';
import { IRecentItems } from '../../models/interfaces/recent-items.interface';
import { v4 as uuidv4 } from 'uuid'
import { createTeam } from '../../store/actions/team.actions';
import { Plugins } from '@capacitor/core';

const { App } = Plugins;
@Component({
  selector: 'app-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
})
export class RecentComponent {

  @ViewChild(IonSearchbar) search: IonSearchbar;

  public unreadTeams: any = []
  public currentUser: IProfileResponse
  public teamEntities: { [id: number]: ITeamResponse }
  public userEntities: { [id: number]: IProfileResponse }
  public DMTeamEntities: { [userId: number]: number }
  public personalTeam: ITeamResponse
  public isLoaded: boolean
  public recentItems$: Observable<{ [id: string]: ITeamUserResponse }>
  public recentChatLastMessage: IMessageResponse
  public recentItemsArray$: Observable<ITeamUserResponse[]>
  public recentItemsArray: ITeamUserResponse[]
  public typeTrackerEntities: any
  public onlineUsers: { [id: string]: string }
  public activeOrgInitials: string
  public showSearchbar: boolean
  public searchResults: any[]
  public currentUserId: string
  public apiKey = 'TmkzBMbr3Z1eiLjMOQ0kqhqp4f0GVCzR1w'
  private activeOrgId: string
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1)

  constructor(
    private store: Store,
    private navController: NavController,
    private cdRef: ChangeDetectorRef,
    private delveService: DelveService,
    private modalController: ModalController,
    private elementRef: ElementRef
  ) {}

  public ionViewDidEnter() {
    window.dispatchEvent(new Event('resize')); //temporary virtual scroll fix

    App.addListener('backButton', () => {
      if (this.showSearchbar) {
        this.toggleSearch();
      }
    });

    // this.recentItemsArray$ = this.store.pipe(
    //   select(selectRecentItemsArray),
    //   takeUntil(this.destroyed$)
    // )


    this.store.pipe(
      select(selectRecentItemsArray),
      takeUntil(this.destroyed$)
    ).subscribe(recentItems => {
      this.recentItemsArray = orderBy(recentItems, ['isPinned', 'lastUpdatedAt'], ['desc', 'desc']);
    })

    this.store.pipe(select(selectActiveOrg), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(activeOrg => {
      const regex = /\-| /
      let orgInitialsArr = activeOrg?.name.split(regex)
      // this.activeOrgInitials = orgInitialsArr?.length ? orgInitialsArr?.[0]?.[0] + orgInitialsArr?.[1]?.[0]: null;
      this.activeOrgInitials = orgInitialsArr?.length ? orgInitialsArr?.[0]?.[0] : null;

      if (activeOrg) {
        this.activeOrgId = activeOrg.id;
      }

    })

    this.store.pipe(select(selectTeamListEntities), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(teamEntities => {
      this.teamEntities =  teamEntities;
    })

    this.store.pipe(select(selectRecentChatLastMessage), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(lastMessages => {
      this.recentChatLastMessage = {};
      if (Object.keys(lastMessages)?.length) {
        Object.keys(lastMessages).map(messageId => {
          let updatedMessage = {...lastMessages[messageId], content: this.getContent(lastMessages[messageId])};
          this.recentChatLastMessage[messageId] = updatedMessage;
        })
      }
    })

    this.store.pipe(select(selectTypeTrackerEntities),takeUntil(this.destroyed$)).subscribe(typeTrackers => {
      this.typeTrackerEntities = typeTrackers;
    })

    this.store.pipe(select(selectUserEntities), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(userEntities => {
      this.userEntities = userEntities;
    })

    this.store.pipe(select(selectOnlineUserEntities), takeUntil(this.destroyed$)).subscribe((onlineUsers) => {
      this.onlineUsers = onlineUsers
    })
    this.store.pipe(select(selectCurrentUser), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe((currentUser) => {
      this.currentUserId = currentUser?.id;
    })

    // this.recentItemsArray$.subscribe(res => {
    //   console.log('this.recentItemsArray$', res)
    // })

    // this.recentItems$ = this.store.pipe(select(selectRecentItems), distinctUntilChanged(), takeUntil(this.destroyed$)),
    // this.starredItems$ = this.store.pipe(select(selectStarredItems), distinctUntilChanged(), takeUntil(this.destroyed$)),
    // this.recentChatLastMessage$ = this.store.pipe(select(selectRecentChatLastMessage), distinctUntilChanged(), takeUntil(this.destroyed$)),

    // combineLatest([
    //   this.store.pipe(select(selectRecentItems), distinctUntilChanged(), takeUntil(this.destroyed$)),
    //   this.store.pipe(select(selectStarredItems), distinctUntilChanged(), takeUntil(this.destroyed$)),
    //   this.store.pipe(select(selectRecentChatLastMessage), distinctUntilChanged(), takeUntil(this.destroyed$)),


    // ]).subscribe((resp) => {
    //   console.log('resp', resp);
    // })

    // combineLatest([
    //   this.store.pipe(select(selectReadReceipts), distinctUntilChanged(), takeUntil(this.destroyed$)),
    //   this.store.pipe(select(selectTeamListEntities), distinctUntilChanged(), takeUntil(this.destroyed$)),
    //   this.store.pipe(select(selectRecentItems), distinctUntilChanged(), takeUntil(this.destroyed$)),
    //   this.store.pipe(select(selectStarredItems), distinctUntilChanged(), takeUntil(this.destroyed$)),
    //   this.store.pipe(select(selectUserEntities), distinctUntilChanged(), takeUntil(this.destroyed$)),
    //   this.store.pipe(select(selectRecentChatLastMessage), distinctUntilChanged(), takeUntil(this.destroyed$)),
    //   this.store.pipe(select(selectCurrentUser), distinctUntilChanged(), takeUntil(this.destroyed$)),
    // ])
    // .subscribe((resp: any) => {

    //   this.unreadTeams = [];

    //   const readReceipts = resp[0];
    //   const teamEntities = resp[1];
    //   const recentItems = resp[2];
    //   const starredItems = resp[3];
    //   const userEntities = resp[4];
    //   const recentChatLastMessage = resp[5];
    //   this.currentUser = resp[6];
    //   // const recentAllArr = orderBy([...resp[2], ...resp[3]], 'visitedAt', 'desc')
    //   const recentAllEntities = {...starredItems, ...recentItems};
    //   this.teamEntities = teamEntities;
    //   let receiverId = null
    //   const unreadTeamsEntities: { [id: string]: any } = {}
    //   if (readReceipts && teamEntities) {
    //     readReceipts.forEach((receipt) => {
    //       if (receipt.unreadCount && teamEntities[receipt?.teamId]) {
    //         if (teamEntities[receipt.teamId]?.type === 'DIRECT_MESSAGE') {
    //           if (
    //             teamEntities[receipt.teamId]?.users[0].userId ===
    //             this.currentUser?.id
    //           ) {
    //             receiverId = teamEntities[receipt.teamId]?.users[1].userId
    //           } else {
    //             receiverId = teamEntities[receipt.teamId]?.users[0].userId
    //           }
    //           const userObj = {
    //             ...userEntities[recentAllEntities[receipt.teamId].receiverId],
    //             unreadCount: receipt.unreadCount,
    //             lastMessage: recentChatLastMessage?.[receipt.teamId]?.content
    //           }
    //           const unreadTeam = {
    //             type: 'USER',
    //             teamId: receipt.teamId,
    //             receiverId,
    //             _id: receiverId,
    //           }
    //           unreadTeamsEntities[receipt.teamId] = unreadTeam
    //           this.unreadTeams.push(userObj)
    //         } else {
    //           const unreadTeam = {
    //             type: 'CHANNEL',
    //             teamId: receipt.teamId,
    //             _id: receipt.teamId,
    //           }
    //           const teamObj = {
    //             ...teamEntities[recentAllEntities[receipt.teamId].teamId],
    //             unreadCount: receipt.unreadCount,
    //             lastMessage: recentChatLastMessage?.[receipt.teamId]?.content
    //           }
    //           unreadTeamsEntities[receipt.teamId] = unreadTeam
    //           this.unreadTeams.push(teamObj)
    //         }
    //       }
    //     })
    //   }
    //   if (recentAllEntities ) {
    //     Object.keys(recentAllEntities).forEach(recentkey => {
    //       if (!unreadTeamsEntities?.[recentkey]) {
    //         if (recentAllEntities[recentkey].type === 'USER') {
    //           const userObj = {
    //             ...userEntities[recentAllEntities[recentkey].receiverId],
    //             ...{visitedAt: recentAllEntities[recentkey].visitedAt},
    //             lastMessage: recentChatLastMessage?.[recentkey]?.content
    //           }
    //           this.unreadTeams.push(userObj);
    //         } else {
    //           const teamObj = {
    //             ...teamEntities[recentAllEntities[recentkey].teamId],
    //             ...{visitedAt: recentAllEntities[recentkey].visitedAt},
    //             lastMessage: recentChatLastMessage?.[recentkey]?.content
    //           }
    //           this.unreadTeams.push(teamObj);
    //         }
    //       }
    //     })
    //     this.unreadTeams = orderBy(this.unreadTeams, 'visitedAt', 'desc')
    //   }
    // })
    // combineLatest([
    //   this.store.pipe(select(selectReadReceipts), distinctUntilChanged(), takeUntil(this.destroyed$)),
    //   this.store.pipe(
    //     select(selectTeamListEntities),
    //     takeUntil(this.destroyed$)
    //   ),
    //   this.store.pipe(select(selectCurrentUser), distinctUntilChanged(), takeUntil(this.destroyed$)),
    //   this.store.pipe(select(selectUserEntities), distinctUntilChanged(), takeUntil(this.destroyed$)),
    //   this.store.pipe(select(selectRecentItems), distinctUntilChanged(), takeUntil(this.destroyed$)),
    //   // this.store.pipe(select(selectRecentUsers), distinctUntilChanged(), takeUntil(this.destroyed$)),
    // ]).subscribe((resp) => {
    //   // console.log('resp', resp);
    //   let recentlyVisitedEntities = {};
    //   let recentlyVisited;
    //   if (resp[4]) {
    //     const recentChannels = resp[4];
    //     // const recentUsers = resp[5];
    //     // recentlyVisited = [...recentChannels];
    //     recentlyVisited = recentChannels;
    //     if (recentlyVisited?.length) {
    //       recentlyVisited.forEach(recent => {
    //         if (recent.teamId) {
    //           recentlyVisitedEntities[recent.teamId] = recent;
    //         }
    //       });
    //     }
    //   }
    //   if (resp && resp[0] && resp[1] && resp[2] && resp[3]) {
    //     const readReceipts = resp[0]
    //     const teamEntities = resp[1]
    //     this.teamEntities = teamEntities
    //     this.currentUser = resp[2]
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
    //           if (recentlyVisitedEntities[receipt.teamId]) {
    //             delete recentlyVisitedEntities[receipt.teamId];
    //           }
    //           if (
    //             teamEntities[receipt.teamId]?.users[0].userId ===
    //             this.currentUser.id
    //           ) {
    //             receiverId = teamEntities[receipt.teamId]?.users[1].userId
    //           } else {
    //             receiverId = teamEntities[receipt.teamId]?.users[0].userId
    //           }
    //           const unreadTeam = {...userEntities[receiverId], unreadCount: receipt.unreadCount}
    //           this.unreadTeams.push(unreadTeam)
    //         } else {
    //           const unreadTeam = {...teamEntities[receipt.teamId], unreadCount: receipt.unreadCount}
    //           this.unreadTeams.push(unreadTeam)
    //         }
    //       }
    //     })
    //     if (recentlyVisitedEntities && Object.keys(recentlyVisitedEntities)?.length) {
    //       let recentVIS = [];
    //       Object.keys(recentlyVisitedEntities).forEach(recent => {
    //         if (recentlyVisitedEntities[recent].type === 'USER') {
    //           const recentUser = {...userEntities[recentlyVisitedEntities[recent].userId], visitedTime: recentlyVisitedEntities[recent].time}
    //           recentVIS.push(recentUser)
    //         } else {
    //           const recentTeam = {...teamEntities[recentlyVisitedEntities[recent].teamId], visitedTime: recentlyVisitedEntities[recent].time}
    //           recentVIS.push(recentTeam)
    //         }
    //       })
    //       this.unreadTeams = [...this.unreadTeams, ...orderBy(recentVIS, 'visitedTime', 'desc')];
    //     }
    //     this.cdRef.detectChanges();
    //   }
    // })

    combineLatest([
      this.store.pipe(select(isUsersLoaded), distinctUntilChanged(), takeUntil(this.destroyed$)),
      this.store.pipe(select(isTeamsLoaded), distinctUntilChanged(), takeUntil(this.destroyed$)),
      this.store.pipe(select(isRecentItemsLoaded), distinctUntilChanged(), takeUntil(this.destroyed$)),
      // this.store.pipe(select(isRecentChannelsLoaded), distinctUntilChanged(), takeUntil(this.destroyed$)),
      // this.store.pipe(select(isRecentUsersLoaded), distinctUntilChanged(), takeUntil(this.destroyed$))
    ]).subscribe(resp => {
      // console.log('resp', resp);
      if (resp[0] && resp[1] && resp[2]) {
        this.isLoaded = true;
      } else {
        this.isLoaded = false;
      }
    })

    this.store
    .pipe(takeUntil(this.destroyed$), select(selectDMTeamEntities))
    .subscribe((DMTeamEntities) => {
      if (DMTeamEntities) {
        this.DMTeamEntities = DMTeamEntities
      }
    })

    this.store
      .pipe(takeUntil(this.destroyed$), select(selectPersonalTeam))
      .subscribe((personalTeam) => {
        if (personalTeam) {
          this.personalTeam = personalTeam
        }
      })
  }

  public ionViewWillLeave() {
    App.removeAllListeners();
  }

  public searchItems(event) {
    let term = event?.target?.value ? event.target.value : '';
    this.delveService
    .search(
      term,
      this.currentUserId,
      `${environment.environment}-space`,
      this.apiKey,
      {
        terms: {
          type: ['U', 'T'],
          orgId: [this.activeOrgId],
        },
        scoreMultiplier: {
          type: {
            values: ['U'],
            weight: 2,
          },
        },
      }
    ).pipe(
      map((res) => {
        let data = res.filter((data) => {
          if (
            this.userEntities[data?._source?.userId] ||
            this.teamEntities[data._id]
          ) {
            return true
          }
        })
        if (data?.length === 0 && term.length > 0) {
          data = [...data, { noResults: true }]
        }
        return data
      }),
    ).subscribe(res => {
      this.searchResults = res;
    })
  }

  public toggleSearch() {
    this.showSearchbar = !this.showSearchbar;
    this.searchResults = null;
    this.cdRef.detectChanges();
    if (this.showSearchbar) {
      this.search.setFocus();
    }
  }

  public navigateToItem(itemId) {
    if (itemId !== this.currentUser?.id) {
      if (this.DMTeamEntities[itemId]) {
        this.navController.navigateForward(`org/chat/${itemId}`)
      } else {
        let newTeam: ITeamResponse
        newTeam = {
          type: 'DIRECT_MESSAGE',
          userId: itemId,
          requestId: uuidv4(),
          orgId: this.activeOrgId,
          name: '',
        }
        this.store.dispatch(createTeam({ model: newTeam }))
      }
    } else {
      this.navController.navigateForward(`org/chat/${this.personalTeam?._id}`)
    }
  }

  public itemHeightFn(item, index) {
    // return this.recentChatLastMessage?.[item?.teamId] ? 69 : 48;
    return 66;
  }

  public trackByFn(data: any) {
    return data;
  }

  public async openCreateChannel() {

    const modal = await this.modalController.create({
      component: CreateChannelComponent,
      swipeToClose: true,
      presentingElement: this.elementRef.nativeElement,
      backdropDismiss: true
    })
    await modal.present();

  }

  public closeItem(item) {
    this.store.dispatch(
      removeRecentItems({
        orgId: this.activeOrgId,
        userId: this.currentUserId,
        teamId: item?.teamId,
        model: {
          isPinned: false,
          lastUpdatedAt: null,
        },
      })
    )
  }

  public toggleStarItem(item, isPinned) {
    const utcMoment = new Date().toISOString()
    let model: IRecentItems = { isPinned }
    if (isPinned) {
      model = { ...model, lastUpdatedAt: utcMoment }
    }
    this.store.dispatch(
      updateRecentItems({
        teamId: item?.teamId,
        userId: this.currentUserId,
        orgId: this.activeOrgId,
        model: {
          lastUpdatedAt: utcMoment,
          isPinned,
        },
      })
    )
  }

  public ngOnDestroy() {
    this.destroyed$.next(true)
    this.destroyed$.complete()
  }

  private getContent(message) {
    let content = message?.content
    const res = content?.match(/[^{\{]+(?=}\})/gi)
    res?.forEach((ress) => {
      const username =
        this.userEntities?.[ress]?.firstName +
        ' ' +
        this.userEntities?.[ress]?.lastName
      content = content.replace(/[^{\{]+(?=}\})/i, username)
      content = content.replace('{{', '')
      content = content.replace('}}', '')
    })
    return content
  }

}
