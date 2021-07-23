import { Component, OnInit } from '@angular/core';
import {
  LoadingController,
  NavController,
  AlertController,
  MenuController,
} from '@ionic/angular';
import { IOrgDetails, ISignInResponse, IOrgResponse, ISignInRequest } from '@app/models';
import { Storage } from '@ionic/storage-angular';
import { AuthService } from '../../store/services/auth.service';
import { Store } from '@ngrx/store';
import { setActiveOrgId } from '../../store/actions/org.actions';
// import { Store } from '@ngrx/store';
// import { loadAllTeams } from 'src/app/+teams/store/actions/team.actions';
// import { loadOrg } from 'src/app/+org/store/actions/org.actions';
// import { loadUser } from 'src/app/+org/store/actions/user.actions';

@Component({
  selector: 'app-login-orgs',
  templateUrl: './login-orgs.component.html',
  styleUrls: ['./login-orgs.component.scss'],
})
export class LoginOrgsComponent implements OnInit {
  public workspaceURI: string;
  public validateError = '';
  public followedOrgs: IOrgDetails[];
  public otherOrgs: IOrgDetails[];
  public userOrgsDetails: ISignInResponse;
  public loading: boolean = false;

  constructor(
    public loadingController: LoadingController,
    private _authService: AuthService,
    private _storage: Storage,
    private _navController: NavController,
    private _alertController: AlertController,
    public _menuController: MenuController,
    private store: Store
    // private _store: Store
  ) {}

  ngOnInit() {
    this._menuController.enable(false, 'sidebar');
    this.userOrgsDetails = this._authService.getUserOrgsDetails();
    this.followedOrgs = this.userOrgsDetails.followedOrgs;
    this.otherOrgs = this.userOrgsDetails.otherOrgs;
  }

  public loginToOrg(org: IOrgResponse) {
    this.loading = true;
    const orgLoginData: ISignInRequest = {
      accessToken: this.userOrgsDetails.accessToken,
      strategy: 'jwt',
      domain: org.domain,
    };
    this._authService
      .authenticate(orgLoginData)
      .then((res: ISignInResponse) => {
        if (res && res.accessToken) {
          // this._storage.set('activeOrgId', org.id).then((activeOrg) => {
            this.store.dispatch(setActiveOrgId({orgId: org.id}));
            this._storage.set('feathers-jwt', res.accessToken).then((res) => {
              // this._store.dispatch(loadUser());
              // this._store.dispatch(loadOrg({ orgId: org.id }));
              // this._store.dispatch(loadAllTeams({ orgId: org.id }));
              this.loading = false;
              this._menuController.enable(true, 'sidebar');
              this._navController.navigateRoot(['org']);
            });
          // });
        }
      })
      .catch((err) => {
        this.loading = false;
        this.showErrorAlert();
      });
  }

  async showErrorAlert() {
    const alert = await this._alertController.create({
      header: 'Oops!',
      subHeader: 'Something is wrong!',
      message: 'It seems like something went wrong, please try again later.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}
