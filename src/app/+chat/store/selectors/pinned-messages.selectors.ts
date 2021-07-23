import { selectActiveChatId } from '@app/src/app/store/reducers'
import { createFeatureSelector, createSelector } from '@ngrx/store'
import * as PinnedMessagesReducer from '../reducers/pinned-messages.reducer'

export const {
  selectAll,
  selectEntities,
} = PinnedMessagesReducer.adapter.getSelectors()

export const selectPinnedMessagesState = createFeatureSelector<PinnedMessagesReducer.PinnedMessagesState>(
  PinnedMessagesReducer.pinnedMessagesFeatureKey
)

export const selectActiveChatPinnedMessages = createSelector(
  selectPinnedMessagesState,
  selectActiveChatId,
  (state, activeChatId) => {
    return state?.recentChatPinnedMessages &&
      state?.recentChatPinnedMessages[activeChatId]
      ? selectAll(state.recentChatPinnedMessages[activeChatId])
      : null
  }
)
