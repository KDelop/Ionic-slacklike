import { chatBaseUrl } from '@app/src/app/store/apis/baseURL.apis'

const msgUrl = `${chatBaseUrl}/message`

export const PINNED_MESSAGES_APIS = {
  FETCH_CHANNEL_PINNED_MESSAGES: `${msgUrl}?teamId=:teamId&isPinned=true`,
}
