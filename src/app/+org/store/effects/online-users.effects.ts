import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { EMPTY } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import * as OnlineUsersActions from './../actions/online-users.actions'
import { OnlineUsersService } from '../services/online-users.service'

@Injectable()
export class OnlineUsersEffects {
  loadOnlineUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OnlineUsersActions.loadOnlineUsers),
      switchMap((payload) => {
        return this.onlineUsersService.fetchOnlineUsers(payload.orgId)
      }),
      map((onlineUser) => ({
        type: OnlineUsersActions.loadOnlineUsersSuccess.type,
        payload: onlineUser,
      })),
      catchError(() => EMPTY)
    )
  )

  constructor(
    private actions$: Actions,
    private onlineUsersService: OnlineUsersService
  ) {}
}
