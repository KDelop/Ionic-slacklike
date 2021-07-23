import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { ITeamResponse } from '../../../models';
import { isTeamsLoaded, selectAllChannelList, selectChannelList, selectTeamList } from '../../../store/selectors/team.selectors';

@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.scss'],
})
export class ChannelListComponent implements OnInit {

  // public channels$: Observable<ITeamResponse[]>;
  public channels: ITeamResponse[];
  public channelsAll: ITeamResponse[];
  public searchText: string;
  public isLoaded: boolean;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1)

  constructor(
    private store: Store,
    private navController: NavController
  ) {}

  ionViewWillEnter() {
    window.dispatchEvent(new Event('resize')); //temporary virtual scroll fix
  }

  ngOnInit() {
    this.store.pipe(select(selectAllChannelList), takeUntil(this.destroyed$)).subscribe(channels => {
      this.channels = channels;
      this.channelsAll = channels;
    })

    this.store.pipe(select(isTeamsLoaded), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(isLoaded => {
      if (isLoaded) {
        this.isLoaded = true;
      } else {
        this.isLoaded = false;
      }
    })

  }

  public searchChannels() {
    if (this.searchText?.length) {
      const searchText = this.searchText.toLowerCase()
      this.channels = this.channelsAll.filter(channel => {
        if (
          channel?.name?.toLowerCase().includes(searchText) ||
          channel?.purpose?.toLowerCase().includes(searchText)
        ) {
          return channel;
        }
      })
    } else {
      this.channels = this.channelsAll;
    }
  }

  public navigateToItem(item) {
    this.navController.navigateForward(['org', 'chat', item._id]);
  }

  public ngOnDestroy() {
    this.destroyed$.next(true)
    this.destroyed$.complete()
  }

}
