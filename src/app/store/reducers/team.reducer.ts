import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { createReducer, on, Action } from '@ngrx/store'

import * as TeamActions from '../actions/team.actions'
import { ITeamResponse } from '@app/models'
import { loadUserSuccess } from '../actions/user.actions'

export const teamFeatureKey = 'team'

export interface TeamState extends EntityState<ITeamResponse> {
  loading: boolean
  isLoaded: boolean
  defaultTeamId: string
  personalTeamId: string
  currentUserId: string
  isNewTeamBeingCreated: boolean
  isNewTeamCreated: boolean
}

export const adapter: EntityAdapter<ITeamResponse> =
  createEntityAdapter<ITeamResponse>({
    selectId: (team: ITeamResponse) => team._id,
    sortComparer: sortByName,
  })

export function sortByName(a: ITeamResponse, b: ITeamResponse): number {
  return a.name.localeCompare(b.name)
}

export const initialState: TeamState = adapter.getInitialState({
  loading: null,
  isLoaded: null,
  defaultTeamId: null,
  personalTeamId: null,
  currentUserId: null,
  isNewTeamBeingCreated: null,
  isNewTeamCreated: null,
})

export const teamReducer = createReducer(
  initialState,

  on(loadUserSuccess, (state, action) => {
    if (action.payload.data) {
      const user = action.payload.data
      if (user) {
        state = { ...state, currentUserId: user.id }
      }
    }
    return state
  }),

  on(TeamActions.loadAllTeams, (state, action) => {
    state = { ...state, loading: true, isLoaded: false }
    return state
  }),

  on(TeamActions.loadAllTeamsSuccess, (state, action) => {
    const teamsData = action.payload.data
    let defaultTeamId = null
    let personalTeamId = null
    if (teamsData) {
      const teams = []
      teamsData.map((team) => {
        if (team?.type === 'DEFAULT') {
          defaultTeamId = team?._id
        } else if (
          team?.type === 'DIRECT_MESSAGE' ||
          team?.type === 'PERSONAL'
        ) {
          let receiverId = null
          if (team?.type === 'PERSONAL') {
            receiverId = state?.currentUserId
            personalTeamId = team?._id
          } else {
            receiverId = team?.users?.[0]?.userId
          }
          team = { ...team, receiverId }
        }
        if (team?._id) {
          teams.push(team)
        }
      })
      state = {
        ...state,
        loading: false,
        isLoaded: true,
        defaultTeamId,
        personalTeamId,
      }
      return adapter.setAll(teams, state)
    }
    return state
  }),

  on(TeamActions.loadTeamSuccess, (state, action) => {
    let teamData = action.payload.data
    if (teamData) {
      if (
        (teamData.type === 'DIRECT_MESSAGE' || teamData.type === 'PERSONAL') &&
        !state.entities[teamData?._id]?.receiverId
      ) {
        let receiverId = null
        if (teamData?.type === 'PERSONAL') {
          receiverId = state?.currentUserId
        } else {
          receiverId = teamData?.users?.[0]?.userId
        }
        teamData = { ...teamData, receiverId }
      }
      return adapter.upsertOne(teamData, state)
    }
    return state
  }),

  on(TeamActions.createTeam, (state, action) => {
    const teamModel = { ...action.model, _id: action.model.requestId}
    state = {...state, isNewTeamBeingCreated: true, isNewTeamCreated: false };
    return adapter.addOne(teamModel, state)
  }),

  on(TeamActions.createTeamSuccess, (state, action) => {
    let team = action.payload.data
    if (team) {
      if (
        team?.type === 'DIRECT_MESSAGE' ||
        team?.type !== 'PERSONAL'
      ) {
        let receiverId = null
        receiverId = team?.users?.[0]?.userId
        team = { ...team, receiverId }
      }
      state = {...state, isNewTeamBeingCreated: false, isNewTeamCreated: true}
      return adapter.updateOne({ id: team.requestId, changes: team }, state)
    }
    return state
  }),

  on(TeamActions.createTeamFailure, (state, action) => {
    const team = (action as any).payload
    if (team) {
      return adapter.removeOne(team.requestId, state)
    }
    return state
  }),

  on(TeamActions.updateTeam, (state, action) => {
    const teamModel = { ...action.model }
    return adapter.updateOne({ id: action.teamId, changes: teamModel }, state)
  }),

  on(TeamActions.updateTeamSuccess, (state, action) => {
    const team = action.payload.data
    if (team) {
      return adapter.updateOne({ id: team._id, changes: team }, state)
    }
    return state
  }),

  on(TeamActions.createTeamUser, (state, action) => {
    const userId = action.model.userId
    let selectedTeam = state.entities[action.model.teamId]
    if (selectedTeam) {
      const tempIndex = selectedTeam.users.findIndex(
        // tslint:disable-next-line:triple-equals
        (u) => u.userId === userId
      )
      if (tempIndex === -1) {
        let users = selectedTeam.users
        const newUserArray = [{ userId }]
        users = [...users, ...newUserArray]
        selectedTeam = { ...selectedTeam, users }
        return adapter.updateOne(
          { id: selectedTeam._id, changes: selectedTeam },
          state
        )
      }
    }
    return state
  }),

  on(TeamActions.deleteTeamUser, (state, action) => {
    let selectedTeam = state.entities[action.teamId]
    const users = selectedTeam.users.filter(
      (user) => user.userId !== action.userId
    )
    selectedTeam = { ...selectedTeam, users }
    return adapter.updateOne(
      { id: selectedTeam._id, changes: selectedTeam },
      state
    )
  }),

  on(TeamActions.upsertTeamViaEvent, (state, action) => {
    const team = { ...action.team }
    if (team) {
      return adapter.upsertOne(team, state)
    }
  }),

  on(TeamActions.removeTeamViaEvent, (state, action) => {
    const teamId = action.teamId
    if (teamId) {
      return adapter.removeOne(teamId, state)
    }
  }),

  on(TeamActions.addTeamUserViaEvent, (state, action) => {
    const teamUserModel = { ...action.teamUser }
    const teamUser = []
    teamUser[0] = teamUserModel.userId
    let selectedTeam = state.entities[teamUserModel.teamId]
    if (selectedTeam) {
      const tempIndex = selectedTeam?.users?.findIndex(
        (user) => user.userId === teamUser[0]
      )
      if (tempIndex === -1) {
        let users = selectedTeam.users
        const newUserArray = [{ userId: teamUser[0] }]
        users = [...users, ...newUserArray]
        selectedTeam = { ...selectedTeam, users }
        return adapter.updateOne(
          { id: selectedTeam._id, changes: selectedTeam },
          state
        )
      }
    }
    return state
  }),

  on(TeamActions.removeTeamUserViaEvent, (state, action) => {
    const teamUserModel = { ...action.teamUser }
    let selectedTeam = state.entities[teamUserModel.teamId]
    const users = selectedTeam?.users?.filter(
      (user) => user.userId !== teamUserModel.userId
    )
    selectedTeam = { ...selectedTeam, users }
    if (!action.removeTeam) {
      return adapter.updateOne(
        { id: selectedTeam._id, changes: selectedTeam },
        state
      )
    } else {
      return adapter.removeOne(teamUserModel.teamId, state)
    }
  }),

  on(TeamActions.resetNewTeamCreated, (state) => {
    return {...state, isNewTeamCreated: null}
  })
)

export function reducer(teamState: TeamState | undefined, action: Action) {
  return teamReducer(teamState, action)
}
