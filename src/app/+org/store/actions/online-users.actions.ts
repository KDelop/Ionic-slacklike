import { createAction, props } from '@ngrx/store'
import {
  IListRootResponse,
  IProfileResponse,
  RealTimeResponse,
} from '@app/models'

export const loadOnlineUsers = createAction(
  '[onlineUsers] Load online users',
  props<{ orgId: string }>()
)

export const loadOnlineUsersSuccess = createAction(
  '[onlineUsers] Load online users Success',
  props<{ payload: RealTimeResponse<any[]> }>()
)

export const loadOnlineUsersFailure = createAction(
  '[onlineUsers] Load online users Failure',
  props<{ error: any }>()
)

export const upsertOnlineUserViaEvent = createAction(
  '[onlineUsers] upsert online user via event',
  props<{ user: any }>()
)

export const removeOnlineUserViaEvent = createAction(
  '[onlineUsers] remove online user via event',
  props<{ user: any }>()
)
