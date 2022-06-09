// import { ThrowStmt } from '@angular/compiler';
import { Component, ElementRef, OnInit } from '@angular/core';
// import { AppFile } from './file/file.component';
// import { AppFolder } from './folder/folder.component';
import { FileService } from './services/file.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  data: Array<any> = [];
  edit: boolean = false;
  fileHovering: boolean = false;
  fileInput: any;
  preview: boolean = false;
  previewFiles: Array<any> = [];

  constructor(
    private ref: ElementRef,
    public fileService: FileService
  ) {
    let currentPath = this.fileService.currentPath;
    this.fileService.getDirectory(currentPath).then((data: any) => {
      this.data = data;
    });
  }

  ngOnInit() {
    this.fileInput = this.ref.nativeElement.getElementsByClassName('file-uploader')[0];
  }

  loadDirectory(path: string) {
    let directory: Array<string> = this.fileService.currentPath;
    directory.push(path);
    this.fileService.getDirectory(directory).then((data: any) => {
      this.data = data;
      this.fileService.currentPath = directory;
    });
  }

  itemClicked(item: any) {
    item.isDirectory ? this.loadDirectory(item) : this.previewFile(item);
  }

  back() {
    let directory = this.fileService.currentPath;
    if (directory.length === 0) {
      return;
    }

    let removed = directory.pop();

    this.fileService.getDirectory(directory).then((data: any) => {
      this.data = data;
      this.fileService.currentPath = directory;
    }).catch(() => {
      if (removed) this.fileService.currentPath.push(removed);
    });
  }

  goToSection(section: string, index: number) {
    let directory = this.fileService.currentPath;
    if (directory.length - 1 === index) {
      return;
    }

    while (directory.length - 1 > index) {
      directory.pop();
    }

    this.fileService.getDirectory(directory).then((data: any) => {
      this.data = data;
      this.fileService.currentPath = directory;
    });
  }

  fileDroped(data: any) {
    let event = data.event;
    let directory = data.directory;
    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      this.fileService.uploadFile(event.dataTransfer.files[0], directory).then(() => {
        this.fileService.reload((data: any) => this.data = data);
      });
    }
  }

  newFolder() {
    this.fileService.newFolder().then((folder) => {
      this.data.push(folder);
    });
  }

  itemDeleted(name: string) {
    let index = -1;
    this.data.forEach((item, i) => {
      if (item.name === name) index = i;
    });
    if (index > -1) this.data.splice(index, 1);
  }

  upload() {
    this.fileInput.click();
  }

  filesSelected(event: any) {
    let files = event.target.files;
    this.fileService.uploadFile(files[0]).then(() => {
      this.fileService.reload((data: any) => this.data = data);
    });
    event.target.files = null;
  }

  previewFile(name: string) {
    this.preview = true;
    this.previewFiles = this.data
      .filter(item => item.isFile)
      .map((item, i) => {
        return {
          name: item.name,
          path: item.fullpath = this.fileService.currentPath.concat(item.name),
          index: i,
          loadFirst: name === item.name
        };
      });
  }

  onDrop(event: any) {
    this.fileHovering = false;
    event.preventDefault();
    this.fileDroped({ event: event });
  }

  onDragOver(event: any) {
    this.fileHovering = true;
    event.preventDefault();
  }

  onDragLeave() {
    this.fileHovering = false;
  }

  onDragEnter() {
    this.fileHovering = true;
  }

  closePreviewWindow(event: MouseEvent) {
    this.preview = false;
  }
}
