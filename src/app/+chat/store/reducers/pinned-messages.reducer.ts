import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { createReducer, on, Action } from '@ngrx/store'

import * as pinnedMessagesActions from '../actions/pinned-messages.actions'
import { IMessageResponse } from '@app/src/app/models/interfaces/message.interfaces'

export const pinnedMessagesFeatureKey = 'pinnedMessages'

export interface PinnedMessagesState {
  isLoaded: boolean
  recentChatPinnedMessages: { [id: number]: MessageState }
}

export interface MessageState extends EntityState<IMessageResponse> {}

export const adapter: EntityAdapter<IMessageResponse> = createEntityAdapter<IMessageResponse>(
  {
    sortComparer: sortByCreatedAt,
    selectId: (message: IMessageResponse) => message._id,
  }
)

function sortByCreatedAt(a: IMessageResponse, b: IMessageResponse) {
  return a.createdAt > b.createdAt ? 1 : a.createdAt < b.createdAt ? -1 : 0
}

const messageInitialState: MessageState = adapter.getInitialState({})

export const initialState = {
  isLoaded: false,
  recentChatPinnedMessages: {},
}

export const pinnedMessagesReducer = createReducer(
  initialState,

  on(pinnedMessagesActions.loadPinnedMessages, (state, action) => {
    if (!state.recentChatPinnedMessages[action.teamId]) {
      state = { ...state, isLoaded: false }
    }
    return state
  }),

  on(pinnedMessagesActions.loadPinnedMessagesSuccess, (state, action) => {
    const pinnedMessagesData = action.payload.data?.data
    if (pinnedMessagesData) {
      const teamId = action.payload.query?.teamId
      if (!state.recentChatPinnedMessages[teamId]) {
        state = {
          ...state,
          recentChatPinnedMessages: {
            ...state.recentChatPinnedMessages,
            [teamId]: messageInitialState,
          },
        }
      }
      let recentChatPinnedMessages = state.recentChatPinnedMessages
      recentChatPinnedMessages = {
        ...recentChatPinnedMessages,
        [teamId]: adapter.setAll(
          pinnedMessagesData,
          state.recentChatPinnedMessages[teamId]
        ),
      }
      state = { ...state, recentChatPinnedMessages, isLoaded: true }
      return state
    }
    return state
  }),

  on(pinnedMessagesActions.upsertPinnedMessages, (state, action) => {
    const pinnedMessage = action.model
    if (pinnedMessage) {
      const teamId = action.model.teamId
      if (!state.recentChatPinnedMessages[teamId]) {
        state = {
          ...state,
          recentChatPinnedMessages: {
            ...state.recentChatPinnedMessages,
            [teamId]: messageInitialState,
          },
        }
      }
      let recentChatPinnedMessages = state.recentChatPinnedMessages
      if (pinnedMessage?.isPinned) {
        recentChatPinnedMessages = {
          ...recentChatPinnedMessages,
          [teamId]: adapter.upsertOne(
            pinnedMessage,
            state.recentChatPinnedMessages[teamId]
          ),
        }
      } else {
        recentChatPinnedMessages = {
          ...recentChatPinnedMessages,
          [teamId]: adapter.removeOne(
            pinnedMessage._id,
            state.recentChatPinnedMessages[teamId]
          ),
        }
      }
      state = { ...state, recentChatPinnedMessages, isLoaded: true }
      return state
    }
    return state
  })
)
export function reducer(
  pinnedMessagesState: PinnedMessagesState | undefined,
  action: Action
) {
  // return chatReducer(chatState, action)
}
