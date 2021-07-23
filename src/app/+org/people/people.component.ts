import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { IProfileResponse, ITeamResponse } from '../../models';
import { v4 as uuidv4 } from 'uuid'
import { NavController } from '@ionic/angular';
import { createTeam } from '../../store/actions/team.actions';
import { selectDMTeamEntities, selectPersonalTeam } from '../../store/selectors/team.selectors';
import { selectUserList, isUsersLoaded, selectCurrentUser } from '../../store/selectors/user.selectors';
import { selectActiveOrgId } from '../../store/selectors/org.selectors';
import { selectOnlineUserEntities } from '../store/selectors/online-users.selectors';

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
})
export class PeopleComponent implements OnInit {

  // public peoples$: Observable<ITeamResponse[]>;
  public peoples: IProfileResponse[];
  public peoplesAll: IProfileResponse[];
  public searchText: string;
  public DMTeamEntities: { [userId: number]: number }
  public currentUser: IProfileResponse
  public personalTeam: ITeamResponse
  public isLoaded: boolean;
  public activeOrgId: string;
  public onlineUsers: { [id: string]: string }

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1)

  constructor(
    private store: Store,
    private navController: NavController
  ) {}

  ionViewWillEnter() {
    window.dispatchEvent(new Event('resize')); //temporary virtual scroll fix
  }

  ngOnInit() {
    // this.peoples$ = this.store.pipe(select(selectAllChannelList), takeUntil(this.destroyed$));
    this.store.pipe(select(selectUserList), takeUntil(this.destroyed$)).subscribe(peoples => {
      this.peoples = peoples;
      this.peoplesAll = peoples;
    })

    this.store.pipe(select(selectOnlineUserEntities), takeUntil(this.destroyed$)).subscribe((onlineUsers) => {
      this.onlineUsers = onlineUsers
    })

    this.store.pipe(select(isUsersLoaded), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(isLoaded => {
      if (isLoaded) {
        this.isLoaded = true;
      } else {
        this.isLoaded = false;
      }
    })

    this.store
      .pipe(takeUntil(this.destroyed$), select(selectCurrentUser))
      .subscribe((currentUser) => {
        if (currentUser) {
          this.currentUser = currentUser
        }
      })



    this.store
      .pipe(takeUntil(this.destroyed$), select(selectPersonalTeam))
      .subscribe((personalTeam) => {
        if (personalTeam) {
          this.personalTeam = personalTeam
        }
      })

    this.store
      .pipe(takeUntil(this.destroyed$), select(selectActiveOrgId))
      .subscribe((activeOrgId) => {
        if (activeOrgId) {
          this.activeOrgId = activeOrgId
        }
      })

  }

  ionViewDidEnter() {
    this.store
    .pipe(takeUntil(this.destroyed$), select(selectDMTeamEntities))
    .subscribe((DMTeamEntities) => {
      if (DMTeamEntities) {
        this.DMTeamEntities = DMTeamEntities
      }
    })
  }

  public searchChannels() {
    if (this.searchText?.length) {
      const searchText = this.searchText.toLowerCase()
      this.peoples = this.peoplesAll.filter(user => {
        let initials = (user?.firstName?.toLowerCase()?.[0]) + (user?.lastName?.toLowerCase()?.[0]);
        const fullName = user?.firstName + ' ' + user?.lastName
        if (
          initials.includes(searchText) ||
          fullName.toLowerCase().includes(searchText) ||
          user?.jobRole?.toLowerCase().includes(searchText) ||
          user?.username?.toLowerCase().includes(searchText)
        ) {
          return true
        }

      })
    } else {
      this.peoples = this.peoplesAll;
    }
  }

  public navigateToItem(user) {
    if (user.id !== this.currentUser?.id) {
      if (this.DMTeamEntities[user.id]) {
        this.navController.navigateForward(`org/chat/${this.DMTeamEntities[user.id]}`)
      } else {
        let newTeam: ITeamResponse
        newTeam = {
          type: 'DIRECT_MESSAGE',
          userId: user.id,
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

  public ngOnDestroy() {
    this.destroyed$.next(true)
    this.destroyed$.complete()
  }

}
