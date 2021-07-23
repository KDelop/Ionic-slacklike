import { createAction, props } from '@ngrx/store'
import { RealTimeResponse, IListRootResponse } from '@app/src/app/models'
import { IMessageResponse } from '@app/src/app/models/interfaces/message.interfaces'

export const loadPinnedMessages = createAction(
  '[pinnedMessages] Load pinned messages',
  props<{ teamId: string }>()
)

export const loadPinnedMessagesSuccess = createAction(
  '[pinnedMessages] Load pinned messages Success',
  props<{ payload: RealTimeResponse<IListRootResponse<IMessageResponse>> }>()
)

export const loadPinnedMessagesFailure = createAction(
  '[pinnedMessages] Load pinned messages Failure',
  props<{ error: any }>()
)

export const upsertPinnedMessages = createAction(
  '[pinnedMessages] upsert pinned message',
  props<{ teamId: string; model: IMessageResponse }>()
)
