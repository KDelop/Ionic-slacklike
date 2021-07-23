import { Component, ElementRef, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { IOrgResponse, IProfileResponse } from '@app/models';
import { Auth0Service } from '../../store/services/auth0.service';
// import { selectActiveOrg } from '../../store/reducers';
import { selectCurrentUser } from '../../store/selectors/user.selectors';
import { selectActiveOrg, selectActiveOrgId, selectOrgList } from '../../store/selectors/org.selectors';
import { Router } from '@angular/router';
import { LOGOUT } from '../../store/reducers';
import { setActiveOrgId } from '../../store/actions/org.actions';
import { LoadingController, ModalController } from '@ionic/angular';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  public activeOrg: IOrgResponse;
  public orgList: IOrgResponse[];
  public currentUser: IProfileResponse;
  public loading;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  constructor(
    private _store: Store,
    private auth0Service: Auth0Service,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private elementRef: ElementRef
  ) {
  }

  public ionViewDidEnter() {
    console.log('sidebar ionViewDidEnter');
  }
  public ionViewWillEnter() {
    console.log('sidebar ionViewWillEnter');
  }

  ngOnInit() {
    this._store
      .pipe(select(selectActiveOrg), takeUntil(this.destroyed$))
      .subscribe((org) => {
        this.activeOrg = org;
      });

    this._store
      .pipe(select(selectOrgList), takeUntil(this.destroyed$))
      .subscribe((orgs) => {
        this.orgList = orgs;
      });

    this._store
      .pipe(select(selectCurrentUser), takeUntil(this.destroyed$))
      .subscribe((user) => {
        this.currentUser = user;
      });

    // this._store
    //   .pipe(select(selectActiveOrgId), takeUntil(this.destroyed$))
    //   .subscribe((orgId) => {

    //     console.log('%c sidebar orgId' + orgId, 'background: yellowgreen');
    //   });

      // console.log('sidebar ngOnInit');
  }

  public switchOrg(id) {
    // this._store.dispatch(LOGOUT())
    console.log('switchOrg id', id)
    this.presentLoading();
    this._store.dispatch(setActiveOrgId({orgId: id, isOrgSwitched: true}));

    setTimeout(() => {
      this.loading.dismiss();
      window.location.reload();
    }, 1000);
    // window.localStorage.setItem('activeOrgId', id)

    // this.router.navigate(['login'])
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Switching org...',
    });
    await this.loading.present();
  }

  public async openEditProfile() {

    const modal = await this.modalController.create({
      component: EditProfileComponent,
      swipeToClose: true,
      presentingElement: this.elementRef.nativeElement.parentElement,
      backdropDismiss: true
    })
    await modal.present();

  }

  public ngOnDestroy() {
    console.log('ngOnDestroy');
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public async logout() {
    this.auth0Service.logout();
  }
}
