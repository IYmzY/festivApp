import { Component, OnInit } from '@angular/core';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss'],
})
export class EmailVerificationComponent implements OnInit {
  auth = new FirebaseTSAuth();

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (!this.auth.isSignedIn()) {
      this.router.navigate(['connect']);
    }
    this.auth.sendVerificationEmail();
    this.refreshVerify();
  }

  onResendClick() {
    this.auth.sendVerificationEmail();
  }

  refreshVerify() {
    if (
      this.auth.isSignedIn() &&
      this.auth.getAuth().currentUser?.emailVerified
    ) {
      this.router.navigate(['']);
    }
  }

  onVerifyClick() {
    if (
      this.auth.isSignedIn() &&
      this.auth.getAuth().currentUser?.emailVerified
    ) {
      this.router.navigate(['connect']);
    } else {
      window.alert("You're account isn't verrified yet");
    }
  }

  onLogoutClick() {
    this.auth.signOut().then(() => {
      this.router.navigate(['connect']);
    });
  }
}
