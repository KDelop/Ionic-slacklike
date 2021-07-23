import { IOrgResponse, ITeamUserResponse } from '.'

export interface IUserRoleRequest {
  role?: 0 | 1 | 2
  isEnabled?: boolean
}

export interface IStats {
  teamId: string
  blocks: string
  name?: string
  type?: string
}

export interface IUserEntities {
  [id: number]: IProfileResponse
}

export interface IProfileResponse extends IUserRoleRequest {
  id?: string
  email?: string
  username?: string
  firstName?: string
  orgs?: IOrgResponse[]
  invitedBy?: number
  chatOnline?: boolean
  isOnline?: boolean
  lastName?: string
  avatar?: string
  mobileNumber?: string
  quote?: string
  jobRole?: string
  skills?: string[]
  createdAt?: Date | string
  updatedAt?: Date | string
  teamUsers?: ITeamUserResponse
  stats?: IStats[]
  identifier?: string
  unreadCount?: number
  status?: { text: string; iconCode?: string; icon?: string }
  personalTeam?: string
  activeSession?: string
  googleOAuth2Tokens?
  org_user: any
  theme?
}

export interface IProfileRequest extends IUserRoleRequest {
  email: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  mobileNumber?: string
  quote?: string
  password?: string
  jobRole?: string
  skills?: string[]
  activeSession?: string
  googleOAuth2Tokens?
  theme?
}
