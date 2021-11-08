import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FolderComponent } from './folder/folder.component';
import { FileComponent } from './file/file.component';
import { FileService } from './services/file.service';
import { HttpClientModule } from '@angular/common/http';
import { NgxFilesizeModule } from 'ngx-filesize';
import { FormsModule } from '@angular/forms';
import { ImageSliderComponent } from './image-slider/image-slider.component';

@NgModule({
  declarations: [
    AppComponent,
    FolderComponent,
    FileComponent,
    ImageSliderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgxFilesizeModule
  ],
  providers: [
    FileService
  ],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
