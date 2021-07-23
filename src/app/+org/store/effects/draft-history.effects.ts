import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { EMPTY } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import * as DraftHistoryActions from './../actions/draft-history.actions'
import { DraftHistoryService } from '../services/draft-history.service'

@Injectable()
export class DraftHistoryEffects {
  loadDraftHistoryList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DraftHistoryActions.loadDraftHistoryList),
      switchMap((payload) => {
        return this.draftHistoryService.fetchDraftHistory(
          payload.orgId,
          payload.userId
        )
      }),
      map((draftHistory) => ({
        type: DraftHistoryActions.loadDraftHistoryListSuccess.type,
        payload: draftHistory,
      })),
      catchError(() => EMPTY)
    )
  )

  upsertDraftHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DraftHistoryActions.upsertDraftHistory),
      switchMap((payload) => {
        return this.draftHistoryService.upsertDraftHistory(
          payload.orgId,
          payload.userId,
          payload.teamId,
          payload.model
        )
      }),
      map((recentItem) => ({
        type: DraftHistoryActions.upsertDraftHistorySuccess.type,
        payload: recentItem,
      })),
      catchError(() => EMPTY)
    )
  )

  constructor(
    private actions$: Actions,
    private draftHistoryService: DraftHistoryService
  ) {}
}
