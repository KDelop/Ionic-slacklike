import { createAction, props } from '@ngrx/store'
import {
  IListRootResponse,
  ITeamUserResponse,
  RealTimeResponse,
} from '@app/models'

export const loadRecentItems = createAction(
  '[recentItems] Load recent items list',
  props<{ orgId: string; userId: string }>()
)

export const loadRecentItemsSuccess = createAction(
  '[recentItems] Load recent items list Success',
  props<{ payload: RealTimeResponse<ITeamUserResponse[]> }>()
)

export const loadRecentItemsFailure = createAction(
  '[recentItems] Load recent items list Failure',
  props<{ error: any }>()
)

export const updateRecentItems = createAction(
  '[recentItems] update recent items',
  props<{
    orgId: string
    userId: string
    teamId: string
    model: ITeamUserResponse
  }>()
)

export const updateRecentItemsSuccess = createAction(
  '[recentItems] Update recent items Success',
  props<{ payload: RealTimeResponse<ITeamUserResponse> }>()
)

export const updateRecentItemFailure = createAction(
  '[recentItems] Update recent items Failure',
  props<{ error: any }>()
)

export const removeRecentItems = createAction(
  '[recentItems] Remove recent items',
  props<{
    orgId: string
    userId: string
    teamId: string
    model: ITeamUserResponse
  }>()
)

export const removeRecentItemsSuccess = createAction(
  '[recentItems] Remove recent items Success',
  props<{ payload: RealTimeResponse<ITeamUserResponse> }>()
)

export const removeRecentItemsFailure = createAction(
  '[recentItems] Remove recent items Failure',
  props<{ error: any }>()
)

export const upsertRecentItem = createAction(
  '[recentItems] Upsert recent item',
  props<{
    orgId: string
    userId: string
    teamId: string
    model: ITeamUserResponse
  }>()
)

export const upsertRecentItemSuccess = createAction(
  '[recentItems] Upsert recent item Success',
  props<{ payload: RealTimeResponse<ITeamUserResponse> }>()
)

export const upsertRecentItemFailure = createAction(
  '[recentItems] Upsert recent item Failure',
  props<{ orgId: string; model: ITeamUserResponse }>()
)

export const upsertRecentItemViaEvent = createAction(
  '[recentItems] Upsert recent item via event',
  props<{
    teamUser: ITeamUserResponse
  }>()
)

export const removeRecentItemViaEvent = createAction(
  '[recentItems] Remove recent item via event',
  props<{
    teamUser: ITeamUserResponse
  }>()
)