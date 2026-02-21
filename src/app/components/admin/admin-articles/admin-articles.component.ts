import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, AdminArticle } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-articles',
  templateUrl: './admin-articles.component.html',
  styleUrls: ['./admin-articles.component.scss']
})
export class AdminArticlesComponent implements OnInit {
  articles: AdminArticle[] = [];
  filteredArticles: AdminArticle[] = [];
  searchQuery = '';
  loading = false;
  error = '';
  successMessage = '';
  deletingId: string | null = null;
  confirmDeleteId: string | null = null;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.loading = true;
    this.error = '';
    this.adminService.getArticles().subscribe({
      next: (res) => {
        this.articles = res.data;
        this.filteredArticles = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load articles.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredArticles = this.articles;
    } else {
      this.filteredArticles = this.articles.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
  }

  confirmDelete(id: string): void {
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  deleteArticle(id: string): void {
    this.deletingId = id;
    this.confirmDeleteId = null;
    this.adminService.deleteArticle(id).subscribe({
      next: () => {
        this.articles = this.articles.filter(a => a.id !== id);
        this.filteredArticles = this.filteredArticles.filter(a => a.id !== id);
        this.deletingId = null;
        this.successMessage = 'Article deleted successfully.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.error = err.message || 'Failed to delete article.';
        this.deletingId = null;
      }
    });
  }

  editArticle(id: string): void {
    this.router.navigate(['/admin/dashboard/articles/edit', id]);
  }

  goToUpload(): void {
    this.router.navigate(['/admin/dashboard/articles/upload']);
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}
