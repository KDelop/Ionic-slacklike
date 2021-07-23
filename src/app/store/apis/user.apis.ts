import { authBaseUrl } from './baseURL.apis'

const url = `${authBaseUrl}/users`

export const USER_APIS = {
  FETCH_USER: `${url}?getCurrentUser=true`,
  CREATE_USER: `${authBaseUrl}/invite-user`,
  UPDATE_USER: `${url}/:userId`,
  UPDATE_USER_DEVICE_ID: `${url}/deviceGroups`,
}
