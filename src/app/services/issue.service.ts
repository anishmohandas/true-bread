import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { Issue } from '../shared/interfaces/issue.interface';
import { Publication } from '../shared/interfaces/publication.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private apiUrl = `${environment.apiUrl}/publications`;

  constructor(private http: HttpClient) {}

  getLatestIssue(): Observable<Issue> {
    return this.http.get<Publication>(`${this.apiUrl}/latest`).pipe(
      map(publication => ({
        id: publication.id,
        month: publication.month,
        year: publication.year,
        coverImage: publication.coverImage,
        description: publication.description,
        highlights: publication.highlights,
        pdfUrl: publication.pdfUrl,
        issueNumber: publication.issueNumber
      })),
      catchError(error => {
        console.error('Error fetching latest issue:', error);
        return throwError(() => new Error('Failed to fetch latest issue'));
      })
    );
  }
}

