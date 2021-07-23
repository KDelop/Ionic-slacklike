import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ISignInResponse } from 'src/app/models';

@Injectable({
  providedIn: 'root'
})
export class OrgGuardService implements CanActivate {

  constructor(
    public _router: Router,
    public _authService: AuthService
  ) { }

  canActivate(): boolean {
    const orgDetails: ISignInResponse = this._authService.getUserOrgsDetails()
    if (orgDetails) {
      return true;
    } else {
      this._router.navigateByUrl('login');
      return false;
    }
  }

}
