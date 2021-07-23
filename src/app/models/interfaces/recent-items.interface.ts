export enum TabType {
  CHANNEL = 'CHANNEL',
  USER = 'USER',
}

export interface IRecentItemsReq {
  userId?: string
  teamId?: string
  type?: string
  draftMessage?: string
  isPinned?: boolean
  createdAt?: string
  updatedAt?: string
  lastUpdatedAt?: string
  unreadCount?: number
  badgeCount?: number
}
export interface IRecentItems {
  userId?: string
  teamId?: string
  type?: string
  draftMessage?: string
  isPinned?: boolean
  createdAt?: Date
  updatedAt?: Date
  lastUpdatedAt?: Date | string
  unreadCount?: number
  badgeCount?: number
}