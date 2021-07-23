import {
  Component,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core'
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { AlertController, AnimationController, IonContent, IonInfiniteScroll, IonItem, ModalController, NavController, PopoverController } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { IProfileResponse, IReaction, IReactionResponse, ITeamResponse, RealTimeResponse } from '../../models';
import { IMessageResponse } from '../../models/interfaces/message.interfaces';
import { ChatActionsComponent } from '../chat-actions/chat-actions.component';
import { addReaction, createMessage, removeReaction, unsetNewMessageRecieved, updateMessage } from '../store/actions/chat.actions';
import { cloneDeep } from 'lodash';
import { ForwardListComponent } from '../../+org/forward-list/forward-list.component';
import { v4 as uuidv4 } from 'uuid'
import { TeamService } from '../../store/services/team.service';
import { ENTER } from '@angular/cdk/keycodes';
import { updateTypeTracker } from '../store/actions/type-tracker.actions';
import { HTTP } from '@ionic-native/http/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { createTeam } from '../../store/actions/team.actions';
import { upsertPinnedMessages } from '../store/actions/pinned-messages.actions';

@Component({
  selector: 'app-chat-list-new',
  templateUrl: './chat-list-new.component.html',
  styleUrls: ['./chat-list-new.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListNewComponent {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild('chatMain') public chatMain: ElementRef;

  @Input() public chatList: any[]
  @Input() public isMessageSent: boolean;
  @Input() public isMessageRecieved: boolean;
  @Input() public userEntities: {[id: string]: IProfileResponse};
  @Input() public currentUser: IProfileResponse;
  @Input() public teamEntities: { [id: number]: ITeamResponse }
  @Input() public DMTeamEntities: { [userId: number]: number }
  @Input() public activeChat: ITeamResponse
  @Input() public onlineUsers?: { [id: string]: string }
  @Input() public personalTeam: ITeamResponse
  @Output() public loadMore: EventEmitter<any> = new EventEmitter<any>()



  public previousScrollHeight: number;
  public overReactionLimit = false

  public placeholder: string
  public editorOptions = null
  private editorInstance: any
  public editMode: string
  public cloneMessage: IMessageResponse
  public showNewMessage: boolean
  private typeTimer;
  private isTyping: boolean
  private scrolled: boolean
  private alert: HTMLIonAlertElement;

  constructor(
    private cdRef: ChangeDetectorRef,
    private store: Store,
    private photoViewer: PhotoViewer,
    private popoverController: PopoverController,
    private animationCtrl: AnimationController,
    private modalController: ModalController,
    private navController: NavController,
    private teamService: TeamService,
    private elementRef: ElementRef,
    private nativeHTTP: HTTP,
    private file: File,
    private fileOpener: FileOpener,
    private alertController: AlertController,
  ) {}

  public ngOnChanges(changes: SimpleChanges) {
    if ('isMessageRecieved' in changes && this.isMessageRecieved) {
      this.showNewMessage = true
    }
    if ('chatList' in changes) {
      this.prepareChatList();
    }

  }

  public prepareChatList() {
    if (this.chatList?.length) {
      this.chatList = this.chatList.map(message => {
        let attachments = {}
        if (message.attachment) {
          attachments = message.attachment.map(media => {
            let newMedia = {...media, size: this.humanFileSize(media.size, 1)};
            return newMedia;
          });
        }
        let newMessage = {...message, content: this.getContent(message), attachment: attachments};
        return newMessage;
      })
    }
  }

  public hideNewMessage() {
    this.showNewMessage = false
  }

  public scrollToBottom() {
    this.showNewMessage = false
    this.chatMain.nativeElement.firstElementChild.firstElementChild.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
  }

  public unsetNewMessage() {
    console.log('unsetNewMessage' , this.isMessageRecieved);
    if (this.showNewMessage || this.isMessageRecieved) {
      // this.showNewMessage = false
      this.store.dispatch(unsetNewMessageRecieved())
    }
  }


  public trackByFn(index, data: any, ele) {
    // return index;
    return data && data.id ? data.id : index;
  }

  public loadMoreMessages() {
    this.previousScrollHeight = this.chatMain.nativeElement.querySelector('.chat-scrollable').scrollHeight;
    this.loadMore.emit()
  }

  public itemHeightFn() {
    return 58;
  }

  public showImagePreview(url: string) {
    // this.popoverController.dismiss();
    const option = {
      share: false, // default is false
      closeButton: true, // default is true
      copyToReference: false, // default is false
      headers: "",  // If it is not provided, it will trigger an exception
      piccasoOptions: { } // If it is not provided, it will trigger an exception
    }
    this.photoViewer.show(url, 'Preview', option);
  }

  public addBindingCreated(quill: any) {
    this.editorInstance = quill
    if (this.cloneMessage.content) {
      const content = this.cloneMessage.content
      const delta = this.editorInstance.clipboard.convert(content)
      this.editorInstance.setContents(delta, 'silent')
      setTimeout(() => {
        this.editorInstance.setSelection(content.length + 1)
        this.editorInstance.focus()
      }, 10)
    }
  }

  public onKeyupHandler(e: any) {
    e.stopPropagation()
    e.stopImmediatePropagation()
    const key = e.which || e.keyCode
    const val: string = e.target.innerText
    if (key !== ENTER || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      if (this.typeTimer) {
        if (!this.isTyping && val) {
          this.updateTypeTracker(true)
          this.isTyping = true
        }

        clearTimeout(this.typeTimer)
      }

      this.typeTimer = setTimeout(() => {
        this.updateTypeTracker(false)
        this.isTyping = false
      }, 1500)
    }
  }

  public goForAttachment(attachment: any) {
    const filePath = this.file.documentsDirectory + '/space/' + attachment.title;
    const url = attachment.resourceUrl;
    this.nativeHTTP.downloadFile(url, {}, {}, filePath).then(response => {
      this.fileOpener.open(response.nativeURL, attachment.contentType)
      .then(() => {})
      .catch(e => {
        this.presentAlert();
      });
    }).catch(err => {
        this.presentAlert();
    })
  }

  async presentAlert() {
    this.alert = await this.alertController.create({
      header: 'Oops!',
      message: 'Sorry, something went wrong.',
      buttons: ['OK']
    });
    await this.alert.present();
  }

  private getContent(message) {
    let content = message?.content
    const res = content?.match(/[^{\{]+(?=}\})/gi)
    res?.forEach((ress) => {
      const username =
        this.userEntities[ress]?.firstName +
        ' ' +
        this.userEntities[ress]?.lastName
      content = content.replace(/[^{\{]+(?=}\})/i, username)
      content = content.replace('{{', '')
      content = content.replace('}}', '')
    })
    return content
  }

  private humanFileSize(bytes, dp=1) {
    const thresh = 1000;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    const r = 10**dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
  }

  private updateTypeTracker(isTyping: boolean) {
    if (this.activeChat) {
      const orgId = this.activeChat.orgId
      const teamId = this.activeChat._id
      this.store.dispatch(
        updateTypeTracker({
          model: {
            orgId,
            teamId,
            isTyping,
          },
        })
      )
    }
  }

  private prepareEditorOpts() {
    const self = this
    this.placeholder = 'Send message, @<user>, :<emoji>'
    this.editorOptions = {
      // markdownShortcuts: {},
      keyboard: {
        bindings: {
          enter: {
            key: 13,
            handler: () => {
              this.customHandler(event)
            },
          },
          // selectall: {
          //   key: 'A',
          //   shortKey: true,
          //   handler: () => {
          //     document.execCommand('selectall', null)
          //   },
          // },
          // bold: {
          //   key: 'Jk',
          //   shortKey: true,
          //   handler: (range, context) => {
          //     const e: any = event
          //     let content = e.target.innerText
          //     content =
          //       context.prefix +
          //       '**' +
          //       content.substr(range.index, range.length) +
          //       '**' +
          //       context.suffix
          //     e.target.innerText = content
          //   },
          // },
          // italic: {
          //   key: 'Tl',
          //   shortKey: true,
          //   handler: (range, context) => {
          //     const e: any = event
          //     let content = e.target.innerText
          //     content =
          //       context.prefix +
          //       '*' +
          //       content.substr(range.index, range.length) +
          //       '*' +
          //       context.suffix
          //     e.target.innerText = content
          //   },
          // },
        },
      },
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['code-block', 'link'],
        [{ list: 'ordered' }, { list: 'bullet' }],
      ],
      // 'emoji-shortname': true,
      // 'emoji-textarea': true,
      mention: {
        showDenotationChar: true,
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ['@'],
        source: (searchTerm, renderList, mentionChar) => {
          // const values = self.userListForMention
          // if (searchTerm.length === 0) {
          //   renderList(values, searchTerm)
          // } else {
          //   // const matches = self.universalSearchService.filterByIProfile(
          //   //   searchTerm.toLowerCase(),
          //   //   cloneDeep(self.userListForMention.concat(this.chatMentions))
          //   // )
          //   // renderList(matches, searchTerm)
          // }
        },
      },
    }
  }

  public saveUpdatedMessage(quill) {
    this.handleSubmit(quill.quillEditor.root)
  }


  public resetEditMode() {
    this.editMode = null
  }

  private customHandler(event: any) {
    event.preventDefault()
    event.stopImmediatePropagation()
    this.handleSubmit(event)
  }

  private async handleSubmit(event: any) {
    let val: string = event.target ? event.target.innerHTML : event.innerHTML
    val = val.replace(/<p[>]*>/g, '')
    val = val.replace(/<br[>]*>/g, '')
    val = val.replace(/<(\/)p[>]*>/g, '<br>')
    val = val.trim()
    const messageData = event.target
      ? event.target.innerText.trim()
      : event.innerText.trim()
    if (val && messageData?.length > 0) {
      const o = await this.prepareString(val, this.cloneMessage.content)
      const updatedMessage = { ...this.cloneMessage, content: o.content, isEdited: 'true' }
      this.updateMessage(updatedMessage)
    }
  }

  private prepareString(str: string, obj: any) {
    const finalObj: any = {
      content: null,
      mentions: [],
    }
    if (obj && obj.ops && obj.ops.length) {
      obj.ops.forEach((item: any) => {
        if (typeof item.insert === 'object') {
          if (item.insert.mention) {
            const o: any = item.insert.mention
            finalObj.mentions.push(o.identifier)
            const value = `<span class="ql-mention-denotation-char">${o.denotationChar}</span>${o.value}`
            let PATTERN = ''
            if (o.value !== 'channel') {
              const route = o.id
              const url = `MENTION-${btoa(route)}`
              PATTERN = `[${o.denotationChar}${o.value}](${url})`
            } else {
              PATTERN = `**${value}**`
            }
            str = str.replace(new RegExp(value, 'g'), PATTERN)
          }
        }
      })
    }
    finalObj.content = str.trim()
    return finalObj
  }

  public updateMessage(cloneMessage) {
    this.store.dispatch(
      updateMessage({
        messageId: cloneMessage._id,
        model: cloneMessage,
      })
    )
    this.editMode = null
  }

  async presentActionSheet(message: IMessageResponse, msgIndex: number, messageEle: IonItem) {
    if (message.deleted) {
      return;
    }
    messageEle.color = 'light';
    const popover = await this.popoverController.create({
      id: 'previewPopover',
      component: ChatActionsComponent,
      componentProps: {
        currentUser: this.currentUser,
        message: message,
        userEntities: this.userEntities
      },
      cssClass: 'popover-bottomsheet',
      enterAnimation: (baseEle, opts) => {
        return this.animationCtrl.create()
          .duration(390)
          .addElement(baseEle.querySelector('.popover-wrapper'))
          .fromTo('opacity', '0', '1')
          .easing('cubic-bezier(0.380, 0.700, 0.125, 1.000)')
          .addElement(baseEle.querySelector('.popover-content'))
          // .fromTo('bottom', '-100%', '0')
          .fromTo('transform', 'translateY(100%)', 'translateY(0%)')
          .easing('cubic-bezier(0.380, 0.700, 0.125, 1.000)')
      },
      leaveAnimation: (baseEle) => {
        return this.animationCtrl.create()
          .duration(290)
          .addElement(baseEle.querySelector('.popover-wrapper'))
          .fromTo('opacity', '1', '0')
          .easing('ease-in')
          .addElement(baseEle.querySelector('.popover-content'))
          // .fromTo('bottom', '0px', '-100%')
          .fromTo('transform', 'translateY(0)', 'translateY(100%)')
          .easing('ease-in')
      }
    });
    popover.onDidDismiss().then(res => {
      messageEle.color = '';
      if (res?.data?.type === 'reaction') {
        this.selectedReaction(res.data.reaction, message, msgIndex);
      }
      if (res.data === 'pinMessage') {
        this.pinMessage(message);
        this.cdRef.detectChanges();
      }
      if (res.data === 'edit') {
        this.editMessage(message);
        this.cdRef.detectChanges();
      }
      if (res.data === 'forward') {
        const userArr = [];
        Object.keys(this.userEntities).forEach(res => {
          // if (this.userEntities[res].isEnabled) {
          // }
          userArr.push(this.userEntities[res]);
        })
        const teamsArr = [];
        Object.keys(this.teamEntities).forEach(res => {
          if (
              !this.teamEntities[res].isArchived &&
              this.teamEntities[res].type !== 'PERSONAL' &&
              this.teamEntities[res].type !== 'DIRECT_MESSAGE'
            ) {
            teamsArr.push(this.teamEntities[res]);
          }
        })
        const forwardList = [...userArr, ...teamsArr];
        this.presentModal(forwardList, message);
      }
    })
    return await popover.present();
  }

  public selectedReaction($event, message: IMessageResponse, msgIndex?: number) {
    let selectedReactionObj = {...$event, messageId: message?._id}
    const currentReactions: IReactionResponse[] = message.reactions || []
    const userId = this.currentUser.id
    this.updateReaction(selectedReactionObj, currentReactions, userId, message, msgIndex)
  }

  public navigateToItem(userId) {
    if (userId !== this.currentUser?.id) {
      if (this.DMTeamEntities[userId]) {
        this.navController.navigateForward(`org/chat/${this.DMTeamEntities[userId]}`)
      } else {
        let newTeam: ITeamResponse
        newTeam = {
          type: 'DIRECT_MESSAGE',
          userId: userId,
          requestId: uuidv4(),
          orgId: this.activeChat.orgId,
          name: '',
        }
        this.store.dispatch(createTeam({ model: newTeam }))
      }
    } else {
      this.navController.navigateForward(`org/chat/${this.personalTeam?._id}`)
    }
  }

  public pinMessage(message) {
    const utcMoment = new Date().toISOString()
    const toPin = message?.isPinned ? null : utcMoment
    const updatedMessage = {
      ...message,
      isPinned: toPin,
      pinnedBy: toPin ? this.currentUser?.id : null,
    }
    this.store.dispatch(
      upsertPinnedMessages({
        teamId: message?.teamId,
        model: updatedMessage,
      })
    )
    this.store.dispatch(
      updateMessage({
        messageId: message?._id,
        model: {
          teamId: message?.teamId,
          isPinned: toPin,
          pinnedBy: toPin ? this.currentUser?.id : null,
        },
      })
    )
  }

  private updateReaction(
    selectedReaction: IReaction,
    currentReactions: IReactionResponse[],
    userId: string,
    message: IMessageResponse,
    msgIndex: number
  ) {
    const reactionIndex = currentReactions.findIndex(
      (r) => r.reaction_name === selectedReaction.reaction_name
    )
    if (reactionIndex > -1) {
      const users = cloneDeep(currentReactions[reactionIndex].users) || []
      const userIndex = users.findIndex((u) => u === userId)
      if (userIndex > -1) {
        // removing locally.
        this.overReactionLimit = false
        users.splice(userIndex, 1)
        if (users.length > 0) {
          const reactions = cloneDeep(message.reactions)
          let selected = reactions[reactionIndex]
          selected = { ...selected, users }
          reactions[reactionIndex] = selected
          message = { ...message, reactions }
        } else {
          const reactions = cloneDeep(message.reactions)
          reactions.splice(reactionIndex, 1)
          message = { ...message, reactions }
        }
        // removing on API.
        this.store.dispatch(
          removeReaction({ reaction: selectedReaction })
        )
      } else {
        if (currentReactions.length < 35) {
          // adding locally
          users.push(userId)
          const reactions = cloneDeep(message.reactions)
          let selected = reactions[reactionIndex]
          selected = { ...selected, users }
          reactions[reactionIndex] = selected
          message = { ...message, reactions }
          // add on API.
          this.store.dispatch(
            addReaction({ reaction: selectedReaction })
          )
        } else {
          this.overReactionLimit = true
        }
      }
    } else {
      if (currentReactions.length < 35) {
        // adding new locally.
        const selected = [{ ...selectedReaction, users: [userId] }]
        currentReactions = [...currentReactions, ...selected]
        message = { ...message, reactions: currentReactions }
        // add on API.

        this.store.dispatch(
          addReaction({ reaction: selectedReaction })
        )
      } else {
        this.overReactionLimit = true
      }
    }
    if (this.overReactionLimit) {
      alert(
        "You've reached the reaction limit! On Space, you're limited to 35 reactions per message."
      )
    }
    if (this.chatList?.length && msgIndex) {
      this.chatList[msgIndex] = message;
    }
    this.cdRef.detectChanges();
  }

  private editMessage(message: IMessageResponse) {
    this.prepareEditorOpts();
    this.editMode = message?._id;
    this.cloneMessage = cloneDeep(message)
  }

  private async presentModal(itemList, message: IMessageResponse) {
    const modal = await this.modalController.create({
      component: ForwardListComponent,
      componentProps: {
        items: itemList,
        onlineUsers: this.onlineUsers
      },
      swipeToClose: true,
      presentingElement: this.elementRef.nativeElement.closest('.ion-page'),
      backdropDismiss: true
    });
    modal.onDidDismiss().then(res => {
      if (res) {
        this.forwardMessage(res, message);
      }
    })
    return await modal.present();
  }

  private forwardMessage(res, message: IMessageResponse) {
    if (res?.data) {
      let forwardedMessage: IMessageResponse = {
        attachment: message.attachment,
        content: message.content,
        mentions: message.mentions,
        requestId: uuidv4(),
        senderId: this.currentUser.id,
        channelId: null,
        teamId: null,
        createdAt: new Date().toISOString(),
        orgId: message.orgId
      }
      let redirectionId;
      res?.data.map((option) => {
        if (option?.name) {
          redirectionId = option?._id;
          forwardedMessage = {
            ...forwardedMessage,
            teamId: option?._id,
            channelId: option?.name,
          }
        } else {
          if (option.id === this.currentUser.id) {
            forwardedMessage = {
              ...forwardedMessage,
              teamId: this.personalTeam?._id,
            }
            redirectionId = this.personalTeam?._id;
          } else {
            const DMTeam = this.teamEntities[this.DMTeamEntities[option.id]]
            redirectionId = DMTeam?._id;
            if (!DMTeam) {
              this.sendMessageinNewDmTeam(option.id, forwardedMessage)
              return
            }
            forwardedMessage = {
              ...forwardedMessage,
              teamId: DMTeam?._id,
              channelId: DMTeam?.name,
            }
          }
        }
        this.store.dispatch(
          createMessage({
            // orgId: this.currentUser.orgId,
            message: forwardedMessage,
          })
        )
      })
      if (res?.data?.length === 1 && redirectionId) {
        this.navController.navigateForward(`org/chat/${redirectionId}`, {replaceUrl: true})
      }
    }
  }

  private sendMessageinNewDmTeam(userId, forwardedMessage) {
    let newTeam: ITeamResponse
    newTeam = {
      type: 'DIRECT_MESSAGE',
      userId: userId,
      requestId: uuidv4(),
      name: '',
      orgId: forwardedMessage.orgId
    }
    this.teamService
      .createTeam(newTeam)
      .then((res: RealTimeResponse<ITeamResponse>) => {
        if (res && res.successful && res.data) {
          forwardedMessage = {
            ...forwardedMessage,
            teamId: res.data?._id,
            channelId: res.data?.name,
          }
          this.store.dispatch(
            createMessage({
              message: forwardedMessage,
            })
          )
        } else {
          alert(
            `Unable to forward message to ${this.userEntities[userId]?.firstName}.`
          )
        }
      })
  }

}
