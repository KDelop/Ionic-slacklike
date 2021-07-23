import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { EMPTY } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import * as UserActions from './../actions/user.actions'
import { UserService } from '../services/user.service'

@Injectable()
export class UserEffects {
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUser),
      switchMap((payload) => {
        return this.userService.fetchUser()
      }),
      map((user) => ({
        type: UserActions.loadUserSuccess.type,
        payload: user,
      })),
      catchError(() => EMPTY)
    )
  )

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createUser),
      switchMap((payload) => {
        return this.userService.createUser(payload.model).then((res) => {
          if (res.successful) {
            return res
          } else {
            if (res.errorData) {
              alert(`${payload.model.email} might already be a member.`)
            }
          }
        })
      }),
      map((user) => ({
        type: UserActions.createUserSuccess.type,
        payload: user,
      })),
      catchError(() => EMPTY)
    )
  )

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      switchMap((payload) => {
        return this.userService.updateUser(payload.userId, payload.model)
      }),
      map((user) => ({
        type: UserActions.updateUserSuccess.type,
        payload: user,
      })),
      catchError(() => EMPTY)
    )
  )

  constructor(private actions$: Actions, private userService: UserService) {}
}
