import { Component, OnInit } from '@angular/core';
import { AdminService, Subscriber } from '../../../services/admin.service';

@Component({
  standalone: false,
  selector: 'app-admin-subscribers',
  templateUrl: './admin-subscribers.component.html',
  styleUrls: ['./admin-subscribers.component.scss']
})
export class AdminSubscribersComponent implements OnInit {
  subscribers: Subscriber[] = [];
  filteredSubscribers: Subscriber[] = [];
  isLoading = true;
  errorMessage = '';
  searchQuery = '';
  totalCount = 0;
  activeCount = 0;
  deletingId: number | null = null;
  successMessage = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSubscribers();
  }

  loadSubscribers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getSubscribers().subscribe({
      next: (response) => {
        this.subscribers = response.data;
        this.filteredSubscribers = [...this.subscribers];
        this.totalCount = response.total;
        this.activeCount = this.subscribers.filter(s => s.is_active).length;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load subscribers.';
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery = query;
    this.filteredSubscribers = this.subscribers.filter(s =>
      s.email.toLowerCase().includes(query) ||
      s.name.toLowerCase().includes(query)
    );
  }

  deleteSubscriber(id: number): void {
    if (!confirm('Are you sure you want to delete this subscriber?')) return;

    this.deletingId = id;
    this.adminService.deleteSubscriber(id).subscribe({
      next: () => {
        this.subscribers = this.subscribers.filter(s => s.id !== id);
        this.filteredSubscribers = this.filteredSubscribers.filter(s => s.id !== id);
        this.totalCount = this.subscribers.length;
        this.activeCount = this.subscribers.filter(s => s.is_active).length;
        this.deletingId = null;
        this.showSuccess('Subscriber deleted successfully.');
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to delete subscriber.';
        this.deletingId = null;
      }
    });
  }

  exportCsv(): void {
    const headers = ['ID', 'Name', 'Email', 'Subscription Date', 'Active'];
    const rows = this.filteredSubscribers.map(s => [
      s.id,
      `"${s.name}"`,
      s.email,
      new Date(s.subscription_date).toLocaleDateString(),
      s.is_active ? 'Yes' : 'No'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => this.successMessage = '', 3000);
  }
}
