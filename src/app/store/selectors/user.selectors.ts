import { createFeatureSelector, createSelector, props } from '@ngrx/store';
import * as UserReducer from '../reducers/user.reducer';

export const { selectAll, selectEntities } = UserReducer.adapter.getSelectors();

export const selectUserListState = createFeatureSelector<UserReducer.UserState>(
  UserReducer.userFeatureKey
);

export const selectUserList = createSelector(selectUserListState, selectAll);

export const selectUserEntities = createSelector(
  selectUserListState,
  selectEntities,
  state => {
    if (state && state.entities) {
      return state.entities;
    }
  }
);

export const isUsersLoaded = createSelector(
  selectUserListState,
  (state) => state.isLoaded
);

export const selectCurrentUserId = createSelector(
  selectUserListState,
  state => {
    if (state && state.currentUserId) {
      return state.currentUserId;
    }
  }
);

export const selectCurrentUser = createSelector(
  selectUserEntities,
  selectCurrentUserId,
  (userEntities, userId) => {
    if (userEntities && userId) {
      return userEntities[userId];
    }
  }
);
