import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PdfConversionService {
  // Always use localhost:3000 for the API URL to avoid CORS issues
  private apiUrl = 'http://localhost:3000/api';
  private baseUrl = environment.baseUrl || 'http://localhost:4200';

  constructor(private http: HttpClient) {}

  /**
   * Convert a PDF from a URL to images
   * @param pdfUrl URL of the PDF to convert
   * @param issueId Identifier for the issue
   * @param startPage First page to convert (1-based index)
   * @param endPage Last page to convert (1-based index)
   * @returns Observable of image URLs
   */
  convertPdfFromUrl(
    pdfUrl: string,
    issueId: string,
    startPage: number = 1,
    endPage: number = 5
  ): Observable<string[]> {
    const url = `${this.apiUrl}/pdf/convert-from-url`;

    // Handle relative URLs by prepending the base URL
    let fullPdfUrl = pdfUrl;
    if (pdfUrl && !pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://')) {
      // Remove leading slash if present
      const relativePath = pdfUrl.startsWith('/') ? pdfUrl.substring(1) : pdfUrl;
      // Use the backend server URL for PDF files
      const correctBaseUrl = 'http://localhost:3000/api/files';
      // Extract just the filename from the path
      const filename = relativePath.split('/').pop();
      fullPdfUrl = `${correctBaseUrl}/${filename}`;
      console.log('Using backend server for PDF:', fullPdfUrl);
      console.log('Converting relative URL to absolute:', fullPdfUrl);
    }

    const payload = {
      pdfUrl: fullPdfUrl,
      issueId,
      startPage,
      endPage
    };

    return this.http.post<{ success: boolean; images: string[] }>(url, payload).pipe(
      map(response => response.images),
      catchError(error => {
        console.error('Error converting PDF:', error);
        return of([]);
      })
    );
  }

  /**
   * Upload and convert a PDF file to images
   * @param pdfFile PDF file to convert
   * @param issueId Identifier for the issue
   * @param startPage First page to convert (1-based index)
   * @param endPage Last page to convert (1-based index)
   * @returns Observable of image URLs
   */
  convertPdfFile(
    pdfFile: File,
    issueId: string,
    startPage: number = 1,
    endPage: number = 5
  ): Observable<string[]> {
    const url = `${this.apiUrl}/pdf/convert`;
    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('issueId', issueId);
    formData.append('startPage', startPage.toString());
    formData.append('endPage', endPage.toString());

    return this.http.post<{ success: boolean; images: string[] }>(url, formData).pipe(
      map(response => response.images),
      catchError(error => {
        console.error('Error converting PDF:', error);
        return of([]);
      })
    );
  }
}
