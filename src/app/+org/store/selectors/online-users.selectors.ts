import { createFeatureSelector, createSelector } from '@ngrx/store'
import * as OnlineUsersReducer from '../reducers/online-users.reducer'

export const {
  selectAll,
  selectEntities,
} = OnlineUsersReducer.adapter.getSelectors()

export const selectOnlineUsersState = createFeatureSelector<OnlineUsersReducer.OnlineUsersState>(
  OnlineUsersReducer.onlineUsersFeatureKey
)

export const selectOnlineUserEntities = createSelector(
  selectOnlineUsersState,
  selectEntities
)

export const isOnlineUsersLoaded = createSelector(
  selectOnlineUsersState,
  (state) => {
    return state?.isLoaded
  }
)
