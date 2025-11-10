import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-20 w-20 rounded-full bg-primary-500 flex items-center justify-center">
                <span class="text-2xl font-medium text-white">
                  {{ (currentUser$ | async)?.username?.charAt(0)?.toUpperCase() }}
                </span>
              </div>
            </div>
            <div class="ml-6">
              <h1 class="text-2xl font-bold text-gray-900">{{ (currentUser$ | async)?.username }}</h1>
              <p class="text-gray-600">{{ (currentUser$ | async)?.email }}</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span *ngFor="let role of (currentUser$ | async)?.roles" 
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {{ role.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Quick Actions -->
        <div class="lg:col-span-1">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div class="space-y-3">
                <!-- Student Actions -->
                <div *ngIf="!(isModeratorOrAdmin$ | async)">
                  <a routerLink="/settings" 
                     class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                    Account Settings
                  </a>
                  <a routerLink="/content" 
                     class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Browse Content
                  </a>
                </div>
                
                <!-- Moderator/Admin Actions -->
                <div *ngIf="isModeratorOrAdmin$ | async" class="space-y-3">
                  <a routerLink="/content/create" 
                     class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                    Create Content
                  </a>
                  <a routerLink="/content/my" 
                     class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    My Content
                  </a>
                  <a routerLink="/settings" 
                     class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Settings
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
              <p class="text-gray-500">Activity tracking coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  private authService = inject(AuthService);
  
  currentUser$ = this.authService.currentUser$;
  isModeratorOrAdmin$ = this.authService.currentUser$.pipe(
    map(user => user ? this.authService.isModeratorOrAdmin() : false)
  );
}
