import { IProfileResponse } from './user.interfaces'

export interface ITypeTrackerReq {
  orgId: string
  teamId: string
  isTyping: boolean
}

export interface ITypeTrackerRes extends ITypeTrackerReq {
  userId: string
  createdAt: Date
}
