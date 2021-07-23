import { ITeamUserResponse } from '@app/src/app/models'
import { IRecentItems } from '@app/src/app/models/interfaces/recent-items.interface'
import { createTeamUser, deleteTeamUser } from '@app/src/app/store/actions/team.actions'
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { createReducer, on, Action } from '@ngrx/store'

import * as RecentItemsActions from '../actions/recent-items.actions'

export const recentItemsFeatureKey = 'recentItemsList'

export interface RecentItemsState extends EntityState<ITeamUserResponse> {
  isLoaded: boolean
  isError: boolean
  // entities: {[ids: string]: IRecentItems}
}

export const adapter: EntityAdapter<ITeamUserResponse> =
  createEntityAdapter<ITeamUserResponse>({
    selectId: (items: ITeamUserResponse) => items.teamId,
    sortComparer: sortByTime,
  })

function sortByTime(a: ITeamUserResponse, b: ITeamUserResponse) {
  return a.lastUpdatedAt > b.lastUpdatedAt
    ? -1
    : a.lastUpdatedAt < b.lastUpdatedAt
    ? 1
    : 0
}

export const initialState: RecentItemsState = adapter.getInitialState({
  isLoaded: false,
  isError: false,
})

export const recentItemsReducer = createReducer(
  initialState,

  on(RecentItemsActions.loadRecentItems, (state, action) => {
    state = { ...state, isLoaded: false }
    return state
  }),

  on(RecentItemsActions.loadRecentItemsSuccess, (state, action) => {
    state = { ...state, isLoaded: true }
    const recentItemsData = action.payload.data
    if (recentItemsData) {
      return adapter.setAll(recentItemsData, state)
    }
    return state
  }),
  on(RecentItemsActions.loadRecentItemsFailure, (state, action) => {
    state = { ...state, isLoaded: false, isError: true }
    return state
  }),

  on(RecentItemsActions.updateRecentItems, (state, action) => {
    const recentItemsModel = { ...action.model }
    if (state.entities[action.teamId]) {
      return adapter.updateOne(
        { id: action.teamId, changes: recentItemsModel },
        state
      )
    }
    return state
  }),

  on(RecentItemsActions.updateRecentItemsSuccess, (state, action) => {
    const recentItemsModel = action.payload.data
    if (recentItemsModel) {
      return adapter.updateOne(
        { id: recentItemsModel.teamId, changes: recentItemsModel },
        state
      )
    }
    return state
  }),

  on(RecentItemsActions.removeRecentItems, (state, action) => {
    if (state.entities[action?.teamId]) {
      return adapter.removeOne(action?.teamId, state)
    }
    return state
  }),

  on(RecentItemsActions.upsertRecentItem, (state, action) => {
    let recentItemsModel = { ...action.model }
    recentItemsModel = {
      ...recentItemsModel,
      teamId: action.teamId,
      userId: action.userId,
    }
    if (recentItemsModel?.lastUpdatedAt) {
      return adapter.upsertOne(recentItemsModel, state)
    } else {
      if (state.entities[recentItemsModel.teamId]) {
        return adapter.removeOne(recentItemsModel.teamId, state)
      }
    }
    return state
  }),

  on(RecentItemsActions.upsertRecentItemSuccess, (state, action) => {
    const recentItemModel = action.payload.data[0]
    if (recentItemModel && recentItemModel?.lastUpdatedAt) {
      return adapter.updateOne(
        { id: recentItemModel.teamId, changes: recentItemModel },
        state
      )
    }
    return state
  }),

  on(RecentItemsActions.upsertRecentItemViaEvent, (state, action) => {
    const recentItemsModel = { ...action.teamUser }
    if (recentItemsModel?.lastUpdatedAt) {
      return adapter.upsertOne(recentItemsModel, state)
    } else {
      if (state.entities[recentItemsModel.teamId]) {
        return adapter.removeOne(recentItemsModel.teamId, state)
      }
    }
    return state
  }),

  on(deleteTeamUser, (state, action) => {
    if (state.entities[action?.teamId] && action.isCurrentUserRemoved) {
      return adapter.removeOne(action?.teamId, state)
    }
    return state
  }),

  on(createTeamUser, (state, action) => {
    if (action.isCurrentUserAdded) {
      return adapter.upsertOne(
        {
          orgId: action.model.orgId,
          userId: action.model.userId,
          teamId: action.model.teamId,
          lastUpdatedAt: new Date().toISOString(),
        },
        state
      )
    }
    return state
  }),

  on(RecentItemsActions.removeRecentItemViaEvent, (state, action) => {
    const recentItemsModel = { ...action.teamUser }
    if (state.entities[recentItemsModel.teamId]) {
      return adapter.removeOne(recentItemsModel.teamId, state)
    }
    return state
  })
)

export function reducer(
  recentItemsState: RecentItemsState | undefined,
  action: Action
) {
  return recentItemsReducer(recentItemsState, action)
}
