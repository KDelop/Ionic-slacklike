import { chatBaseUrl } from '@app/src/app/store/apis/baseURL.apis'

const msgUrl = `${chatBaseUrl}/message`

export const CHAT_APIS = {
  FETCH_CHANNEL_CHAT: `${msgUrl}?teamId=:teamId&deleted=false`,
  FETCH_UNREAD_CHATS: `${msgUrl}?onlyUnread=true&orgId=:orgId`,
  FETCH_THREADS: `${msgUrl}?teamId=:teamId&threadId=:threadId&deleted=false`,
  FETCH_RECENT_CHAT_LAST_MESSAGE: `${chatBaseUrl}/teamUser?orgId=:orgId&getMessage=true`,
  CREATE_MESSAGE: `${msgUrl}`,
  UPDATE_MESSAGE: `${msgUrl}/:messageId`,
  DELETE_MESSAGE: `${msgUrl}/:messageId`,
  REACT: `${chatBaseUrl}/reactions`,
  CALL_SESSION: `${chatBaseUrl}/sessions`,
}
