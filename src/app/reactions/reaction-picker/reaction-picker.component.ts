import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core'
import { PopoverController } from '@ionic/angular'
import { IReaction } from '../../models'

@Component({
  selector: 'app-reaction-picker',
  templateUrl: './reaction-picker.component.html',
  styleUrls: ['./reaction-picker.component.scss'],
})
export class ReactionPickerComponent implements OnInit {
  @Output() public selectedReaction: EventEmitter<any> = new EventEmitter<any>()
  @Input() public buttonReactionTray = false
  @Input() public position = 'top bottom left'

  public reaction: IReaction
  constructor(
    private popoverController: PopoverController
  ) {}

  public ngOnInit() {}

  public addEmoji($event) {
    this.reaction = {
      reaction_name: $event.name,
      reaction_icon: $event.char,
    }
    // this.selectedReaction.emit(this.reaction)
    this.popoverController.dismiss(this.reaction);
  }

  // public popoverShown() {
  //   this.elementRef.nativeElement.closest('.list-row').classList.add('focused')
  // }

  // public popoverHidden() {
  //   this.elementRef.nativeElement
  //     .closest('.list-row')
  //     .classList.remove('focused')
  // }
}
