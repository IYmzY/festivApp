import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PostData } from 'src/app/pages/main-app/main-app.component';
import { ReplyComponent } from '../reply/reply.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
  constructor(private dialog: MatDialog) {}

  @Input() postData: PostData;

  @Input() currentUsername: string;

  @Input() currentImage;

  ngOnInit(): void {}

  onCommentClick() {
    this.dialog.open(ReplyComponent, { data: this.postData.postID });
  }
}
