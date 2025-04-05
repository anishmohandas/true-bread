import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { ShareService } from '../../services/share.service';
import { Article } from '../../shared/interfaces/article.interface';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {
  articles: Article[] = [];
  selectedCategory: string | null = null;
  categories: string[] = [];
  loading = true;
  error = false;

  constructor(
    private articleService: ArticleService,
    private shareService: ShareService
  ) {}

  ngOnInit(): void {
    this.articleService.getArticles().subscribe({
      next: (articles: Article[]) => {
        this.articles = articles;
        this.categories = [...new Set(articles.map(article => article.category))];
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error fetching articles:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  filterByCategory(category: string | null): void {
    this.selectedCategory = category;
  }

  get filteredArticles(): Article[] {
    if (!this.selectedCategory) return this.articles;
    return this.articles.filter(article => article.category === this.selectedCategory);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/placeholder.jpg';
  }

  /**
   * Share an article via WhatsApp
   * @param article The article to share
   * @param event The click event (to prevent navigation)
   */
  shareViaWhatsApp(article: Article, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Construct the article URL
    const baseUrl = window.location.origin;
    const articleUrl = `${baseUrl}/articles/${article.id}`;

    // Use the share service to share via WhatsApp
    this.shareService.shareViaWhatsApp(article, articleUrl);
  }

  /**
   * Share an article via Facebook
   * @param article The article to share
   * @param event The click event (to prevent navigation)
   */
  shareViaFacebook(article: Article, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Construct the article URL
    const baseUrl = window.location.origin;
    const articleUrl = `${baseUrl}/articles/${article.id}`;

    // Use the share service to share via Facebook
    this.shareService.shareViaFacebook(articleUrl);
  }

  /**
   * Share an article via X (Twitter)
   * @param article The article to share
   * @param event The click event (to prevent navigation)
   */
  shareViaX(article: Article, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Construct the article URL
    const baseUrl = window.location.origin;
    const articleUrl = `${baseUrl}/articles/${article.id}`;

    // Use the share service to share via X
    this.shareService.shareViaX(article, articleUrl);
  }

  /**
   * Share an article via Instagram
   * @param event The click event (to prevent navigation)
   */
  shareViaInstagram(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    // Use the share service to share via Instagram
    this.shareService.shareViaInstagram();
  }
}



