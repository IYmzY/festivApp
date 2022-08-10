import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { Router } from '@angular/router';
import {
  FirebaseTSFirestore,
  OrderBy,
} from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { FirebaseTSStorage } from 'firebasets/firebasetsStorage/firebaseTSStorage';
import { MatDialog } from '@angular/material/dialog';
import { CreatePostComponent } from 'src/app/components/create-post/create-post.component';
import { SharingFestivDataService } from 'src/app/services/sharing-festiv-data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss'],
})
export class MainAppComponent implements OnInit, OnDestroy {
  auth = new FirebaseTSAuth();

  firestore = new FirebaseTSFirestore();

  storage = new FirebaseTSStorage();

  currentImage;

  currentRandomImageProfile;

  currentUsername;

  currentDescription = 'Description';

  isProfile: boolean = false;

  isProfilePictureChanged: boolean;

  userDocument: UserDocument;

  posts: PostData[] = [];

  currentUserID;

  subscription: Subscription;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private festivDataService: SharingFestivDataService
  ) {
    this.subscription = this.festivDataService
      .getProfilePictureUpdate()
      .subscribe(() => {
        this.loadCurrentPreview();
      });
    this.subscription = this.festivDataService
      .getPostsUpdate()
      .subscribe(() => {
        this.getposts();
      });
  }

  ngOnInit(): void {
    this.currentUserID = this.auth.getAuth().currentUser?.uid;
    if (
      this.auth.isSignedIn() &&
      !this.auth.getAuth().currentUser?.emailVerified
    ) {
      this.router.navigate(['emailVerification']);
    }
    if (!this.auth.isSignedIn()) {
      this.router.navigate(['connect']);
    }
    this.getUserProfile();
    this.loadCurrentPreview();
    this.currentRandomImageProfile = this.getRandomImageProfile(1, 15);
    this.loadProfilePreview();
    this.getposts();
  }

  onLogoutClick() {
    this.auth.signOut();
  }

  onProfileClick() {
    this.isProfile = !this.isProfile;
  }

  checkIsUpdated(update: any) {
    this.isProfile = update;
  }

  profileShowState() {
    return this.isProfile;
  }

  async getUserProfile() {
    await this.firestore.listenToDocument({
      name: 'Getting DOCUMENT',
      path: ['UsersProfile', this.currentUserID!],
      onUpdate: (result) => {
        this.userDocument = <UserDocument>result.data();
        if (result.exists && this.userDocument.publicName.length > 0) {
          this.currentUsername = this.userDocument.publicName;
        }
        this.isProfile = !result.exists;
      },
    });
  }

  loadCurrentPreview() {
    const loadImgProfile = (url) => {
      this.currentImage = url;
    };
    this.storage.getDownloadUrl({
      path: ['/Avatar', this.currentUserID],
      onComplete: (url) => {
        loadImgProfile(url);
      },
      onFail(err) {},
    });
  }

  getRandomImageProfile(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  loadProfilePreview() {
    const loadImgProfile = (url) => {
      this.currentImage = url;
    };

    this.storage
      .getDownloadUrl({
        path: ['/Avatar', `userIcon${this.currentRandomImageProfile}.webp`],
        onComplete: (url) => {
          loadImgProfile(url);
        },
        onFail(err) {},
      })
      .then(() => {
        this.storage.getDownloadUrl({
          path: ['/Avatar', this.currentUserID],
          onComplete: (url) => {
            loadImgProfile(url);
          },
          onFail(err) {},
        });
      });
  }

  onPostButtonClick() {
    this.dialog.open(CreatePostComponent);
  }

  async getposts() {
    await this.firestore.getCollection({
      path: ['Posts'],
      where: [new OrderBy('timestamp', 'desc')],
      onComplete: (result) => {
        result.docs.forEach((doc) => {
          let post = <PostData>doc.data();
          this.posts.push(post);
        });
      },
      onFail: (err) => {},
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}

export interface UserDocument {
  publicName: string;
  description: string;
  imageProfile: string;
  isProfilePictureCustom: boolean;
}

export interface PostData {
  postContent: string;
  creatorId: string;
  imageUrl?: string;
  creatorUsername: string;
  imageProfile: string;
}
