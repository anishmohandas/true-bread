import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, AdminPublication } from '../../../services/admin.service';

@Component({
  standalone: false,
  selector: 'app-admin-publications',
  templateUrl: './admin-publications.component.html',
  styleUrls: ['./admin-publications.component.scss']
})
export class AdminPublicationsComponent implements OnInit {
  publications: AdminPublication[] = [];
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
    this.loadPublications();
  }

  loadPublications(): void {
    this.loading = true;
    this.error = '';
    this.adminService.getPublications().subscribe({
      next: (res) => {
        this.publications = res.data;
        console.log(this.publications);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load publications.';
        this.loading = false;
      }
    });
  }

  confirmDelete(id: string): void {
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  deletePublication(id: string): void {
    this.deletingId = id;
    this.confirmDeleteId = null;
    this.adminService.deletePublication(id).subscribe({
      next: () => {
        this.publications = this.publications.filter(p => p.id !== id);
        this.deletingId = null;
        this.successMessage = 'Publication deleted successfully.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.error = err.message || 'Failed to delete publication.';
        this.deletingId = null;
      }
    });
  }

  editPublication(id: string): void {
    this.router.navigate(['/admin/dashboard/publications/edit', id]);
  }

  goToUpload(): void {
    this.router.navigate(['/admin/dashboard/publications/upload']);
  }

  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  getPdfFilename(pdfUrl: string): string {
    if (!pdfUrl) return '—';
    return pdfUrl.split('/').pop() || pdfUrl;
  }
}
