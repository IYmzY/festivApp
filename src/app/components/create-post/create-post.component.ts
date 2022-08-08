import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.scss'],
})
export class CreatePostComponent implements OnInit {
  constructor() {}

  fileToUploadInPost;

  currentImageInPost;

  ngOnInit(): void {
    console.log('yo');
    if (this.fileToUploadInPost) console.log(this.fileToUploadInPost);
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
}
