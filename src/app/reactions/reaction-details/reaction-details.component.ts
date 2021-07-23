import { Component, Input, OnInit } from '@angular/core'
import { IProfileResponse, IReactionResponse } from '../../models';

@Component({
  selector: 'app-reaction-details',
  templateUrl: './reaction-details.component.html',
  styleUrls: ['./reaction-details.component.scss'],
})
export class ReactionDetailsComponent implements OnInit {
  @Input() public reactions: IReactionResponse[];
  @Input() public userEntities: {[id: number]: IProfileResponse}
  @Input() public currentUser: IProfileResponse;

  public activeReaction: IReactionResponse;
  public activeReactionUsers: IProfileResponse[];

  constructor(
  ) {}

  public ngOnInit() {
    if (this.reactions?.length) {
      this.prepareFirstSegment();
    }
  }

  public segmentChanged(event) {
    this.activeReactionUsers = [];
    if (event?.detail?.value?.users?.length && this.userEntities) {
      this.activeReaction = event?.detail?.value;
      event.detail.value.users.forEach(userId => {
        this.activeReactionUsers.push(this.userEntities[userId]);
      });
    }
  }

  public prepareFirstSegment() {
    this.activeReactionUsers = [];
    if (this.reactions?.length && this.reactions[0].users?.length && this.userEntities) {
      this.activeReaction = this.reactions[0];
      this.reactions[0].users.forEach(userId => {
        this.activeReactionUsers.push(this.userEntities[userId]);
      });
    }
  }


}
