import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private storage: Storage,
    private _navController: NavController
  ) { }
  canActivate(): Promise<boolean> {
    return this.storage.get('feathers-jwt').then((token: string) => {
      if (token) {
        return true;
      }
      this._navController.navigateRoot(['login']);
      return false;
    })
  }

}
