import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { EMPTY, of } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import { OrgService } from '../services/org.service'
import * as OrgActions from './../actions/org.actions'

@Injectable()
export class OrgEffects {
  loadOrg$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgActions.loadOrg),
      switchMap((payload) => {
        return this.orgService.fetchOrgDetails(payload.orgId)
      }),
      map((org) => ({
        type: OrgActions.loadOrgSuccess.type,
        payload: org,
      })),
      catchError(() => EMPTY)
    )
  )

  loadUserOrgs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgActions.loadUserOrgs),
      switchMap(() => {
        return this.orgService.fetchUserOrgs()
      }),
      map((followedOrgs) => ({
        type: OrgActions.loadUserOrgsSuccess.type,
        payload: followedOrgs,
      })),
      catchError(() => EMPTY)
    )
  )

  createOrg$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgActions.createOrg),
      switchMap((payload) => {
        return this.orgService.createOrg(payload.model)
      }),
      map((org) => ({
        type: OrgActions.updateOrgSuccess.type,
        payload: org,
      })),
      catchError((error) =>
        of({ type: OrgActions.createOrgFailure.type, error })
      )
    )
  )

  updateOrg$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrgActions.updateOrg),
      switchMap((payload) => {
        return this.orgService.updateOrg(payload.orgId, payload.model)
      }),
      map((org) => ({
        type: OrgActions.updateOrgSuccess.type,
        payload: org,
      })),
      catchError(() => EMPTY)
    )
  )

  constructor(private actions$: Actions, private orgService: OrgService) {}
}
