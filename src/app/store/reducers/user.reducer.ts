import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { createReducer, on, Action } from '@ngrx/store'

import * as UserActions from '../actions/user.actions'
import { IProfileResponse } from '@app/models'
import { loadOrg, loadOrgSuccess } from '../actions/org.actions'

export const userFeatureKey = 'user'

export interface UserState extends EntityState<IProfileResponse> {
  currentUserId: string
  loading: boolean
  isLoaded: boolean
}

export const adapter: EntityAdapter<IProfileResponse> = createEntityAdapter<IProfileResponse>(
  {
    sortComparer: sortByName,
  }
)

export function sortByName(a: IProfileResponse, b: IProfileResponse): number {
  if (!a?.firstName) {
    a = { ...a, firstName: '' }
  }
  if (!b?.firstName) {
    b = { ...b, firstName: '' }
  }
  return a?.firstName.localeCompare(b?.firstName)
}

export const initialState: UserState = adapter.getInitialState({
  currentUserId: null,
  loading: null,
  isLoaded: null,
})

export const userReducer = createReducer(
  initialState,

  on(loadOrg, (state, action) => {
    state = { ...state, loading: true, isLoaded: false }
    return state
  }),

  on(loadOrgSuccess, (state, action) => {
    if (action.payload.data?.users) {
      state = { ...state, loading: false, isLoaded: true }
      const users = action.payload.data?.users
      const tempUsers = []
      users.map((user) => {
        // if (user?.avatar) {
        //   let avatar = ''
        //   if (user?.avatar.includes('=s96-c')) {
        //     avatar = user?.avatar.replace('=s96-c', '=s1096-c')
        //   } else if (user?.avatar.includes('?sz=50')) {
        //     avatar = user?.avatar.replace('?sz=50', '?sz=1050')
        //   } else {
        //     avatar = user?.avatar.replace('/s96-c', '/s1096-c')
        //   }
        //   user = { ...user, avatar }
        // }
        if (user?.org_user?.status === 'joined') {
          tempUsers.push(user)
        } else if (user?.id === '0') {
          tempUsers.push(user)
        }
      })
      return adapter.setAll(tempUsers, state)
    }
    return state
  }),

  on(UserActions.loadUserSuccess, (state, action) => {
    if (action.payload.data) {
      let user = action.payload.data
      if (user?.avatar) {
        let avatar = ''
        if (user?.avatar.includes('=s96-c')) {
          avatar = user?.avatar.replace('=s96-c', '=s1096-c')
        } else if (user?.avatar.includes('?sz=50')) {
          avatar = user?.avatar.replace('?sz=50', '?sz=1050')
        } else {
          avatar = user?.avatar.replace('/s96-c', '/s1096-c')
        }
        user = { ...user, avatar }
      }
      state = { ...state, currentUserId: user.id }
      return adapter.upsertOne(user, state)
    }
    return state
  }),

  on(UserActions.createUserSuccess, (state, action) => {
    if (action.payload.data) {
      const user = action.payload.data
      return adapter.upsertOne(user, state)
    }
    return state
  }),

  on(UserActions.updateUser, (state, action) => {
    const userModel = { ...action.model }
    return adapter.updateOne({ id: action.userId, changes: userModel }, state)
  }),

  on(UserActions.updateUserSuccess, (state, action) => {
    const user = action.payload.data
    if (user) {
      return adapter.updateOne({ id: user.id, changes: user }, state)
    }
    return state
  }),

  on(UserActions.upsertUserViaEvent, (state, action) => {
    const userModel = { ...action.user }
    if (userModel) {
      return adapter.upsertOne(userModel, state)
    }
    return state
  })
)

export function reducer(userState: UserState | undefined, action: Action) {
  return userReducer(userState, action)
}
