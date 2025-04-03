import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Publication } from '../shared/interfaces/publication.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PublicationsService {
  private apiUrl = `${environment.apiUrl}/publications`; // Changed from /publication to /publications

  constructor(private http: HttpClient) {}

  getAllPublications(): Observable<Publication[]> {
    return this.http.get<Publication[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Error fetching publications:', error);
          return throwError(() => new Error('Failed to fetch publications'));
        })
      );
  }

  getLatestPublication(): Observable<Publication> {
    return this.http.get<Publication>(`${this.apiUrl}/latest`)
      .pipe(
        catchError(error => {
          console.error('Error fetching latest publication:', error);
          return throwError(() => new Error('Failed to fetch latest publication'));
        })
      );
  }

  getPublicationById(id: string): Observable<Publication | undefined> {
    return this.http.get<Publication>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching publication:', error);
          return throwError(() => new Error('Failed to fetch publication'));
        })
      );
  }
}





