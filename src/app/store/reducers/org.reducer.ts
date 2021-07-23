import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity'
import { createReducer, on, Action } from '@ngrx/store'

import * as OrgActions from '../actions/org.actions'
import { IOrgResponse } from '@app/models'

export const orgFeatureKey = 'org'

export interface OrgState extends EntityState<IOrgResponse> {
  activeOrgId: string
  orgCreateError: string
  orgCreateSuccess: boolean
}

export const adapter: EntityAdapter<IOrgResponse> = createEntityAdapter<IOrgResponse>()

export const initialState: OrgState = adapter.getInitialState({
  activeOrgId: null,
  orgCreateError: null,
  orgCreateSuccess: false,
})

export const orgReducer = createReducer(
  initialState,

  on(OrgActions.loadOrgSuccess, (state, action) => {
    if (action.payload?.data) {
      const orgData = action.payload.data
      return adapter.upsertOne(orgData, state)
    }
    return state
  }),

  on(OrgActions.loadUserOrgsSuccess, (state, action) => {
    if (action.payload?.data?.orgs) {
      const orgData = action.payload.data?.orgs
      return adapter.setAll(orgData, state)
    }
    return state
  }),

  on(OrgActions.updateOrg, (state, action) => {
    const orgModel = { ...action.model }
    return adapter.updateOne({ id: action.orgId, changes: orgModel }, state)
  }),

  on(OrgActions.updateOrgSuccess, (state, action) => {
    const org = action.payload.data
    if (org) {
      return adapter.updateOne({ id: org.id, changes: org }, state)
    }
  }),

  on(OrgActions.createOrg, (state, action) => {
    state = { ...state, orgCreateSuccess: false, orgCreateError: null }
    return state
  }),

  on(OrgActions.createOrgSuccess, (state, action) => {
    state = { ...state, orgCreateSuccess: true }
    const org = action.payload.data
    if (org) {
      return adapter.upsertOne(org, state)
    }
    return state
  }),

  on(OrgActions.createOrgFailure, (state, action) => {
    const err = action.error
    if (err) {
      return (state = { ...state, orgCreateError: err })
    }
    return state
  }),

  on(OrgActions.updateOrgViaEvent, (state, action) => {
    const org = action.org
    if (org) {
      return adapter.updateOne({ id: org.id, changes: org }, state)
    }
  }),

  on(OrgActions.setActiveOrgId, (state, action) => {
    if (action?.orgId) {
      state = {...state, activeOrgId: action?.orgId}
    }
    return state
  }),

)

export function reducer(orgState: OrgState | undefined, action: Action) {
  return orgReducer(orgState, action)
}
