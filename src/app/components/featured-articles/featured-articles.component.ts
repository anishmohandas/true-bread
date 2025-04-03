import { Component, OnInit, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Article } from '../../shared/interfaces/article.interface';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-featured-articles',
  templateUrl: './featured-articles.component.html',
  styleUrls: ['./featured-articles.component.scss']
})
export class FeaturedArticlesComponent implements OnInit {
  @Input() articles: Article[] = [];
  loading = true;
  error = false;
  currentIndex = 0;
  slidesPerView = 4;

  constructor(
    private articleService: ArticleService,
    private router: Router
  ) {}

  ngOnInit() {
    this.calculateSlidesPerView();
    if (!this.articles?.length) {
      this.loadFeaturedArticles();
    } else {
      this.loading = false;
    }
  }

  private loadFeaturedArticles() {
    this.loading = true;
    this.error = false;
    
    this.articleService.getFeaturedArticles().subscribe({
      next: (articles) => {
        if (!articles?.length) {
          this.error = true;
          this.loading = false;
          this.articles = [];
          return;
        }
        
        this.articles = articles
          .filter((article): article is Article => 
            article !== null && 
            article !== undefined && 
            typeof article === 'object'
          )
          .map(article => this.transformArticle(article));
        
        this.loading = false;
        this.calculateSlidesPerView();
      },
      error: (error) => {
        console.error('Error fetching featured articles:', error);
        this.error = true;
        this.loading = false;
        this.articles = [];
      }
    });
  }

  private transformArticle(article: Article): Article {
    const base = {
      id: article.id || '',
      title: 'Untitled Article',
      author: 'Unknown Author',
      category: 'Uncategorized',
      altText: 'Article image',
      imageUrl: '/assets/images/placeholder.jpg',
      content: article.content || '',
      excerpt: article.excerpt || '',
      publishDate: article.publishDate || new Date().toISOString(),
      readTime: article.readTime || 0,
      language: article.language || 'en' as const,
      tags: article.tags || []
    };

    if (article.language === 'ml') {
      return {
        ...base,
        ...article,
        title: article.titleMl || article.title || base.title,
        author: article.authorMl || article.author || base.author,
        category: article.categoryMl || article.category || base.category,
        altText: article.altTextMl || article.altText || base.altText,
        imageUrl: article.imageUrl || base.imageUrl
      };
    }

    return {
      ...base,
      ...article,
      title: article.title || base.title,
      author: article.author || base.author,
      category: article.category || base.category,
      altText: article.altText || base.altText,
      imageUrl: article.imageUrl || base.imageUrl
    };
  }

  get totalSlides(): number {
    return Math.ceil(this.articles.length / (this.slidesPerView * 2));
  }

  get firstRowArticles(): Article[] {
    if (!Array.isArray(this.articles)) return [];
    return this.articles.slice(0, 3); // First 3 articles
  }

  get secondRowArticles(): Article[] {
    if (!Array.isArray(this.articles)) return [];
    return this.articles.slice(3, 6); // Next 3 articles
  }

  isLastSlide(): boolean {
    return (this.currentIndex + 1) * (this.slidesPerView * 2) >= this.articles.length;
  }

  @HostListener('window:resize')
  calculateSlidesPerView() {
    if (window.innerWidth >= 1536) { // 2xl breakpoint
      this.slidesPerView = 4;
    } else if (window.innerWidth >= 1280) { // xl breakpoint
      this.slidesPerView = 3;
    } else if (window.innerWidth >= 1024) { // lg breakpoint
      this.slidesPerView = 3;
    } else if (window.innerWidth >= 768) { // md breakpoint
      this.slidesPerView = 2;
    } else {
      this.slidesPerView = 1;
    }
    
    const maxIndex = Math.max(0, Math.floor(this.articles.length / (this.slidesPerView * 2)));
    this.currentIndex = Math.min(this.currentIndex, maxIndex);
    this.updateSlidePosition();
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateSlidePosition();
    }
  }

  nextSlide() {
    if (!this.isLastSlide()) {
      this.currentIndex++;
      this.updateSlidePosition();
    }
  }

  private updateSlidePosition() {
    const containers = document.querySelectorAll('.article-row');
    containers.forEach(container => {
      const slideWidth = 100 / this.slidesPerView;
      const offset = -this.currentIndex * slideWidth;
      (container as HTMLElement).style.transform = `translateX(${offset}%)`;
    });
  }

  navigateToArticle(articleId: string) {
    this.router.navigate(['/articles', articleId]);
  }

  handleImageError(event: Event) {
    if (event?.target) {
      const img = event.target as HTMLImageElement;
      img.src = '/assets/images/placeholder.jpg';
    }
  }
}

















