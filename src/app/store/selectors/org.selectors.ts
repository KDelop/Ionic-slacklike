import { createFeatureSelector, createSelector, props } from '@ngrx/store';
import * as OrgReducer from '../reducers/org.reducer';

export const { selectAll, selectEntities } = OrgReducer.adapter.getSelectors();

export const selectOrgListState = createFeatureSelector<OrgReducer.OrgState>(
  OrgReducer.orgFeatureKey
);

export const selectOrgList = createSelector(selectOrgListState, selectAll);

export const selectOrgListEntities = createSelector(
  selectOrgListState,
  selectEntities
);

export const selectCreateOrgSuccess = createSelector(
  selectOrgListState,
  state => state.orgCreateSuccess
);

export const selectCreateOrgFailure = createSelector(
  selectOrgListState,
  state => state.orgCreateError
);



export const selectActiveOrgId = createSelector(
  selectOrgListState,
  (orgState) => {
    return orgState?.activeOrgId;
  }
)

export const selectActiveOrg = createSelector(
  selectOrgListEntities,
  selectActiveOrgId,
  (orgs, orgId) => {
    if (orgs && orgId) {
      return orgs[orgId]
    }
  }
)