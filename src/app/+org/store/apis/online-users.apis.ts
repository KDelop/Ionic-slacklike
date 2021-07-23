import { authBaseUrl } from '@app/src/app/store/apis/baseURL.apis'

const url = `${authBaseUrl}/onlineUsers`

export const ONLINE_USERS_APIS = {
  FETCH_ONLINE_USERS: `${url}?orgId=:orgId&app=chat`,
}
