import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { createReducer, on, Action } from '@ngrx/store'

import * as ChatActions from '../actions/chat.actions'
import { IMessageResponse } from '@app/src/app/models/interfaces/message.interfaces'
import { cloneDeep } from 'lodash'
import { selectAll } from '../selectors/chat.selectors'
import { WSEventType } from '@app/src/app/models/constants/websocket'

export const chatFeatureKey = 'chat'

export interface ChatState {
  isLoaded: boolean
  recentChatMessages: { [id: number]: MessageState }
  messageSent: boolean
  messageRecieved: boolean
  threads: { [id: number]: ThreadsState }
  recentChatLastMessage: { [id: string]: IMessageResponse }
}

export interface MessageState extends EntityState<IMessageResponse> {}
export interface ThreadsState extends EntityState<IMessageResponse> {}

export const adapter: EntityAdapter<IMessageResponse> = createEntityAdapter<IMessageResponse>(
  {
    // sortComparer: sortByCreatedAt,
    selectId: (message: IMessageResponse) => message._id  ? message._id : 'id',
  }
)

export const threadsAdapter: EntityAdapter<IMessageResponse> = createEntityAdapter<IMessageResponse>(
  {
    sortComparer: sortByCreatedAt,
    selectId: (message: IMessageResponse) => message._id  ? message._id : 'id',
  }
)

function sortByCreatedAt(a: IMessageResponse, b: IMessageResponse) {
  return a.createdAt > b.createdAt ? 1 : a.createdAt < b.createdAt ? -1 : 0
}

const messageInitialState: MessageState = adapter.getInitialState({})
const threadsInitialState: ThreadsState = threadsAdapter.getInitialState({})

export const initialState = {
  isLoaded: false,
  recentChatMessages: {},
  messageSent: false,
  messageRecieved: false,
  threads: {},
  recentChatLastMessage: {},
}

export const chatReducer = createReducer(
  initialState,

  on(ChatActions.loadChat, (state, action) => {
    if (!state.recentChatMessages[action.teamId]) {
      state = { ...state, isLoaded: false }
    }
    return state
  }),

  on(ChatActions.loadChatSuccess, (state, action) => {
    let chatList = []
    let chatsData = action.payload.data?.data

    chatsData?.forEach((message, index) => {
      let currentMsgDate = (message.createdAt as string).split('T')[0];
      let nextMsgDate = chatsData[index + 1] ? (chatsData[index + 1].createdAt as string).split('T')[0] : null;

      chatList.push(message);

      if (currentMsgDate && nextMsgDate && currentMsgDate !== nextMsgDate) {

        chatList.push({
          id: message.createdAt,
          type: 'date',
          date: nextMsgDate
        })

      }
    })

    const teamId = action.payload.query?.teamId
    if (chatsData) {
      if (!state.recentChatMessages[teamId]) {
        state = {
          ...state,
          recentChatMessages: {
            ...state.recentChatMessages,
            [teamId]: messageInitialState,
          }
        }
      }

      let recentChatMessages = state.recentChatMessages
      let recentChatLastMessage = state.recentChatLastMessage
      recentChatLastMessage = {
        ...recentChatLastMessage,
        [teamId]: chatsData[0],
      }
      state = { ...state, recentChatLastMessage }
      recentChatMessages = {
        ...recentChatMessages,
        [teamId]: adapter.setAll(chatList, state.recentChatMessages[teamId]),
      }
      state = { ...state, recentChatMessages, isLoaded: true }
      return state
    }
    return state
  }),

  on(ChatActions.removeChats, (state, action) => {
    return {...state, recentChatMessages: {}};
  }),
  on(ChatActions.loadMoreChatSuccess, (state, action) => {
    const chatsData = action.payload.data?.data


    const teamId = action?.payload?.query?.teamId
    const currentList: IMessageResponse[] = teamId && state?.recentChatMessages && state?.recentChatMessages[teamId] ? adapter?.getSelectors()?.selectAll(state?.recentChatMessages?.[teamId]) : [];

    let chatList = []
    chatsData?.forEach((message, index) => {
      let currentMsgDate = (message.createdAt as string).split('T')[0];
      let nextMsgDate = chatsData[index + 1] ? (chatsData[index + 1].createdAt as string).split('T')[0] : null;
      chatList.push(message);
      if (currentMsgDate && nextMsgDate && currentMsgDate !== nextMsgDate) {

        chatList.push({
          id: message.createdAt,
          type: 'date',
          date: nextMsgDate
        })

      }
    })

    const newList = [...currentList, ...chatList]

    let recentChatMessages = state?.recentChatMessages
    if (chatsData && teamId && newList?.length && adapter) {
      recentChatMessages = {
        ...recentChatMessages,
        [teamId]: adapter.setAll(
          newList,
          state.recentChatMessages[teamId]
        ),
      }
      state = { ...state, recentChatMessages, isLoaded: true }
      return state
    }
    return state
  }),

  on(ChatActions.loadRecentChatLastMessageSuccess, (state, action) => {
    const chatsData = action.payload.data
    if (chatsData) {
      let recentChatLastMessage = state.recentChatLastMessage
      chatsData.map((chat) => {
        const teamId = chat?.teamId
        recentChatLastMessage = { ...recentChatLastMessage, [teamId]: chat }
      })
      state = { ...state, recentChatLastMessage }
    }
    return state
  }),

  on(ChatActions.createMessage, (state, action) => {
    const messageModel = { ...action.message, _id: action.message.requestId }
    if (action?.message?.threadId) {
      let threads = state.threads
      threads = {
        ...threads,
        [action.message.threadId]: threadsAdapter.addOne(
          messageModel,
          state.threads[messageModel.threadId]
        ),
      }
      let recentChatMessages = state.recentChatMessages
      let threadReplyCount = 1
      if (
        messageModel?.teamId &&
        messageModel.threadId &&
        state?.recentChatMessages[messageModel.teamId]?.entities[
          messageModel.threadId
        ].threadReplyCount
      ) {
        threadReplyCount =
          state.recentChatMessages[messageModel.teamId].entities[
            messageModel.threadId
          ].threadReplyCount + 1
      }
      recentChatMessages = {
        ...recentChatMessages,
        [messageModel.teamId]: adapter.updateOne(
          {
            id: messageModel.threadId,
            changes: { threadReplyCount },
          },
          state.recentChatMessages[messageModel.teamId]
        ),
      }
      if (messageModel.showInMainConversation) {
        recentChatMessages = {
          ...recentChatMessages,
          [action.message.teamId]: adapter.addOne(
            messageModel,
            state.recentChatMessages[messageModel.teamId]
          ),
        }
      }
      state = { ...state, threads, messageSent: true, recentChatMessages }
    } else {
      const currentList: IMessageResponse[] = messageModel?.teamId && state?.recentChatMessages && state.recentChatMessages[messageModel.teamId] ? adapter?.getSelectors()?.selectAll(state.recentChatMessages[messageModel.teamId]) : [];
      const newList: IMessageResponse[] = [messageModel, ...currentList];


      let recentChatMessages = state.recentChatMessages
      if (messageModel?.teamId && state?.recentChatMessages && state.recentChatMessages[messageModel.teamId]) {
        recentChatMessages = {
          ...recentChatMessages,
          // [action.message.teamId]: adapter.addOne(
          //   messageModel,
          //   state.recentChatMessages[messageModel.teamId]
          // ),
          [action.message.teamId]: adapter.setAll(
            newList,
            state.recentChatMessages[messageModel.teamId]
          ),
        }
      }
      state = { ...state, recentChatMessages, messageSent: true }
    }
    return state
  }),

  on(ChatActions.createMessageSuccess, (state, action) => {
    const message = { ...action.payload.data, isError: false }
    if (message) {
      if (message.threadId) {
        let threads = state.threads
        threads = {
          ...threads,
          [message.threadId]: threadsAdapter.updateOne(
            { id: message.requestId, changes: message },
            state.threads[message.threadId]
          ),
        }

        let recentChatMessages = state.recentChatMessages
        if (message.showInMainConversation) {
          recentChatMessages = {
            ...recentChatMessages,
            [message.teamId]: adapter.updateOne(
              { id: message.requestId, changes: message },
              state.recentChatMessages[message.teamId]
            ),
          }
        }

        state = { ...state, threads, messageSent: true, recentChatMessages }
      } else {
        let recentChatMessages = state.recentChatMessages
        recentChatMessages = {
          ...recentChatMessages,
          [message.teamId]: adapter.updateOne(
            { id: message.requestId, changes: message },
            state.recentChatMessages[message.teamId]
          ),
        }
        let recentChatLastMessage = state.recentChatLastMessage
        recentChatLastMessage = {
          ...recentChatLastMessage,
          [message.teamId]: message,
        }
        state = {
          ...state,
          recentChatLastMessage,
          recentChatMessages,
          messageSent: false,
        }
      }
      if (!message?.threadId || message?.showInMainConversation) {
        let recentChatLastMessage = state.recentChatLastMessage
        recentChatLastMessage = {
          ...recentChatLastMessage,
          [message.teamId]: message,
        }
        state = {
          ...state,
          recentChatLastMessage,
        }
      }
      return state
    }
    return state
  }),

  on(ChatActions.createMessageFailure, (state, action) => {
    const message = { ...action.payload, isError: true }
    if (message) {
      let recentChatMessages = state.recentChatMessages
      recentChatMessages = {
        ...recentChatMessages,
        [message.teamId]: adapter.updateOne(
          { id: message.requestId, changes: message },
          state.recentChatMessages[message.teamId]
        ),
      }
      state = { ...state, recentChatMessages, messageSent: false }
      return state
    }
    return state
  }),


  on(ChatActions.addReactionSuccess, (state, action) => {
    const messageModel = { ...action?.payload?.data }
    let recentChatMessages = state.recentChatMessages
    recentChatMessages = {
      ...recentChatMessages,
      [messageModel.teamId]: adapter.updateOne(
        { id: messageModel._id, changes: messageModel },
        state.recentChatMessages[messageModel.teamId]
      ),
    }
    state = { ...state, recentChatMessages }
    return state
  }),

  on(ChatActions.removeReactionSuccess, (state, action) => {
    const messageModel = { ...action?.payload?.data }
    let recentChatMessages = state.recentChatMessages
    recentChatMessages = {
      ...recentChatMessages,
      [messageModel.teamId]: adapter.updateOne(
        { id: messageModel._id, changes: messageModel },
        state.recentChatMessages[messageModel.teamId]
      ),
    }
    state = { ...state, recentChatMessages }
    return state
  }),

  on(ChatActions.updateMessage, (state, action) => {
    const messageModel = { ...action.model }
    if (state.threads[messageModel.threadId]) {
      if (state.threads[messageModel.threadId].entities[messageModel._id]) {
        let recentChatMessages = state.recentChatMessages
        if (messageModel.showInMainConversation) {
          recentChatMessages = {
            ...recentChatMessages,
            [messageModel.teamId]: adapter.updateOne(
              { id: action.messageId, changes: messageModel },
              state.recentChatMessages[messageModel.teamId]
            ),
          }
        }
        let threads = state.threads
        threads = {
          ...threads,
          [messageModel.threadId]: threadsAdapter.updateOne(
            { id: messageModel._id, changes: messageModel },
            state.threads[messageModel.threadId]
          ),
        }
        state = { ...state, threads, recentChatMessages }
        return state
      }
    } else {
      let recentChatMessages = state.recentChatMessages
      recentChatMessages = {
        ...recentChatMessages,
        [messageModel.teamId]: adapter.updateOne(
          { id: action.messageId, changes: messageModel },
          state.recentChatMessages[messageModel.teamId]
        ),
      }
      state = { ...state, recentChatMessages }
      return state
    }
    return state
  }),

  on(ChatActions.updateMessageSuccess, (state, action) => {
    const message = action.payload.data
    if (message) {
      let recentChatMessages = state.recentChatMessages
      recentChatMessages = {
        ...recentChatMessages,
        [message.teamId]: adapter.updateOne(
          { id: message._id, changes: message },
          state.recentChatMessages[message.teamId]
        ),
      }
      if (
        state.recentChatMessages[message.teamId].ids[
          state.recentChatMessages[message.teamId].ids.length - 1
        ] === message?._id
      ) {
        let recentChatLastMessage = state.recentChatLastMessage
        recentChatLastMessage = {
          ...recentChatLastMessage,
          [message.teamId]: message,
        }
        state = { ...state, recentChatLastMessage }
      }
      state = { ...state, recentChatMessages }
      return state
    }
    return state
  }),

  on(ChatActions.deleteMessage, (state, action) => {
    const messageModel = {
      deleted: true,
      teamId: action.teamId,
    }
    if (action.threadId) {
      let threads = state.threads
      if (threads[action.threadId]) {
        threads = {
          ...threads,
          [action.threadId]: adapter.removeOne(
            action.messageId,
            state.threads[action.threadId]
          ),
        }
      }
      state = { ...state, threads, messageSent: true }
    }
    if (!action.threadId || action.model.showInMainConversation) {
      let recentChatMessages = state.recentChatMessages
      if (
        state.recentChatMessages[messageModel.teamId].ids[
          state.recentChatMessages[messageModel.teamId].ids.length - 1
        ] === action.messageId
      ) {
        let recentChatLastMessage = state.recentChatLastMessage
        recentChatLastMessage = {
          ...recentChatLastMessage,
          [messageModel.teamId]:
            state.recentChatMessages[messageModel.teamId].entities[
              state.recentChatMessages[messageModel.teamId].ids[
                state.recentChatMessages[messageModel.teamId].ids.length - 2
              ]
            ],
        }
        state = { ...state, recentChatLastMessage }
      }
      recentChatMessages = {
        ...recentChatMessages,
        [messageModel.teamId]: adapter.removeOne(
          action.messageId,
          state.recentChatMessages[messageModel.teamId]
        ),
      }
      state = { ...state, recentChatMessages }
    }
    return state
  }),

  on(ChatActions.updateMessageViaEvent, (state, action) => {
    const messageModel = { ...action.message }
    if (!messageModel.threadId || messageModel.showInMainConversation) {
      if (!state.recentChatMessages[messageModel.teamId]) {
        state = {
          ...state,
          recentChatMessages: {
            ...state.recentChatMessages,
            [messageModel.teamId]: messageInitialState,
          },
        }
      }


      let recentChatMessages = state.recentChatMessages
      recentChatMessages = {
        ...recentChatMessages,
        [action.message.teamId]: adapter.upsertOne(
          messageModel,
          state.recentChatMessages[messageModel.teamId]
        ),
      }
      if (
        recentChatMessages[messageModel.teamId].ids[0] === messageModel?._id
      ) {
        let recentChatLastMessage = state.recentChatLastMessage
        recentChatLastMessage = {
          ...recentChatLastMessage,
          [messageModel.teamId]: messageModel,
        }
        state = { ...state, recentChatLastMessage }
      }
      state = { ...state, recentChatMessages }
      if (
        messageModel?.teamId === action?.activeChatId &&
        messageModel?.senderId !== action?.currentUserId
      ) {
        state = { ...state, messageRecieved: true }
      }
      return state
    }

    return state
  }),
  on(ChatActions.upsertMessageViaEvent, (state, action) => {
    const messageModel = { ...action.message }
    if (!state.recentChatMessages[messageModel.teamId]) {
      state = {
        ...state,
        recentChatMessages: {
          ...state.recentChatMessages,
          [messageModel.teamId]: messageInitialState,
        },
      }
    }


    let recentChatMessages = state.recentChatMessages
    if (action.eventType === WSEventType.PATCHED) {
      recentChatMessages = {
        ...recentChatMessages,
        [messageModel.teamId]: adapter.upsertOne(
          messageModel,
          state.recentChatMessages[messageModel.teamId]
        ),
      }
    } else {
      if (state?.recentChatMessages?.[messageModel?.teamId]?.entities?.[messageModel?.requestId]) {
        recentChatMessages = {
          ...recentChatMessages,
          [messageModel.teamId]: adapter.updateOne(
            {id: messageModel.requestId, changes: messageModel},
            state.recentChatMessages[messageModel.teamId]
          ),
        }
      } else {
        const currentList: IMessageResponse[] = messageModel?.teamId ? adapter.getSelectors().selectAll(state.recentChatMessages[messageModel.teamId]) : [];
        const newList: IMessageResponse[] = [messageModel, ...currentList];
        recentChatMessages = {
          ...recentChatMessages,
          [action.message.teamId]: adapter.setAll(
            newList,
            state.recentChatMessages[messageModel.teamId]
          ),
        }
      }
    }

    if (
      recentChatMessages[messageModel.teamId].ids[0] === messageModel?._id
    ) {
      let recentChatLastMessage = state.recentChatLastMessage
      recentChatLastMessage = {
        ...recentChatLastMessage,
        [messageModel.teamId]: messageModel,
      }
      state = { ...state, recentChatLastMessage }
    }
    state = { ...state, recentChatMessages }
    if (
      messageModel?.teamId === action?.activeChatId &&
      messageModel?.senderId !== action?.currentUserId &&
      action.eventType === WSEventType.CREATED
    ) {
      state = { ...state, messageRecieved: true }
    }
    return state
  }),

  on(ChatActions.deleteMessageViaEvent, (state, action) => {
    const messageModel = { ...action.message }
    if (messageModel.threadId) {
      if (state.threads[messageModel.threadId]) {
        if (state.threads[messageModel.threadId].entities[messageModel._id]) {
          let threads = state.threads
          threads = {
            ...threads,
            [messageModel.threadId]: adapter.removeOne(
              messageModel._id,
              state.threads[messageModel.threadId]
            ),
          }
          state = { ...state, threads }
          return state
        }
      }
    }
    if (!messageModel.threadId || messageModel.showInMainConversation) {
      if (state.recentChatMessages[messageModel.teamId]) {
        if (
          state.recentChatMessages[messageModel.teamId].entities[
            messageModel._id
          ]
        ) {
          let recentChatMessages = state.recentChatMessages
          if (
            recentChatMessages[messageModel.teamId].ids[0] === messageModel._id
          ) {
            let recentChatLastMessage = state.recentChatLastMessage
            recentChatLastMessage = {
              ...recentChatLastMessage,
              [messageModel.teamId]:
                recentChatMessages[messageModel.teamId].entities[
                  recentChatMessages[messageModel.teamId].ids[1]
                ],
            }
            state = { ...state, recentChatLastMessage }
          }
          recentChatMessages = {
            ...recentChatMessages,
            [messageModel.teamId]: adapter.removeOne(
              messageModel._id,
              state.recentChatMessages[messageModel.teamId]
            ),
          }
          state = { ...state, recentChatMessages }
          return state
        }
      }
    }

    return state
  }),

  on(ChatActions.unsetNewMessageRecieved, (state) => {
    return { ...state, messageRecieved: false }
  }),

  on(ChatActions.loadThreads, (state, action) => {
    // if (!state.threads[action.teamId]) {
    //   state = { ...state, isLoaded: false }
    // }
    return state
  }),

  on(ChatActions.loadThreadsSuccess, (state, action) => {
    const threadsData = action.payload.data.data
    if (threadsData) {
      const threadId = action.payload.query?.threadId
      if (state?.threads && !state.threads[threadId]) {
        state = {
          ...state,
          threads: {
            ...state.threads,
            [threadId]: threadsInitialState,
          },
        }
      }
      let threads = state.threads
      threads = {
        ...threads,
        [threadId]: adapter.setAll(threadsData, state.threads[threadId]),
      }
      state = { ...state, threads }
      return state
    }

    return state
  })
)
export function reducer(chatState: ChatState | undefined, action: Action) {
  // return chatReducer(chatState, action)
}
