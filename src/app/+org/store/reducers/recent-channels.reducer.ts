import { ITeamUserResponse } from '@app/src/app/models'
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { createReducer, on, Action } from '@ngrx/store'

import * as RecentItemsActions from '../actions/recent-items.actions'

export const recentChannelsFeatureKey = 'recentChannelsList'

export interface RecentChannelsState extends EntityState<ITeamUserResponse> {
  isLoaded: boolean
}

export const adapter: EntityAdapter<ITeamUserResponse> = createEntityAdapter<ITeamUserResponse>(
  {
    selectId: (items: ITeamUserResponse) => items.teamId,
    sortComparer: sortByTime,
  }
)

function sortByTime(a: ITeamUserResponse, b: ITeamUserResponse) {
  return a.lastUpdatedAt > b.lastUpdatedAt ? -1 : a.lastUpdatedAt < b.lastUpdatedAt ? 1 : 0
}

export const initialState: RecentChannelsState = adapter.getInitialState({
  isLoaded: false,
})

export const recentChannelsReducer = createReducer(
  initialState

  // on(RecentItemsActions.loadRecentChannelsList, (state, action) => {
  //   state = { ...state, isLoaded: false }
  //   return state
  // }),

  // on(RecentItemsActions.loadRecentChannelsListSuccess, (state, action) => {
  //   state = { ...state, isLoaded: true }
  //   const recentChannelsData = action.payload.data.data
  //   if (recentChannelsData) {
  //     return adapter.setAll(recentChannelsData, state)
  //   }
  //   return state
  // }),

  // on(RecentItemsActions.upsertRecentItem, (state, action) => {
  //   if (action.model.type === 'CHANNEL') {
  //     const recentChannelsModel = { ...action.model };
  //     if (state.entities[recentChannelsModel.teamId]) {
  //       return adapter.updateOne(
  //         { id: recentChannelsModel.teamId, changes: recentChannelsModel },
  //         state
  //       );
  //     }

  //     if (state.ids.length < 7) {
  //       return adapter.upsertOne(recentChannelsModel, state);
  //     } else {
  //       return adapter.updateOne(
  //         {
  //           id: `${state.ids[state.ids.length - 1]}`,
  //           changes: recentChannelsModel,
  //         },
  //         state
  //       );
  //     }
  //   } else {
  //     return state;
  //   }
  // }),

  // on(RecentItemsActions.upsertRecentItemSuccess, (state, action) => {
  //   if (action.payload?.data[0]?.type === 'CHANNEL') {
  //     const recentUserModel = action.payload.data[0];
  //     if (recentUserModel) {
  //       return adapter.updateOne(
  //         { id: recentUserModel.teamId, changes: recentUserModel },
  //         state
  //       );
  //     }
  //     return state;
  //   } else {
  //     return state;
  //   }
  // })
)

export function reducer(
  recentChannelsState: RecentChannelsState | undefined,
  action: Action
) {
  return recentChannelsReducer(recentChannelsState, action)
}
