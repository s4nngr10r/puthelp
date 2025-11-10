import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, MessageResponse } from '../models/auth.models';
import { Content, Category, Page } from '../models/content.models';
import { environment } from '../../../environments/environment';

export interface UserManagementRequest {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  search?: string;
  role?: string;
}

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  totalCategories: number;
  totalKieruneks: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // System Statistics
  getSystemStats(): Observable<SystemStats> {
    // This will be implemented with actual backend endpoints
    // For now, we'll aggregate from existing endpoints
    return this.http.get<SystemStats>(`${this.API_URL}/admin/stats`);
  }

  // User Management
  getAllUsers(params: UserManagementRequest = {}): Observable<Page<User>> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 10).toString())
      .set('sortBy', params.sortBy || 'createdAt')
      .set('sortDir', params.sortDir || 'desc');

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.role) {
      httpParams = httpParams.set('role', params.role);
    }

    return this.http.get<Page<User>>(`${this.API_URL}/auth/admin/users`, { params: httpParams });
  }

  updateUserRole(userId: number, role: string): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.API_URL}/auth/admin/users/${userId}/role`, { role });
  }

  updateUserStatus(userId: number, isActive: boolean): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.API_URL}/auth/admin/users/${userId}/status`, { isActive });
  }

  deleteUser(userId: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.API_URL}/auth/admin/users/${userId}`);
  }

  // Content Management
  getAllContent(params: any = {}): Observable<Page<Content>> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 10).toString())
      .set('sortBy', params.sortBy || 'createdAt')
      .set('sortDir', params.sortDir || 'desc');

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.type) {
      httpParams = httpParams.set('type', params.type);
    }
    if (params.authorId) {
      httpParams = httpParams.set('authorId', params.authorId.toString());
    }

    return this.http.get<Page<Content>>(`${this.API_URL}/content/admin`, { params: httpParams });
  }

  moderateContent(contentId: number, action: 'approve' | 'reject', reason?: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/content/admin/${contentId}/moderate`, { 
      action, 
      reason 
    });
  }

  // Category Management (using existing endpoints)
  getAllCategories(params: any = {}): Observable<Page<Category>> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 10).toString())
      .set('sortBy', params.sortBy || 'name')
      .set('sortDir', params.sortDir || 'asc');

    return this.http.get<Page<Category>>(`${this.API_URL}/categories`, { params: httpParams });
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

  // Kierunek Management (using existing endpoints)
  getAllKieruneks(params: any = {}): Observable<Page<any>> {
    let httpParams = new HttpParams()
      .set('page', (params.page || 0).toString())
      .set('size', (params.size || 10).toString())
      .set('sortBy', params.sortBy || 'name')
      .set('sortDir', params.sortDir || 'asc');

    return this.http.get<Page<any>>(`${this.API_URL}/kieruneks`, { params: httpParams });
  }

  createKierunek(kierunek: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/kieruneks`, kierunek);
  }

  updateKierunek(id: number, kierunek: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/kieruneks/${id}`, kierunek);
  }

  deleteKierunek(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${this.API_URL}/kieruneks/${id}`);
  }
}
