import { Component, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IProfileResponse, ITeamResponse } from '../../../models';
import { v4 as uuidv4 } from 'uuid'
import { cloneDeep, isEmpty } from 'lodash'
import { createTeam, resetNewTeamCreated } from '@app/src/app/store/actions/team.actions';
import { isNewTeamBeingCreated, isNewTeamCreated, selectChannelList } from '@app/src/app/store/selectors/team.selectors';
import { selectCurrentUser } from '@app/src/app/store/selectors/user.selectors';
import { selectActiveOrgId } from '@app/src/app/store/selectors/org.selectors';
import { IonInput, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-create-channel',
  templateUrl: './create-channel.component.html',
  styleUrls: ['./create-channel.component.scss'],
})
export class CreateChannelComponent implements OnInit {

  @ViewChild('displayNameInput') displayNameInput: IonInput;

  public currentUser: IProfileResponse
  public teamData: ITeamResponse = {
    name: '',
    type: 'PUBLIC',
    purpose: '',
    users: [],
    requestId: '',
  }
  public channelAlreadyExists: boolean
  public channelList: ITeamResponse[]
  public channelListEntities: {[name: string]: ITeamResponse}
  public activeOrgId: string
  public isCreating: boolean

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1)

  constructor(
    private store: Store,
    private modalController: ModalController
  ) {}

  public ionViewDidEnter() {
    window.requestAnimationFrame(() => {
      this.displayNameInput.setFocus();
    })
  }

  public ionViewWillEnter() {
    window.dispatchEvent(new Event('resize')); //temporary virtual scroll fix
  }

  public ngOnInit() {
    this.store
      .pipe(takeUntil(this.destroyed$), select(selectChannelList))
      .subscribe((channels) => {
        this.channelList = channels
        this.prepareEntities(channels);
    });
    this.store
      .pipe(takeUntil(this.destroyed$), select(selectCurrentUser))
      .subscribe((currentUser) => {
        this.currentUser = currentUser
      })
    this.store
      .pipe(takeUntil(this.destroyed$), select(selectActiveOrgId))
      .subscribe((activeOrgId) => {
        this.activeOrgId = activeOrgId
      })
    this.store
      .pipe(takeUntil(this.destroyed$), select(isNewTeamBeingCreated))
      .subscribe((isCreating) => {
        this.isCreating = isCreating
      })
    this.store
      .pipe(takeUntil(this.destroyed$), select(isNewTeamCreated))
      .subscribe((isCreated) => {
        if (isCreated) {
          this.closeModal();
          this.store.dispatch(resetNewTeamCreated());
        }
      })
  }

  public changeChannelType() {
    if (this.teamData?.type === 'PUBLIC') {
      this.teamData = { ...this.teamData, type: 'PRIVATE' }
    } else {
      this.teamData = { ...this.teamData, type: 'PUBLIC' }
    }
  }

  public createChannel() {
    // this.teamData.users = [this.currentUser]
    this.teamData.requestId = uuidv4()
    let team = cloneDeep(this.teamData)
    team = { ...team, orgId: this.activeOrgId }
    if (isEmpty(team.name)) {
      return
    }

    this.channelAlreadyExists = false
    if (this.channelListEntities[team.name]) {
      this.channelAlreadyExists = true;
      return
    }

    this.store.dispatch(
      createTeam({ model: team })
    )
  }

  public closeModal() {
    this.modalController.dismiss();
  }

  public ngOnDestroy() {
    this.destroyed$.next(true)
    this.destroyed$.complete()
  }

  private prepareEntities(channels: ITeamResponse[]) {
    if (channels?.length) {
      this.channelListEntities = {};
      channels.forEach(channel => {
        this.channelListEntities[channel.name] = channel;
      })
    }
  }

}
