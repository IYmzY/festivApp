import { Component, OnInit } from '@angular/core';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-app',
  templateUrl: './main-app.component.html',
  styleUrls: ['./main-app.component.scss'],
})
export class MainAppComponent implements OnInit {
  auth = new FirebaseTSAuth();

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (
      this.auth.isSignedIn() &&
      !this.auth.getAuth().currentUser?.emailVerified
    ) {
      this.router.navigate(['emailVerification']);
      // this.auth.sendVerificationEmail();
    }
    if (!this.auth.isSignedIn()) {
      this.router.navigate(['connect']);
    }
  }

  onLogoutClick() {
    this.auth.signOut();
  }
}
