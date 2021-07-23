import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  NgZone,
  EventEmitter,
  Output,
  HostListener,
  OnDestroy,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core'
// import './../../frameworks/quill-plugins/command/command.js'
import './../../frameworks/quill-plugins/mention/mention.js'
// import './../../frameworks/quill-plugins/emoji/quill-emoji.js'
import { DOCUMENT } from '@angular/common'
import { IMessageResponse } from '@app/src/app/models/interfaces/message.interfaces'
import { v4 as uuidv4 } from 'uuid'
import { Store } from '@ngrx/store'
import {
  createMessage,
} from '../store/actions/chat.actions'
import {
  IProfileResponse,
  ITeamResponse,
  ITeamUserResponse,
  ITypeTrackerRes,
} from '../../models/index'
import { cloneDeep } from 'lodash'
// import { UniversalSearchService } from '../../store/services/search.service'
import { DomSanitizer } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { ENTER } from '@angular/cdk/keycodes'
import { updateTypeTracker } from '../store/actions/type-tracker.actions'
import moment from 'moment';
import { UniversalSearchService } from '../../store/services/search.service'
import { UploadFileService } from '../../store/services/upload.service'
import { createTeamUser } from '../../store/actions/team.actions.js'
import { Plugins } from '@capacitor/core';
const { Keyboard } = Plugins;


@Component({
  selector: 'app-chat-footer',
  templateUrl: './chat-footer.component.html',
  styleUrls: ['./chat-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatFooterComponent implements OnInit, OnChanges, OnDestroy {
  @Input() public userList: IProfileResponse[]
  @Input() public receiver: IProfileResponse
  @Input() public activeChat: ITeamResponse
  @Input() public currentUser: IProfileResponse
  @Input() public draftHistoryEntities: { [id: string]: string }
  @Input() public activeThreadId: number

  @Output() public fileUploading: EventEmitter<{
    inProgress: boolean
    msg: string
  }> = new EventEmitter<{ inProgress: boolean; msg: string }>()

  private editorInstance: any
  public editorOptions = null
  public placeholder: string
  public message: string
  public showFormattingOptions: boolean
  public userListForMention: IProfileResponse[]
  public chatMentions: IProfileResponse[] = []
  public fileUploadObj: any = []
  public attachmentData: any[] = []
  public sendToTracks: boolean

  private isTyping: boolean
  private typeTimer;

  @ViewChild('fileInput', { static: false }) public fileInput: ElementRef

  constructor(
    // @Inject(DOCUMENT) private document: any,
    private store: Store,
    private universalSearchService: UniversalSearchService,
    // private domSanitizer: DomSanitizer,
    private uploadFileService: UploadFileService,
    private zone: NgZone,
    // private router: Router,
    // private cdRef: ChangeDetectorRef,
    private elementRef: ElementRef
  ) {
    // this.elementRef.nativeElement.addEventListener('inside-upload', this.uploadListner)
    // this.elementRef.nativeElement.addEventListener('inside-upload-thread', this.uploadListner)
    // this.elementRef.nativeElement.addEventListener('inside-formatting', (e: any) => {
    //   if (e) {
    //     this.showFormattingOptions = !this.showFormattingOptions;
    //     this.editorInstance.focus()
    //     this.cdRef.detectChanges();
    //   }
    // })
    // this.elementRef.nativeElement.addEventListener('send-message-event', (e: any) => {
    //   if (e) {
    //     this.customHandler(e);
    //     this.editorInstance.focus()
    //   }
    // })
  }

  // @HostListener('body:keydown', ['$event'])
  // public handleKeydownBody(e: any) {
  //   if (
  //     e?.target?.parentElement?.parentElement?.classList?.contains(
  //       'active-thread'
  //     )
  //   ) {
  //     e?.stopPropagation()
  //     return
  //   }
  //   if (
  //     !this.editorInstance.root.parentElement.parentElement.classList.contains(
  //       'active-thread'
  //     )
  //   ) {
  //     const key = e.which || e.keyCode
  //     // tslint:disable-next-line:no-string-literal
  //     if (e?.srcElement['dataset'].video === 'Embed URL') {
  //       e?.stopPropagation()
  //       return
  //     }
  //     if (key !== 27 && !(key === 91 || e.metaKey || e.ctrlKey)) {
  //       this.editorInstance.focus()
  //     }
  //   }
  // }

  ngOnInit(): void {
      this.prepareEditorOpts()
  }

  public ngOnChanges(changes: SimpleChanges) {
    if ('userList' in changes && this.userList) {
      this.userListForMention = []
      this.userList.map((user) => {
        // if (user.isEnabled) {
          let tempUser: any
          tempUser = { ...user, value: `${user.firstName} ${user.lastName}` }
          this.userListForMention.push(tempUser)
        // }
      })
      // this.prepareEditorOpts()
      this.initTeamMentions()
    }
    // if ('activeTypeTracker' in changes && this.activeTypeTracker) {
    //   this.activeTypers = ''
    //   this.findActiveTypers()
    // }
  }

  // private uploadListner = (e: any) => {
  //   if (e) {
  //     if (
  //       (e.eventName === 'inside-upload' && !this.activeThreadId) ||
  //       (e.eventName === 'inside-upload-thread' && this.activeThreadId)
  //     ) {
  //       this.editorInstance.focus();
  //       this.initiateFileSelect(e)
  //     }
  //   }
  // }

  public ngOnDestroy() {
    // this.elementRef.nativeElement.removeEventListener('inside-upload', this.uploadListner)
    // this.elementRef.nativeElement.removeEventListener(
    //   'inside-upload-thread',
    //   this.uploadListner
    // )
    // this.elementRef.nativeElement.removeEventListener(
    //   'inside-upload-thread',
    //   this.uploadListner
    // )
    // this.elementRef.nativeElement.removeEventListener('inside-formatting', (e: any) => {
    //   this.showFormattingOptions = !this.showFormattingOptions;
    //   this.editorInstance.focus()
    // });
    // this.elementRef.nativeElement.removeEventListener('send-message-event', this.customHandler);

    // if (this.editorInstance) {
    //   const content = this.editorInstance.getText()
    //   if (
    //     content.length <= 1 &&
    //     this.draftHistoryEntities &&
    //     this.draftHistoryEntities[this.activeChat?.name]
    //   ) {
    //     this.store.dispatch(
    //       removeDraftHistory({
    //         channelId: this.activeChat?.name,
    //       })
    //     )
    //   }
    //   if (content.length > 1) {
    //     this.store.dispatch(
    //       addDraftHistory({
    //         content: this.editorInstance.getContents(),
    //         channelId: this.activeChat?.name,
    //       })
    //     )
    //   }
    // }
  }

  public addBindingCreated(quill: any) {
    this.editorInstance = quill
    if (this.draftHistoryEntities && this.draftHistoryEntities[this.activeChat?.name]) {
      const content: any = this.draftHistoryEntities[this.activeChat?.name]
      this.editorInstance.updateContents(content)
    }
  }

  public initiateFileSelect() {
    Keyboard.hide().then(() => {
      this.fileInput.nativeElement.click()
    })
  }

  public onfileInputChange(event: any) {
    this.editorInstance.focus()
    const files: File[] = event.srcElement.files
    this.onFileUploadTrigger(files)
  }

  public onFileUploadTrigger(files: File[]) {
    // this.fileUploadObj = []
    let uploadFiles = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const name = files[i].name.replace(/[^\w\s\.\_\-]/gi, '')
        uploadFiles[i] = {
          key: `${uuidv4()}_${name}`,
          name,
          comment: '',
          path: (files[i] as any).path,
          // handle for zip and dmg and few other types
          type: files[i].type || `application/${name.split('.').pop()}`,
          isShared: true,
          file: files[i],
        }
      }
      this.fileUploadObj = [...this.fileUploadObj, ...uploadFiles];
    }
  }

  public removeFile(file) {
    this.fileUploadObj = this.fileUploadObj.filter(
      (fileObj) => fileObj.name !== file.name
    )
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

  // public toggleFormatting() {
  //   console.log('toggleFormatting this.editorInstance', this.editorInstance);
  // }

  public joinChannel() {
    const teamUser: ITeamUserResponse = {
      userId: this.currentUser.id,
      teamId: this.activeChat._id,
      orgId: this.activeChat.orgId,
    }

    this.store.dispatch(
      createTeamUser({
        model: teamUser,
        user: this.currentUser,
        isCurrentUserAdded: true,
      })
    )
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

  private uploadFilesToS3(e) {
    let message: IMessageResponse = Object.assign(e)
    if (message.content.split('\n').length > 3) {
      const str = message.content.replace(/\n\n/gi, '<br>')
      message = { ...message, content: str }
    }
    message = {
      ...message,
      teamId: this.activeChat._id,
      channelId: this.activeChat.name,
      requestId: uuidv4(),
      senderId: this.currentUser.id,
    }
    if (this.activeThreadId) {
      message.threadId = this.activeThreadId
    }

    let totalUploads = 0
    const attachmentData = []
    // for (let i = 0; i < this.fileUploadObj.length; i++) {
    this.fileUploadObj.forEach((item) => {
      const obj = {
        content: item.file,
        key: item.key,
        file: {
          type: item.type,
        },
      }
      const ref = this.uploadFileService.uploadfile(obj)
      ref
        .then((res: any) => {
          this.zone.run(() => {
            totalUploads++
            const resourceKey = res.Key || res.key
            const attachment = {
              title: item.name,
              key: resourceKey,
              resourceUrl: `https://kiss-uploads.sokt.io/${encodeURI(
                resourceKey
              )}`,
              contentType: obj.file.type,
              size: item.file.size,
              encoding: '',
            }
            attachmentData.push(attachment)
            if (totalUploads === this.fileUploadObj.length) {
              this.fileUploading.emit({
                inProgress: true,
                msg: 'Your file is successfully uploaded',
              })
              message = { ...message, attachment: attachmentData }
              this.sendMessagewithAttachment(message)
            }
          })
        })
        .catch((err: any) => {
          this.fileUploading.emit({
            inProgress: true,
            msg: 'There is some issue with file uploading. please try again',
          })
          totalUploads++
          if (totalUploads === this.fileUploadObj.length) {
            message = { ...message, attachment: attachmentData }
            this.sendMessagewithAttachment(message)
          }
        })
    })
  }

  private sendMessagewithAttachment(message) {
    this.attachmentData = []
    message.attachment.forEach((attachment) => {
      this.feedImageDimensions(message, attachment)
    })
  }

  private feedImageDimensions(message, attachment) {
    if (
      attachment.contentType &&
      attachment.contentType.startsWith('image') &&
      attachment.contentType !== 'image/vnd.adobe.photoshop'
    ) {
      const image = new Image()
      image.src = attachment.resourceUrl
      image.onload = (scope) => {
        this.zone.run(() => {
          attachment = {
            ...attachment,
            metaData: {
              height: image.height,
              width: image.width,
            },
          }
          this.attachmentData.push(attachment)
          if (this.attachmentData.length === message.attachment.length) {
            message = { ...message, attachment: this.attachmentData, orgId: this.activeChat.orgId }
            this.createMessage(message)
          }
        })
      }
    } else {
      this.attachmentData.push(attachment)
      if (this.attachmentData.length === message.attachment.length) {
        message = { ...message, attachment: this.attachmentData }
        this.createMessage(message)
      }
    }
  }

  private createMessage(message) {
    message = { ...message, createdAt: this.getCurrentDateTime() }
    this.store.dispatch(
      createMessage({
        // orgId: this.activeChat.orgId,
        message,
      })
    )
    this.fileUploadObj = []
    this.fileUploading.emit({ inProgress: false, msg: '' })
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

  private prepareEditorOpts() {
    const self = this
    this.placeholder = 'Send message';
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
      // toolbar: [
      //   ['bold', 'italic', 'underline', 'strike'],
      //   ['code-block', 'link'],
      //   [{ list: 'ordered' }, { list: 'bullet' }],
      // ],
      // 'emoji-shortname': true,
      // 'emoji-textarea': true,
      mention: {
        showDenotationChar: true,
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ['@'],
        source: (searchTerm, renderList, mentionChar) => {
          const values = self.userListForMention
          if (searchTerm.length === 0) {
            renderList(values, searchTerm)
          } else {
            const matches = self.universalSearchService.filterByIProfile(
              searchTerm.toLowerCase(),
              cloneDeep(self.userListForMention.concat(this.chatMentions))
            )
            renderList(matches, searchTerm)
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

  public async handleSubmit(event: any, tapped?: boolean) {
    this.editorInstance.focus();
    let content;
    if (tapped) {
      content = event.quillEditor.root;
      // console.log('content', content);
    } else {
      content = event.target;
    }
    let val: string = content.innerHTML
    val = val.replace(/<p[>]*>/g, '')
    val = val.replace(/<br[>]*>/g, '')
    val = val.replace(/<(\/)p[>]*>/g, '<br>')
    val = val.trim()
    let messageData = content.innerText.trim()
    if (this.fileUploadObj?.length) {
      this.fileUploading.emit({ inProgress: true, msg: 'Uploading file...' })
      if (!val || !messageData) {
        val = 'Shared attachment from mobile.'
        messageData = val
      }
    }
    if (val && messageData?.length > 0) {
      const o = await this.prepareString(val, this.message)
      if (this.fileUploadObj?.length) {
        this.uploadFilesToS3(o)
      } else {
        this.sendMessage(o)
      }
      // this.editorInstance.setText('')
      content.innerHTML = ''
      if (this.draftHistoryEntities && this.draftHistoryEntities[this.activeChat?.name]) {
        // this.store.dispatch(
        //   removeDraftHistory({
        //     channelId: this.activeChat?.name,
        //   })
        // )
      }
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

  private sendMessage(e: any) {
    let message: IMessageResponse = Object.assign(e)
    if (message.content.split('\n').length > 3) {
      const str = message.content.replace(/\n\n/gi, '<br>')
      message = { ...message, content: str }
    }
    message = {
      ...message,
      teamId: this.activeChat?._id,
      channelId: this.activeChat?.name,
      requestId: uuidv4(),
      senderId: this.currentUser.id,
      orgId: this.activeChat?.orgId,
    }
    message = { ...message, createdAt: this.getCurrentDateTime() }
    if (this.activeThreadId) {
      message.threadId = this.activeThreadId
    }
    if (this.sendToTracks) {
      message.showInMainConversation = 1
    }
    // if (this.currentUser) {
    //   message.user = this.currentUser;
    // }
    // return;
    this.store.dispatch(
      createMessage({
        // orgId: this.activeChat?.orgId,
        message,
      })
    )
  }

  private getCurrentDateTime() {
    // const m = require('moment')
    const utcMoment = moment.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    return utcMoment
  }
}
