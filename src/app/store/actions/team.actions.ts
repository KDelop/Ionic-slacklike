import { createAction, props } from '@ngrx/store'
import {
  RealTimeResponse,
  IListRootResponse,
  ITeamResponse,
  IProfileResponse,
  ITeamUserResponse,
} from '@app/models'

export const loadAllTeams = createAction(
  '[teams] Load all teams',
  props<{ orgId: string }>()
)

export const loadAllTeamsSuccess = createAction(
  '[teams] Load all teams Success',
  props<{ payload: RealTimeResponse<ITeamResponse[]> }>()
)

export const loadAllTeamsFailure = createAction(
  '[teams] Load all teams Failure',
  props<{ error: any }>()
)

export const loadTeam = createAction(
  '[teams] Load team',
  props<{ teamId: string }>()
)

export const loadTeamSuccess = createAction(
  '[teams] Load team Success',
  props<{ payload: RealTimeResponse<ITeamResponse> }>()
)

export const loadTeamFailure = createAction(
  '[teams] Load team Failure',
  props<{ error: any }>()
)

export const createTeam = createAction(
  '[teams] Create team',
  props<{ model: ITeamResponse }>()
)

export const createTeamSuccess = createAction(
  '[teams] Create team Success',
  props<{ payload: RealTimeResponse<ITeamResponse> }>()
)

export const createTeamFailure = createAction(
  '[teams] Create team Failure',
  props<{ error: any }>()
)

export const resetNewTeamCreated = createAction(
  '[teams] Reset new team created'
)

export const updateTeam = createAction(
  '[teams] Update team',
  props<{ teamId: string; model: ITeamResponse }>()
)

export const updateTeamSuccess = createAction(
  '[teams] Update team Success',
  props<{ payload: RealTimeResponse<ITeamResponse> }>()
)

export const updateTeamFailure = createAction(
  '[teams] Update team Failure',
  props<{ error: any }>()
)

export const createTeamUser = createAction(
  '[teamUser] Create team user',
  props<{ model: ITeamUserResponse; user: IProfileResponse, isCurrentUserAdded: boolean }>()
)

export const createTeamUserSuccess = createAction(
  '[teamUser] Create team user Success',
  props<{ payload: RealTimeResponse<ITeamUserResponse> }>()
)

export const createTeamUserFailure = createAction(
  '[teamUser] Create team user Failure',
  props<{ error: any }>()
)

export const deleteTeamUser = createAction(
  '[teamUser] Delete team user',
  props<{ userId: string; teamId: string, isCurrentUserRemoved: boolean }>()
)

export const deleteTeamUserSuccess = createAction(
  '[teamUser] Delete team user Success',
  props<{ payload: RealTimeResponse<ITeamUserResponse> }>()
)

export const deleteTeamUserFailure = createAction(
  '[teamUser] Delete team user Failure',
  props<{ error: any }>()
)

export const upsertTeamViaEvent = createAction(
  '[teams] Upsert team via event',
  props<{ team: ITeamResponse }>()
)

export const removeTeamViaEvent = createAction(
  '[teams] Remove team via event',
  props<{ teamId: string }>()
)

export const addTeamUserViaEvent = createAction(
  '[teamUser] Add team user via event',
  props<{ teamUser: ITeamUserResponse }>()
)

export const removeTeamUserViaEvent = createAction(
  '[teamUser] Remove team user via event',
  props<{ teamUser: ITeamUserResponse; removeTeam: boolean }>()
)
