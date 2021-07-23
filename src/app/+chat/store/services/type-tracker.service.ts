import { Injectable } from '@angular/core'
import {
  ITypeTrackerReq,
  ITypeTrackerRes,
  RealTimeResponse,
} from '@app/src/app/models'
import { chatBaseUrl } from '@app/src/app/store/apis/baseURL.apis'
import { HttpWrapperService } from '@app/src/app/store/services/http-wrapper.service'

const URI = `${chatBaseUrl}/typeTrackers`

@Injectable()
export class TypeTrackerService {
  constructor(private httpWrapperService: HttpWrapperService) {}

  public updateTypeTracker(
    model: ITypeTrackerReq
  ): Promise<RealTimeResponse<ITypeTrackerRes>> {
    const url = URI
    return this.httpWrapperService
      .post(url, model, {})
      .then((res: any) =>
        new RealTimeResponse<ITypeTrackerRes>().success(res.body)
      )
      .catch((e: any) => new RealTimeResponse<ITypeTrackerRes>().error(e.error))
  }
}
