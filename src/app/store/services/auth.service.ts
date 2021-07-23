import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ISignInRequest, ISignInResponse, RealTimeResponse } from '../../models'
import { authBaseUrl } from '../apis/baseURL.apis'
import { FeathersService } from './feathers.service'
import { HttpWrapperService } from './http-wrapper.service'

@Injectable()
export class AuthService {
  public userOrgsDetails;
  constructor(
    private feathersService: FeathersService,
    private httpWrapperService: HttpWrapperService,
    private http: HttpClient,
  ) {}

  public signOut() {
    this.feathersService.logout()
  }

  public sendOrgDataToSocket(payload: any): Promise<RealTimeResponse<any>> {
    const url = `https://sokt.io/RqXu62HY7FwysqEuVaFy/space-space-beta-user`
    return this.httpWrapperService
      .post(url, payload, {})
      .then((res) => new RealTimeResponse<any>().success(res.body))
      .catch((err) => new RealTimeResponse<any>().error(err.error))
  }

  // public generateMagicLink(
  //   payload: IMagicLinkRequest
  // ): Promise<RealTimeResponse<IMagicLinkResponse>> {
  //   return this.feathersService
  //     .service('magic-links')
  //     .create(payload)
  //     .then(res => new RealTimeResponse<IMagicLinkResponse>().success(res))
  //     .catch(err => new RealTimeResponse<IMagicLinkResponse>().error(err));
  // }

  public authenticate(loginData: ISignInRequest) {
    return new Promise((resolve, reject) => {
      let url = `${authBaseUrl}/authentication`;
      this.http.post(url, loginData).subscribe(data => {
        this.userOrgsDetails = data;
        resolve(data);
      }, err => {
        reject(err)
      });
    })
  }

  public getUserOrgsDetails() {
    return this.userOrgsDetails;
  }}
