import { Injectable } from '@angular/core'
import {
  IListRootResponse,
  ITeamUserResponse,
  RealTimeResponse,
} from '@app/models'
import { DRAFT_HISTORY_APIS } from '../apis/draft-history.apis'
import { HttpWrapperService } from '@app/src/app/store/services/http-wrapper.service'

@Injectable()
export class DraftHistoryService {
  constructor(private httpWrapperService: HttpWrapperService) {
    //
  }

  public fetchDraftHistory(orgId: string, userId: string) {
    const url = DRAFT_HISTORY_APIS.FETCH_DRAFT_HISTORY.replace(
      ':orgId',
      String(orgId)
    ).replace(':userId', String(userId))
    return this.httpWrapperService
      .get(url, {})
      .then((res) =>
        new RealTimeResponse<IListRootResponse<ITeamUserResponse>>().success(
          res.body
        )
      )
      .catch((err) =>
        new RealTimeResponse<IListRootResponse<ITeamUserResponse>>().error(
          err.error
        )
      )
  }

  public upsertDraftHistory(
    orgId: string,
    userId: string,
    teamId: string,
    model: ITeamUserResponse
  ) {
    const url = DRAFT_HISTORY_APIS.UPDATE_TEAM_USER.replace(
      ':orgId',
      String(orgId)
    )
      .replace(':userId', String(userId))
      .replace(':teamId', String(teamId))
    model = { ...model, eventType: 'DraftHistoryUpdate' }
    return this.httpWrapperService
      .patch(url, model, {})
      .then((res) =>
        new RealTimeResponse<ITeamUserResponse>().success(res.body)
      )
      .catch((err) =>
        new RealTimeResponse<ITeamUserResponse>().error(err.error)
      )
  }
}
