import { ITeamUserResponse } from '@app/src/app/models'
import { selectTeamListEntities } from '@app/src/app/store/selectors/team.selectors'
import { selectCurrentUserId } from '@app/src/app/store/selectors/user.selectors'
import { createFeatureSelector, createSelector } from '@ngrx/store'
import * as DraftHistoryReducer from '../reducers/draft-history.reducer'

export const {
  selectAll,
  selectEntities,
} = DraftHistoryReducer.adapter.getSelectors()

export const selectDraftHistoryState = createFeatureSelector<DraftHistoryReducer.DraftHistoryState>(
  DraftHistoryReducer.draftHistoryFeatureKey
)

export const selectDraftHistoryArray = createSelector(
  selectDraftHistoryState,
  selectAll
)

export const isDraftHistoryLoaded = createSelector(
  selectDraftHistoryState,
  (state) => {
    return state?.isLoaded
  }
)

export const selectDraftHistoryEntities = createSelector(
  selectDraftHistoryState,
  selectEntities
)
