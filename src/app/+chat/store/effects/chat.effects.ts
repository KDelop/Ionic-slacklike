import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { EMPTY, of } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import * as ChatActions from './../actions/chat.actions'
import { ChatService } from '../services/chat.service'
import { upsertRecentItem } from '@app/src/app/+org/store/actions/recent-items.actions'

@Injectable()
export class ChatEffects {
  loadChats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadChat),
      switchMap((payload) => {
        return this.chatService.fetchChannelChats(payload.teamId)
      }),
      map((chats) => ({
        type: ChatActions.loadChatSuccess.type,
        payload: chats,
      })),
      catchError(() => EMPTY)
    )
  )
  loadMoreChats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadMoreChat),
      switchMap((payload) => {
        return this.chatService.fetchChannelChats(
          payload.teamId,
          payload.skip,
          payload.limit
        )
      }),
      map((chats) => ({
        type: ChatActions.loadMoreChatSuccess.type,
        payload: chats,
      })),
      catchError(() => EMPTY)
    )
  )

  loadRecentChatLastMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadRecentChatLastMessage),
      switchMap((payload) => {
        return this.chatService.fetchRecentChatLastMesssage(payload.orgId)
      }),
      map((chats) => ({
        type: ChatActions.loadRecentChatLastMessageSuccess.type,
        payload: chats,
      })),
      catchError(() => EMPTY)
    )
  )

  updateRecentItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.createMessage),
      map((payload) => {
        const utcMoment = new Date().toISOString()
        return upsertRecentItem({
          orgId: payload.message.orgId,
          userId: payload.message.senderId,
          teamId: payload.message.teamId,
          model: {
            lastUpdatedAt: utcMoment,
          },
        })
      })
    )
  )

  createMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.createMessage),
      switchMap((payload) => {
        return this.chatService.createMessage(payload.message).then((res) => {
          if (res.successful) {
            return res
          } else {
            return payload.message
          }
        })
      }),
      map((message) => {
        if ((message as any).successful) {
          return {
            type: ChatActions.createMessageSuccess.type,
            payload: message,
          }
        } else {
          return {
            type: ChatActions.createMessageFailure.type,
            payload: message,
          }
        }
      }),
      catchError((error) => {
        return of({ type: ChatActions.createMessageFailure.type, error })
      })
    )
  )

  updateMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.updateMessage),
      switchMap((payload) => {
        return this.chatService.updateMessage(payload.messageId, payload.model)
      }),
      map((message) => ({
        type: ChatActions.updateMessageSuccess.type,
        payload: message,
      })),
      catchError(() => EMPTY)
    )
  )

  deleteMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.deleteMessage),
      switchMap((payload) => {
        const audio = new Audio()
        audio.src = '/assets/sounds/delete_audio.wav'
        audio.autoplay = true
        audio.muted = true
        audio.load()
        audio.play()
        return this.chatService.deleteMessage(payload.messageId, payload.model)
      }),
      map((message) => ({
        type: ChatActions.deleteMessageSuccess.type,
        payload: message,
      })),
      catchError(() => EMPTY)
    )
  )

  addReaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.addReaction),
      switchMap((payload) => {
        return this.chatService.addReaction(payload.reaction)
      }),
      map((message) => ({
        type: ChatActions.addReactionSuccess.type,
        payload: message,
      })),
      catchError(() => EMPTY)
    )
  )

  removeReaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.removeReaction),
      switchMap((payload) => {
        return this.chatService.removeReaction(payload.reaction)
      }),
      map((message) => ({
        type: ChatActions.removeReactionSuccess.type,
        payload: message,
      })),
      catchError(() => EMPTY)
    )
  )

  constructor(private actions$: Actions, private chatService: ChatService) {}
}
