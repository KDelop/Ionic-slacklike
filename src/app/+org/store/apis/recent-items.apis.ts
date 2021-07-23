import { chatBaseUrl } from '@app/src/app/store/apis/baseURL.apis'

const url = `${chatBaseUrl}/teamUser`

export const RECENT_ITEMS_APIS = {
  FETCH_RECENT_ITEMS: `${url}?orgId=:orgId&userId=:userId&$sort[lastUpdatedAt]=-1&$paginate=false`,
  UPDATE_TEAM_USER: `${url}?orgId=:orgId&userId=:userId&teamId=:teamId`,
}
