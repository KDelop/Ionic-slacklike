import { Component } from '@angular/core';

import "@capacitor-community/uxcam"
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import Auth0Cordova from '@auth0/cordova';
import { Plugins, AppState } from '@capacitor/core';
import { LogEventProperty, UserProperty } from "@capacitor-community/uxcam"

const { App, UXCamPlugin } = Plugins;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      App.addListener('appUrlOpen', (data: any) => {
        Auth0Cordova.onRedirectUri(data.url);
      });
      UXCamPlugin.optIntoSchematicRecordings()
      UXCamPlugin.startWithKey('b8ib8v14vcya23t')
    });
  }
}
