import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { EMPTY, of } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import * as TypeTrackerActions from './../actions/type-tracker.actions'
import { TypeTrackerService } from '../services/type-tracker.service'

@Injectable()
export class TypeTrackerEffects {
  updateTypeTracker$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TypeTrackerActions.updateTypeTracker),
      switchMap((payload) => {
        return this.typeTrackerService.updateTypeTracker(payload.model)
      }),
      map((chats) => ({
        type: TypeTrackerActions.updateTypeTrackerSuccess.type,
        payload: chats,
      })),
      catchError(() => EMPTY)
    )
  )

  constructor(
    private actions$: Actions,
    private typeTrackerService: TypeTrackerService
  ) {}
}
