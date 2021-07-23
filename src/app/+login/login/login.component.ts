import {
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core'
import { ReplaySubject } from 'rxjs'
import { AlertController, NavController, MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { Auth0Service } from '../../store/services/auth0.service';
import { setActiveOrgId } from '../../store/actions/org.actions';
import { Store } from '@ngrx/store';
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1)
  public rootPage: any;
  public userLoginCheck: any;
  constructor(
    private _alertController: AlertController,
    private _storage: Storage,
    private _navController: NavController,
    public _menuController: MenuController,
    public auth: Auth0Service,
    private store: Store
  ) { }

  ngOnInit() {
    /* this._storage.set('activeOrg', {
      id: 1,
      name: 'Walkover',
      domain: 'walkover',
      updatedBy: 2,
      whitelistedDomains: [
          'walkover.in',
          'msg91.com',
          'giddh.com',
          'muneem.co',
          'dotsale.in',
          'bingage.com',
          'bingage.in',
          'hostnsoft.com'
      ],
      public: false,
      guestSettings: {
          canJoinTeams: false,
          hideProfile: false
      },
      customEmojis: null,
      createdAt: '2018-06-26T04:53:41.340Z',
      updatedAt: '2020-07-28T09:17:34.140Z',
    }); */
     //this._storage.set('accessToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJ1c2VySWQiOjIsImlhdCI6MTYwMjQ5MTc5MCwiZXhwIjoxNjAyNTc4MTkwLCJhdWQiOiJodHRwczovL3lvdXJkb21haW4uY29tIiwiaXNzIjoiZmVhdGhlcnMiLCJzdWIiOiJhbm9ueW1vdXMiLCJqdGkiOiI5YmYzZGE2NS1iZTNjLTQ4MGQtYjNhMy0yZWRiZDYzZWRmMTcifQ.B1FuUendAQNyYtgh_8-1pRWsx8H6kYiEVTBptcESCXM');
    // this._storage.set('accessToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJ1c2VySWQiOjI5MCwiaWF0IjoxNjAzMDg1MDIwLCJleHAiOjE2MDMxNzE0MjAsImF1ZCI6Imh0dHBzOi8veW91cmRvbWFpbi5jb20iLCJpc3MiOiJmZWF0aGVycyIsInN1YiI6ImFub255bW91cyIsImp0aSI6ImRkNmYwNzY3LTkzY2MtNDhhMy1iMDhkLTYyNzRmZDYwZTVlZSJ9.XbndQIMDfpmX5SzZPImSfzhXZEF2QiRQS85b1bbqVy4');

    // this._storage.set('feathers-jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJ1c2VySWQiOjk3LCJpYXQiOjE2MTM4NTg1NjEsImV4cCI6MTYxMzk0NDk2MSwiYXVkIjoiaHR0cHM6Ly95b3VyZG9tYWluLmNvbSIsImlzcyI6ImZlYXRoZXJzIiwic3ViIjoiYW5vbnltb3VzIiwianRpIjoiYmMyMjQ5ZDAtYTk3Mi00YTJiLWE4OWMtZTkxOWJhMmU0ZDRlIn0.SoyXRwye-WfQrYzSIX-XFkJuabDUvj8gyJ0nnq8IKJU');
    // this._storage.set('feathers-jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJlbWFpbCI6ImFyaXNoQHdhbGtvdmVyLmluIiwiaWF0IjoxNjIwOTAxNzMxLCJleHAiOjE2NTI0NTkzMzEsImF1ZCI6Imh0dHBzOi8veW91cmRvbWFpbi5jb20iLCJpc3MiOiJmZWF0aGVycyIsInN1YiI6IllyWmZoTXJPU3dqOTNlWUsiLCJqdGkiOiIyZGNlYWZjYy1kMzc5LTQ2YzQtYjczNC02MTFlMGRiOTA3NjcifQ.G7lNYlAbv4NA1BuGB0txaMlzHhEh9ikrzdnN8D4jB50');
    // this.store.dispatch(setActiveOrgId({orgId: 'egynb02e9apqy6076v4c'}));
    // window.localStorage.setItem('feathers-jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJ1c2VySWQiOjk3LCJpYXQiOjE2MTI0NTg2MTYsImV4cCI6MTYxMjU0NTAxNiwiYXVkIjoiaHR0cHM6Ly95b3VyZG9tYWluLmNvbSIsImlzcyI6ImZlYXRoZXJzIiwic3ViIjoiYW5vbnltb3VzIiwianRpIjoiNTUzODc2ZmUtNGFjYy00NTJkLTk5N2YtNzg2MjJmNjg5ZjFiIn0.BRrnbPe8cEHanrkwMGACrpubiFhAyII74Cqtyk2kxkw');
    // this._storage.set('feathers-jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6ImFjY2VzcyJ9.eyJlbWFpbCI6ImFyaXNoQHdhbGtvdmVyLmluIiwiaWF0IjoxNjIzMzA3MDc3LCJleHAiOjE2NTQ4NjQ2NzcsImF1ZCI6Imh0dHBzOi8veW91cmRvbWFpbi5jb20iLCJpc3MiOiJmZWF0aGVycyIsInN1YiI6Ik4zWFFQcGxFWllqYWkzVHUiLCJqdGkiOiI2OGM3MTVkYy03NjU5LTRkYmUtOWEwMS04ZDZmZmM1YTE5ZmUifQ.1BKXOCF0J8ZCJxNMYsWLCZ5U-ZnP6XHBJZ9YFA-uspo');
    // this.store.dispatch(setActiveOrgId({orgId: '5zvduevwhn1w7zdv2bd3'}));

    this._menuController.enable(false, 'sidebar');
    this._storage.get('feathers-jwt').then(token => {
      if (token) {
        this._navController.navigateRoot(['org']);
      }
    });
  }

  public reLogin() {
    this.auth.logout();
  }

  async showErrorAlert(err, googleLoginRes) {
    const alert = await this._alertController.create({
      header: 'Oops!',
      subHeader: 'Something is wrong!',
      message: 'It seems like something went wrong, please try again later.',
      buttons: ['OK']
    });
    await alert.present();
  }

  public ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}
