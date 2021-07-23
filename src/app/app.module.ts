import { NgModule, SecurityContext } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { createAnimation, IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage-angular';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { MarkdownModule, MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { startsWith } from 'lodash'
import { SafariViewController } from '@ionic-native/safari-view-controller/ngx';
import { Auth0Service } from './store/services/auth0.service'
import { OrgModule } from './+org/org.module';
import { HydrationEffects } from './hydration-store/hydration.effects';
import { OrgEffects } from './store/effects/org.effects';
import { TeamEffects } from './store/effects/team.effects';
import { UserEffects } from './store/effects/user.effects';
import { reducers, metaReducers } from './store/reducers';
import { orgReducer } from './store/reducers/org.reducer';
import { teamReducer } from './store/reducers/team.reducer';
import { userReducer } from './store/reducers/user.reducer';
import { AuthGuardService } from './store/services/auth-guard.service';
import { AuthService } from './store/services/auth.service';
import { FeathersService } from './store/services/feathers.service';
import { HttpWrapperService } from './store/services/http-wrapper.service';
import { OrgService } from './store/services/org.service';
import { UniversalSearchService } from './store/services/search.service';
import { TeamService } from './store/services/team.service';
import { UploadFileService } from './store/services/upload.service';
import { UserService } from './store/services/user.service';
import { LoginGuardService } from './store/services/login-guard.service';
import { Drivers } from '@ionic/storage';

export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer()
  const linkRenderer = renderer.link

  renderer.link = (href, title, text) => {
    const html = linkRenderer.call(renderer, href, title, text)
    if (!startsWith(href, `MENTION-`)) {
      return html.replace(
        /^<a /,
        '<a role="link" tabindex="0" target="_blank" rel="nofollow noopener noreferrer" '
      )
    } else {
      const hrefContent = `javascript:document.dispatchEvent(new CustomEvent('mentionEvent', {detail: '${href}'})); void(0)`
      return html.replace(/^<a /, `<a href="${hrefContent}"`)
    }
  }

  return {
    renderer,
    gfm: true,
    breaks: false,
    pedantic: false,
    smartLists: true,
    smartypants: false,
  }
}
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      // animated: false
      // navAnimation: (baseEle, sec) => {

      //   console.log('sec', sec)
      //   console.log('baseEle', baseEle)
        
      //   const enterAnimation = createAnimation()
      //   .fromTo('visibility', 'visible', 'visible')
      //   .fromTo('opacity', '0.9', '1')
      //   .fromTo('transform', 'translateX(60%)', 'translateX(0px)')
      //   .addElement(sec.enteringEl)
      //   // .addElement(sec.leavingEl)
      //   // .fromTo('transform', 'translateX(0)', 'translateX(-20%)')
      //   .duration(1000)
      //   .easing('ease-out')

      //   return enterAnimation;
      // }
    }),
    AppRoutingModule,
    HttpClientModule,
    OrgModule,
    NgbModule,
    IonicStorageModule.forRoot({
      name: 'SPACE chat mobile',
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
      storeName: 'space_store'

    }),
    FormsModule,
    StoreModule.forRoot(reducers, { metaReducers }),
    StoreRouterConnectingModule.forRoot(),
    StoreDevtoolsModule.instrument({
      name: 'SPACE Chat Ionic development',
      maxAge: 25,
      logOnly: environment.production,
    }),
    // EffectsModule.forRoot([]),
    EffectsModule.forRoot([HydrationEffects]),
    EffectsModule.forFeature([
      UserEffects,
      OrgEffects,
      TeamEffects,
    ]),
    StoreModule.forFeature('user', userReducer),
    StoreModule.forFeature('org', orgReducer),
    StoreModule.forFeature('team', teamReducer),
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory,
      },
      sanitize: SecurityContext.NONE,
    }),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    HttpWrapperService,
    FeathersService,
    AuthService,
    AuthGuardService,
    LoginGuardService,
    UserService,
    OrgService,
    TeamService,
    UploadFileService,
    UniversalSearchService,
    SafariViewController,
    Auth0Service

  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
