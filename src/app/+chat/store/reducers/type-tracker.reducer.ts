import { ITypeTrackerRes } from '@app/src/app/models'
import { loadOrg, loadOrgSuccess } from '@app/src/app/store/actions/org.actions'
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { createReducer, on, Action } from '@ngrx/store'

import * as TypeTrackerActions from '../actions/type-tracker.actions'

export const typeTrackerFeatureKey = 'typeTracker'

export interface TypeTrackerState {
  recentChatTypeTrackers: { [id: string]: TrackerState }
}

export interface TrackerState extends EntityState<ITypeTrackerRes> {}

export const adapter: EntityAdapter<ITypeTrackerRes> = createEntityAdapter<ITypeTrackerRes>(
  {
    selectId: (tracker: ITypeTrackerRes) => tracker.userId,
  }
)

const typeTrackerInitialState: TrackerState = adapter.getInitialState({})

export const initialState = {
  recentChatTypeTrackers: {},
}

export const typeTrackerReducer = createReducer(
  initialState,

  on(loadOrg, (state, action) => {
    state = { ...state, recentChatTypeTrackers: {} }
    return state
  }),
  // on(TypeTrackerActions.updateTypeTrackerSuccess, (state, action) => {
  //   const typeTrackerData = action.payload.data;
  //   if (typeTrackerData) {
  //     const teamId = typeTrackerData.teamId;
  //     if (!state.recentChatTypeTrackers[teamId]) {
  //       state = {
  //         ...state,
  //         recentChatTypeTrackers: {
  //           ...state.recentChatTypeTrackers,
  //           [teamId]: typeTrackerInitialState,
  //         },
  //       };
  //     }
  //     let recentChatTypeTrackers = state.recentChatTypeTrackers;
  //     if (typeTrackerData.isTyping) {
  //       recentChatTypeTrackers = {
  //         ...recentChatTypeTrackers,
  //         [teamId]: adapter.addOne(
  //           typeTrackerData,
  //           state.recentChatTypeTrackers[teamId]
  //         ),
  //       };
  //     } else {
  //       recentChatTypeTrackers = {
  //         ...recentChatTypeTrackers,
  //         [teamId]: adapter.removeOne(
  //           typeTrackerData.teamId,
  //           state.recentChatTypeTrackers[teamId]
  //         ),
  //       };
  //     }
  //     state = { ...state, recentChatTypeTrackers };
  //     return state;
  //   }
  //   return state;
  // }),

  on(TypeTrackerActions.upsertTypeTrackerViaEvent, (state, action) => {
    const typeTrackerData = action.model
    if (typeTrackerData) {
      const teamId = typeTrackerData.teamId
      if (!state.recentChatTypeTrackers[teamId]) {
        state = {
          ...state,
          recentChatTypeTrackers: {
            ...state.recentChatTypeTrackers,
            [teamId]: typeTrackerInitialState,
          },
        }
      }
      let recentChatTypeTrackers = state.recentChatTypeTrackers
      if (typeTrackerData.isTyping) {
        recentChatTypeTrackers = {
          ...recentChatTypeTrackers,
          [teamId]: adapter.addOne(
            typeTrackerData,
            state.recentChatTypeTrackers[teamId]
          ),
        }
      } else {
        recentChatTypeTrackers = {
          ...recentChatTypeTrackers,
          [teamId]: adapter.removeOne(
            typeTrackerData.userId,
            state.recentChatTypeTrackers[teamId]
          ),
        }
      }
      state = { ...state, recentChatTypeTrackers }
      return state
    }
    return state
  })
)

export function reducer(
  typeTrackerState: TypeTrackerState | undefined,
  action: Action
) {
  return typeTrackerReducer(typeTrackerState, action)
}
