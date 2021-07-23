import { Injectable } from '@angular/core'
import {
  IRecentItems,
  TabType,
} from '@app/models/interfaces/recent-items.interface'
import {
  IListRootResponse,
  ITeamUserResponse,
  RealTimeResponse,
} from '@app/models'
import { RECENT_ITEMS_APIS } from '../apis/recent-items.apis'
import { HttpWrapperService } from '@app/src/app/store/services/http-wrapper.service'

@Injectable()
export class RecentItemsService {
  constructor(private httpWrapperService: HttpWrapperService) {
    //
  }

  public fetchRecentItems(orgId: string, userId: string) {
    const url = RECENT_ITEMS_APIS.FETCH_RECENT_ITEMS.replace(
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

  public updateRecentItems(
    orgId: string,
    userId: string,
    teamId: string,
    model: ITeamUserResponse
  ) {
    const url = RECENT_ITEMS_APIS.UPDATE_TEAM_USER.replace(
      ':orgId',
      String(orgId)
    )
      .replace(':userId', String(userId))
      .replace(':teamId', String(teamId))
    return this.httpWrapperService
      .patch(url, model, {})
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

  public removeRecentItems(
    orgId: string,
    userId: string,
    teamId: string,
    model: ITeamUserResponse
  ) {
    const url = RECENT_ITEMS_APIS.UPDATE_TEAM_USER.replace(
      ':orgId',
      String(orgId)
    )
      .replace(':userId', String(userId))
      .replace(':teamId', String(teamId))
    return this.httpWrapperService
      .patch(url, model, {})
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
}
