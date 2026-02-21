import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminSubscribersComponent } from './admin-subscribers/admin-subscribers.component';
import { AdminArticleUploadComponent } from './admin-article-upload/admin-article-upload.component';
import { AdminPublicationUploadComponent } from './admin-publication-upload/admin-publication-upload.component';
import { AdminArticlesComponent } from './admin-articles/admin-articles.component';
import { AdminPublicationsComponent } from './admin-publications/admin-publications.component';
import { AdminAuthGuard } from '../../guards/admin-auth.guard';

const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },
  {
    path: 'dashboard',
    component: AdminDashboardComponent,
    canActivate: [AdminAuthGuard],
    children: [
      { path: '', redirectTo: 'subscribers', pathMatch: 'full' },
      { path: 'subscribers', component: AdminSubscribersComponent },
      { path: 'articles', component: AdminArticlesComponent },
      { path: 'articles/upload', component: AdminArticleUploadComponent },
      { path: 'articles/edit/:id', component: AdminArticleUploadComponent },
      { path: 'publications', component: AdminPublicationsComponent },
      { path: 'publications/upload', component: AdminPublicationUploadComponent },
      { path: 'publications/edit/:id', component: AdminPublicationUploadComponent }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
