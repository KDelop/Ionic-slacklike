import { createAction, props } from '@ngrx/store'
import {
  RealTimeResponse,
  IListRootResponse,
  IProfileResponse,
  IInviteUserRequest,
  IProfileRequest,
  IUserRoleRequest,
} from '@app/models'

export const loadUser = createAction('[user] Load user')

export const loadUserSuccess = createAction(
  '[user] Load user Success',
  props<{ payload: RealTimeResponse<IProfileResponse> }>()
)

export const loadUserFailure = createAction(
  '[user] Load user Failure',
  props<{ error: any }>()
)

export const createUser = createAction(
  '[user] Create user',
  props<{ model: IInviteUserRequest }>()
)

export const createUserSuccess = createAction(
  '[user] Create user Success',
  props<{ payload: RealTimeResponse<IProfileResponse> }>()
)

export const createUserFailure = createAction(
  '[user] Create user Failure',
  props<{ error: any }>()
)

export const updateUser = createAction(
  '[user] Update user',
  props<{ userId: string; model: IProfileRequest | IUserRoleRequest }>()
)

export const updateUserSuccess = createAction(
  '[user] Update user Success',
  props<{ payload: RealTimeResponse<IProfileResponse> }>()
)

export const updateUserFailure = createAction(
  '[user] Update user Failure',
  props<{ error: any }>()
)

export const upsertUserViaEvent = createAction(
  '[user] Upsert user via event',
  props<{ user: IProfileResponse }>()
)
