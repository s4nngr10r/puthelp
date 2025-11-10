import { Component, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a routerLink="/home" class="flex-shrink-0 flex items-center">
              <h1 class="text-xl font-bold text-primary-600">PUT Help</h1>
            </a>
            
            <div class="hidden md:ml-10 md:flex md:space-x-8">
              <a routerLink="/home" 
                 routerLinkActive="border-primary-500 text-gray-900"
                 class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Home
              </a>
              <a routerLink="/content" 
                 routerLinkActive="border-primary-500 text-gray-900"
                 class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Content
              </a>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Search -->
            <div class="hidden md:block">
              <form (ngSubmit)="onSearch()" class="relative">
                <input type="text" 
                       [(ngModel)]="searchQuery"
                       name="searchQuery"
                       placeholder="Search guides..."
                       class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                <button type="submit" 
                        class="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </button>
              </form>
            </div>
            
            <!-- User menu -->
            <div class="relative" *ngIf="isAuthenticated$ | async; else loginButton">
              <button (click)="toggleUserMenu()" 
                      class="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <span class="text-sm font-medium text-white">
                    {{ (currentUser$ | async)?.username?.charAt(0)?.toUpperCase() }}
                  </span>
                </div>
              </button>
              
              <div *ngIf="showUserMenu" 
                   class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                <div class="py-1">
                  <div class="px-4 py-2 text-sm text-gray-700 border-b">
                    {{ (currentUser$ | async)?.username }}
                  </div>
                  <a *ngIf="isModeratorOrAdmin$ | async" 
                     routerLink="/profile" 
                     (click)="closeUserMenu()"
                     class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </a>
                  <a routerLink="/settings" 
                     (click)="closeUserMenu()"
                     class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </a>
                  <div *ngIf="isModeratorOrAdmin$ | async">
                    <div class="border-t border-gray-100"></div>
                    <a routerLink="/content/my" 
                       (click)="closeUserMenu()"
                       class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      My Content
                    </a>
                    <a routerLink="/content/create" 
                       (click)="closeUserMenu()"
                       class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Create Content
                    </a>
                  </div>
                  <div *ngIf="isAdmin$ | async">
                    <div class="border-t border-gray-100"></div>
                    <a routerLink="/admin" 
                       (click)="closeUserMenu()"
                       class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Admin Panel
                    </a>
                  </div>
                  <div class="border-t border-gray-100"></div>
                  <button (click)="logout()" 
                          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sign out
                  </button>
                </div>
              </div>
            </div>
            
            <ng-template #loginButton>
              <div class="flex space-x-2">
                <a routerLink="/auth/login" 
                   class="btn btn-outline">
                  Sign in
                </a>
                <a routerLink="/auth/register" 
                   class="btn btn-primary">
                  Sign up
                </a>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  
  isAuthenticated$ = this.authService.isAuthenticated$;
  currentUser$ = this.authService.currentUser$;
  isAdmin$ = this.authService.currentUser$.pipe(
    map(user => user ? this.authService.isAdmin() : false)
  );
  isModeratorOrAdmin$ = this.authService.currentUser$.pipe(
    map(user => user ? this.authService.isModeratorOrAdmin() : false)
  );
  
  showUserMenu = false;
  searchQuery = '';

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.showUserMenu = false;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/content'], { 
        queryParams: { search: this.searchQuery.trim() } 
      });
      this.searchQuery = '';
    }
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Force logout even if server call fails
        this.router.navigate(['/home']);
      }
    });
  }
}
