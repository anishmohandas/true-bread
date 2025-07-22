import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ArticlesComponent } from './components/articles/articles.component';
import { ArticleDetailComponent } from './components/article-detail/article-detail.component';
import { LatestIssueComponent } from './components/latest-issue/latest-issue.component';
import { FeaturedArticlesComponent } from './components/featured-articles/featured-articles.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { SubscriptionComponent } from './components/subscription/subscription.component';
import { PreloaderComponent } from './components/preloader/preloader.component';
import { PublicationsComponent } from './components/publications/publications.component';
import { AboutComponent } from './components/about/about.component';
import { SafeHtmlPipe } from './shared/pipes/safe-html.pipe';
import { LogoComponent } from './components/header/logo/logo.component';
import { MenuToggleComponent } from './components/header/menu-toggle/menu-toggle.component';
import { MenuComponent } from './components/header/menu/menu.component';
import { ContactComponent } from './components/contact/contact.component';

// Add new Editorial components
import { LatestEditorialComponent } from './components/latest-editorial/latest-editorial.component';
import { EditorialComponent } from './components/editorial/editorial.component';
import { SubscribeComponent } from './components/subscribe/subscribe.component';
import { InfiniteScrollCardsComponent } from './components/infinite-scroll-cards/infinite-scroll-cards.component';
import { PdfPreviewComponent } from './components/pdf-preview/pdf-preview.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    ArticlesComponent,
    ArticleDetailComponent,
    LatestIssueComponent,
    FeaturedArticlesComponent,
    TestimonialsComponent,
    SubscriptionComponent,
    PreloaderComponent,
    PublicationsComponent,
    AboutComponent,
    SafeHtmlPipe,
    LogoComponent,
    MenuToggleComponent,
    MenuComponent,
    ContactComponent,
    // Add new Editorial components
    LatestEditorialComponent,
    EditorialComponent,
    // Add Subscribe component
    SubscribeComponent,
    // Add Infinite Scroll Cards component
    InfiniteScrollCardsComponent,
    // Add PDF Preview component
    PdfPreviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }






