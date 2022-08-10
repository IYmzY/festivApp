import { Component, Input, OnInit } from '@angular/core';
import { FirebaseTSFirestore } from 'firebasets/firebasetsFirestore/firebaseTSFirestore';
import { PostData } from 'src/app/pages/main-app/main-app.component';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent implements OnInit {
  constructor() {}
  @Input() postData: PostData;

  @Input() currentUsername: string;

  @Input() currentImage;

  ngOnInit(): void {}
}
