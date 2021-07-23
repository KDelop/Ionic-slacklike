import { Injectable } from '@angular/core'
import {
  RealTimeResponse,
  IListRootResponse,
  ITeamResponse,
  ITeamRequest,
  ITeamUserRequest,
  ITeamUserResponse,
} from '@app/models'
import { TEAM_APIS, TEAM_USERS_APIS } from '../apis/team.apis'
import { HttpWrapperService } from './http-wrapper.service'

@Injectable()
export class TeamService {
  constructor(private httpWrapperService: HttpWrapperService) {}

  public fetchAllTeams(
    orgId: string
  ): Promise<RealTimeResponse<ITeamResponse[]>> {
    const url = TEAM_APIS.FETCH_ALL_TEAMS.replace(':orgId', String(orgId))
    return this.httpWrapperService
      .get(url, {})
      .then((res) => new RealTimeResponse<ITeamResponse[]>().success(res.body))
      .catch((err) => new RealTimeResponse<ITeamResponse[]>().error(err.error))
  }

  public fetchTeam(teamId: string): Promise<RealTimeResponse<ITeamResponse>> {
    const url = TEAM_APIS.FETCH_TEAM.replace(':teamId', String(teamId))
    return this.httpWrapperService
      .get(url, {})
      .then((res) => new RealTimeResponse<ITeamResponse>().success(res.body))
      .catch((err) => new RealTimeResponse<ITeamResponse>().error(err.error))
  }

  public createTeam(
    model: ITeamRequest
  ): Promise<RealTimeResponse<ITeamResponse>> {
    const url = TEAM_APIS.CREATE_TEAM
    return this.httpWrapperService
      .post(url, model)
      .then((res) => new RealTimeResponse<ITeamResponse>().success(res.body))
      .catch((err) => new RealTimeResponse<ITeamResponse>().error(err.error))
  }

  public updateTeam(
    teamId: string,
    model: ITeamRequest
  ): Promise<RealTimeResponse<ITeamResponse>> {
    const url = TEAM_APIS.UPDATE_TEAM.replace(':teamId', String(teamId))
    return this.httpWrapperService
      .patch(url, model, {})
      .then((res) => new RealTimeResponse<ITeamResponse>().success(res.body))
      .catch((err) => new RealTimeResponse<ITeamResponse>().error(err.error))
  }

  public createTeamUser(
    model: ITeamUserResponse
  ): Promise<RealTimeResponse<ITeamUserResponse>> {
    const url = TEAM_USERS_APIS.CREATE_TEAM_USER
    return this.httpWrapperService
      .post(url, model, {})
      .then((res) =>
        new RealTimeResponse<ITeamUserResponse>().success(res.body)
      )
      .catch((err) =>
        new RealTimeResponse<ITeamUserResponse>().error(err.error)
      )
  }

  public deleteTeamUser(
    teamId: string,
    userId: string
  ): Promise<RealTimeResponse<ITeamUserResponse>> {
    const url = TEAM_USERS_APIS.DELETE_TEAM_USER.replace(
      ':teamId',
      String(teamId)
    ).replace(':userId', String(userId))
    return this.httpWrapperService
      .delete(url, {})
      .then((res) =>
        new RealTimeResponse<ITeamUserResponse>().success(res.body)
      )
      .catch((err) =>
        new RealTimeResponse<ITeamUserResponse>().error(err.error)
      )
  }

  public fetchTeamAttachements(
    teamId: string,
    limit: number = 0,
    skip: number = 0
  ): Promise<RealTimeResponse<any>> {
    let url = TEAM_APIS.FETCH_ATTACHEMENTS.replace(':teamId', String(teamId))

    if (skip || limit) {
      url += `&$skip=${skip}&$limit=${limit}`
    }
    return this.httpWrapperService
      .get(url, {})
      .then((res) => new RealTimeResponse<any>().success(res.body))
      .catch((err) => new RealTimeResponse<any>().error(err.error))
  }
}
