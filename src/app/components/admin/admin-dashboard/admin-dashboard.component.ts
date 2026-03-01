import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  standalone: false,
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  username = '';
  sidebarOpen = true;

  navItems = [
    {
      label: 'Subscribers',
      icon: 'users',
      route: '/admin/dashboard/subscribers'
    },
    {
      label: 'Articles',
      icon: 'list',
      route: '/admin/dashboard/articles'
    },
    {
      label: 'Upload Article',
      icon: 'file-text',
      route: '/admin/dashboard/articles/upload'
    },
    {
      label: 'Publications',
      icon: 'book-open',
      route: '/admin/dashboard/publications'
    },
    {
      label: 'Upload Publication',
      icon: 'upload',
      route: '/admin/dashboard/publications/upload'
    }
  ];

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.adminService.getUsername();
  }

  logout(): void {
    this.adminService.logout();
    this.router.navigate(['/admin/login']);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
