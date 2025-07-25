import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
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
    private articleService: ArticleService
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
}
