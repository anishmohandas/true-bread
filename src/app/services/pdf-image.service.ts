import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import { PdfConversionService } from './pdf-conversion.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PdfImageService {
  private imageCache: { [key: string]: string[] } = {};

  constructor(
    private http: HttpClient,
    private pdfConversionService: PdfConversionService
  ) {}

  /**
   * Get images converted from PDF pages
   * @param pdfId Identifier for the PDF (e.g., 'latest-issue')
   * @param count Number of images to retrieve
   * @param pdfUrl Optional direct URL to the PDF file
   * @returns Observable of image URLs
   */
  getPageImages(pdfId: string = 'latest-issue', count: number = 5, pdfUrl?: string): Observable<string[]> {
    console.log('PdfImageService.getPageImages called with:');
    console.log('- pdfId:', pdfId);
    console.log('- count:', count);
    console.log('- pdfUrl:', pdfUrl);

    // Check if we have cached images
    if (this.imageCache[pdfId] && this.imageCache[pdfId].length >= count) {
      console.log('Using cached images for:', pdfId);
      return of(this.imageCache[pdfId].slice(0, count));
    }

    // Always use pre-converted images from the backend
    console.log('Using pre-converted images for:', pdfId);
    const images = this.getStaticImagePaths(count, pdfId);
    this.imageCache[pdfId] = images;
    return of(images);
  }

  /**
   * Get a list of static image paths for testing
   * @param count Number of images to generate
   * @returns Array of image paths
   */
  getStaticImagePaths(count: number = 5, issueId: string = 'latest-issue'): string[] {
    console.log('Getting static image paths for:', issueId);

    const images: string[] = [];
    // Use assets/images for local images
    const baseUrl = 'assets/images';

    // For the April 2025 issue, always use april-2025 as the directory
    let cleanIssueId = 'april-2025';
    if (issueId !== 'april-2025' && issueId !== 'latest-issue') {
      // For other issues, clean up the issueId to create a valid directory name
      cleanIssueId = issueId.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
    }
    console.log('Using directory:', cleanIssueId);

    for (let i = 1; i <= count; i++) {
      // Use JPG files which should be pre-converted and placed in the correct directory
      const imageUrl = `${baseUrl}/highlights/${cleanIssueId}/page_${i}.jpg`;
      images.push(imageUrl);
      console.log('Added image URL:', imageUrl);
    }

    return images;
  }
}
