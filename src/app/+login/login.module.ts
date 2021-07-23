import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {LoginComponent} from './login';
import {LoginOrgsComponent} from './login-orgs';
import {LoginRoutingModule} from './login-routing.module';
import { OrgGuardService } from '../store/services/org-guard.service';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [LoginComponent, LoginOrgsComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // NgbModule,
    // ChatModule,
    // AvatarModule,
    // ScrollingModule,
    LoginRoutingModule
  ],
  providers: [GooglePlus, OrgGuardService],
})
export class LoginModule {}
