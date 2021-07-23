import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { EMPTY, of } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import * as PinnedMessagesActions from './../actions/pinned-messages.actions'
import { PinnedMessagesService } from '../services/pinned-messages.service'

@Injectable()
export class PinnedMessagesEffects {
  loadPinnedMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PinnedMessagesActions.loadPinnedMessages),
      switchMap((payload) => {
        return this.pinnedMessagesService.fetchPinnedMessages(payload.teamId)
      }),
      map((pinnedMessages) => ({
        type: PinnedMessagesActions.loadPinnedMessagesSuccess.type,
        payload: pinnedMessages,
      })),
      catchError(() => EMPTY)
    )
  )
  constructor(
    private actions$: Actions,
    private pinnedMessagesService: PinnedMessagesService
  ) {}
}
