import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrgGuardService } from '../store/services/org-guard.service';
import {LoginComponent} from './login';
import { LoginOrgsComponent } from './login-orgs';

// const ROUTES: Routes = [
//   { path: '', component: LoginComponent },
// ];

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'org-login',
    component: LoginOrgsComponent,
    canActivate: [OrgGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRoutingModule {}
