import { createAction, props } from '@ngrx/store'
import { RealTimeResponse, IOrgResponse, IOrgUpdateRequest } from '@app/models'

export const loadOrg = createAction(
  '[orgs] Load org',
  props<{ orgId: string }>()
)

export const loadOrgSuccess = createAction(
  '[orgs] Load org Success',
  props<{ payload: RealTimeResponse<IOrgResponse> }>()
)

export const loadOrgFailure = createAction(
  '[orgs] Load user orgs Failure',
  props<{ error: any }>()
)

export const loadUserOrgs = createAction('[orgs] Load user orgs')

export const loadUserOrgsSuccess = createAction(
  '[orgs] Load user orgs Success',
  props<{ payload: RealTimeResponse<any> }>()
)

export const loadUserOrgsFailure = createAction(
  '[orgs] Load user orgs Failure',
  props<{ error: any }>()
)

export const createOrg = createAction(
  '[orgs] Create org',
  props<{ model: IOrgResponse | IOrgUpdateRequest }>()
)

export const createOrgSuccess = createAction(
  '[orgs] Create org Success',
  props<{ payload: RealTimeResponse<IOrgResponse> }>()
)

export const createOrgFailure = createAction(
  '[orgs] Create org Failure',
  props<{ error: any }>()
)

export const updateOrg = createAction(
  '[orgs] Update org',
  props<{ orgId: string; model: IOrgResponse | IOrgUpdateRequest }>()
)

export const updateOrgSuccess = createAction(
  '[orgs] Update org Success',
  props<{ payload: RealTimeResponse<IOrgResponse> }>()
)

export const updateOrgFailure = createAction(
  '[orgs] Update org Failure',
  props<{ error: any }>()
)

export const updateOrgViaEvent = createAction(
  '[orgs] Update org via Event',
  props<{ org: IOrgResponse }>()
)

export const clearState = createAction(
  '[orgs] Clear state'
);

export const setActiveOrgId = createAction(
  '[orgs] Set active org id',
  props<{ orgId: string, isOrgSwitched?: boolean }>()
)