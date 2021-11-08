import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileService } from '../services/file.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss']
})
export class FolderComponent implements OnInit {

  states = FolderState;
  showOptions = false;
  @Input() name!: string;
  @Input() size!: number;
  @Input() state!: FolderState;
  @Input() locked!: boolean

  @Output() clicked = new EventEmitter();
  @Output() droped = new EventEmitter();
  @Output() deleted = new EventEmitter();

  fileHovering: boolean = false;
  constructor(
    private ref: ElementRef,
    private fileService: FileService
  ) {

  }

  ngOnInit(): void {
    if (this.state === FolderState.EDIT) {
      setTimeout(() => {
        this.ref.nativeElement.scrollIntoView({
          behavior: 'smooth'
        });

        this.focusAndSelect();
      }, 200);
    }
  }

  onDrop(event: any) {
    this.fileHovering = false;
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    let data = {
      event: event,
      directory: this.name
    }
    this.droped.emit(data);
  }

  onDragOver(event: any) {
    this.fileHovering = true;
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
  }

  onDragLeave() {
    this.fileHovering = false;
  }

  onDragEnter() {
    this.fileHovering = true;
  }

  folderClicked(name: string) {
    if (this.state === FolderState.IDLE) {
      this.clicked.emit(name)
    }
  }

  onInput(event: any) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();
    console.log(event.data);
    if (!event.data && event.inputType === 'insertParagraph') {
      event.target.blur();
    }
  }

  onKeyDown(event: any) {
    if (event.which === 13) {
      event.preventDefault();
      event.target.blur();
      this.commitFolderName(event);
    }
  }

  toggleOptions(event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.showOptions = !this.showOptions;
  }

  toggleEdit(event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.state = FolderState.EDIT;
    setTimeout(() => {
      this.focusAndSelect();
      this.showOptions = false;
    }, 50)
  }

  deleteFolder(event: any) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.fileService.hasContent(this.name).then((response) => {
      if (response) {
        console.log('This folder has content');
      } else {
        this.fileService.deleteFolder(this.name).then((success) => {
          if (success) this.deleted.emit(this.name);
        });
      }
    });
  }

  commitFolderName(event: any) {
    console.log('FolderName committed');
    let newName = event.target.innerText;
    this.state = FolderState.IDLE;
    if (newName === this.name) {
      return;
    } 
    this.fileService.renameFolder(this.name, newName).then(success => {
      if (success) {
        this.name = newName
      }
    });
  }

  private focusAndSelect() {
    let name = this.ref.nativeElement.getElementsByClassName('name')[0];
    name.focus();
    let text = name.childNodes[0];
    let range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, text.length);

    let s = window.getSelection();
    if (s) {
      s.removeAllRanges();
      s.addRange(range);
    }
  }
}

export enum FolderState {
  IDLE = 0,
  EDIT = 1
}

export class AppFolder {
  public state: FolderState;
  public name: string;
  public locked: boolean;
  public isDirectory: boolean = true;

  constructor(name: string, state: FolderState, locked?: boolean) {
    this.state = state;
    this.name = name;
    locked ? this.locked = locked : this.locked = false;
  }
}
