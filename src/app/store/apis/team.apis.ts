import { chatBaseUrl } from './baseURL.apis'

const url = `${chatBaseUrl}/team`
const teamUserUrl = `${chatBaseUrl}/teamUser`

export const TEAM_APIS = {
  FETCH_ALL_TEAMS: `${url}?orgId=:orgId&$paginate=false`,
  FETCH_TEAM: `${url}/:teamId`,
  CREATE_TEAM: `${url}`,
  UPDATE_TEAM: `${url}/:teamId`,
  FETCH_ATTACHEMENTS: `${chatBaseUrl}/message?teamId=:teamId&attachment=true`,
}

export const TEAM_USERS_APIS = {
  CREATE_TEAM_USER: `${teamUserUrl}`,
  DELETE_TEAM_USER: `${teamUserUrl}?userId=:userId&teamId=:teamId`,
}
