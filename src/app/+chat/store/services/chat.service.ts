import { Injectable } from '@angular/core'
import { CHAT_APIS } from '../apis/chat.apis'
import { RealTimeResponse, IListRootResponse } from '@app/models'
import { IMessageResponse } from '@app/src/app/models/interfaces/message.interfaces'
import { HttpWrapperService } from '@app/src/app/store/services/http-wrapper.service'
import { AnyARecord } from 'dns'

@Injectable()
export class ChatService {
  constructor(private httpWrapperService: HttpWrapperService) {}

  public fetchChannelChats(
    teamId: string,
    $skip?: number,
    $limit?: number
  ): Promise<RealTimeResponse<IListRootResponse<IMessageResponse>>> {
    let url = CHAT_APIS.FETCH_CHANNEL_CHAT.replace(':teamId', String(teamId))
    if ($skip) {
      url += `&$skip=${$skip}`
    }
    url += `&$limit=30`
    const query = { teamId }
    return this.httpWrapperService
      .get(url, {})
      .then((res) =>
        new RealTimeResponse<IListRootResponse<IMessageResponse>>().success(
          res.body,
          query
        )
      )
      .catch((err) =>
        new RealTimeResponse<IListRootResponse<IMessageResponse>>().error(
          err.error,
          query
        )
      )
  }

  public fetchRecentChatLastMesssage(
    orgId: string
  ): Promise<RealTimeResponse<IMessageResponse>> {
    const url = CHAT_APIS.FETCH_RECENT_CHAT_LAST_MESSAGE.replace(
      ':orgId',
      String(orgId)
    )
    return this.httpWrapperService
      .get(url, {})
      .then((res) => new RealTimeResponse<IMessageResponse>().success(res.body))
      .catch((err) => new RealTimeResponse<IMessageResponse>().error(err.error))
  }

  public fetchUnreadChatsOfUser(
    orgId: string
  ): Promise<RealTimeResponse<IMessageResponse[]>> {
    const url = CHAT_APIS.FETCH_UNREAD_CHATS.replace(':orgId', String(orgId))
    return this.httpWrapperService
      .get(url, {})
      .then((res) =>
        new RealTimeResponse<IMessageResponse[]>().success(res.body)
      )
      .catch((err) =>
        new RealTimeResponse<IMessageResponse[]>().error(err.error)
      )
  }

  public createMessage(
    model: IMessageResponse
  ): Promise<RealTimeResponse<IMessageResponse>> {
    const url = CHAT_APIS.CREATE_MESSAGE
    return this.httpWrapperService
      .post(url, model, {})
      .then((res) => new RealTimeResponse<IMessageResponse>().success(res.body))
      .catch((err) => new RealTimeResponse<IMessageResponse>().error(err.error))
  }

  public updateMessage(
    messageId: string,
    model: IMessageResponse
  ): Promise<RealTimeResponse<IMessageResponse>> {
    const url = CHAT_APIS.UPDATE_MESSAGE.replace(
      ':messageId',
      String(messageId)
    )
    return this.httpWrapperService
      .patch(url, model, {})
      .then((res) => new RealTimeResponse<IMessageResponse>().success(res.body))
      .catch((err) => new RealTimeResponse<IMessageResponse>().error(err.error))
  }

  public deleteMessage(
    messageId: string,
    model: IMessageResponse
  ): Promise<RealTimeResponse<IMessageResponse>> {
    const url = CHAT_APIS.DELETE_MESSAGE.replace(
      ':messageId',
      String(messageId)
    )
    return this.httpWrapperService
      .patch(url, model, {})
      .then((res) => new RealTimeResponse<IMessageResponse>().success(res.body))
      .catch((err) => new RealTimeResponse<IMessageResponse>().error(err.error))
  }

  public addReaction(
    reaction: any
  ): Promise<RealTimeResponse<IMessageResponse>> {
    const url = CHAT_APIS.REACT
    return this.httpWrapperService
      .post(url, reaction)
      .then((res) => new RealTimeResponse<IMessageResponse>().success(res.body))
      .catch((err) => new RealTimeResponse<IMessageResponse>().error(err.error))
  }

  public removeReaction(
    reaction: any
  ): Promise<RealTimeResponse<IMessageResponse>> {
    const url = CHAT_APIS.REACT
    return this.httpWrapperService
      .patch(url, reaction, {})
      .then((res) => new RealTimeResponse<IMessageResponse>().success(res.body))
      .catch((err) => new RealTimeResponse<IMessageResponse>().error(err.error))
  }

  public startCallSession(model: any): Promise<RealTimeResponse<any>> {
    const url = CHAT_APIS.CALL_SESSION
    return this.httpWrapperService
      .post(url, model, {})
      .then((res) => new RealTimeResponse<any>().success(res.body))
      .catch((err) => new RealTimeResponse<any>().error(err.error))
  }

  public fetchThreads(
    teamId: string,
    threadId: string,
    $skip?: number,
    $limit?: number
  ): Promise<RealTimeResponse<IListRootResponse<IMessageResponse>>> {
    let url = CHAT_APIS.FETCH_THREADS.replace(
      ':teamId',
      String(teamId)
    ).replace(':threadId', String(threadId))
    if ($skip) {
      url += `&$skip=${$skip}`
    }
    url += `&$limit=30`
    const query = { threadId, teamId }
    return this.httpWrapperService
      .get(url, {})
      .then((res) =>
        new RealTimeResponse<IListRootResponse<IMessageResponse>>().success(
          res.body,
          query
        )
      )
      .catch((err) =>
        new RealTimeResponse<IListRootResponse<IMessageResponse>>().error(
          err.error,
          query
        )
      )
  }
}
