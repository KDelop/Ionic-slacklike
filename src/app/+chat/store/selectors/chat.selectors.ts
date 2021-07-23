import { selectActiveChatId } from '@app/src/app/store/reducers'
import { createFeatureSelector, createSelector } from '@ngrx/store'
import * as ChatReducer from '../reducers/chat.reducer'

export const { selectAll, selectEntities } = ChatReducer.adapter.getSelectors()

export const selectChatsState = createFeatureSelector<ChatReducer.ChatState>(
  ChatReducer.chatFeatureKey
)

// export const selectChats = createSelector(selectChatsState, selectAll);

// export const selectChatsEntities = createSelector(
//   selectChatsState,
//   selectEntities
// );

export const selectActiveChatMessages = createSelector(
  selectChatsState,
  selectActiveChatId,
  (state, activeChatId) => {
    return state?.recentChatMessages && state?.recentChatMessages[activeChatId]
      ? selectAll(state.recentChatMessages[activeChatId])
      : null
  }
)
export const selectActiveChatMessagesEntities = createSelector(
  selectChatsState,
  selectActiveChatId,
  (state, activeChatId) => {
    if (
      state?.recentChatMessages &&
      activeChatId &&
      state.recentChatMessages[activeChatId]
    ) {
      return selectEntities(state.recentChatMessages[activeChatId])
    }
  }
)

// export const selectThread = createSelector(selectChatsState, (state) => {
//   return state.threads
// })

// export const selectActiveThreadMessages = createSelector(
//   selectThread,
//   selectActiveThreadId,
//   (state, activeThreadId) => {
//     return activeThreadId && state[activeThreadId]
//       ? selectAll(state[activeThreadId])
//       : null
//   }
// )

export const isChatsLoaded = createSelector(
  selectChatsState,
  (state) => state.isLoaded
)

export const isMessageSent = createSelector(
  selectChatsState,
  (state) => state.messageSent
)

export const isMessageRecieved = createSelector(
  selectChatsState,
  (state) => state.messageRecieved
)

export const selectRecentChatLastMessage = createSelector(
  selectChatsState,
  (state) => {
    return state?.recentChatLastMessage
  }
)
