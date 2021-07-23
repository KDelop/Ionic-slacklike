import { chatBaseUrl } from '@app/src/app/store/apis/baseURL.apis'

const url = `${chatBaseUrl}/teamUser`

export const DRAFT_HISTORY_APIS = {
  FETCH_DRAFT_HISTORY: `${url}?userId=:userId&orgId=:orgId&draftMessage[$ne]=null`,
  UPDATE_TEAM_USER: `${url}?orgId=:orgId&userId=:userId&teamId=:teamId`,
}
