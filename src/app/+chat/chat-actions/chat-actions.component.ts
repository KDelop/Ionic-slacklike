import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core'
import { Store } from '@ngrx/store'
import {
  IProfileResponse,
  IReaction,
} from '../../models'
import { IMessageResponse } from '../../models/interfaces/message.interfaces'
import { deleteMessage } from '../store/actions/chat.actions'
import { PopoverController } from '@ionic/angular'
import { LocalService } from '../../store/services/local.service'

@Component({
  selector: 'app-chat-actions',
  templateUrl: './chat-actions.component.html',
  styleUrls: ['./chat-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatActionsComponent implements OnInit {
  @Input() public message: IMessageResponse
  @Input() public currentUser: IProfileResponse
  @Input() public userEntities: {[id: string]: IProfileResponse}

  @Output()
  public editMessageClick: EventEmitter<number> = new EventEmitter<number>()
  @Output()
  public emitSelectedReaction: EventEmitter<IReaction> = new EventEmitter<IReaction>()


  public emojis = [
    {reaction_icon: "😀", reaction_name: "grinning"},
    {reaction_icon: "😃", reaction_name: "smiley"},
    {reaction_icon: "😄", reaction_name: "smile"},
    {reaction_icon: "😁", reaction_name: "grin"},
    {reaction_icon: "😆", reaction_name: "laughing"}
  ];

  constructor(
    private store: Store,
    private popoverController: PopoverController,
    private localService: LocalService
  ) {}

  ngOnInit(): void {
  }

  public editMessage() {
    this.closePopover('edit');
  }

  // public deleteMessage() {
  //   this.store.dispatch(
  //     deleteMessage({
  //       // orgId: this.currentUser.orgId,
  //       messageId: this.message.id,
  //       teamId: this.message.teamId,
  //     })
  //   )
  //   this.closePopover('delete');
  // }

  public deleteMessage() {
    let model: IMessageResponse = { deleted: true }
    if (this.message?.threadId) {
      model = {
        ...model,
        threadId: this.message?.threadId,
        showInMainConversation: this.message?.showInMainConversation,
      }
    }
    this.store.dispatch(
      deleteMessage({
        messageId: this.message._id,
        teamId: this.message.teamId,
        threadId: this.message?.threadId,
        model,
      })
    )
    this.closePopover('delete');
  }

  public forwardMessage() {
    this.closePopover('forward')
  }

  public openReactionPicker(event: any) {
    event.stopPropagation();
    this.closePopover(null);
  }

  public selectedReaction($event) {
    const reaction: IReaction = $event
    this.closePopover({type: 'reaction', reaction: reaction}, 'previewPopover');
  }

  public openThread() {
    this.localService.changeQueryParam({
      thread: this.message._id,
      details: null,
    })
    this.closePopover('openThreads');
  }

  public pinMessage() {
    this.closePopover('pinMessage');
  }

  public closePopover(data: any, id?: any) {
    this.popoverController.dismiss(data, null, id);
  }
}
