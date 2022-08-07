import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';

@Component({
  selector: 'app-authenticator',
  templateUrl: './authenticator.component.html',
  styleUrls: ['./authenticator.component.scss'],
})
export class AuthenticatorComponent implements OnInit {
  state = AuthComponentState.LOGIN;

  firebasetsAuth: FirebaseTSAuth;

  constructor(private router: Router) {
    this.firebasetsAuth = new FirebaseTSAuth();
  }

  ngOnInit(): void {}

  onLogingIn(loginEmail: HTMLInputElement, loginPassword: HTMLInputElement) {
    let email = loginEmail.value;
    let password = loginPassword.value;
    if (this.isNotEmpty(email) && this.isNotEmpty(password)) {
      this.firebasetsAuth.signInWith({
        email: email,
        password: password,
        onComplete: (uc) => {
          console.log('Connected with success');
          this.router.navigate(['']);
        },
        onFail: (err) => {
          alert(err);
        },
      });
    }
  }

  onRegisterClick(
    registerEmail: HTMLInputElement,
    registerPassword: HTMLInputElement,
    registerConfirmPassword: HTMLInputElement
  ) {
    let email = registerEmail.value;
    let password = registerPassword.value;
    let confirmPassword = registerConfirmPassword.value;

    if (
      this.isNotEmpty(email) &&
      this.isNotEmpty(password) &&
      this.isNotEmpty(confirmPassword) &&
      this.isSame(password, confirmPassword)
    ) {
      this.firebasetsAuth.createAccountWith({
        email: email,
        password: password,
        onComplete: (uc) => {
          alert('Account created with success');
          registerEmail.value = '';
          registerPassword.value = '';
          registerConfirmPassword.value = '';
        },
        onFail: (err) => {
          alert('Failed to create the account');
        },
      });
    }
  }

  onResetPassword(resetEmail: HTMLInputElement) {
    let email = resetEmail.value;
    if (this.isNotEmpty(email)) {
      this.firebasetsAuth.sendPasswordResetEmail({
        email: email,
        onComplete: (err) => {
          alert(
            `Instruction to reset your passoword has been sent to ${email}`
          );
        },
      });
    }
  }

  isNotEmpty(text: string) {
    return text !== null && text.length > 0;
  }
  isSame(password: string, confirmPassword: string) {
    return password === confirmPassword;
  }

  onForgotPasswordClick() {
    this.state = AuthComponentState.FORGOT_PASSWORD;
  }

  onCreateAccountClick() {
    this.state = AuthComponentState.REGISTER;
  }

  onLoginClick() {
    this.state = AuthComponentState.LOGIN;
  }

  isInLogin() {
    return this.state == AuthComponentState.LOGIN;
  }

  isInRegister() {
    return this.state == AuthComponentState.REGISTER;
  }

  isInForgotPassword() {
    return this.state == AuthComponentState.FORGOT_PASSWORD;
  }

  getHeaderText() {
    switch (this.state) {
      case AuthComponentState.LOGIN:
        return "Log in to your festiv'Account";
      case AuthComponentState.REGISTER:
        return "Create your festiv'Account";
      case AuthComponentState.FORGOT_PASSWORD:
        return 'Forgot Password';
    }
  }
}

export enum AuthComponentState {
  LOGIN,
  REGISTER,
  FORGOT_PASSWORD,
}
