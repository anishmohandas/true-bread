import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface PreviewArticle {
  title: string;
  author: string;
  category: string;
  publishDate: string;
  readTime: number;
  content: string;
  imageUrl: string;
  altText: string;
  excerpt: string;
  language: string;
  isFeatured: boolean;
}

@Component({
  standalone: false,
  selector: 'app-admin-article-preview',
  templateUrl: './admin-article-preview.component.html',
  styleUrls: ['./admin-article-preview.component.scss']
})
export class AdminArticlePreviewComponent implements OnInit {
  article: PreviewArticle | null = null;
  notFound = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    try {
      const raw = sessionStorage.getItem('admin_article_preview');
      if (raw) {
        this.article = JSON.parse(raw);
      } else {
        this.notFound = true;
      }
    } catch {
      this.notFound = true;
    }
  }

  isHtmlContent(): boolean {
    return !!this.article?.content?.trim().startsWith('<');
  }

  getSafeHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.article?.content || '');
  }

  getFormattedContent(): string[] {
    if (!this.article?.content) return [];
    return this.article.content
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => p.replace(/\n/g, '<br>'));
  }

  close(): void {
    window.close();
  }
}
