import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Article } from '../shared/interfaces/article.interface';

interface ApiResponse<T> {
  status: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private apiUrl = `${environment.apiUrl}/articles`;
  private currentLanguage: 'en' | 'ml' = 'en';

  constructor(private http: HttpClient) {}

  setLanguage(lang: 'en' | 'ml') {
    this.currentLanguage = lang;
  }

  getLanguage(): 'en' | 'ml' {
    return this.currentLanguage;
  }

  transformArticle(article: Article): Article {
    if (article.language === 'ml') {
      return {
        ...article,
        title: article.titleMl || article.title,
        author: article.authorMl || article.author,
        content: article.contentMl || article.content,
        excerpt: article.excerptMl || article.excerpt,
        altText: article.altTextMl || article.altText,
        category: article.categoryMl || article.category,
        jobTitle: article.jobTitleMl || article.jobTitle,
        worksAt: article.worksAtMl || article.worksAt,
        language: 'ml' as const
      };
    }
    return article;
  }

  getArticles(): Observable<Article[]> {
    return this.http.get<ApiResponse<Article[]>>(`${this.apiUrl}`).pipe(
      map(response => {
        if (!Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }
        return response.data.map(article => this.transformArticle(article));
      }),
      catchError(error => {
        console.error('Error fetching articles:', error);
        return throwError(() => new Error('Failed to fetch articles'));
      })
    );
  }

  getArticleById(id: string): Observable<Article> {
    return this.http.get<ApiResponse<Article>>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        const article = response.data;
        
        if (article.language === 'ml') {
          const transformedArticle = {
            ...article,
            // Use camelCase properties instead of snake_case
            title: article.titleMl || article.title,
            author: article.authorMl || article.author,
            content: article.contentMl || article.content,
            excerpt: article.excerptMl || article.excerpt,
            alt_text: article.altTextMl || article.altText,
            category: article.categoryMl || article.category,
            job_title: article.jobTitleMl || article.jobTitle,
            works_at: article.worksAtMl || article.worksAt,
            language: 'ml' as const
          };
          
          console.log('Malayalam fields present:', {
            hasTitle: !!article.titleMl,
            hasContent: !!article.contentMl,
            hasAuthor: !!article.authorMl
          });
          
          return transformedArticle;
        }
        
        return article;
      }),
      catchError(error => {
        console.error('Error fetching article:', error);
        return throwError(() => new Error('Failed to fetch article'));
      })
    );
  }

  getFeaturedArticles(): Observable<Article[]> {
    return this.http.get<ApiResponse<Article[]>>(`${this.apiUrl}/featured`).pipe(
      map(response => {
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }
        return response.data.map(article => this.transformArticle(article));
      }),
      catchError(error => {
        console.error('Error fetching featured articles:', error);
        return throwError(() => new Error('Failed to fetch featured articles'));
      })
    );
  }

  private getImageUrl(url: string): string {
    if (!url) {
      console.log('URL is undefined or empty, using placeholder');
      return '/assets/images/placeholder.jpg';
    }
    
    console.log('getImageUrl input:', url);
    let result = '';

    if (url.startsWith('http')) {
      result = url;
    } else if (url.startsWith('/api/')) {
      result = `${environment.apiUrl}${url}`;
    } else if (url.startsWith('assets/')) {
      result = '/' + url;
    } else if (url.startsWith('/assets/')) {
      result = url;
    } else {
      result = `/assets/images/articles/${url}`;
    }

    console.log('getImageUrl output:', result);
    return result;
  }

  private decodeMalayalamText(text: string): string {
    if (!text) return '';
    
    try {
      // First decode any URI encoded components
      text = decodeURIComponent(text);
      
      // Handle escaped Unicode sequences
      text = text.replace(/\\u([a-fA-F0-9]{4})/g, (match, grp) => 
        String.fromCharCode(parseInt(grp, 16))
      );
      
      // Handle double-escaped backslashes before Malayalam characters
      text = text.replace(/\\\\([^\x00-\x7F])/g, '$1');
      
      // Handle remaining escaped Malayalam characters
      text = text.replace(/\\([^\x00-\x7F])/g, '$1');
      
      return text;
    } catch (e) {
      console.error('Error decoding Malayalam text:', e);
      return text;
    }
  }

  private cleanMalayalamText(text: string | undefined): string {
    if (!text) return '';
    
    try {
      // First decode any URI encoded components
      let cleaned = decodeURIComponent(text);
      
      // Handle escaped Unicode sequences
      cleaned = cleaned.replace(/\\u([a-fA-F0-9]{4})/g, (match, grp) => 
        String.fromCharCode(parseInt(grp, 16))
      );
      
      // Handle all types of escapes in a specific order
      cleaned = cleaned
        .replace(/\\\\([^\x00-\x7F])/g, '$1')  // Double-escaped Malayalam chars
        .replace(/\\([^\x00-\x7F])/g, '$1')    // Single-escaped Malayalam chars
        .replace(/\\([nN])/g, '$1')            // Newlines
        .replace(/\\\\/g, '\\')                // Double backslashes
        .replace(/\\'/g, "'")                  // Escaped quotes
        .replace(/\\/g, '');                   // Any remaining single backslashes
      
      return cleaned.trim();
    } catch (e) {
      console.error('Error cleaning Malayalam text:', e);
      return text;
    }
  }
}






















