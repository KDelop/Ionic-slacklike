import { Injectable } from '@angular/core'
import { USER_APIS } from '../apis/user.apis'
import {
  RealTimeResponse,
  IListRootResponse,
  IProfileResponse,
  IProfileRequest,
  IUserRoleRequest,
  IInviteUserRequest,
} from '@app/models'
import { HttpWrapperService } from './http-wrapper.service'

@Injectable()
export class UserService {
  constructor(private httpWrapperService: HttpWrapperService) {}

  public fetchUser(): Promise<RealTimeResponse<IProfileResponse>> {
    const url = USER_APIS.FETCH_USER
    return this.httpWrapperService
      .get(url, {})
      .then((res) => new RealTimeResponse<IProfileResponse>().success(res.body))
      .catch((err) => new RealTimeResponse<IProfileResponse>().error(err.error))
  }

  // update user
  public updateUser(
    userId,
    profile: IProfileRequest | IUserRoleRequest
  ): Promise<RealTimeResponse<IProfileResponse>> {
    const url = USER_APIS.UPDATE_USER.replace(':userId', String(userId))
    return this.httpWrapperService
      .patch(url, profile, {})
      .then((res) => new RealTimeResponse<IProfileResponse>().success(res.body))
      .catch((err) => new RealTimeResponse<IProfileResponse>().error(err.error))
  }

  // invite user to org
  public createUser(
    model: IInviteUserRequest
  ): Promise<RealTimeResponse<IProfileResponse>> {
    const url = USER_APIS.CREATE_USER
    return this.httpWrapperService
      .post(url, model, {})
      .then((res) => new RealTimeResponse<IProfileResponse>().success(res.body))
      .catch((err) => new RealTimeResponse<IProfileResponse>().error(err.error))
  }
  public addDeviceToken(deviceId) {
    const url = USER_APIS.UPDATE_USER_DEVICE_ID
    const payload = {
      deviceId: {
        chat: deviceId,
      },
    }

    return this.httpWrapperService
      .post(url, payload, {})
      .then((res) => new RealTimeResponse<any>().success(res.body))
      .catch((err) => new RealTimeResponse<any>().error(err.error))
  }
}
