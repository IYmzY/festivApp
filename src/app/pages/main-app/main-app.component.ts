import { Component, OnInit } from '@angular/core';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { Router } from '@angular/router';
import {
  FirebaseTSFirestore,
  OrderBy,
} from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { FirebaseTSStorage } from 'firebasets/firebasetsStorage/firebaseTSStorage';
import { MatDialog } from '@angular/material/dialog';
import { CreatePostComponent } from 'src/app/components/create-post/create-post.component';

@Component({
  selector: 'app-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss'],
})
export class MainAppComponent implements OnInit {
  auth = new FirebaseTSAuth();

  firestore = new FirebaseTSFirestore();

  storage = new FirebaseTSStorage();

  currentImage;

  currentRandomImageProfile;

  currentUsername;

  currentDescription = 'Description';

  isProfile: boolean = false;

  isProfilePictureUpdated: boolean;

  userDocument: UserDocument;

  posts: PostData[] = [];

  isPreviewLoaded: boolean = false;

  currentUserID;

  constructor(private router: Router, private dialog: MatDialog) {}

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
    this.currentRandomImageProfile = this.getRandomImageProfile(1, 15);
    this.getUserProfile();
    this.loadCurrentPreview();
    this.onProfilePictureChange();
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

  checkProfilePictureIsUpdated(update: any) {
    this.isProfilePictureUpdated = update;
  }

  onProfilePictureChange() {
    if (this.isProfilePictureUpdated === true) {
      this.loadCurrentPreview();
      this.isProfilePictureUpdated = !this.isProfilePictureUpdated;
    }
  }

  profileShowState() {
    return this.isProfile;
  }

  getUserProfile() {
    this.firestore.listenToDocument({
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
      this.isPreviewLoaded = true;
    };
    this.storage
      .getDownloadUrl({
        path: ['/Avatar', this.currentUserID],
        onComplete(url) {
          loadImgProfile(url);
        },
        onFail(err) {
          console.log(err);
        },
      })
      .then(() => {
        if (this.isPreviewLoaded === false) {
          this.loadRandomDefaultProfilePreview();
        }
      });
  }

  loadRandomDefaultProfilePreview() {
    const loadImgProfile = (url) => {
      this.currentImage = url;
    };
    this.storage.getDownloadUrl({
      path: ['/Avatar', `userIcon${this.currentRandomImageProfile}.webp`],
      onComplete(url) {
        loadImgProfile(url);
      },
      onFail(err) {
        console.log(err);
      },
    });
  }
  getRandomImageProfile(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  onPostButtonClick() {
    this.dialog.open(CreatePostComponent);
  }

  getposts() {
    this.firestore.getCollection({
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
}

export interface UserDocument {
  publicName: string;
  description: string;
}

export interface PostData {
  postContent: string;
  creatorId: string;
  imageUrl?: string;
  creatorUsername: string;
}
