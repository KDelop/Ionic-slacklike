// src/app/services/auth.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { SafariViewController } from '@ionic-native/safari-view-controller/ngx';

// Import AUTH_CONFIG, Auth0Cordova, and auth0.js
import { AUTH_CONFIG } from './auth.config';
import Auth0Cordova from '@auth0/cordova';
// import * as auth0 from 'auth0-js';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { SignInRequest } from '../../models';
import { Store } from '@ngrx/store';
import { FeathersService } from './feathers.service';
import { HttpWrapperService } from './http-wrapper.service';
import { clearState } from '../actions/org.actions';

declare let cordova: any;

@Injectable()
export class Auth0Service {
  // Auth0 = new auth0.WebAuth(AUTH_CONFIG);
  Client = new Auth0Cordova(AUTH_CONFIG);
  accessToken: string;
  user: any;
  loggedIn: boolean;
  loading = true;
  private webWorker;

  constructor(
    public zone: NgZone,
    private storage: Storage,
    private safariViewController: SafariViewController,
    private _authService: AuthService,
    private _router: Router,
    private _alertController: AlertController,

    // private _storage: Storage,
    private _navController: NavController,
    private _store: Store,
    private _feathersService: FeathersService,
    private httpWrapperService: HttpWrapperService,
    private modalController: ModalController
  ) {
    this.webWorker = new Worker('../../../assets/worker.js')
    this.storage.get('expires_at').then(exp => {
      this.loggedIn = Date.now() < JSON.parse(exp);
      this.loading = false;
    });
  }

  login() {
    this.loading = true;
    const options = {
      scope: 'email openid profile'
    };
    // Authorize login request with Auth0: open login page and get auth results
    this.Client.authorize(options, (err, authResult) => {
      if (err) {
        this.zone.run(() => this.loading = false);
        throw err;
      }
      this.accessToken = authResult.accessToken;
      // Set access token expiration
      const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
      this.storage.set('expires_at', expiresAt);
      // Set logged in
      if (authResult) {
        const loginData = new SignInRequest(authResult.accessToken);
        this._authService.authenticate(loginData).then(res => {
          if (res) {
            this.zone.run(() => {
              this._router.navigate(['login', 'org-login']);
            })
          }
        }).catch(err => {
          this.showErrorAlert();
        });
      }
      this.loading = false;
      this.loggedIn = true;
    });
  }

  async showErrorAlert() {
    const alert = await this._alertController.create({
      header: 'Oops!',
      subHeader: 'Something is wrong!',
      message: 'It seems like something went wrong, please try again later.',
      buttons: ['OK']
    });
    await alert.present();
  }

  logout() {
      this.accessToken = null;
      this.user = null;
      this.loggedIn = false;
      this.safariViewController.isAvailable()
        .then((available: boolean) => {
          const domain = AUTH_CONFIG.domain;
          const clientId = AUTH_CONFIG.clientId;
          const pkgId = AUTH_CONFIG.packageIdentifier;
          const url = `https://${domain}/v2/logout?client_id=${clientId}&returnTo=${pkgId}://${domain}/cordova/${pkgId}/callback`;

          if (available) {
            this.safariViewController.show({ url })
            .subscribe((result: any) => {
                if(result.event === 'opened') console.log('Opened');
                else if(result.event === 'closed') console.log('Closed');
                if (result.event === 'loaded') {
                  this.safariViewController.hide();
                  this.modalController.dismiss();
                  this._store.dispatch(clearState());
                  this.webWorker.postMessage('remove');
                  window.localStorage.removeItem('feathers-jwt')
                  this.storage.clear();
                  this.httpWrapperService.resetAuthToken();
                  this.storage.remove('feathers-jwt').then((res) => {
                    this._feathersService.logout().then(() => {
                      this._navController.navigateRoot(['login']);
                    });
                  });
                }
              },
              (error: any) => console.error(error)
            );
          } else {
            // use fallback browser
            cordova.InAppBrowser.open(url, '_system');
          }
        }
      );
    }
}