import { Injectable } from '@angular/core'
import { PINNED_MESSAGES_APIS } from '../apis/pinned-messages.apis'
import { RealTimeResponse, IListRootResponse } from '@app/models'
import { IMessageResponse } from '@app/src/app/models/interfaces/message.interfaces'
import { HttpWrapperService } from '@app/src/app/store/services/http-wrapper.service'

@Injectable()
export class PinnedMessagesService {
  constructor(private httpWrapperService: HttpWrapperService) {}

  public fetchPinnedMessages(
    teamId: string
  ): Promise<RealTimeResponse<IListRootResponse<IMessageResponse>>> {
    const url = PINNED_MESSAGES_APIS.FETCH_CHANNEL_PINNED_MESSAGES.replace(
      ':teamId',
      String(teamId)
    )
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
}
