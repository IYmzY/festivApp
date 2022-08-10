import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { FirebaseTSStorage } from 'firebasets/firebasetsStorage/firebaseTSStorage';
import { UserDocument } from 'src/app/pages/main-app/main-app.component';
import { SharingFestivDataService } from 'src/app/services/sharing-festiv-data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  @Input() show: boolean = false;

  @Input() randomProfileSetter: number;

  @Output() isProfile: EventEmitter<boolean> = new EventEmitter();

  firestore: FirebaseTSFirestore;

  auth: FirebaseTSAuth;

  storage: FirebaseTSStorage;

  userDocument: UserDocument;

  fileToUpload;

  filePath: string;

  currentImage;

  currentUsername;

  currentDescription = 'Description';

  currentUserID;

  constructor(private festivDataService: SharingFestivDataService) {
    this.firestore = new FirebaseTSFirestore();
    this.auth = new FirebaseTSAuth();
    this.storage = new FirebaseTSStorage();
  }

  ngOnInit(): void {
    this.currentUserID = this.auth.getAuth().currentUser?.uid;
    this.loadCurrentPreview();
    this.getUserProfile();
    this.loadRandomDefaultProfilePreview();
  }
  async onSaveProfile(
    nameInput: HTMLInputElement,
    descriptionInput: HTMLTextAreaElement
  ) {
    let name = nameInput.value.trim();
    let description = descriptionInput.value.trim();
    if (name.length > 0) {
      await this.firestore.update({
        path: ['UsersProfile', this.currentUserID],
        data: {
          publicName: name,
        },

        onComplete: (docId) => {
          nameInput.value = '';
        },

        onFail: (err) => {},
      });
    }
    if (description.length > 0) {
      await this.firestore.update({
        path: ['UsersProfile', this.currentUserID],
        data: {
          description: description,
        },

        onComplete: (docId) => {
          descriptionInput.value = '';
        },

        onFail: (err) => {},
      });
    }
    this.uploadFile();
    this.isProfile.emit(false);
    this.show = false;
  }
  handleFileInput(file) {
    this.fileToUpload = file.target.files[0] as File;
    if (this.fileToUpload) {
      const reader = new FileReader();
      reader.onload = () => {
        this.currentImage = reader.result as string;
      };
      reader.readAsDataURL(this.fileToUpload);
    }
  }

  async uploadFile() {
    if (this.fileToUpload) {
      await this.storage.upload({
        uploadName: this.fileToUpload.name,
        path: ['/Avatar', this.currentUserID],
        data: {
          data: this.fileToUpload,
          metadata: this.fileToUpload.type,
        },
        onComplete: async (downloadUrl) => {
          this.festivDataService.sendProfilePictureUpdate(true);
          await this.firestore.update({
            path: ['UsersProfile', this.currentUserID],
            data: {
              imageProfile: downloadUrl,
              isProfilePictureCustom: true,
            },
          });
        },
      });
    }
  }

  loadCurrentPreview() {
    const loadImgProfile = (url) => {
      this.currentImage = url;
    };
    this.storage.getDownloadUrl({
      path: ['/Avatar', this.currentUserID],
      onComplete(url) {
        loadImgProfile(url);
      },
      onFail: (err) => {},
    });
  }

  async getUserProfile() {
    if (this.currentUserID) {
      await this.firestore.listenToDocument({
        name: 'Getting DOCUMENT',
        path: ['UsersProfile', this.currentUserID],
        onUpdate: async (result) => {
          this.userDocument = <UserDocument>result.data();
          if (result.exists && this.userDocument.publicName.length > 0) {
            this.currentUsername = this.userDocument.publicName;
          }
          if (result.exists && !this.userDocument.imageProfile) {
            await this.firestore.update({
              path: ['UsersProfile', this.currentUserID],
              data: {
                imageProfile: this.currentImage,
                isProfilePictureCustom: false,
              },
            });
          }
          if (!result.exists) {
            await this.firestore.create({
              path: ['UsersProfile', this.currentUserID],
              data: {
                publicName: `User${this.getRandomImageProfile(1, 999999)}`,
                imageProfile: this.currentImage,
              },
            });
          }
          if (
            result.exists &&
            this.userDocument.description &&
            this.userDocument.description.length > 0
          ) {
            this.currentDescription = this.userDocument.description;
          }
        },
      });
    }
  }

  onCloseProfile() {
    this.isProfile.emit(false);
    this.show = false;
  }

  async loadRandomDefaultProfilePreview() {
    const loadImgProfile = (url) => {
      this.currentImage = url;
    };
    this.storage.getDownloadUrl({
      path: ['/Avatar', `userIcon${this.randomProfileSetter}.webp`],
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
}
