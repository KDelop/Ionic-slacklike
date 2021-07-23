import { Injectable } from '@angular/core'
import { ORG_APIS } from '../apis/org.apis'
import {
  RealTimeResponse,
  IListRootResponse,
  IOrgResponse,
  IOrgUpdateRequest,
} from '@app/models'
import { HttpWrapperService } from './http-wrapper.service'

@Injectable()
export class OrgService {
  constructor(private httpWrapperService: HttpWrapperService) {}

  public fetchOrgDetails(
    orgId: string
  ): Promise<RealTimeResponse<IListRootResponse<IOrgResponse> | any>> {
    const url = ORG_APIS.FETCH_ORG.replace(':orgId', String(orgId))
    return this.httpWrapperService
      .get(url, {})
      .then((res: any) =>
        new RealTimeResponse<IListRootResponse<IOrgResponse>>().success(
          res.body
        )
      )
      .catch((e: any) => new RealTimeResponse<any>().error(e.error))
  }

  public fetchUserOrgs(): Promise<RealTimeResponse<any> | any> {
    const url = ORG_APIS.FETCH_USER_ORGS
    return this.httpWrapperService
      .get(url, {})
      .then((res: any) => new RealTimeResponse<any>().success(res.body))
      .catch((e: any) => new RealTimeResponse<any>().error(e.error))
  }

  public createOrg(
    model: IOrgUpdateRequest
  ): Promise<RealTimeResponse<IOrgResponse | any>> {
    const url = ORG_APIS.CREATE_ORG
    return this.httpWrapperService
      .post(url, model, {})
      .then((res: any) =>
        new RealTimeResponse<IOrgResponse>().success(res.body)
      )
      .catch((e: any) => new RealTimeResponse<any>().error(e.error))
  }

  public updateOrg(
    orgId: string,
    model: IOrgUpdateRequest
  ): Promise<RealTimeResponse<IOrgResponse | any>> {
    const url = ORG_APIS.UPDATE_ORG.replace(':orgId', String(orgId))
    return this.httpWrapperService
      .patch(url, model, {})
      .then((res: any) =>
        new RealTimeResponse<IOrgResponse>().success(res.body)
      )
      .catch((e: any) => new RealTimeResponse<any>().error(e.error))
  }
}
