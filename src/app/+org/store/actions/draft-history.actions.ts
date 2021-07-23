import { createAction, props } from '@ngrx/store'
import {
  IListRootResponse,
  ITeamUserResponse,
  RealTimeResponse,
} from '@app/models'

export const loadDraftHistoryList = createAction(
  '[draftHistory] Load draft history list',
  props<{ orgId: string; userId: string }>()
)

export const loadDraftHistoryListSuccess = createAction(
  '[draftHistory] Load draft history list Success',
  props<{ payload: RealTimeResponse<IListRootResponse<ITeamUserResponse>> }>()
)

export const loadDraftHistoryListFailure = createAction(
  '[draftHistory] Load draft history list Failure',
  props<{ error: any }>()
)

export const upsertDraftHistory = createAction(
  '[draftHistory] Upsert draft history',
  props<{
    orgId: string
    userId: string
    teamId: string
    model: ITeamUserResponse
  }>()
)

export const upsertDraftHistorySuccess = createAction(
  '[draftHistory] Upsert draft history Success',
  props<{ payload: RealTimeResponse<ITeamUserResponse> }>()
)

export const upsertDraftHistoryFailure = createAction(
  '[draftHistory] Upsert draft history Failure',
  props<{ orgId: string; model: ITeamUserResponse }>()
)

export const upsertDraftHistoryViaEvent = createAction(
  '[draftHistory] Upsert draft history via event',
  props<{
    teamUser: ITeamUserResponse
  }>()
)
