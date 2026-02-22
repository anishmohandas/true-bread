import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { QuillModule } from 'ngx-quill';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminSubscribersComponent } from './admin-subscribers/admin-subscribers.component';
import { AdminArticleUploadComponent } from './admin-article-upload/admin-article-upload.component';
import { AdminPublicationUploadComponent } from './admin-publication-upload/admin-publication-upload.component';
import { AdminArticlesComponent } from './admin-articles/admin-articles.component';
import { AdminPublicationsComponent } from './admin-publications/admin-publications.component';

@NgModule({
  declarations: [
    AdminLoginComponent,
    AdminDashboardComponent,
    AdminSubscribersComponent,
    AdminArticleUploadComponent,
    AdminPublicationUploadComponent,
    AdminArticlesComponent,
    AdminPublicationsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    AdminRoutingModule,
    QuillModule
  ],
  providers: [DatePipe]
})
export class AdminModule {}
