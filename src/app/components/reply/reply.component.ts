import { Component, Inject, OnInit } from '@angular/core';
import {
  FirebaseTSFirestore,
  OrderBy,
} from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirebaseTSApp } from 'firebasets/firebasetsApp/firebaseTSApp';
import { MainAppComponent } from 'src/app/pages/main-app/main-app.component';

@Component({
  selector: 'app-reply',
  templateUrl: './reply.component.html',
  styleUrls: ['./reply.component.scss'],
})
export class ReplyComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) private postID: string) {}

  firestore = new FirebaseTSFirestore();

  comments: Comment[] = [];

  ngOnInit(): void {
    this.getComments();
  }

  getComments() {
    if (this.postID) {
      this.firestore.listenToCollection({
        name: 'PostCommentsListener',
        path: ['Posts', this.postID, 'PostComments'],
        where: [new OrderBy('timestamp', 'asc')],
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

  onSendClick(commentContent: HTMLTextAreaElement) {
    if (
      commentContent.value.trim().length > 0 &&
      commentContent.value.trim().length <= 150
    ) {
      this.firestore.create({
        path: ['Posts', this.postID, 'PostComments'],
        data: {
          comment: commentContent.value.trim(),
          creatorId: MainAppComponent.getUserDocument().userID,
          creatorUsername: MainAppComponent.getUserDocument().publicName,
          creatorImageProfileUrl:
            MainAppComponent.getUserDocument().imageProfile,
          timestamp: FirebaseTSApp.getFirestoreTimestamp(),
        },
        onComplete: (docId) => {
          commentContent.value = '';
        },
      });
    }
  }

  isCommentCreator(comment: Comment) {
    if (comment.creatorId == MainAppComponent.getUserDocument().userID) {
      return true;
    } else {
      return false;
    }
  }
}

export interface Comment {
  comment: string;
  creatorId: string;
  creatorUsername: string;
  creatorImageProfileUrl: string;
  timestamp: firebase.default.firestore.Timestamp;
}
