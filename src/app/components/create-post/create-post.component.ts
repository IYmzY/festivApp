import { Component, OnInit } from '@angular/core';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { FirebaseTSStorage } from 'firebasets/firebasetsStorage/firebaseTSStorage';
import { FirebaseTSApp } from 'firebasets/firebasetsApp/firebaseTSApp';
import { MatDialogRef } from '@angular/material/dialog';
import { UserDocument } from 'src/app/pages/main-app/main-app.component';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
  constructor(private dialog: MatDialogRef<CreatePostComponent>) {}

  fileToUploadInPost;

  currentImageInPost;

  firestore = new FirebaseTSFirestore();

  auth = new FirebaseTSAuth();

  storage = new FirebaseTSStorage();

  userDocument: UserDocument;

  username: string;

  ngOnInit(): void {
    this.getUserProfile();
    if (this.fileToUploadInPost) console.log(this.fileToUploadInPost);
    console.log(this.username);
  }

  handleFileInputInPost(fileInPost) {
    this.fileToUploadInPost = fileInPost.target.files[0] as File;
    if (this.fileToUploadInPost) {
      const reader = new FileReader();
      reader.readAsDataURL(this.fileToUploadInPost);
      console.log(this.fileToUploadInPost);
      reader.onload = () => {
        this.currentImageInPost = reader.result as string;
      };
    }
  }

  getUserProfile() {
    this.firestore.getDocument({
      path: ['UsersProfile', this.auth.getAuth().currentUser?.uid!],
      onComplete: (result) => {
        // this.userDocument = <UserDocument>result.data();
        if (result.exists && result.data()?.publicName.length > 0) {
          this.username = result.data()?.publicName;
        }
      },
    });
  }
  onShareClick(post: HTMLTextAreaElement) {
    let postContent = post.value;
    let postId = this.firestore.genDocId();
    if (this.fileToUploadInPost) {
      this.storage.upload({
        uploadName: 'upload Image & post content',
        path: ['Posts', postId, 'imagePost'],
        data: {
          data: this.fileToUploadInPost,
        },
        onComplete: (downloadUrl) => {
          this.firestore.create({
            path: ['Posts', postId],
            data: {
              postContent: postContent,
              creatorId: this.auth.getAuth().currentUser?.uid,
              imageUrl: downloadUrl,
              timestamp: FirebaseTSApp.getFirestoreTimestamp(),
              creatorUsername: this.username,
            },
            onComplete: (docId) => {
              this.dialog.close();
            },
          });
        },
      });
    }
  }
}
