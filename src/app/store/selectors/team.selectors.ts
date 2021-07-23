import { createFeatureSelector, createSelector } from '@ngrx/store'
import * as TeamReducer from '../reducers/team.reducer'
import { selectCurrentUserId } from './user.selectors'

export const { selectAll, selectEntities } = TeamReducer.adapter.getSelectors()

export const selectTeamListState = createFeatureSelector<TeamReducer.TeamState>(
  TeamReducer.teamFeatureKey
)

export const selectTeamList = createSelector(selectTeamListState, selectAll)

export const selectTeamIds = createSelector(
  selectTeamListState,
  (state) => state.ids
)

export const selectTeamListEntities = createSelector(
  selectTeamListState,
  selectEntities
)

export const isTeamsLoaded = createSelector(
  selectTeamListState,
  (state) => state.isLoaded
)

export const selectPersonalTeamId = createSelector(
  selectTeamListState,
  (state) => state.personalTeamId
)

export const selectDefaultTeamId = createSelector(
  selectTeamListState,
  (state) => state.defaultTeamId
)

export const selectPersonalTeam = createSelector(
  selectTeamListEntities,
  selectPersonalTeamId,
  (teamEntities, personalTeamId) => {
    if (teamEntities && personalTeamId) {
      return teamEntities[personalTeamId]
    }
  }
)

export const selectDefaultTeam = createSelector(
  selectTeamListEntities,
  selectDefaultTeamId,
  (teamEntities, defaultTeamId) => {
    if (teamEntities && defaultTeamId) {
      return teamEntities[defaultTeamId]
    }
  }
)

export const selectChannelList = createSelector(
  selectTeamList,
  selectCurrentUserId,
  (teamList, currentUserId) => {
    const channelList = []
    if (teamList && currentUserId) {
      teamList.map((team) => {
        if (team?.type !== 'DIRECT_MESSAGE' && team?.type !== 'PERSONAL') {
          if (team?.users?.find((user) => user.userId === currentUserId)) {
            team = { ...team, isCurrentUserMember: true }
          }
          channelList.push(team)
        }
      })
    }
    return channelList
  }
)

export const selectDMTeamEntities = createSelector(
  selectTeamList,
  selectCurrentUserId,
  (teamList, currentUserId) => {
    const DMTeamEntities = {}
    if (teamList && currentUserId) {
      teamList.map((team) => {
        if (team?.type === 'DIRECT_MESSAGE' && team?.users?.length) {
          if (team?.users[0]?.userId === currentUserId) {
            DMTeamEntities[team?.users[1]?.userId] = team?._id
          } else {
            DMTeamEntities[team?.users[0]?.userId] = team?._id
          }
        }
      })
    }
    return DMTeamEntities
  }
)

export const selectFollowedTeams = createSelector(
  selectTeamListState,
  selectPersonalTeam,
  (teamListState, personalTeam) => {
    const followedTeams = { ids: [], entities: {} }
    if (teamListState?.ids?.length) {
      teamListState.ids.forEach((teamId) => {
        if (
          teamListState.entities[teamId]?.users?.length &&
          teamListState.entities[teamId].users.find(
            (user) => user.userId === personalTeam?.users[0]?.userId
          ) &&
          !teamListState.entities[teamId].isArchived &&
          teamListState.entities[teamId].type !== 'PERSONAL'
        ) {
          followedTeams.ids.push(teamId)
          followedTeams.entities[teamId] = teamListState.entities[teamId]
        }
      })
    }
    return followedTeams
  }
)

export const selectAllChannelList = createSelector(
  selectTeamList,
  (teamList) => {
    teamList = teamList.filter(team => team.type !== 'DIRECT_MESSAGE' && team.type !== 'PERSONAL' && !team.isArchived)
    return teamList
  }
)

export const isNewTeamBeingCreated = createSelector(
  selectTeamListState,
  (teamListState) => {
    return teamListState.isNewTeamBeingCreated
  }
)

export const isNewTeamCreated = createSelector(
  selectTeamListState,
  (teamListState) => {
    return teamListState.isNewTeamCreated
  }
)