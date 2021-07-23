import { IProfileResponse } from '.'

export interface ITeamRequest {
  name?: string
  requestId?: string
  type: string
  purpose?: string
  userId?: string
  webrtcSessionInfo?: { hostId: string; createdAt: Date | string }
}
export interface ITeamResponse extends ITeamRequest {
  _id?: any
  orgId?: string
  createdBy?: number
  updatedBy?: number
  createdAt?: Date | string
  updatedAt?: Date | string
  receiverName?: string
  users?: { userId: string }[]
  unreadCount?: number
  isEnabled?: boolean
  isArchived?: boolean
  isCurrentUserMember?: boolean
  receiverId?: string
  teamId?: string
}

export interface ITeamUserRequest {
  teamId?: string
  userId?: string
  orgId?: string
  isPinned?: boolean
  draftMessage?: string
  lastUpdatedAt?: string
  unreadCount?: number
  badgeCount?: number
  eventType?: string
}

export interface ITeamUserResponse extends ITeamUserRequest {
  createdAt?: Date | string
  id?: string
  receiverId?: string
  updatedAt?: Date | string
}
