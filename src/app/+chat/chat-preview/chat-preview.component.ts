import {
  Component,
  OnInit,
  Input,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core'
import {
  IMessageRequest,
  IMessageResponse,
} from '../../models/interfaces/message.interfaces'
import { cloneDeep } from 'lodash'
import {
  addReaction,
  createMessage,
  removeReaction,
  updateMessage,
} from '../store/actions/chat.actions'
import { Store } from '@ngrx/store'
import {
  IProfileResponse,
  IReaction,
  IReactionResponse,
  ITeamResponse,
  RealTimeResponse,
} from '../../models'
// import { CommonModalComponent } from '../../+org/common-modal/common-modal.component'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { ENTER } from '@angular/cdk/keycodes'
import { updateTypeTracker } from '../store/actions/type-tracker.actions'
import { ActionSheetController, AnimationController, ModalController, NavController, PopoverController } from '@ionic/angular'
import { ChatActionsComponent } from '../chat-actions/chat-actions.component'
import { ForwardListComponent } from '../../+org/forward-list/forward-list.component'
import { v4 as uuidv4 } from 'uuid'
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { LocalService } from '../../store/services/local.service'
import { TeamService } from '../../store/services/team.service'

@Component({
  selector: 'app-chat-preview',
  templateUrl: './chat-preview.component.html',
  styleUrls: ['./chat-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPreviewComponent implements OnChanges {
  @Input() public message: any
  @Input() public currentUser: IProfileResponse
  @Input() public userEntities: { [id: number]: IProfileResponse }
  @Input() public teamEntities: { [id: number]: ITeamResponse }
  @Input() public attachmentMessages: any = []
  @Input() public activeChat: ITeamResponse
  @Input() public DMTeamEntities: { [userId: number]: number }
  @Input() public inThread: boolean
  @Input() public parentMessage: IMessageResponse

  public editMode: boolean
  public cloneMessage: IMessageResponse
  public imgUtilityBox = false
  public overReactionLimit = false

  public userListForMention: IProfileResponse[]
  public placeholder: string
  public editorOptions = null
  public chatMentions: IProfileResponse[] = []
  public qillMessage: any
  private editorInstance: any
  private typeTimer;
  private isTyping: boolean

  constructor(
    private store: Store,
    private popoverController: PopoverController,
    private animationCtrl: AnimationController,
    private cdRef: ChangeDetectorRef,
    public modalController: ModalController,
    private teamService: TeamService,
    private navController: NavController,
    private localService: LocalService,
    private photoViewer: PhotoViewer
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('userEntities' in changes && this.userEntities && Object.keys(this.userEntities)?.length) {
      this.userListForMention = []
      Object.keys(this.userEntities).forEach((userKey) => {
        if (this.userEntities[userKey]?.isEnabled) {
          let tempUser: any
          tempUser = {
            ...this.userEntities[userKey],
            value: `${this.userEntities[userKey].firstName} ${this.userEntities[userKey].lastName}`,
          }
          this.userListForMention.push(tempUser)
        }
      })
    }
  }

  ngOnInit(): void {
    // this.prepareEditorOpts()
    // this.initTeamMentions()
    // if (this.message?.attachment && this.message?.attachment?.length) {
    //   this.message.attachment.forEach((attachment) => {
    //     if (
    //       attachment &&
    //       attachment?.contentType?.startsWith('image') &&
    //       attachment.metaData
    //     ) {
    //       attachment = this.evalDim(attachment)
    //     }
    //     if (attachment && attachment && attachment.size) {
    //       const size = this.convertFileSize(attachment.size)
    //       attachment = { ...attachment, size }
    //     }
    //   })
    // }
  }

  public onEditMessageClick(e) {
    this.editMode = true
    this.cloneMessage = cloneDeep(this.message)
  }

  public resetEditMode() {
    this.editMode = false
  }

  public handleMouseEvent(event: any) {
    event.preventDefault()
    event.stopPropagation()
    if (event && event.type === 'mouseleave') {
      this.imgUtilityBox = false
    } else if (event && event.type === 'mouseenter') {
      this.imgUtilityBox = true
    }
  }

  public selectedReaction($event) {
    const selectedReaction: IReaction = $event
    const currentReactions: IReactionResponse[] = this.message.reactions || []
    const userId = this.currentUser.id
    this.updateReaction(selectedReaction, currentReactions, userId)
  }

  public showImagePreview(data: any) {
    this.popoverController.dismiss();
    this.photoViewer.show(data.resourceUrl);
  }

  public saveUpdatedMessage(quill) {
    this.handleSubmit(quill.quillEditor.root)
  }

  public downloadFile(attachment: any, event: any) {
    event.preventDefault()
    event.stopPropagation()
    this.goForAttachment(attachment)
  }

  public goForAttachment(attachment: any) {
    const url = attachment.resourceUrl
    const fileName = attachment.title
    if (!url) {
      return
    }
    fetch(url).then((t) => {
      return t.blob().then((b) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(b)
        a.setAttribute('download', fileName)
        a.click()
      })
    })
  }

  public resendMessage(message) {
    let resendMessage: any
    resendMessage = {
      content: message.content,
      teamId: message?.teamId,
      channelId: message?.channelId,
      requestId: message?.requestId,
      senderId: this.currentUser.id,
    }
    resendMessage = { ...resendMessage, createdAt: this.getCurrentDateTime() }
    this.store.dispatch(
      createMessage({
        // orgId: this.currentUser.orgId,
        message: resendMessage,
      })
    )
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

  async presentActionSheet(ev) {
    if (this.message.deleted) {
      return;
    }
    const popover = await this.popoverController.create({
      id: 'previewPopover',
      component: ChatActionsComponent,
      componentProps: {
        currentUser: this.currentUser,
        message: this.message
      },
      cssClass: 'popover-bottomsheet',
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
      if (res?.data?.type === 'reaction') {
        this.selectedReaction(res.data.reaction);
      }
      if (res.data === 'edit') {
        this.onEditMessageClick(null);
        this.cdRef.detectChanges();
      }
      if (res.data === 'forward') {
        const userArr = [];
        Object.keys(this.userEntities).forEach(res => {
          if (this.userEntities[res].isEnabled) {
            userArr.push(this.userEntities[res]);
          }
        })
        const teamsArr = [];
        Object.keys(this.teamEntities).forEach(res => {
          if (
              !this.teamEntities[res].isArchived &&
              this.teamEntities[res].scope === 'CHATROOM' &&
              this.teamEntities[res].type !== 'DIRECT_MESSAGE'
            ) {
            teamsArr.push(this.teamEntities[res]);
          }
        })
        const forwardList = [...userArr, ...teamsArr];
        this.presentModal(forwardList);
      }
    })
    return await popover.present();
  }

  async presentModal(itemList) {
    const modal = await this.modalController.create({
      component: ForwardListComponent,
      componentProps: {
        items: itemList
      },
      swipeToClose: true,
    });
    modal.onDidDismiss().then(res => {
      if (res) {
        this.forwardMessage(res);
      }
    })
    return await modal.present();
  }

  public forwardMessage(res) {
    if (res?.data) {
      let forwardedMessage: IMessageResponse = {
        attachment: this.message.attachment,
        content: this.message.content,
        mentions: this.message.mentions,
        requestId: uuidv4(),
        senderId: this.currentUser.id,
        channelId: null,
        teamId: null,
        createdAt: this.getCurrentDateTime(),
      }
      let redirectionId;
      res?.data.map((option) => {
        if (option?.name) {
          redirectionId = option?.id;
          forwardedMessage = {
            ...forwardedMessage,
            teamId: option?.id,
            channelId: option?.name,
          }
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
        this.store.dispatch(
          createMessage({
            // orgId: this.currentUser.orgId,
            message: forwardedMessage,
          })
        )
      })
      if (res?.data?.length === 1 && redirectionId) {
        this.navController.navigateForward(`org/chat/${redirectionId}`);
      }
    }
  }

  public openThread() {
    this.localService.changeQueryParam({
      thread: this.message.id,
      details: null,
    })
  }

  public trackByFn(index, data: any) {
    return data && data.key ? data.key : index;
  }

  private sendMessageinNewDmTeam(userId, forwardedMessage) {
    let newTeam: ITeamResponse
    newTeam = {
      type: 'DIRECT_MESSAGE',
      userId: userId,
      requestId: uuidv4(),
      name: '',
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

  private getCurrentDateTime() {
    const currentDate: any = new Date()
    // const m = require('moment')
    // let newDate = momentVar(currentDate, 'DD-MM-YYYY')
    // newDate = momentVar(newDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    return currentDate
  }

  private updateReaction(
    selectedReaction: IReaction,
    currentReactions: IReactionResponse[],
    userId: string
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
          const reactions = cloneDeep(this.message.reactions)
          let selected = reactions[reactionIndex]
          selected = { ...selected, users }
          reactions[reactionIndex] = selected
          this.message = { ...this.message, reactions }
        } else {
          const reactions = cloneDeep(this.message.reactions)
          reactions.splice(reactionIndex, 1)
          this.message = { ...this.message, reactions }
        }
        // removing on API.
        this.store.dispatch(
          removeReaction({ reaction: selectedReaction })
        )
      } else {
        if (currentReactions.length < 35) {
          // adding locally
          users.push(userId)
          const reactions = cloneDeep(this.message.reactions)
          let selected = reactions[reactionIndex]
          selected = { ...selected, users }
          reactions[reactionIndex] = selected
          this.message = { ...this.message, reactions }
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
        this.message = { ...this.message, reactions: currentReactions }
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
    this.cdRef.detectChanges();
  }

  private evalDim(attachment) {
    const realWidth = attachment.metaData.width
    const realHeight = attachment.metaData.height
    const previewWidth = 360
    const previewHeight: number = (previewWidth * realHeight) / realWidth
    const attachmentData = {
      ...attachment,
      metaData: { width: previewWidth, height: previewHeight },
    }
    return attachmentData
  }

  private convertFileSize(bytes: any) {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    let l = 0
    let n = parseInt(bytes, 10) || 0
    while (n >= 1024 && ++l) {
      n = n / 1024
    }

    // include a decimal point and a tenths-place digit if presenting
    // less than ten of KB or greater units
    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]
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
          selectall: {
            key: 'A',
            shortKey: true,
            handler: () => {
              document.execCommand('selectall', null)
            },
          },
          bold: {
            key: 'Jk',
            shortKey: true,
            handler: (range, context) => {
              const e: any = event
              let content = e.target.innerText
              content =
                context.prefix +
                '**' +
                content.substr(range.index, range.length) +
                '**' +
                context.suffix
              e.target.innerText = content
            },
          },
          italic: {
            key: 'Tl',
            shortKey: true,
            handler: (range, context) => {
              const e: any = event
              let content = e.target.innerText
              content =
                context.prefix +
                '*' +
                content.substr(range.index, range.length) +
                '*' +
                context.suffix
              e.target.innerText = content
            },
          },
        },
      },
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['code-block', 'link'],
        [{ list: 'ordered' }, { list: 'bullet' }],
      ],
      'emoji-shortname': true,
      'emoji-textarea': true,
      mention: {
        showDenotationChar: true,
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ['@'],
        source: (searchTerm, renderList, mentionChar) => {
          const values = self.userListForMention
          if (searchTerm.length === 0) {
            renderList(values, searchTerm)
          } else {
            // const matches = self.universalSearchService.filterByIProfile(
            //   searchTerm.toLowerCase(),
            //   cloneDeep(self.userListForMention.concat(this.chatMentions))
            // )
            // renderList(matches, searchTerm)
          }
        },
      },
    }
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
      const updatedMessage = { ...this.cloneMessage, content: o.content }
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

  private initTeamMentions() {
    this.chatMentions = []
    if (
      this.activeChat &&
      this.activeChat.type !== 'DIRECT_MESSAGE' &&
      this.activeChat.type !== 'PERSONAL'
    ) {
      const teamMention: any = {
        id: 0,
        orgId: 0,
        email: 'channel',
        firstName: '@channel',
        lastName: '',
        username: 'channel',
        value: 'channel',
        identifier: '@all',
        isEnabled: true,
      }
      this.chatMentions.push(teamMention)
    }
  }

  public updateMessage(cloneMessage) {
    this.store.dispatch(
      updateMessage({
        messageId: cloneMessage.id,
        model: cloneMessage,
      })
    )
    this.editMode = false
  }
}
