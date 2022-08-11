import { Component, Inject, OnInit } from '@angular/core';
import {
  FirebaseTSFirestore,
  OrderBy,
} from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirebaseTSApp } from 'firebasets/firebasetsApp/firebaseTSApp';
import { MainAppComponent } from 'src/app/pages/main-app/main-app.component';
//import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.scss'],
})
export class ReplyComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) private postID: string) {}

  firestore = new FirebaseTSFirestore();

  //afs: AngularFirestore;

  comments: Comment[] = [];

  ngOnInit(): void {
    this.getComments();
  }

  async getComments() {
    if (this.postID) {
      await this.firestore.listenToCollection({
        name: 'PostCommentsListener',
        path: ['Posts', this.postID, 'PostComments'],
        where: [new OrderBy('timeStamp', 'asc')],
        onUpdate: (result) => {
          result.docChanges().forEach((postCommentDoc) => {
            if (postCommentDoc.type === 'added') {
              this.comments.unshift(<Comment>postCommentDoc.doc.data());
            }
          });
        },
      });
    }
  }

  onSendClick(commentContent: HTMLInputElement) {
    if (commentContent.value.length > 0) {
      this.firestore.create({
        path: ['Posts', this.postID, 'PostComments'],
        data: {
          comment: commentContent.value.trim(),
          creatorId: MainAppComponent.getUserDocument().userID,
          creatorUsername: MainAppComponent.getUserDocument().publicName,
          creatorImageProfileUrl:
            MainAppComponent.getUserDocument().imageProfile,
          timeStamp: FirebaseTSApp.getFirestoreTimestamp(),
        },
        onComplete: (docId) => {
          commentContent.value = '';
        },
      });
    }
  }
}

export interface Comment {
  comment: string;
  creatorId: string;
  creatorUsername: string;
  creatorImageProfileUrl: string;
  timeStamp: firebase.default.firestore.Timestamp;
}
