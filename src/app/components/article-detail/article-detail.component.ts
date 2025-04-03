import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ArticleService } from '../../services/article.service';
import { Article } from '../../shared/interfaces/article.interface';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss']
})
export class ArticleDetailComponent implements OnInit {
  article: Article | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.articleService.getArticleById(id).subscribe({
        next: (article) => {
          

          // Check if this is a Malayalam article
          const isMalayalam = article.language === 'ml';
          
          if (isMalayalam) {
            this.article = {
              ...article,
              title: article.titleMl || article.title,
              author: article.authorMl || article.author,
              jobTitle: article.jobTitleMl || article.jobTitle,
              worksAt: article.worksAtMl || article.worksAt,
              category: article.categoryMl || article.category,
              content: article.contentMl || article.content,
              excerpt: article.excerptMl || article.excerpt,
              altText: article.altTextMl || article.altText,
              language: 'ml' as const
            };

            if (this.article?.images) {
              this.article.images = this.article.images.map(image => ({
                ...image,
                alt: image.altMl || image.alt,
                caption: image.captionMl || image.caption
              }));
            }
          } else {
            this.article = article;
          }

          console.log('Transformed article:', this.article); // Debug log
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading article:', error);
          this.error = true;
          this.loading = false;
        }
      });
    });
  }

  getFormattedContent(): string[] {
    if (!this.article?.content) return [];
 
    return this.article.content
      .split('\n')
      .filter((paragraph: string) => paragraph.trim() !== '')
      .map((paragraph: string) => {
        const isMalayalam = this.article?.language === 'ml';
 
        if (/^\d+\.\s/.test(paragraph)) {
          return `<li>${paragraph.replace(/^\d+\.\s/, '')}</li>`;
        }
        if (paragraph.startsWith('"') && paragraph.endsWith('"')) {
          return `<blockquote>${paragraph}</blockquote>`;
        }
        if (!isMalayalam && paragraph.length < 100 && paragraph.endsWith(':')) {
          return `<h3>${paragraph}</h3>`;
        }
        return `<p>${paragraph}</p>`;
      });
  }

  handleImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/placeholder.jpg';
  }
}






















