import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FolderState, AppFolder } from '../folder/folder.component';
import { AppFile } from '../file/file.component';
import { EXTENSIONS_MAP } from './file-icons.constants';
import * as FileSaver from 'file-saver';

const server = 'http://localhost:8080/';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  currentPath: Array<string> = [];


  constructor(
    private http: HttpClient
  ) { }

  reload(fn: (data: any) => void) {
    this.getDirectory(this.currentPath).then(data => {
      fn(data)
    });
  }

  getDirectory(path: Array<string>) {
    return new Promise((resolve, reject) => {
      this.http.post('directory', { path: path }).toPromise().then((data: any) => {
        let result: any = [];
        data.forEach((item: any) => {
          let element;
          if (item.isFile) {
            let icon = this.getIconFromName(item.name);
            element = new AppFile(item.name, item.size, icon);
          }
          else if (item.isDirectory) {
            element = new AppFolder(item.name, FolderState.IDLE)
          }
          result.push(element);
        });
        resolve(result);
      });
    });
  }

  uploadFromEvent(event: any) {
    console.log(event);
  }

  uploadFile(file: File, directory?: string) {
    const formData = new FormData();
    const path = directory ? this.currentPath.concat([directory, file.name]) : this.currentPath.concat(file.name);
    formData.append('upload', file);
    formData.set('path', JSON.stringify(path));
    return this.http.post('upload', formData).toPromise().then((res) => {
      return res;
    });
  }

  newFolder() {
    return new Promise((resolve, reject) => {
      this.http.post('new-directory', {path: this.currentPath}).toPromise().then((response: any) => {
        resolve(new AppFolder(response.name, FolderState.EDIT));
      });
    });
  }

  deleteFolder(name: string) {
    let path = this.currentPath.concat(name);
    return new Promise((resolve, reject) => {
      this.http.post('force-delete-directory', {path: path}).toPromise().then((response) => {
        resolve(response);
      });
    })
  }

  deleteFile(name: string) {
    let path = this.currentPath.concat(name);
    return new Promise((resolve, reject) => {
      this.http.post('delete-file', {path: path}).toPromise().then(response => {
        resolve(response);
      });
    })
  }

  hasContent(name: string) {
    let path = this.currentPath.concat(name);
    return new Promise((resolve, reject) => {
      this.http.post('has-content', {path: path}).toPromise().then((response) => {
        resolve(response);
      });
    });
  }

  renameFolder(oldName: string, newName: string) {
    return new Promise((resolve, reject) => {
      this.http.post('rename-directory', {
        path: this.currentPath,
        old: oldName,
        new: newName
      }).toPromise().then(success => {
        if (success) {
          resolve(true);
        }
        else {
          reject();
        }
      });
    });
  }

  downloadFile(fileName: string) {
    let path = this.currentPath.concat(fileName);
    let params = {
      path: path
    }
    return new Promise((resolve, reject) => {
      this.http.get('download', {params: params, responseType: 'blob'})
        .subscribe((data: any) => {
          console.log(data);
          FileSaver.saveAs(data, fileName);
        });
    });
  }

  getFile(path: Array<string>): Promise<Blob> {
    let params = {
      path: path
    };

    return new Promise((resolve, reject) => {
      return this.http.get('download', { params: params, responseType: 'blob' })
        .subscribe((data: Blob) => {
          resolve(data);
        });
    });
  }

  getIconFromName(name: string): string {
    let icon = 'description';
    let splitted = name.split('.');
    let extension: string = splitted[splitted.length - 1].toUpperCase();
    if (EXTENSIONS_MAP[extension]) icon = EXTENSIONS_MAP[extension];
    return icon;
  }
}

