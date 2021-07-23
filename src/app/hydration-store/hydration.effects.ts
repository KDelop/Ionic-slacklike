import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage-angular'
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects'
import { Action, Store } from '@ngrx/store'
import { distinctUntilChanged, map, switchMap, take, tap } from 'rxjs/operators'
import { State } from '../store/reducers'
import * as HydrationActions from './hydration.actions'

@Injectable()
export class HydrationEffects implements OnInitEffects {

  public webWorker;
  public stateName = 'space-state';

  hydrate$ = createEffect(() =>
    this.action$.pipe(
      ofType(HydrationActions.hydrate),
      switchMap(() => {
        this.storage.create()
        return this.storage.get(this.stateName)
      }),
      map((savedState: State) => {
        const latestState = this.store.select((store) => store)
        latestState.pipe(take(1)).subscribe((state) => {
          if (savedState && state?.router) {
            savedState.router = state.router
          }
        })
        if (savedState) {
          return HydrationActions.hydrateSuccess({ state: savedState })
        }
        return HydrationActions.hydrateFailure()
      })
    )
  )

  serialize$ = createEffect(
    () =>
      this.action$.pipe(
        ofType(
          HydrationActions.hydrateSuccess,
          HydrationActions.hydrateFailure
        ),
        switchMap(() => this.store),
        distinctUntilChanged(),
        tap((state) => {
          this.webWorker.postMessage({ stateName: this.stateName, state })
        })
      ),
    { dispatch: false }
  )

  constructor(
    private action$: Actions,
    private store: Store<State>,
    private storage: Storage
    ) {
    this.webWorker = new Worker('../../assets/worker.js')
  }

  ngrxOnInitEffects(): Action {
    return HydrationActions.hydrate()
  }
}
