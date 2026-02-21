import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ArticlesComponent } from './components/articles/articles.component';
import { ArticleDetailComponent } from './components/article-detail/article-detail.component';
import { AboutComponent } from './components/about/about.component';
import { PublicationsComponent } from './components/publications/publications.component';
import { EditorialComponent } from './components/editorial/editorial.component';
import { ContactComponent } from './components/contact/contact.component';
import { SubscribeComponent } from './components/subscribe/subscribe.component';
import { PdfPreviewComponent } from './components/pdf-preview/pdf-preview.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    runGuardsAndResolvers: 'always'
  },
  { path: 'publications', component: PublicationsComponent },
  { path: 'articles', component: ArticlesComponent },
  { path: 'articles/:id', component: ArticleDetailComponent },
  { path: 'about', component: AboutComponent },
  { path: 'editorial/:id', component: EditorialComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'subscribe', component: SubscribeComponent },
  { path: 'preview', component: PdfPreviewComponent },
  { path: 'preview/:id', component: PdfPreviewComponent },
  {
    path: 'admin',
    loadChildren: () => import('./components/admin/admin.module').then(m => m.AdminModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    onSameUrlNavigation: 'reload',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }






