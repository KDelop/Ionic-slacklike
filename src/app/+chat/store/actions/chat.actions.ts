import { createAction, props } from '@ngrx/store'
import {
  RealTimeResponse,
  IListRootResponse,
  IReactionResponse,
} from '@app/src/app/models'
import { IMessageResponse } from '@app/src/app/models/interfaces/message.interfaces'

export const loadChat = createAction(
  '[chats] Load chat',
  props<{ teamId: string }>()
)

export const loadChatSuccess = createAction(
  '[chats] Load chat Success',
  props<{ payload: RealTimeResponse<IListRootResponse<IMessageResponse>> }>()
)

export const loadChatFailure = createAction(
  '[chats] Load chat Failure',
  props<{ error: any }>()
)

export const removeChats = createAction(
  '[chats] Remove all chat',
)

export const loadMoreChat = createAction(
  '[chats] Load More chat',
  props<{
    teamId: string
    skip?: number
    limit?: number
  }>()
)

export const loadMoreChatSuccess = createAction(
  '[chats] Load More chat Success',
  props<{ payload: RealTimeResponse<IListRootResponse<IMessageResponse>> }>()
)

export const loadMoreChatFailure = createAction(
  '[chats] Load More chat Failure',
  props<{ error: any }>()
)

export const loadRecentChatLastMessage = createAction(
  '[chats] load Recent Chat Last Message',
  props<{ orgId: string }>()
)

export const loadRecentChatLastMessageSuccess = createAction(
  '[chats] load Recent Chat Last Message Success',
  props<{ payload: RealTimeResponse<IMessageResponse[]> }>()
)

export const loadRecentChatLastMessageFailure = createAction(
  '[chats] load Recent Chat Last Message Failure',
  props<{ error: any }>()
)

export const createMessage = createAction(
  '[chats] Create message',
  props<{ message: IMessageResponse }>()
)

export const createMessageSuccess = createAction(
  '[chats] Create message Success',
  props<{ payload: RealTimeResponse<IMessageResponse> }>()
)

export const createMessageFailure = createAction(
  '[chats] Create message Failure',
  props<{ payload: any }>()
)

export const updateMessage = createAction(
  '[chats] Update message',
  props<{ messageId: any; model: IMessageResponse }>()
)

export const updateMessageSuccess = createAction(
  '[chats] Update message Success',
  props<{ payload: RealTimeResponse<IMessageResponse> }>()
)

export const updateMessageFailure = createAction(
  '[chats] Update message Failure',
  props<{ error: any }>()
)

export const deleteMessage = createAction(
  '[chats] Delete message',
  props<{
    messageId: any
    teamId: string
    threadId: any
    model: IMessageResponse
  }>()
)

export const deleteMessageSuccess = createAction(
  '[chats] Delete message Success',
  props<{ payload: RealTimeResponse<IMessageResponse> }>()
)

export const deleteMessageFailure = createAction(
  '[chats] Delete message Failure',
  props<{ error: any }>()
)

export const addReaction = createAction(
  '[chats] Add reaction',
  props<{ reaction: IReactionResponse }>()
)

export const addReactionSuccess = createAction(
  '[chats] Add reaction Success',
  props<{ payload: RealTimeResponse<IMessageResponse> }>()
)

export const addReactionFailure = createAction(
  '[chats] Add reaction Failure',
  props<{ error: any }>()
)

export const removeReaction = createAction(
  '[chats] Remove reaction',
  props<{ reaction: IReactionResponse }>()
)

export const removeReactionSuccess = createAction(
  '[chats] Remove reaction Success',
  props<{ payload: RealTimeResponse<IMessageResponse> }>()
)

export const removeReactionFailure = createAction(
  '[chats] Remove reaction Failure',
  props<{ error: any }>()
)

export const upsertMessageViaEvent = createAction(
  '[chats] Upsert message via event',
  props<{
    message: IMessageResponse
    activeChatId: string
    currentUserId: string
    eventType?: string
  }>()
)

export const updateMessageViaEvent = createAction(
  '[chats] Update message via event',
  props<{
    message: IMessageResponse
    activeChatId: string
    currentUserId: string
  }>()
)

export const deleteMessageViaEvent = createAction(
  '[chats] Delete message via event',
  props<{ message: IMessageResponse }>()
)

export const unsetNewMessageRecieved = createAction(
  '[chats] Unset New message recieved flag'
)

export const loadThreads = createAction(
  '[chats] Load threads',
  props<{ teamId: string; threadId: string }>()
)

export const loadThreadsSuccess = createAction(
  '[chats] Load threads Success',
  props<{ payload: RealTimeResponse<IListRootResponse<IMessageResponse>> }>()
)

export const loadThreadsFailure = createAction(
  '[chats] Load threads Failure',
  props<{ error: any }>()
)
