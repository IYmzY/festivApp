import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-authenticator',
  templateUrl: './authenticator.component.html',
  styleUrls: ['./authenticator.component.scss'],
})
export class AuthenticatorComponent implements OnInit {
  state = AuthComponentState.LOGIN;
  constructor() {}

  ngOnInit(): void {}

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
