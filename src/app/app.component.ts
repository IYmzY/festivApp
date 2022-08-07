import { Component } from '@angular/core';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { Router } from '@angular/router';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'festivApp';

  auth = new FirebaseTSAuth();

  firestore = new FirebaseTSFirestore();

  userHasProfile = false;

  userDocument: any;

  constructor(private router: Router) {
    this.auth.listenToSignInStateChanges((user) => {
      this.auth.checkSignInState({
        whenSignedIn: (user) => {
          this.router.navigate(['']);
        },
        whenSignedOut: (user) => {
          this.router.navigate(['connect']);
        },
        whenSignedInAndEmailNotVerified: (user) => {
          this.router.navigate(['emailVerification']);
        },
        whenSignedInAndEmailVerified: (user) => {
          this.router.navigate(['']);
          this.getUserProfile();
        },
        whenChanged: (user) => {},
      });
    });
  }

  loggedIn() {
    return this.auth.isSignedIn();
  }

  getUserProfile() {
    this.firestore.listenToDocument({
      name: 'Getting DOCUMENT',
      path: ['UsersProfile', this.auth.getAuth().currentUser?.uid!],
      onUpdate: (result) => {
        result.data();
        this.userHasProfile = result.exists;
      },
    });
  }
}
