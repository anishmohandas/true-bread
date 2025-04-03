import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Editorial } from '../shared/interfaces/editorial.interface';

interface EditorialResponse {
  status: string;
  data: {
    id: string;
    title: string;
    content: string;
    contentMl?: string;
    excerpt: string;
    excerptMl?: string;
    publishDate: string;
    editor: EditorResponse;
    image_url: string;
    month: string;
    month_ml?: string;
    year: number;
    language: 'en' | 'ml';
    titleMl?: string;
  };
}
interface EditorResponse {
  id:number;
  name:string;
  role:string;
  imageUrl:string;
  bio:string;
  nameMl?:string;
  roleMl?:string;
  bioMl?:string;
}

@Injectable({
  providedIn: 'root'
})
export class EditorialService {
  private apiUrl = `${environment.apiUrl}/editorials`;
  private currentLanguage: 'en' | 'ml' = 'en';

  constructor(private http: HttpClient) {}

  setLanguage(lang: 'en' | 'ml') {
    this.currentLanguage = lang;
  }

  getEditorialById(id: string): Observable<EditorialResponse> {
    return this.http.get<EditorialResponse>(`${this.apiUrl}/${id}`);
  }

  getLatestEditorial(): Observable<EditorialResponse> {
    return this.http.get<EditorialResponse>(`${this.apiUrl}/latest`);
  }
}








