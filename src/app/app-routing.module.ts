import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailVerificationComponent } from './pages/email-verification/email-verification.component';
import { HomeComponent } from './pages/home/home.component';
import { MainAppComponent } from './pages/main-app/main-app.component';

const routes: Routes = [
  { path: 'connect', component: HomeComponent },
  { path: '', component: MainAppComponent },
  { path: 'emailVerification', component: EmailVerificationComponent },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
