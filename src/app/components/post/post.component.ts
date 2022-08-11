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

  commentIcon: string = 'defaultCommentIcon';

  allLikes: number = 0;

  ngOnInit(): void {
    this.getLikes();
    //this.getCurrentLikeUser();
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
            //this.likeCount();
            if (postLikeDoc.doc.data().like === 1) {
              this.allLikes++;
            }
            if (
              postLikeDoc.doc.data().creatorId ==
              MainAppComponent.getUserDocument().userID
            ) {
              this.like = postLikeDoc.doc.data()?.like;
              console.log('mon nombre de like à moi' + this.like);
            }
          }
        });
      },
    });
  }

  likeCount() {
    this.likes.forEach((like) => {
      this.allLikes += like.like;
      console.log('je roule mon like' + this.allLikes);
    });
  }

  getCurrentLikeUser() {
    this.firestore.getDocument({
      path: [
        'Posts',
        this.postData.postID,
        'Likes',
        MainAppComponent.getUserDocument().userID!,
      ],
      onComplete: (result) => {
        if (result.exists) {
          this.like = result.data()?.like;
          console.log('mon nombre de like à moi' + this.like);
        }
      },
      onFail(err) {
        console.log(err);
      },
    });
  }

  onLikeClick() {
    if (this.like < 1) {
      this.like = 1;
    } else {
      this.allLikes--;
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
      onComplete(docId) {},
    });

    console.log(this.like);
    console.log(this.allLikes);
  }
}

export interface Like {
  like: number;
  creatorId: string;
  creatorUsername: string;
  timestamp: firebase.default.firestore.Timestamp;
}
