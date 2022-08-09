import { Component, OnDestroy, OnInit } from '@angular/core';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { FirebaseTSAuth } from 'firebasets/firebasetsAuth/firebaseTSAuth';
import { FirebaseTSStorage } from 'firebasets/firebasetsStorage/firebaseTSStorage';
import { FirebaseTSApp } from 'firebasets/firebasetsApp/firebaseTSApp';
import { MatDialogRef } from '@angular/material/dialog';
import { UserDocument } from 'src/app/pages/main-app/main-app.component';
import { SharingFestivDataService } from 'src/app/services/sharing-festiv-data.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
  constructor(
    private dialog: MatDialogRef<CreatePostComponent>,
    private festivDataService: SharingFestivDataService
  ) {}

  fileToUploadInPost;

  currentImageInPost;

  firestore = new FirebaseTSFirestore();

  auth = new FirebaseTSAuth();

  storage = new FirebaseTSStorage();

  userDocument: UserDocument;

  username: string;

  currentImageProfileUrl;

  ngOnInit(): void {
    this.getUserProfile();
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
        if (result.exists && result.data()?.publicName.length > 0) {
          this.username = result.data()?.publicName;
        }
        if (result.exists && result.data()?.imageProfile) {
          this.currentImageProfileUrl = result.data()?.imageProfile;
        }
      },
    });
  }
  onShareClick(post: HTMLTextAreaElement) {
    let postContent = post.value;
    let postId = this.firestore.genDocId();
    if (this.fileToUploadInPost && postContent.length <= 350) {
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
              imageProfile: this.currentImageProfileUrl,
            },
            onComplete: (docId) => {
              this.dialog.close();
              this.festivDataService.sendPostsUpdate(true);
            },
          });
        },
      });
    }
  }
}
