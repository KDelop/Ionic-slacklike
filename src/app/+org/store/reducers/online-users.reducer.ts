import { IProfileResponse } from '@app/src/app/models'
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { createReducer, on, Action } from '@ngrx/store'

import * as OnlineUsersActions from '../actions/online-users.actions'

export const onlineUsersFeatureKey = 'onlineUsers'

export interface OnlineUsersState extends EntityState<any> {
  isLoaded: boolean
}

export const adapter: EntityAdapter<any> = createEntityAdapter<any>({
  selectId: (user: any) => user,
})

export const initialState: OnlineUsersState = adapter.getInitialState({
  isLoaded: false,
})

export const onlineUsersReducer = createReducer(
  initialState,

  on(OnlineUsersActions.loadOnlineUsers, (state, action) => {
    state = { ...state, isLoaded: false }
    return state
  }),

  on(OnlineUsersActions.loadOnlineUsersSuccess, (state, action) => {
    state = { ...state, isLoaded: true }
    const onlineUsersData = action.payload.data
    if (onlineUsersData) {
      return adapter.setAll(onlineUsersData, state)
    }
    return state
  }),

  on(OnlineUsersActions.upsertOnlineUserViaEvent, (state, action) => {
    const onlineUser = action.user.userId
    if (onlineUser) {
      return adapter.addOne(onlineUser, state)
    }
    return state
  }),

  on(OnlineUsersActions.removeOnlineUserViaEvent, (state, action) => {
    const onlineUser = action.user
    if (onlineUser) {
      return adapter.removeOne(onlineUser.userId, state)
    }
    return state
  })
)

export function reducer(
  onlineUsersState: OnlineUsersState | undefined,
  action: Action
) {
  return onlineUsersReducer(onlineUsersState, action)
}
