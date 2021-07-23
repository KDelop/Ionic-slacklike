import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './+login/login';
import { AuthGuardService } from './store/services/auth-guard.service';
import { LoginGuardService } from './store/services/login-guard.service';

const routes: Routes = [
  // {
  //   path: 'login',
  //   component: LoginComponent
  // },

  {
    path: 'login',
    loadChildren: () => import('./+login/login.module').then( m => m.LoginModule),
    canActivate: [LoginGuardService]
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule),
    canActivate: [AuthGuardService]
  },
  {
    path: 'org',
    loadChildren: () => import('./+org/org.module').then( m => m.OrgModule),
    canActivate: [AuthGuardService]
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled',
    urlUpdateStrategy: 'eager',
    relativeLinkResolution: 'legacy'
})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
