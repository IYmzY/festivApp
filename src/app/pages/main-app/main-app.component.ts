import { Component, OnInit } from '@angular/core';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { Router } from '@angular/router';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { FirebaseTSStorage } from 'firebasets/firebasetsStorage/firebaseTSStorage';

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

  currentUsername = 'User';

  currentDescription = 'Description';

  isProfile: boolean = false;

  isProfilePictureUpdated: boolean;

  userDocument: UserDocument;

  constructor(private router: Router) {}

  ngOnInit(): void {
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

    this.onProfilePictureChange();
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
      path: ['UsersProfile', this.auth.getAuth().currentUser?.uid!],
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
      path: ['/Avatar', this.auth.getAuth().currentUser?.uid!],
      onComplete(url) {
        loadImgProfile(url);
      },
      onFail(err) {
        console.log(err);
      },
    });
  }
}

export interface UserDocument {
  publicName: string;
  description: string;
}
