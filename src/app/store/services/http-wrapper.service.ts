import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Storage } from '@ionic/storage-angular';

@Injectable()
export class HttpWrapperService {

  public authToken: string;

  constructor(
    private http: HttpClient,
    private storage: Storage
  ) {
    this.storage.get('feathers-jwt').then(res => {
      this.authToken = res
    })
  }

  public resetAuthToken() {
    this.storage.get('feathers-jwt').then(res => {
      if (res) {
        this.authToken = res
      } else {
        this.authToken = window.localStorage.getItem('feathers-jwt');
      }
    })
  }

  public get = (url: string, params?: any, options?: any): Promise<any> => {
    options = this.prepareOptions(options)
    options.params = params
    return this.http.get(url, options).toPromise()
  }
  public post = (url: string, body: any, options?: any): Promise<any> => {
    options = this.prepareOptions(options)
    return this.http.post(url, body, options).toPromise()
  }
  public put = (url: string, body: any, options?: any): Promise<any> => {
    options = this.prepareOptions(options)
    return this.http.put(url, body, options).toPromise()
  }
  public delete = (url: string, params?: any, options?: any): Promise<any> => {
    options = this.prepareOptions(options)
    options.search = this.objectToParams(params)
    return this.http.delete(url, options).toPromise()
  }
  public patch = (url: string, body: any, options?: any): Promise<any> => {
    options = this.prepareOptions(options)
    return this.http.patch(url, body, options).toPromise()
  }
  private prepareOptions(options: any): Promise<any> {
    if (!this.authToken) {
      this.authToken = window.localStorage.getItem('feathers-jwt');
    }
    options = options || {}
    if (!options.headers) {
      options.headers = {} as any
    }
    if (!options.headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/json'
    }
    if (!options.headers.Authorization && this.authToken) {
      options.headers.Authorization = this.authToken
    }
    options.headers = new HttpHeaders(options.headers)
    if (!options.observe) {
      options.observe = 'response'
    }
    options.responseType = 'json'
    return options
  }

  private isPrimitive(value) {
    return (
      value == null ||
      (typeof value !== 'function' && typeof value !== 'object')
    )
  }
  private objectToParams(object = {}) {
    return Object.keys(object)
      .map((value) => {
        const objectValue = this.isPrimitive(object[value])
          ? object[value]
          : JSON.stringify(object[value])
        return `${value}=${objectValue}`
      })
      .join('&')
  }
}
