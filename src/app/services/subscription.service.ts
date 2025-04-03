import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SubscriptionRequest {
  email: string;
  name: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name: string;
  subscriptionDate: Date;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscribers`;

  constructor(private http: HttpClient) {}

  subscribe(data: SubscriptionRequest): Observable<Subscriber> {
    return this.http.post<Subscriber>(this.apiUrl, data)
      .pipe(
        catchError(error => {
          if (error.status === 409) {
            return throwError(() => new Error('This email is already subscribed'));
          }
          return throwError(() => new Error('Failed to subscribe. Please try again later.'));
        })
      );
  }

  unsubscribe(email: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/unsubscribe/${email}`);
  }
}

