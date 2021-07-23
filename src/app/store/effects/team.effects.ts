import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { EMPTY } from 'rxjs'
import { map, catchError, switchMap } from 'rxjs/operators'
import * as TeamActions from './../actions/team.actions'
import { TeamService } from '../services/team.service'
import { Store } from '@ngrx/store'
import { Router } from '@angular/router'

@Injectable()
export class TeamEffects {
  loadAllTeams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.loadAllTeams),
      switchMap((payload) => {
        return this.teamService.fetchAllTeams(payload.orgId)
      }),
      map((allTeams) => ({
        type: TeamActions.loadAllTeamsSuccess.type,
        payload: allTeams,
      })),
      catchError(() => EMPTY)
    )
  )

  loadTeams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.loadTeam),
      switchMap((payload) => {
        return this.teamService.fetchTeam(payload.teamId)
      }),
      map((team) => ({
        type: TeamActions.loadTeamSuccess.type,
        payload: team,
      })),
      catchError(() => EMPTY)
    )
  )

  createTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.createTeam),
      switchMap((payload) => {
        return this.teamService.createTeam(payload.model).then((res) => {
          if (res.successful) {
            return res
          } else {
            return payload.model
          }
        })
      }),
      map((team) => {
        if ((team as any).successful) {
          this.goToTeam((team as any).data)
          return {
            type: TeamActions.createTeamSuccess.type,
            payload: team,
          }
        } else {
          alert(
            'A team with similar name exists. Please try with some different name.'
          )
          return {
            type: TeamActions.createTeamFailure.type,
            payload: team,
          }
        }
      }),
      catchError(() => EMPTY)
    )
  )

  updateTeam$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.updateTeam),
      switchMap((payload) => {
        return this.teamService.updateTeam(payload.teamId, payload.model)
      }),
      map((team) => ({
        type: TeamActions.updateTeamSuccess.type,
        payload: team,
      })),
      catchError(() => EMPTY)
    )
  )

  createTeamUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.createTeamUser),
      switchMap((payload) => {
        return this.teamService.createTeamUser(payload.model)
      }),
      map((teamUser) => ({
        type: TeamActions.createTeamUserSuccess.type,
        payload: teamUser,
      })),
      catchError(() => EMPTY)
    )
  )

  deleteTeamUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeamActions.deleteTeamUser),
      switchMap((payload) => {
        return this.teamService.deleteTeamUser(payload.teamId, payload.userId)
      }),
      map((teamUser) => ({
        type: TeamActions.deleteTeamUserSuccess.type,
        payload: teamUser,
      })),
      catchError(() => EMPTY)
    )
  )

  constructor(
    private actions$: Actions,
    private teamService: TeamService,
    private router: Router,
    private store: Store
  ) {}

  public goToTeam(team) {
    if (team) {
      this.teamService
        .fetchTeam(team._id)
        .then((res) => {
          this.store.dispatch(
            TeamActions.upsertTeamViaEvent({ team: res.data })
          )
          const url = `/org/chat/${team._id}`
          this.router.navigateByUrl(url)
        })
        .catch((err) => {})
    }
  }
}
