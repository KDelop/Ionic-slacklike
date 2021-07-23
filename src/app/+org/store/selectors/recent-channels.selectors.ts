import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as RecentChannelsReducer from '../reducers/recent-channels.reducer';

export const {
  selectAll,
  selectEntities
} = RecentChannelsReducer.adapter.getSelectors();

export const selectRecentChannelsState = createFeatureSelector<
  RecentChannelsReducer.RecentChannelsState
>(RecentChannelsReducer.recentChannelsFeatureKey);

export const selectRecentChannels = createSelector(
  selectRecentChannelsState,
  selectAll
);

export const isRecentChannelsLoaded = createSelector(
  selectRecentChannelsState,
  state => {
    return state?.isLoaded;
  }
);
