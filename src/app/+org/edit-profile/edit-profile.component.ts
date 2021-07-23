import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AnimationController, ModalController, NavController, ToastController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IProfileResponse } from '../../models';
import {
  Plugins
} from '@capacitor/core';
import { updateUser } from '../../store/actions/user.actions';
import { selectCurrentUser } from '../../store/selectors/user.selectors';
import { Auth0Service } from '../../store/services/auth0.service';
const { Keyboard } = Plugins;


@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {

  @ViewChild('footer') public footer: any;

  public user: IProfileResponse;
  public userUpdate: IProfileResponse;
  public profileInfoChanged: boolean = false;

  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1)

  constructor(
    private store: Store,
    private navController: NavController,
    private animationCtrl: AnimationController,
    private cdRef: ChangeDetectorRef,
    private toastController: ToastController,
    public auth: Auth0Service,
    private modalController: ModalController
  ) {}

  ionViewWillEnter() {
    window.dispatchEvent(new Event('resize')); //temporary virtual scroll fix
  }

  ngOnInit() {
    this.store.pipe(select(selectCurrentUser), takeUntil(this.destroyed$)).subscribe(user => {
      this.user = user;
      this.userUpdate = { ...user };
    })
  }

  public checkChanges() {
    if (
      this.userUpdate.firstName === this.user.firstName &&
      this.userUpdate.lastName === this.user.lastName &&
      this.userUpdate.username === this.user.username &&
      this.userUpdate.mobileNumber === this.user.mobileNumber &&
      this.userUpdate.jobRole === this.user.jobRole
    ) {
      this.hideFooter();
    } else {
      this.showFooter();
    }
  }

  public updateProfile() {
    if (
      !this.userUpdate.firstName.length ||
      !this.userUpdate.lastName ||
      !this.userUpdate.username
    ) {
      this.toastController.create({
        message: 'Firstname, lastname and username are mandatory fields.',
        duration: 2000
      })
      .then(toast => {
        toast.present();
      })
      return;
    }
    const model = {
      firstName: this.userUpdate.firstName,
      lastName: this.userUpdate.lastName,
      username: this.userUpdate.username,
      mobileNumber: this.userUpdate.mobileNumber,
      jobRole: this.userUpdate.jobRole,
      email: this.userUpdate.email,
    }
    Keyboard.hide();
    this.store.dispatch(
      updateUser({
        userId: this.userUpdate.id,
        model: model,
      })
    )
    this.hideFooter();
  }


  public navigateToItem(item) {
    this.navController.navigateForward(['org', 'chat', item.id]);
  }

  public closeModal() {
    this.modalController.dismiss();
  }

  public signout() {
    this.auth.logout();
  }

  public ngOnDestroy() {
    this.destroyed$.next(true)
    this.destroyed$.complete()
  }

  private hideFooter() {
    if (this.profileInfoChanged) {
      if (this.footer?.el) {
        // if (!this.cdRef['destroyed']) {
        //   this.cdRef.detectChanges();
        // }
        const leaveAnimation = this.animationCtrl.create()
        .duration(200)
        .easing('ease-out')
        .addElement(this.footer.el)
        .fromTo('height', '48px', '0')
        leaveAnimation.play().then(() => {
          this.profileInfoChanged = false;
        })
      }
    }
  }

  private showFooter() {
    if (!this.profileInfoChanged) {
      this.profileInfoChanged = true;
      if (!this.cdRef['destroyed']) {
        this.cdRef.detectChanges();
      }
      if (this.footer) {
        const enterAnimation = this.animationCtrl.create()
        .duration(200)
        .easing('ease-in')
        .addElement(this.footer.el)
        .to('height', '48px')
        enterAnimation.play()
      }
    }
  }

}
