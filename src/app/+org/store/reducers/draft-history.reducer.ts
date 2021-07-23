import { ITeamUserResponse } from '@app/src/app/models'
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { createReducer, on, Action } from '@ngrx/store'

import * as DraftHistoryActions from '../actions/draft-history.actions'

export const draftHistoryFeatureKey = 'draftHistoryList'

export interface DraftHistoryState extends EntityState<ITeamUserResponse> {
  isLoaded: boolean
}

export const adapter: EntityAdapter<ITeamUserResponse> = createEntityAdapter<ITeamUserResponse>(
  {
    selectId: (items: ITeamUserResponse) => items.teamId,
  }
)

export const initialState: DraftHistoryState = adapter.getInitialState({
  isLoaded: false,
})

export const draftHistoryReducer = createReducer(
  initialState,

  on(DraftHistoryActions.loadDraftHistoryList, (state, action) => {
    state = { ...state, isLoaded: false }
    return state
  }),

  on(DraftHistoryActions.loadDraftHistoryListSuccess, (state, action) => {
    state = { ...state, isLoaded: true }
    const draftHistoryData = action.payload.data.data
    if (draftHistoryData) {
      return adapter.setAll(draftHistoryData, state)
    }
    return state
  }),

  on(DraftHistoryActions.upsertDraftHistory, (state, action) => {
    const draftHistoryModel = { ...action.model }
    if (draftHistoryModel) {
      if (draftHistoryModel.draftMessage === 'null') {
        return adapter.removeOne(draftHistoryModel.teamId, state)
      } else {
        return adapter.upsertOne(draftHistoryModel, state)
      }
    }
    return state
  }),

  on(DraftHistoryActions.upsertDraftHistorySuccess, (state, action) => {
    const draftHistoryModel = action.payload.data[0]
    if (draftHistoryModel) {
      if (draftHistoryModel.draftMessage !== 'null') {
        return adapter.updateOne(
          { id: draftHistoryModel.teamId, changes: draftHistoryModel },
          state
        )
      }
    }
    return state
  }),

  on(DraftHistoryActions.upsertDraftHistoryViaEvent, (state, action) => {
    const draftHistoryModel = { ...action.teamUser }
    if (draftHistoryModel) {
      if (draftHistoryModel.draftMessage === 'null') {
        return adapter.removeOne(draftHistoryModel.teamId, state)
      } else {
        return adapter.upsertOne(draftHistoryModel, state)
      }
    }
    return state
  })
)

export function reducer(
  draftHistoryState: DraftHistoryState | undefined,
  action: Action
) {
  return draftHistoryReducer(draftHistoryState, action)
}
