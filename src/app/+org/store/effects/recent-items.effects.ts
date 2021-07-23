import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { EMPTY } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import * as RecentItemsActions from './../actions/recent-items.actions'
import { RecentItemsService } from '../services/recent-items.service'

@Injectable()
export class RecentItemsEffects {
  loadRecentItemsList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecentItemsActions.loadRecentItems),
      switchMap((payload) => {
        return this.recentItemsService.fetchRecentItems(
          payload.orgId,
          payload.userId
        )
      }),
      map((recentItems) => ({
        type: RecentItemsActions.loadRecentItemsSuccess.type,
        payload: recentItems,
      })),
      catchError(() => EMPTY)
    )
  )

  upsertRecentItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecentItemsActions.upsertRecentItem),
      switchMap((payload) => {
        return this.recentItemsService.updateRecentItems(
          payload.orgId,
          payload.userId,
          payload.teamId,
          payload.model
        )
      }),
      map((recentItem) => ({
        type: RecentItemsActions.upsertRecentItemSuccess.type,
        payload: recentItem,
      })),
      catchError(() => EMPTY)
    )
  )

  updateRecentItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecentItemsActions.updateRecentItems),
      switchMap((payload) => {
        return this.recentItemsService.updateRecentItems(
          payload.orgId,
          payload.userId,
          payload.teamId,
          payload.model
        )
      }),
      map((recentItem) => ({
        type: RecentItemsActions.updateRecentItemsSuccess.type,
        payload: recentItem,
      })),
      catchError(() => EMPTY)
    )
  )
  removeRecentItems$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RecentItemsActions.removeRecentItems),
      switchMap((payload) => {
        return this.recentItemsService.removeRecentItems(
          payload.orgId,
          payload.userId,
          payload.teamId,
          payload.model
        )
      }),
      map((recentItem) => ({
        type: RecentItemsActions.removeRecentItemsSuccess.type,
        payload: recentItem,
      })),
      catchError(() => EMPTY)
    )
  )

  constructor(
    private actions$: Actions,
    private recentItemsService: RecentItemsService
  ) {}
}
