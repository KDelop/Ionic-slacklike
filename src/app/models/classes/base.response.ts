import {
  HttpResponseBase,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http'

export class BaseResponse<TResponce, TRequest> {
  public status: string
  public code?: string
  public message?: string
  public body?: TResponce
  public error?: IError
  public response?: TResponce
  public request?: TRequest
  public queryString?: any
  public statusText?: string

  constructor(res: HttpResponseBase, req: TRequest, queryString: any) {
    if (res.status === 200 || 201) {
      const response = res as HttpResponse<any>
      this.status = '200'
      this.response = response.body as TResponce
      this.body = response.body as TResponce
      this.request = req
      this.queryString = queryString
      this.statusText = response.statusText
    } else {
      const response = res as HttpErrorResponse
      this.status = response.status.toString()
      this.request = req
      this.queryString = queryString
      this.error = response.error as IError
      this.statusText = res.statusText
    }
  }
}

export interface IError {
  error?: string
  success?: boolean
  error_type?: string
  errors?: any
}
