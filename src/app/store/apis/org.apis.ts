import { authBaseUrl } from './baseURL.apis'

const url = `${authBaseUrl}/orgs`

export const ORG_APIS = {
  FETCH_ORG: `${url}/:orgId`,
  FETCH_USER_ORGS: `${authBaseUrl}/users?followedOrgs=true`,
  CREATE_ORG: `${url}`,
  UPDATE_ORG: `${url}/:orgId`,
}
