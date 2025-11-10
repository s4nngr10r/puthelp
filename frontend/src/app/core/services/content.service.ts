import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Content, ContentRequest, Page, Category } from '../models/content.models';
import { Kierunek, MessageResponse } from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Public content endpoints
  getPublishedContent(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Observable<Page<Content>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    
    return this.http.get<Page<Content>>(`${this.API_URL}/content/public`, { params });
  }

  getPublishedContentByType(type: string, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc'): Observable<Page<Content>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir)
      .set('type', type);
    
    return this.http.get<Page<Content>>(`${this.API_URL}/content/public`, { params });
  }

  getPublishedContentById(id: number): Observable<Content> {
    return this.http.get<Content>(`${this.API_URL}/content/public/${id}`);
  }

  getContentByKierunek(kierunekId: number, page = 0, size = 10): Observable<Page<Content>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<Content>>(`${this.API_URL}/content/public/kierunek/${kierunekId}`, { params });
  }

  getContentByCategory(categoryId: number, page = 0, size = 10): Observable<Page<Content>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<Content>>(`${this.API_URL}/content/public/category/${categoryId}`, { params });
  }

  searchContent(query: string, page = 0, size = 10): Observable<Page<Content>> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<Content>>(`${this.API_URL}/content/public/search`, { params });
  }

  // Protected content endpoints
  createContent(content: ContentRequest): Observable<Content> {
    return this.http.post<Content>(`${this.API_URL}/content`, content);
  }

  updateContent(id: number, content: ContentRequest): Observable<Content> {
    return this.http.put<Content>(`${this.API_URL}/content/${id}`, content);
  }

  publishContent(id: number): Observable<Content> {
    return this.http.post<Content>(`${this.API_URL}/content/${id}/publish`, {});
  }

  deleteContent(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.API_URL}/content/${id}`);
  }

  getMyContent(paramsObj: any = {}): Observable<Page<Content>> {
    let params = new HttpParams()
      .set('page', (paramsObj.page || 0).toString())
      .set('size', (paramsObj.size || 10).toString())
      .set('sortBy', paramsObj.sortBy || 'createdAt')
      .set('sortDir', paramsObj.sortDir || 'desc');
    
    // Add optional filters
    if (paramsObj.search) {
      params = params.set('search', paramsObj.search);
    }
    if (paramsObj.status) {
      params = params.set('status', paramsObj.status);
    }
    if (paramsObj.type) {
      params = params.set('type', paramsObj.type);
    }
    
    return this.http.get<Page<Content>>(`${this.API_URL}/content/my`, { params });
  }

  getContentById(id: number): Observable<Content> {
    return this.http.get<Content>(`${this.API_URL}/content/${id}`);
  }

  // Categories
  getActiveCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.API_URL}/categories/public`);
  }

  getAllCategories(page = 0, size = 10): Observable<Page<Category>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<Category>>(`${this.API_URL}/categories`, { params });
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.API_URL}/categories`, category);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.API_URL}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.API_URL}/categories/${id}`);
  }

  // Kieruneks
  getActiveKieruneks(): Observable<Kierunek[]> {
    return this.http.get<Kierunek[]>(`${this.API_URL}/kieruneks/public`);
  }

  getAllKieruneks(page = 0, size = 10): Observable<Page<Kierunek>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<Kierunek>>(`${this.API_URL}/kieruneks`, { params });
  }

  createKierunek(kierunek: Partial<Kierunek>): Observable<Kierunek> {
    return this.http.post<Kierunek>(`${this.API_URL}/kieruneks`, kierunek);
  }

  updateKierunek(id: number, kierunek: Partial<Kierunek>): Observable<Kierunek> {
    return this.http.put<Kierunek>(`${this.API_URL}/kieruneks/${id}`, kierunek);
  }

  deleteKierunek(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.API_URL}/kieruneks/${id}`);
  }
}
