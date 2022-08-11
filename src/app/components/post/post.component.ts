import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  MainAppComponent,
  PostData,
} from 'src/app/pages/main-app/main-app.component';
import { ReplyComponent } from '../reply/reply.component';
import {
  FirebaseTSFirestore,
  OrderBy,
} from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { FirebaseTSApp } from 'firebasets/firebasetsApp/firebaseTSApp';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
  constructor(private dialog: MatDialog) {}

  firestore = new FirebaseTSFirestore();

  @Input() postData: PostData;

  @Input() currentUsername: string;

  @Input() currentImage;

  likes: Like[] = [];

  likeIcon: string = 'defaultLikeIcon';

  like: number = 0;

  allLikesPostCount: AllLikesPostCount;

  commentIcon: string = 'defaultCommentIcon';

  allLikes: number = 0;

  removeAddLikeIcon;

  ngOnInit(): void {
    this.getLikes();
  }

  onCommentClick() {
    this.dialog.open(ReplyComponent, { data: this.postData.postID });
  }

  getLikes() {
    this.firestore.listenToCollection({
      name: 'PostLikesListener',
      path: ['Posts', this.postData.postID, 'Likes'],
      where: [new OrderBy('timestamp', 'asc')],
      onUpdate: (result) => {
        result.docChanges().forEach((postLikeDoc) => {
          if (postLikeDoc.type === 'added' || postLikeDoc.type === 'modified') {
            this.likes = [];
            this.likes.push(<Like>postLikeDoc.doc.data());

            if (postLikeDoc.doc.data().like === 1) {
              this.allLikes++;
            }
            if (
              postLikeDoc.type === 'modified' &&
              postLikeDoc.doc.data().like === 0
            ) {
              this.allLikes--;
            }
            if (
              postLikeDoc.doc.data().creatorId ==
              MainAppComponent.getUserDocument().userID
            ) {
              this.like = postLikeDoc.doc.data()?.like;
              this.like < 1
                ? (this.removeAddLikeIcon = 'addLikeIcon')
                : (this.removeAddLikeIcon = 'removeLikeIcon');
            }
          }
        });
      },
    });
  }

  onLikeClick() {
    if (this.like < 1) {
      this.like = 1;
    } else {
      this.like = 0;
    }
    this.firestore.create({
      path: [
        'Posts',
        this.postData.postID,
        'Likes',
        MainAppComponent.getUserDocument().userID,
      ],
      data: {
        like: this.like,
        creatorId: MainAppComponent.getUserDocument().userID,
        creatorUsername: MainAppComponent.getUserDocument().publicName,
        timestamp: FirebaseTSApp.getFirestoreTimestamp(),
      },
      onComplete: (docId) => {
        this.firestore.update({
          path: ['Posts', this.postData.postID],
          data: {
            likesCount: this.allLikes,
          },
        });
      },
    });
  }

  getTotalCount() {
    this.firestore.listenToDocument({
      name: 'PostLikesCountListener',
      path: ['Posts', this.postData.postID],
      onUpdate: (result) => {
        this.allLikesPostCount = <AllLikesPostCount>result.data();
        this.allLikes = this.allLikesPostCount.likesCount;
      },
    });
  }
}

export interface Like {
  like: number;
  creatorId: string;
  creatorUsername: string;
  timestamp: firebase.default.firestore.Timestamp;
}

export interface AllLikesPostCount {
  likesCount: number;
}
