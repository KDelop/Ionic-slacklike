import { Injectable, EventEmitter } from '@angular/core'
import io from 'socket.io-client'
import feathers from '@feathersjs/feathers'
import feathersSocketIOClient from '@feathersjs/socketio-client'
import feathersAuthClient from '@feathersjs/authentication-client'
import { Router } from '@angular/router'
import { environment } from '@app/src/environments/environment'
import { Subject } from 'rxjs'

const RECONNECT_LIMIT = 10
const INITIAL_DELAY = 5

/**
 * Simple wrapper for feathers
 */
@Injectable()
export class FeathersService {
  private reconnectDelay: number // in seconds
  private onAppConnected = new EventEmitter()
  private feathers = feathers() // init socket.io
  public reconnectSocketFlag = 0
  public tempAccessToken = null
  public userEmail = null
  public visibilityChange: string
  public isHidden: string
  public credentialsCache: any
  public onlineEventEmitter$ = new Subject<boolean>()
  private socket = io(environment.authServerURL, {
    transports: ['websocket'],
    forceNew: true,
    reconnectionAttempts: RECONNECT_LIMIT,
  }) // init feathers
  private isOnlineVar = true

  constructor(private router: Router) {
    this.feathers
      .configure(
        feathersSocketIOClient(this.socket, {
          timeout: 10000,
        })
      ) // add socket.io plugin
      .configure(
        feathersAuthClient({
          storage: window.localStorage,
        })
      )

    this.socket.on('connect', () => {
      console.log('Socket connected', this.feathers.io.id)
      this.isOnlineVar = true
      this.reconnectDelay = null
      this.onAppConnected.emit()
    })

    this.socket.on('disconnect', (data) => {
      console.log('Socket disconnected', data)
      this.isOnlineVar = false
    })

    this.socket.on('reconnect', (numberOfAttempts) => {
      console.log(`Socket auto reconnected after ${numberOfAttempts} attempts`)
      this.authentication()
        .then((res) => {
          console.log('reconnect authentication res', res)
        })
        .catch((err) => {
          console.log('reconnect authentication err', err)
        })
    })

    this.socket.on('reconnect_attempt', (numberOfAttempts) => {
      this.isOnlineVar = false
      if (navigator.onLine) {
        const delay = this.getTimings()
        this.socket.io.reconnectionDelay(delay)
        this.socket.io.reconnectionDelayMax(delay)
        console.log(
          `[${numberOfAttempts}] Failed to connect, will retry again in ${this.socket.io} seconds`
        )
      } else {
        this.socket.io.reconnectionAttempts(0)
      }
    })

    window.addEventListener('offline', (e) => {
      this.onlineEventEmitter$.next(false)
    })
    window.addEventListener('online', (e) => {
      this.authentication()
      this.reconnectSocket()
      this.onlineEventEmitter$.next(true)
    })
    // if (typeof document.hidden !== 'undefined') {
    //   this.isHidden = 'hidden'
    //   this.visibilityChange = 'visibilitychange'
    // } else if (typeof (document as any).msHidden !== 'undefined') {
    //   this.isHidden = 'msHidden'
    //   this.visibilityChange = 'msvisibilitychange'
    // } else if (typeof (document as any).webkitHidden !== 'undefined') {
    //   this.isHidden = 'webkitHidden'
    //   this.visibilityChange = 'webkitvisibilitychange'
    // }

    // if (this.visibilityChange) {
    //   document.addEventListener(
    //     this.visibilityChange,
    //     (event) => {
    //       this.handleVisibilityChange()
    //     },
    //     false
    //   )
    // }
  }
  // public handleVisibilityChange() {
  //   if (
  //     !document[this.isHidden] &&
  //     this.socket?.disconnected &&
  //     navigator.onLine
  //   ) {
  //     this.onlineEventEmitter$.next(true)
  //     this.authentication()
  //     this.reconnectSocket()
  //   }
  // }

  public reconnectSocket() {
    console.log('[USER] Initiated reconnect attempt')
    this.reconnectDelay = null
    this.reconnectBridge()
  }

  public getOnAppConnectedEvent() {
    return this.onAppConnected
  }

  public getisOnline(): boolean {
    if (!navigator.onLine) {
      this.reconnectSocketFlag = 0
    } else {
      if (this.reconnectSocketFlag === 0) {
        this.reconnectSocket()
        this.reconnectSocketFlag++
      }
    }
    return navigator.onLine
  }

  // expose services
  public service(name: string) {
    return this.feathers.service(name)
  }

  // expose authentication
  public authentication(credentials?): Promise<any> {
    if (!credentials && this.credentialsCache) {
      credentials = this.credentialsCache
    } else if (credentials) {
      this.credentialsCache = credentials
    }
    return new Promise((resolve: any) => {
      resolve(this.feathers.authenticate(credentials))
    })
  }
  // expose logout
  public logout() {
    return this.feathers.logout()
  }

  // Remove listeners
  public removeListeners() {
    const services = this.feathers.services

    for (const serviceName in services) {
      if (services.hasOwnProperty(serviceName)) {
        this.service(serviceName).removeAllListeners('created')
        this.service(serviceName).removeAllListeners('updated')
        this.service(serviceName).removeAllListeners('patched')
        this.service(serviceName).removeAllListeners('removed')
        // this.service(serviceName).removeAllListeners('pushNotify');
      }
    }
  }

  public disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  private reconnectBridge() {
    if (this.socket) {
      this.socket.connect()
    }
  }

  private getTimings() {
    if (!this.reconnectDelay) {
      this.reconnectDelay = INITIAL_DELAY
    } else {
      this.reconnectDelay = this.reconnectDelay * 2
    }

    // convert into ms for script
    return this.reconnectDelay * 1000
  }
}
