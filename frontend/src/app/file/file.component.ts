import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss']
})
export class FileComponent implements OnInit {

  @Input() name: any;
  @Input() size: any;
  @Input() icon!: string;

  showOptions = false;
  fileState: FileState = FileState.IDLE;

  @Output() clicked = new EventEmitter();
  @Output() deleted = new EventEmitter();

  constructor(
    private fileService: FileService
  ) { }

  ngOnInit(): void {
  }

  toggleOptions(event: MouseEvent) {
    this.showOptions = !this.showOptions;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  toggleEdit(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.fileState = FileState.EDIT;
  }

  delete(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.fileService.deleteFile(this.name).then(()=> {
      this.deleted.emit(this.name);
    });
  }

  download(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.fileService.downloadFile(this.name);
  }
}

export enum FileState {
  IDLE = 0,
  EDIT = 1
}


export class AppFile {
  public name: string;
  public size: number;
  public isFile: boolean = true;
  public icon: string = 'description';
  constructor(name: string, size: number, icon: string) {
    this.name = name;
    this.size = size;
    this.icon = icon;
  }
}
