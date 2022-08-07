import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { FirebaseTSStorage } from 'firebasets/firebasetsStorage/firebaseTSStorage';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  @Input() show: boolean = false;

  @Output() isProfile: EventEmitter<boolean> = new EventEmitter();

  firestore: FirebaseTSFirestore;

  auth: FirebaseTSAuth;

  storage: FirebaseTSStorage;

  fileToUpload;

  filePath: string;

  currentImage =
    'https://api.iconify.design/mdi-light/account.svg?width=60&color=%0';

  currentUser;

  constructor() {
    this.firestore = new FirebaseTSFirestore();
    this.auth = new FirebaseTSAuth();
    this.storage = new FirebaseTSStorage();
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getAuth().currentUser?.uid;
    this.loadCurrentPreview();
  }
  onSaveProfile(
    nameInput: HTMLInputElement,
    descriptionInput: HTMLTextAreaElement
  ) {
    let name = nameInput.value;
    let description = descriptionInput.value;
    let imageProfile;

    this.firestore.create({
      path: ['UsersProfile', this.currentUser],
      data: {
        publicName: name,
        description: description,
        imageProfile: `/Avatar/${this.currentUser}`,
      },

      onComplete: (docId) => {
        nameInput.value = '';
        descriptionInput.value = '';
        imageProfile.value = '';
        this.isProfile.emit(false);
        this.show = false;
      },

      onFail: (err) => {},
    });
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

  uploadFile() {
    if (this.fileToUpload) {
      this.storage.upload({
        uploadName: this.fileToUpload.name,
        path: ['/Avatar', this.currentUser],
        data: {
          data: this.fileToUpload,
          metadata: this.fileToUpload.type,
        },
      });
    }
  }

  loadCurrentPreview() {
    const loadImgProfile = (url) => {
      this.currentImage = url;
    };
    this.storage.getDownloadUrl({
      path: ['/Avatar', this.currentUser],
      onComplete(url) {
        loadImgProfile(url);
      },
      onFail(err) {
        console.log(err);
      },
    });
  }
}
