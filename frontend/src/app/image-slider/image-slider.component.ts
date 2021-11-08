import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-image-slider',
  templateUrl: './image-slider.component.html',
  styleUrls: ['./image-slider.component.scss']
})
export class ImageSliderComponent implements OnInit {

  @Input() files: Array<any> = [];
  currentIndex: number = 0;
  data: any;
  indexedData: Array<any> = [];

  @Output() onClose = new EventEmitter();

  constructor(
    private fileService: FileService
  ) {
  }
  
  ngOnInit(): void {
    let loadFirst = this.files.find((item) => item.loadFirst);
    if (loadFirst) {
      this.load(loadFirst.index, true);
      this.loadAll();
    }
  }

  loadAll() {
    this.files.forEach((file, index) => {
      this.load(index);
    });
  }

  load(index: number, show?: boolean) {
    if (index < 0 || index > this.files.length - 1) {
      return;
    }
    if (this.indexedData[index]) {
      this.data = this.indexedData[index];
      if (index !== this.currentIndex) this.currentIndex = index;
    }
    else {
      this.fileService.getFile(this.files[index].path).then((response: Blob) => {
        let reader = new FileReader();
        reader.readAsDataURL(response);
        reader.onload = () => {
          if (show) {
            this.data = reader.result
            if (index !== this.currentIndex) this.currentIndex = index;
          };
          this.indexedData[index] = reader.result;
        }
      });
    }
  }
}
