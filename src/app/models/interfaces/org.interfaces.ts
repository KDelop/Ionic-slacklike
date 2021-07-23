import { IProfileResponse } from '.'
import { IRecentItems } from './recent-items.interface'

export interface IOrgDetails {
  id: number;
  name: string;
  domain: string;
}
interface ICommonUtils {
  updatedBy?: number
  createdBy?: number
  createdAt?: number
  updatedAt?: string
}

export interface IOrgRequest {
  name: string
  domain: string
  guestSettings?: { hideProfile?: boolean; canJoinTeams?: boolean }
}

// update org
export interface IOrgUpdateRequest {
  whitelistedDomains?: string[]
  public?: boolean
  guestSettings?: { hideProfile?: boolean; canJoinTeams?: boolean }
}

/**
 * using for both places server db and local db
 */
export interface IOrgResponse extends IOrgRequest, ICommonUtils {
  id: string
  users?: IProfileResponse[]
  token?: string
  isActive?: boolean
  whitelistedDomains?: string[]
  public: boolean
  guestSettings?: { hideProfile?: boolean; canJoinTeams?: boolean }
}

// usage for db
export interface IOrgDb {
  id?: string
  name?: string
  aidata?: Igtbl
  recentChannels?: IRecentItems[]
  recentUsers?: IRecentItems[]
}

export interface Igtbl {
  orgUsers?: IProfileResponse[]
}

// invite user
export interface IInviteUserRequest {
  email: string
  orgId: string
  invitedBy?: string
  role?: 0 | 1 | 2 | 3
}

export interface IOrgAuthRequest {
  name: string
}

export interface IOrgAuthResponse extends IOrgAuthRequest, ICommonUtils {
  id: number
  authkey: string
}
