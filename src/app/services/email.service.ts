import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = `${environment.apiUrl}/email`;

  constructor(private http: HttpClient) {}

  sendContactEmail(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/contact`, data);
  }
}
