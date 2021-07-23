import * as fromRouter from '@ngrx/router-store'
import {
  createSelector,
  createFeatureSelector,
  ActionReducerMap,
  MetaReducer,
  createAction,
} from '@ngrx/store'
// import { selectOrgListEntities } from '../selectors/org.selectors'
import { selectTeamListEntities } from '../selectors/team.selectors'
import { hydrationMetaReducer } from '../../hydration-store/hydration.reducer'
import { selectCurrentUser } from '../selectors/user.selectors'
export interface State {
  router: fromRouter.RouterReducerState<any>
}

export const LOGOUT = createAction('LOGOUT')

export const reducers: ActionReducerMap<State> = {
  router: fromRouter.routerReducer,
}

export const metaReducers: MetaReducer<State>[] = [hydrationMetaReducer, logout]

function logout(reducer) {
  return function (state, action) {
    return reducer(action.type === 'LOGOUT' ? undefined : state, action)
  }
}

export const selectRouter =
  createFeatureSelector<State, fromRouter.RouterReducerState<any>>('router')

export const {
  selectCurrentRoute, // select the current route
  selectFragment, // select the current route fragment
  selectQueryParams, // select the current route query params
  selectQueryParam, // factory function to select a query param
  selectRouteParams, // select the current route params
  selectRouteParam, // factory function to select a route param
  selectRouteData, // select the current route data
  selectUrl, // select the current url
} = fromRouter.getSelectors(selectRouter)

// export const selectActiveOrgId = selectRouteParam('orgId')

// export const selectActiveOrg = createSelector(
//   selectOrgListEntities,
//   selectActiveOrgId,
//   (orgs, orgId) => {
//     if (orgs && orgId) {
//       return orgs[orgId]
//     }
//   }
// )

export const selectActiveChatId = selectRouteParam('chatId')

export const selectActiveChat = createSelector(
  selectTeamListEntities,
  selectActiveChatId,
  selectCurrentUser,
  (teams, chatId, currentUser) => {
    let activeChat = teams[chatId]
    if (
      activeChat?.type !== 'DIRECT_MESSAGE' &&
      activeChat?.type !== 'PERSONAL'
    ) {
      if (activeChat?.users?.find((user) => user.userId === currentUser?.id)) {
        activeChat = { ...activeChat, isCurrentUserMember: true }
      }
    } else {
      activeChat = { ...activeChat, isCurrentUserMember: true }
    }
    return activeChat
  }
)