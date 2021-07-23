import { IReactionResponse } from './reaction.interface'
import { IReaction } from '.'
import { IProfileResponse } from './user.interfaces'

export interface IMessageRequest {
  content?: string
  channelId?: string
  teamId?: string
  requestId?: string
  blockId?: number
  metaData?: any
  attachment?: IAttachment[]
  mentions?: null | string[]
  reactions?: IReactionResponse[]
  deleted?: boolean
  threadId?: number
  isEdited?: string
}

export interface IMessageResponse extends IMessageRequest {
  bot?: any
  _id?: any
  senderId?: any
  orgId?: string
  createdAt?: Date | string
  updatedAt?: Date | string
  user?: any
  isActivity?: boolean
  chat?: {}
  iconPath?: any
  senderNameObj?: any
  formatedTime?: any
  contentForMarkdown?: any
  isSentByCurrentUser?: boolean
  showAvatar?: boolean
  sentAt?: Date
  blockRefId?: number
  isDefault?: boolean
  threadReplyCount?: number
  showInMainConversation?: number
  isPinned?: string
  pinnedBy?: string
  receiver?: string
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  ATTACHMENT = 'attachment',
}

export interface IAttachment {
  title: string
  key: string
  contentType: string
  encoding: string
  size: string
  resourceUrl: string
  metaData?: any
  mediaType?: any
}

export interface IEmitQuillObj {
  content: string
  mentions?: string[]
  trigger?: any
  type?: any
}
