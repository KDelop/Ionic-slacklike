import { IOrgResponse } from '.'

export interface ISignInRequest {
  googleAccessToken?: string
  orgRef?: string
  magicToken?: string
  otp?: string
  googleOAuth2Tokens?
  domain?: string
  newDomain?: string
  email?: string
  hash?: string
  name?: string
  whitelistedDomains?: string[]
  public?: boolean
  accessToken?: string
  strategy?: string
}

export interface ISignInResponse {
  accessToken?: string
  tempAccessToken?: string
  orgId?: string
  followedOrgs?: []
  otherOrgs?: []
  hash?: string
  org?: IOrgResponse
}

export interface IMagicLinkRequest {
  email: string
  orgRef: number
}

export interface IMagicLinkResponse {
  message: string
}
export class SignInRequest implements ISignInRequest {
  public strategy: string
  public googleAccessToken: string
  public orgRef: string
  public magicToken: string
  public otp: string
  public googleOAuth2Tokens?
  public hash: string
  public email: string
  public auth0AccessToken: string

  constructor(
    auth0AccessToken: string = null,
    googleAccessToken: string = null,
    orgId: string = null,
    magicToken: string = null,
    otp: string = null,
    googleOAuth2Tokens = null,
    hash: string = null,
    email: string = null
  ) {
    this.auth0AccessToken = auth0AccessToken
    this.strategy = 'local'
    this.googleAccessToken = googleAccessToken
    this.orgRef = orgId
    this.magicToken = magicToken
    this.otp = otp
    this.googleOAuth2Tokens = googleOAuth2Tokens
    this.hash = hash
    this.email = email
  }
}

export class SignInResponse implements ISignInResponse {
  public tempAccessToken: string
  public followedOrgs?: []
  public otherOrgs?: []
}
