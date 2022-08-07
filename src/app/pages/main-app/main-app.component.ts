import { Component, OnInit } from '@angular/core';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { Router } from '@angular/router';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';

@Component({
  selector: 'app-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss'],
})
export class MainAppComponent implements OnInit {
  auth = new FirebaseTSAuth();

  firestore = new FirebaseTSFirestore();

  isProfile: boolean = false;

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

  getUserProfile() {
    this.firestore.listenToDocument({
      name: 'Getting DOCUMENT',
      path: ['UsersProfile', this.auth.getAuth().currentUser?.uid!],
      onUpdate: (result) => {
        this.userDocument = <UserDocument>result.data();
        this.isProfile = !result.exists;
        if (!result.exists || this.userDocument.publicName === '') {
          this.userDocument.publicName = 'User';
        }
      },
    });
  }
}

export interface UserDocument {
  publicName: string;
  description: string;
}
