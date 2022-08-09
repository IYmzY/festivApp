import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharingFestivDataService {
  profilePicture: Subject<boolean> = new Subject<boolean>();

  currentProfilePicture: Subject<string> = new Subject<string>();

  isPostsUpdated: Subject<boolean> = new Subject<boolean>();

  sendProfilePictureUpdate(isUpdated: boolean) {
    this.profilePicture.next(isUpdated);
  }

  getProfilePictureUpdate(): Observable<boolean> {
    return this.profilePicture.asObservable();
  }

  sendPostsUpdate(isUpdated: boolean) {
    this.isPostsUpdated.next(isUpdated);
  }

  getPostsUpdate(): Observable<boolean> {
    return this.isPostsUpdated.asObservable();
  }

  sendProfilePicture(currentImage) {
    this.currentProfilePicture.next(currentImage);
  }

  getProfilePicture(): Observable<string> {
    return this.currentProfilePicture.asObservable();
  }
}
