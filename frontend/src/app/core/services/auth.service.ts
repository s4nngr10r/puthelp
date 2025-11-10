import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap, throwError, catchError } from 'rxjs';
import { LoginRequest, SignupRequest, JwtResponse, MessageResponse, User, RefreshTokenRequest } from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl + '/auth';
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private initialized = false;

  constructor(private http: HttpClient) {
    this.initializeAuthState();
  }

  login(credentials: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.API_URL}/signin`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response);
          // Fetch full user profile after login
          this.fetchCurrentUser().subscribe();
        })
      );
  }

  signup(userData: SignupRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/signup`, userData);
  }

  logout(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.API_URL}/signout`, {})
      .pipe(
        tap(() => {
          this.clearAuthData();
        }),
        catchError((error) => {
          // Even if the server call fails, clear local auth data
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  logoutLocal(): void {
    this.clearAuthData();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Keep for backward compatibility
  getToken(): string | null {
    return this.getAccessToken();
  }

  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;
    
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp <= Date.now() / 1000;
    } catch {
      return true;
    }
  }

  refreshToken(): Observable<JwtResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshRequest: RefreshTokenRequest = { refreshToken };
    return this.http.post<JwtResponse>(`${this.API_URL}/refresh`, refreshRequest)
      .pipe(
        tap(response => {
          this.setAuthData(response);
        }),
        catchError(error => {
          this.clearAuthData();
          return throwError(() => error);
        })
      );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles.some(r => r.name === role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isModerator(): boolean {
    return this.hasRole('MODERATOR');
  }

  isModeratorOrAdmin(): boolean {
    return this.hasAnyRole(['MODERATOR', 'ADMIN']);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<MessageResponse> {
    const changePasswordRequest = {
      currentPassword,
      newPassword
    };
    return this.http.post<MessageResponse>(`${this.API_URL}/change-password`, changePasswordRequest);
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
        })
      );
  }

  private setAuthData(response: JwtResponse): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    }
    
    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email,
      firstName: '',
      lastName: '',
      isActive: true,
      roles: response.roles.map(role => ({
        id: 0,
        name: role.replace('ROLE_', '') as any,
        description: ''
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private initializeAuthState(): void {
    const accessToken = this.getAccessToken();
    if (accessToken && !this.isTokenExpired(accessToken)) {
      this.isAuthenticatedSubject.next(true);
      // Mark as initialized and defer user data fetching
      this.initialized = true;
      setTimeout(() => {
        this.fetchCurrentUser().subscribe({
          error: () => {
            // If fetching user fails, clear auth data
            this.clearAuthData();
          }
        });
      }, 100);
    } else if (accessToken && this.isTokenExpired(accessToken)) {
      // Try to refresh the token
      const refreshToken = this.getRefreshToken();
      if (refreshToken && !this.isTokenExpired(refreshToken)) {
        this.initialized = true;
        setTimeout(() => {
          this.refreshToken().subscribe({
            next: () => {
              this.fetchCurrentUser().subscribe({
                error: () => {
                  this.clearAuthData();
                }
              });
            },
            error: () => {
              this.clearAuthData();
            }
          });
        }, 100);
      } else {
        this.clearAuthData();
        this.initialized = true;
      }
    } else {
      this.clearAuthData();
      this.initialized = true;
    }
  }

  private checkAuthState(): void {
    const accessToken = this.getAccessToken();
    if (accessToken && !this.isTokenExpired(accessToken)) {
      this.isAuthenticatedSubject.next(true);
      this.fetchCurrentUser().subscribe();
    } else if (accessToken && this.isTokenExpired(accessToken)) {
      // Try to refresh the token
      const refreshToken = this.getRefreshToken();
      if (refreshToken && !this.isTokenExpired(refreshToken)) {
        this.refreshToken().subscribe({
          next: () => {
            this.fetchCurrentUser().subscribe();
          },
          error: () => {
            this.clearAuthData();
          }
        });
      } else {
        this.clearAuthData();
      }
    } else {
      this.clearAuthData();
    }
  }
}
