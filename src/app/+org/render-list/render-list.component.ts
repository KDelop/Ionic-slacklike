import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { IProfileResponse } from '../../models';

@Component({
  selector: 'app-render-list',
  templateUrl: './render-list.component.html',
  styleUrls: ['./render-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RenderListComponent {

  @Input() public items;
  @Input() public selectedItemsEntities;
  @Input() public currentUser: IProfileResponse
  @Input() public isLoaded: boolean;
  @Input() public DMTeamEntities: { [userId: number]: number };
  @Input() public onlineUsers?: { [id: string]: string }
  @Output() public itemSelected: EventEmitter<string> = new EventEmitter<any>();

  public skeletonItem = [
    {width: 40},
    {width: 50},
    {width: 30},
    {width: 45},
    {width: 25},
    {width: 20},
    {width: 35},
    {width: 60},
    {width: 40},
    {width: 30},
    {width: 50},
    {width: 55},
    {width: 45},
    {width: 35},
    {width: 20},
    {width: 35},
    {width: 60},
    {width: 40},
    {width: 30},
    {width: 50},
  ]

  constructor(
    private navController: NavController,
    private router: Router
  ) {
  }

  public itemSelect(item) {
    // this.zone.runOutsideAngular(() => {
      this.itemSelected.emit(item);
      // if (item.type) {
      //   this.navController.navigateForward(['org', 'chat', item._id]);
      // } else {
      //   if (item.id !== this.currentUser?.id) {
      //     if (this.DMTeamEntities[item.id]) {
      //       this.navController.navigateForward(`org/chat/${this.DMTeamEntities[item.id]}`)
      //     }
      //   } else {
      //     // this.navController.navigateForward(`org/chat/${this.personalTeam?.id}`)
      //     console.log('should redirect to personal team')
      //   }
      // }
    // })
  }

  public itemHeightFn(item, index) {
    return item?.lastMessage ? 67 : 48;
    // return 48;
  }

  public trackByFn(data: any) {
    return data;
  }

}
