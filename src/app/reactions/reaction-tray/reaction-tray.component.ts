import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core'
import { select, Store } from '@ngrx/store'
import { Observable, ReplaySubject } from 'rxjs'
import { take, takeUntil } from 'rxjs/operators'
import { IProfileResponse, IReaction, IReactionResponse } from '../../models'
import { uniq } from 'lodash'
import { AnimationController, ModalController, PopoverController } from '@ionic/angular'
import { ReactionPickerComponent } from '../reaction-picker/reaction-picker.component'
import { ReactionDetailsComponent } from '../reaction-details/reaction-details.component'
import { selectUserEntities } from '../../store/selectors/user.selectors'

@Component({
  selector: 'app-reaction-tray',
  templateUrl: './reaction-tray.component.html',
  styleUrls: ['./reaction-tray.component.scss'],
})
export class ReactionTrayComponent implements OnChanges, OnDestroy {
  public userEntities$: Observable<{ [id: number]: IProfileResponse }>
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1)
  public userNames: { [id: number]: string } = {}
  public myReaction = false
  public longPressEvent = false
  public userEntities: { [id: number]: IProfileResponse }
  constructor(
    private store: Store,
    public popoverController: PopoverController,
    public animationCtrl: AnimationController,
    public modalController: ModalController
    ) {
    //
    this.userEntities$ = this.store.pipe(
      select(selectUserEntities),
      takeUntil(this.destroyed$)
    )
    this.userEntities$.subscribe(userEntities => {
      this.userEntities = userEntities;
    })
  }
  @Input() public reactions: IReactionResponse[]
  @Input() public showAddReaction = true
  @Input() public view = 'chat'
  @Input() public currentUser: IProfileResponse
  @Input() public positionOfEmojiOptions = 'top'
  @Output()
  public emitSelectedReaction: EventEmitter<IReaction> = new EventEmitter<IReaction>()

  public ngOnChanges(changes: SimpleChanges) {
    if ('reactions' in changes && this.reactions) {
      let usersIds = []
      const usersHash = {}
      this.reactions.forEach((reaction) => {
        if (reaction.users) {
          reaction.users.forEach((id) => {
            if (!usersHash[id]) {
              usersHash[id] = id
            }
            if (id === this.currentUser?.id) {
              this.myReaction = true
            } else {
              this.myReaction = false
            }
          })
        }
      })
      usersIds = Object.values(usersHash)
      const uniqueReactionIds: string[] = uniq(usersIds)
      this.findReactionUsers(uniqueReactionIds)
    }
  }

  public ngOnDestroy() {
    this.destroyed$.next(true)
    this.destroyed$.complete()
  }

  public selectedReaction($event) {
    if (!this.longPressEvent) {
      this.emitSelectedReaction.emit($event)
    }
    this.longPressEvent = false;
  }

  public async longPressed(event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.longPressEvent = true;
    const modal = await this.modalController.create({
      component: ReactionDetailsComponent,
      cssClass: 'reaction-modal',
      componentProps: {
        reactions: this.reactions,
        userEntities: this.userEntities,
        currentUser: this.currentUser
      },
      swipeToClose: true,
    });
    modal.present();

    return false;
  }

  public findReactionUsers(ids: string[]) {
    this.userNames = {}
    this.userEntities$.pipe(take(1)).subscribe((ue) => {
      ids.forEach((id) => {
        if (id === this.currentUser?.id) {
          this.userNames[id] = 'You'
        } else {
          this.userNames[id] = ue[id].username
        }
      })
    })
  }

  public async openReactionPicker() {
    const popover = await this.popoverController.create({
      component: ReactionPickerComponent,
      keyboardClose: false,
      cssClass: ['popover-bottomsheet', 'reaction-popover'],
      enterAnimation: (baseEle, opts) => {
        return this.animationCtrl.create()
          .duration(200)
          .addElement(baseEle.querySelector('.popover-wrapper'))
          .fromTo('opacity', '0', '1')
          .easing('ease-out')
          .addElement(baseEle.querySelector('.popover-content'))
          .fromTo('bottom', '-100px', '0px')
          .easing('ease-in')
      },
      leaveAnimation: (baseEle) => {
        return this.animationCtrl.create()
          .duration(200)
          .addElement(baseEle.querySelector('.popover-wrapper'))
          .fromTo('opacity', '1', '0')
          .easing('ease-in')
          .addElement(baseEle.querySelector('.popover-content'))
          .fromTo('bottom', '0px', '-100px')
          .easing('ease-in')
      }
    });
    popover.onDidDismiss().then(res => {
      if (res.data) {
        this.selectedReaction(res.data);
      }
    })
    return await popover.present();
  }
}
