import {
  Component,
  OnInit,
  ViewChild,
  Input,
  SimpleChanges,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnChanges,
} from '@angular/core'
// import {
//   PerfectScrollbarComponent,
//   PerfectScrollbarConfigInterface,
// } from 'ngx-perfect-scrollbar'
import moment from 'moment'
import { groupBy } from 'lodash'
import { IProfileResponse, ITeamResponse } from '../../models'
import {
  IMessageResponse,
  MediaType,
} from '../../models/interfaces/message.interfaces'
import { NgScrollbar } from 'ngx-scrollbar'
import { Dictionary } from '@ngrx/entity'
declare var require: any
const momentVar = require('moment')
@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatListComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild(NgScrollbar) scrollbarRef: NgScrollbar

  @Input() public chatList: any[]
  @Input() public activeChat: ITeamResponse
  @Input() public currentUser: IProfileResponse
  @Input() public userEntities: { [id: number]: IProfileResponse }
  @Input() public teamEntities: { [id: number]: ITeamResponse }
  @Input() public isMessageSent: boolean
  @Input() public isMessageRecieved: boolean
  @Input() public channelUnreadCount = 0
  @Input() public DMTeamEntities: { [userId: number]: number }
  @Input() public chatListEntities: Dictionary<IMessageResponse>
  @Input() public isLoaded: boolean
  @Output() public loadMore: EventEmitter<any> = new EventEmitter<any>()
  @Output()
  public unsetNewMessageRecieved: EventEmitter<any> = new EventEmitter<any>()

  // public psConfig: PerfectScrollbarConfigInterface = {
  //   suppressScrollY: false,
  //   suppressScrollX: true,
  // }
  public groupedMessagesList: any = null
  // public groupedMessagesListArr: any = [];
  public objectKeys = Object.keys
  public attachmentMessages: any = []
  public leastUnreadChat: IMessageResponse

  // @ViewChild('scrollerRef', { static: false })
  // public scrollerRef: PerfectScrollbarComponent

  private scrollTopTo: number
  private previousScrollHeight: number

  public skeletonItem = [
    {line1: 40, line2: 30},
    {date: true},
    {line1: 50, line2: 12},
    {line1: 43},
    {line1: 68, line2: 32},
    {date: true},
    {line1: 58, line2: 14},
    {line1: 78, line2: 16},
    {date: true},
    {line1: 48, line2: 27},
    {line1: 59, line2: 32},
    {line1: 40},
    {line1: 78, line2: 17},
    {line1: 58, line2: 37},
    {date: true},
    {line1: 49, line2: 11},
    {date: true},
    {line1: 50, line2: 26},
    {line1: 57, line2: 20},
    {line1: 56},
    {line1: 87, line2: 39},
    {date: true},
    {line1: 46, line2: 21},
    {line1: 78},
    {line1: 75, line2: 12},
    {line1: 45, line2: 26},
  ]

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log('chatListComponent ngOnInit');
  }

  ngAfterViewInit() {
    // this.scrollbarRef?.scrolled.subscribe((e) => {
    //   const pos = e.target.scrollTop + e.target.clientHeight
    //   const max = e.target.scrollHeight
    //   if (pos >= max) {
    //     this.unsetNewMessageRecieved.emit()
    //   }
    // })
    // this.scrollToUnreadOrBottom()
  }

  public ngOnChanges(changes: SimpleChanges) {
    if ('activeChat' in changes) {
      if (this.activeChat?.name !== changes.activeChat?.previousValue?.name) {
        this.leastUnreadChat = null
      }
    }
    if ('chatList' in changes && this.chatList) {
      this.prepareChatWrapper(this.chatList)
    }
    if ('isMessageSent' in changes) {
      if (this.isMessageSent) {
        this.unsetNewMessageRecieved.emit()
        this.scrollToBottom()
      }
    }
  }

  public trackByFn(index, data: any) {
    return data && data.id ? data.id : index;
  }

  public loadMoreMessages() {
    this.loadMore.emit()
  }

  public scrollToBottom() {
    // if (this.scrollbarRef) {
    //   this.scrollbarRef.scrollTo({ bottom: 0, duration: 0 })
    // }
    this.unsetNewMessageRecieved.emit()
  }

  private prepareChatWrapper(chats: any[]) {
    // const scrollMargin = this.scrollbarRef?.viewport?.nativeElement?.scrollTop
    // const scrollTopPosition =
    //   this.scrollbarRef?.viewport?.nativeElement?.scrollHeight -
    //   this.scrollbarRef?.viewport?.nativeElement?.offsetHeight

    let tracks = []

    if (chats) {
      const chatTracks = this.prepareChatsData(chats)
      tracks = tracks.concat(chatTracks)
    }

    this.chatList = tracks


    // this.groupedMessagesList = groupBy(
    //   this.chatList,
    //   (track) => track.relativeTime
    // )
    // this.cdRef.detectChanges()
    // if (scrollMargin === scrollTopPosition) {
    //   this.scrollToBottom()
    //   return
    // }

    // if (!this.isMessageRecieved) {
    //   if (this.scrollbarRef) {
    //     const scrollTop =
    //       this.scrollbarRef?.viewport.nativeElement.scrollHeight -
    //       this.previousScrollHeight +
    //       scrollMargin
    //     this.scrollTopTo = scrollTop
    //   }

    //   if (!this.scrollTopTo) {
    //     this.scrollToUnreadOrBottom()
    //   } else {
    //     this.scrollbarRef.scrollTo({ top: this.scrollTopTo, duration: 0 })
    //   }
    //   this.previousScrollHeight = this.scrollbarRef?.viewport.nativeElement.scrollHeight
    // }
  }

  private prepareChatsData(chats): any[] {
    this.attachmentMessages = []
    const senderGroup: { name: string; formatedTime: string } = {
      name: null,
      formatedTime: null,
    }
    const unreadCountDiff = chats?.length - this.channelUnreadCount

    return chats.map((chat: any, index: number) => {
      if (chat.attachment && chat.attachment.length && !chat.deleted) {
        const attachmentData = []
        chat.attachment.forEach((attachment) => {
          attachment = {
            ...attachment,
            mediaType: this.checkForMedia(attachment),
            senderId: chat.senderId,
            createdAt: chat.createdAt,
          }
          attachmentData.push(attachment)
          if (
            attachment.contentType &&
            attachment.contentType.startsWith('image') &&
            attachment.contentType !== 'image/vnd.adobe.photoshop'
          ) {
            this.attachmentMessages.push(attachment)
          }
        })
        chat = { ...chat, attachment: attachmentData }
      }
      if (this.leastUnreadChat && chat?.id === this.leastUnreadChat?._id) {
        chat = { ...chat, isLeastUnreadTrack: true }
      } else if (
        !this.leastUnreadChat &&
        index === unreadCountDiff &&
        unreadCountDiff !== chats?.length &&
        this.channelUnreadCount > 0
      ) {
        this.leastUnreadChat = chat
        chat = { ...chat, isLeastUnreadTrack: true }
      }
      chat = {
        ...chat,
        formatedTime: momentVar(chat.createdAt).format('hh:mm a'),
      }
      chat = {
        ...chat,
        showAvatar: this.showAvatarInTrack(chat, senderGroup),
        // relativeTime: this.relativeTime(chat.createdAt),
      }
      return chat
    })
  }

  private showAvatarInTrack(
    track: any,
    senderGroup: { name: string; formatedTime: string }
  ): boolean {
    const formatedTime = track.formatedTime

    const message: any = track
    const senderName =
      this.userEntities[message?.senderId]?.firstName +
      ' ' +
      this.userEntities[message?.senderId]?.lastName

    if (
      senderGroup.formatedTime === formatedTime &&
      senderGroup.name === senderName
    ) {
      return false
    }

    senderGroup.name = senderName
    senderGroup.formatedTime = track.formatedTime
    return true
  }

  public checkForMedia(attachment: any) {
    // MediaType
    if (attachment && attachment.contentType) {
      if (attachment.contentType.startsWith('image')) {
        return MediaType.IMAGE
      }
      if (attachment.contentType.startsWith('audio')) {
        return MediaType.AUDIO
      }
      if (attachment.contentType.startsWith('video')) {
        return MediaType.VIDEO
      }
      return MediaType.ATTACHMENT
    } else {
      return null
    }
  }

  private relativeTime(date): string {
    const duration = moment.duration(momentVar().diff(momentVar(date)))
    const diff = Math.round(duration.asDays())

    if (diff === 0) {
      return 'Today'
    } else if (diff === 1) {
      return 'Yesterday'
    }
    return momentVar(date).format('DD MMM YYYY')
  }

  private scrollToUnreadOrBottom() {
    if (this.leastUnreadChat) {
      this.scrollbarRef.scrollToElement('#new-track', {
        left: 0,
        top: -40,
        duration: 0,
      })
    } else {
      this.scrollToBottom()
    }
  }
}
