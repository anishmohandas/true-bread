import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Subscriber {
  id: number;
  email: string;
  name: string;
  subscription_date: string;
  is_active: boolean;
}

export interface AdminArticle {
  id: string;
  title: string;
  author: string;
  category: string;
  imageUrl: string;
  publishDate: string;
  readTime: number;
  isFeatured: boolean;
  language: string;
}

export interface AdminPublication {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  pdfUrl: string;
  publishDate: string;
  month: string;
  year: number;
  issueNumber: number | null;
}

export interface AdminLoginResponse {
  token: string;
  expiresIn: number;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ─── Auth ─────────────────────────────────────────────────────────────────

  login(username: string, password: string): Observable<AdminLoginResponse> {
    return this.http.post<AdminLoginResponse>(`${this.apiUrl}/admin/login`, { username, password })
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token_expiry');
    localStorage.removeItem('admin_username');
  }

  saveSession(response: AdminLoginResponse): void {
    localStorage.setItem('admin_token', response.token);
    localStorage.setItem('admin_token_expiry', String(Date.now() + response.expiresIn * 1000));
    localStorage.setItem('admin_username', response.username);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('admin_token');
    const expiry = localStorage.getItem('admin_token_expiry');
    if (!token || !expiry) return false;
    return Date.now() < parseInt(expiry);
  }

  getUsername(): string {
    return localStorage.getItem('admin_username') || 'Admin';
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('admin_token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ─── Subscribers ──────────────────────────────────────────────────────────

  getSubscribers(): Observable<{ status: string; data: Subscriber[]; total: number }> {
    return this.http.get<{ status: string; data: Subscriber[]; total: number }>(
      `${this.apiUrl}/admin/subscribers`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  deleteSubscriber(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/subscribers/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ─── Articles ─────────────────────────────────────────────────────────────

  getArticles(): Observable<{ status: string; data: AdminArticle[]; total: number }> {
    return this.http.get<{ status: string; data: AdminArticle[]; total: number }>(
      `${this.apiUrl}/admin/articles`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getArticle(id: string): Observable<{ status: string; data: any }> {
    return this.http.get<{ status: string; data: any }>(
      `${this.apiUrl}/admin/articles/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  createArticle(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/articles`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  updateArticle(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/articles/${id}`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/articles/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ─── Publications ─────────────────────────────────────────────────────────

  getPublications(): Observable<{ status: string; data: AdminPublication[]; total: number }> {
    return this.http.get<{ status: string; data: AdminPublication[]; total: number }>(
      `${this.apiUrl}/admin/publications`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  getPublication(id: string): Observable<{ status: string; data: any }> {
    return this.http.get<{ status: string; data: any }>(
      `${this.apiUrl}/admin/publications/${id}`,
      { headers: this.getAuthHeaders() }
    ).pipe(catchError(this.handleError));
  }

  createPublication(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/publications`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  updatePublication(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/publications/${id}`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  deletePublication(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/publications/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(catchError(this.handleError));
  }

  // ─── Error Handler ────────────────────────────────────────────────────────

  private handleError(error: any): Observable<never> {
    const message = error?.error?.error || error?.message || 'An unexpected error occurred.';
    return throwError(() => new Error(message));
  }
}
