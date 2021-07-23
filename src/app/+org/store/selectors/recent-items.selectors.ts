import { createFeatureSelector, createSelector } from '@ngrx/store'
import * as RecentItemsReducer from '../reducers/recent-items.reducer'

export const {
  selectAll,
  selectEntities,
} = RecentItemsReducer.adapter.getSelectors()

export const selectRecentItemsState = createFeatureSelector<RecentItemsReducer.RecentItemsState>(
  RecentItemsReducer.recentItemsFeatureKey
)

export const selectRecentItemsArray = createSelector(
  selectRecentItemsState,
  selectAll
)

export const selectRecentItemsIds = createSelector(
  selectRecentItemsState,
  (state) => {
    return state?.ids
  }
)

export const selectRecentItemsEntities = createSelector(
  selectRecentItemsState,
  selectEntities
)

export const isRecentItemsLoaded = createSelector(
  selectRecentItemsState,
  (state) => {
    return state?.isLoaded
  }
)
