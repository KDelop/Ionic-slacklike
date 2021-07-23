import { selectOnlineUserEntities } from '@app/src/app/+org/store/selectors/online-users.selectors'
import {
  selectActiveChat,
  selectActiveChatId,
} from '@app/src/app/store/reducers'
import { createFeatureSelector, createSelector } from '@ngrx/store'
import * as TypeTrackerReducer from '../reducers/type-tracker.reducer'

export const { selectAll, selectEntities } =
  TypeTrackerReducer.adapter.getSelectors()

export const selectTypeTrackerState =
  createFeatureSelector<TypeTrackerReducer.TypeTrackerState>(
    TypeTrackerReducer.typeTrackerFeatureKey
  )

export const selectTypeTrackerEntities = createSelector(
  selectTypeTrackerState,
  selectOnlineUserEntities,
  (state, onlineUsers) => {
    let recentChatTypeTrackers = {}
    if (state?.recentChatTypeTrackers) {
      Object.keys(state.recentChatTypeTrackers).map((id) => {
        if (state.recentChatTypeTrackers[id]?.ids?.length) {
          let typers = {}
          const typersIds = []
          state.recentChatTypeTrackers[id]?.ids.forEach((typerId) => {
            if (state.recentChatTypeTrackers[id]?.entities[typerId]) {
              const typer = state.recentChatTypeTrackers[id]?.entities[typerId]
              if (
                !(
                  new Date().getTime() - new Date(typer.createdAt).getTime() >
                  30 * 1000
                ) &&
                onlineUsers[typerId]
              ) {
                typers = { ...typers, [typerId]: typer }
                typersIds.push(typer?.userId)
              }
            }
          })
          recentChatTypeTrackers = {
            ...recentChatTypeTrackers,
            [id]: { ids: typersIds, entities: typers },
          }
        }
      })
    }
    return recentChatTypeTrackers
  }
)

export const selectActiveChatTypers = createSelector(
  selectTypeTrackerState,
  selectActiveChatId,
  (state, activeChatId) => {
    return state?.recentChatTypeTrackers &&
      state?.recentChatTypeTrackers[activeChatId]
      ? selectAll(state.recentChatTypeTrackers[activeChatId])
      : null
  }
)
