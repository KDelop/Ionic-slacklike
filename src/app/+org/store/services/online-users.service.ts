import { Injectable } from '@angular/core'
import {
  IListRootResponse,
  IProfileResponse,
  RealTimeResponse,
} from '@app/models'
import { ONLINE_USERS_APIS } from '../apis/online-users.apis'
import { HttpWrapperService } from '@app/src/app/store/services/http-wrapper.service'

@Injectable()
export class OnlineUsersService {
  constructor(private httpWrapperService: HttpWrapperService) {
    //
  }

  public fetchOnlineUsers(orgId: string) {
    const url = ONLINE_USERS_APIS.FETCH_ONLINE_USERS.replace(
      ':orgId',
      String(orgId)
    )
    return this.httpWrapperService
      .get(url, {})
      .then((res) => new RealTimeResponse<any[]>().success(res.body))
      .catch((err) => new RealTimeResponse<any[]>().error(err.error))
  }
}
