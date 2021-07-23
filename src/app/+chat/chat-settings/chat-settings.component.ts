import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core'
import { Router } from '@angular/router'
import { Store } from '@ngrx/store'
import {
  IProfileResponse,
  ITeamResponse,
  ITeamUserResponse,
} from '../../models'
import { MediaType } from '../../models/interfaces/message.interfaces'
import { v4 as uuidv4 } from 'uuid'
import { IonContent, ModalController } from '@ionic/angular'
import { ForwardListComponent } from '../../+org/forward-list/forward-list.component'
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx'
import { createTeam, createTeamUser, deleteTeamUser } from '../../store/actions/team.actions'
import { LocalService } from '../../store/services/local.service'
import { TeamService } from '../../store/services/team.service'

@Component({
  selector: 'app-chat-settings',
  templateUrl: './chat-settings.component.html',
  styleUrls: ['./chat-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatSettingsComponent implements OnInit {
  constructor(
    private teamService: TeamService,
    private store: Store,
    private router: Router,
    private localService: LocalService,
    private modalController: ModalController,
    private photoViewer: PhotoViewer,
    private elementRef: ElementRef,
    private cdRef: ChangeDetectorRef
  ) {}

  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild('attachmentHeader') attachmentHeader: ElementRef;

  @Input() userInfo: IProfileResponse
  @Input() currentUser: IProfileResponse
  @Input() public activeChat: ITeamResponse
  @Input() public personalTeam: ITeamResponse
  @Input() public userEntities: { [id: number]: IProfileResponse }
  @Input() public selectedUserId: string
  @Input() public DMTeamEntities: { [userId: number]: number }
  @Input() public activeOrgId: string
  @Input() public onlineUsers?: { [id: string]: string }


  public userInfoUpdate: IProfileResponse
  public selectedUser: IProfileResponse
  public sharedFiles: [] = []
  public noAttachements = false
  public attachments = []
  public isLoadingAttachments: boolean
  public imageUrl: string

  public ngOnInit(): void {
    this.userInfoUpdate = { ...this.userInfo }
    if (this.selectedUserId) {
      this.userInfo = this.userEntities[this.selectedUserId]
      if (this.selectedUserId === this.currentUser.id) {
        this.userInfoUpdate = { ...this.userInfo }
      }
    }
    this.prepareImage();
  }

  public prepareImage() {
    if (this.userInfo?.avatar) {
      if (this.userInfo?.avatar.includes('=s96-c')) {
        this.imageUrl = this.userInfo?.avatar.replace('=s96-c', '')
      } else if (this.userInfo?.avatar.includes('?sz=50')) {
        this.imageUrl = this.userInfo?.avatar.replace('?sz=50', '')
      } else {
        this.imageUrl = this.userInfo?.avatar.replace('/s96-c', '')
      }
    }
  }

  public goToDMTeam(user) {
    const orgId = this.activeOrgId
    if (user.id !== this.currentUser?.id) {
      if (this.DMTeamEntities[user.id]) {
        this.router.navigateByUrl(
          `org/chat/${this.DMTeamEntities[user.id]}`
        )
      } else {
        let newTeam: ITeamResponse
        newTeam = {
          type: 'DIRECT_MESSAGE',
          userId: user.id,
          requestId: uuidv4(),
          name: '',
        }
        this.store.dispatch(createTeam({ model: newTeam }))
      }
    } else {
      this.router.navigateByUrl(`org/chat/${this.personalTeam?._id}`)
    }
  }

  // public toggleArchive(currentValue: boolean) {
  //   const isArchived = !currentValue
  //   const team: ITeamResponse = {
  //     isArchived,
  //     displayName: this.activeChat?.displayName,
  //     type: this.activeChat?.type,
  //   }
  //   this.store.dispatch(
  //     updateTeam({
  //       orgId: this.activeChat.orgId,
  //       teamId: this.activeChat.id,
  //       model: team,
  //     })
  //   )
  // }

  public async addMemberModal() {
    let userArray = [];
    let userEntities = {...this.userEntities};
    delete userEntities[0];
    if (this.activeChat?.users?.length) {
      this.activeChat.users.forEach(res => {
        delete userEntities[res.userId];
      })
    }

    Object.keys(userEntities).forEach(userId => {
      userArray.push(userEntities[userId]);
    })

    const modal = await this.modalController.create({
      component: ForwardListComponent,
      componentProps: {
        items: userArray,
        onlineUsers: this.onlineUsers,
        title: "Add members"
      },
      swipeToClose: true,
      presentingElement: this.elementRef.nativeElement.closest('.modal-card'),
      backdropDismiss: true
    });
    modal.onDidDismiss().then(res => {
      if (res) {
        if (res?.data) {
          const selectedMembers = res.data
          selectedMembers.map((member) => {
            const teamUser: any = {
              userId: member.id,
              teamId: this.activeChat._id,
              orgId: this.activeOrgId,
            }
            this.store.dispatch(
              createTeamUser({
                model: teamUser,
                user: member,
                isCurrentUserAdded: member.id === this.currentUser?.id ? true : false,
              })
            )
            this.activeChat.users = [...this.activeChat.users, {userId: member.id}]
          })
          this.cdRef.detectChanges();
        }
      }
    })
    return await modal.present();
  }

  public removeMember(member) {
    this.store.dispatch(
      deleteTeamUser({
        userId: member.id,
        teamId: this.activeChat._id,
        isCurrentUserRemoved: member.id === this.currentUser?.id ? true : false,
      })
    )
    const index = this.activeChat.users.findIndex(item => item.userId === member.id)
    let users = [...this.activeChat.users];
    users.splice(index, 1);
    this.activeChat.users = [...users];
  }

  public showAttachements() {

    this.sharedFiles.length = 0
    this.isLoadingAttachments = true
    this.attachments.length = 0
    this.cdRef.detectChanges();
    // window.requestAnimationFrame(() => {
    //   this.ionContent.scrollToBottom()
    // })
    this.teamService
      .fetchTeamAttachements(this.activeChat._id, 50, 0)
      .then((res) => {
        this.isLoadingAttachments = false
        this.noAttachements = false
        this.sharedFiles = res.data.data
        if (this.sharedFiles.length === 0) {
          this.noAttachements = true
        }
        this.cdRef.detectChanges();
        setTimeout(() => {
          this.attachmentHeader.nativeElement.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
        }, 100);
      })
      .catch((err) => {})
  }

  public checkForMedia(attachment: any) {
    // MediaType
    if (attachment && attachment.contentType) {
      if (attachment.contentType.startsWith('image')) {
        return MediaType.IMAGE
      }
      if (attachment.contentType.startsWith('audio')) {
        return MediaType.AUDIO
      }
      if (attachment.contentType.startsWith('video')) {
        return MediaType.VIDEO
      }
      return MediaType.ATTACHMENT
    } else {
      return null
    }
  }

  public viewAttachement(resourceUrl) {
    this.photoViewer.show(resourceUrl);
  }

  public closeModal() {
    this.localService.changeQueryParam({
      details: null,
      threads: null
    })
  }

  public ionViewDidLeave() {
    this.localService.changeQueryParam({
      details: null,
      threads: null
    })
  }

}
