import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('admin_token');
    const expiry = localStorage.getItem('admin_token_expiry');

    if (!token || !expiry) {
      this.router.navigate(['/admin/login']);
      return false;
    }

    if (Date.now() > parseInt(expiry)) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_token_expiry');
      localStorage.removeItem('admin_username');
      this.router.navigate(['/admin/login']);
      return false;
    }

    return true;
  }
}
