import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, SystemStats } from '../../../core/services/admin.service';
import { ContentService } from '../../../core/services/content.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p class="text-lg text-gray-600">System overview and management tools</p>
      </div>

      <!-- System Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Users -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.totalUsers }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Users -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.activeUsers }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Content -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Content</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.totalContent }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Published Content -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Published</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.publishedContent }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- User Management -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <svg class="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              <h3 class="ml-3 text-lg font-medium text-gray-900">User Management</h3>
            </div>
            <p class="text-sm text-gray-500 mb-4">Manage user accounts, roles, and permissions</p>
            <button (click)="activeTab = 'users'; loadUsers()" 
                    class="w-full btn btn-primary">
              Manage Users
            </button>
          </div>
        </div>

        <!-- Content Management -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <h3 class="ml-3 text-lg font-medium text-gray-900">Content Management</h3>
            </div>
            <p class="text-sm text-gray-500 mb-4">Moderate content, manage categories and types</p>
            <button (click)="activeTab = 'content'" 
                    class="w-full btn btn-primary">
              Manage Content
            </button>
          </div>
        </div>

        <!-- System Settings -->
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-6">
            <div class="flex items-center mb-4">
              <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <h3 class="ml-3 text-lg font-medium text-gray-900">System Settings</h3>
            </div>
            <p class="text-sm text-gray-500 mb-4">Configure categories, study programs, and settings</p>
            <button (click)="activeTab = 'settings'" 
                    class="w-full btn btn-primary">
              System Settings
            </button>
          </div>
        </div>
      </div>

      <!-- Tabbed Interface -->
      <div class="bg-white shadow rounded-lg" *ngIf="activeTab">
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8 px-6">
            <button (click)="activeTab = 'users'; loadUsers()"
                    [class]="activeTab === 'users' ? 'border-indigo-500 text-indigo-600 py-4 px-1 border-b-2 font-medium text-sm' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-4 px-1 border-b-2 font-medium text-sm'">
              User Management
            </button>
            <button (click)="activeTab = 'content'"
                    [class]="activeTab === 'content' ? 'border-indigo-500 text-indigo-600 py-4 px-1 border-b-2 font-medium text-sm' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-4 px-1 border-b-2 font-medium text-sm'">
              Content Management
            </button>
            <button (click)="activeTab = 'settings'"
                    [class]="activeTab === 'settings' ? 'border-indigo-500 text-indigo-600 py-4 px-1 border-b-2 font-medium text-sm' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-4 px-1 border-b-2 font-medium text-sm'">
              System Settings
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- User Management Tab -->
          <div *ngIf="activeTab === 'users'">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">User Management</h3>
              <span class="text-sm text-gray-500">{{ users.length }} users</span>
            </div>
            
            <!-- Loading State -->
            <div *ngIf="isLoadingUsers" class="text-center py-8">
              <svg class="animate-spin mx-auto h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="mt-2 text-sm text-gray-500">Loading users...</p>
            </div>
            
            <!-- User Filters -->
            <div *ngIf="!isLoadingUsers" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <input type="text" 
                       [(ngModel)]="userSearchQuery"
                       (input)="onUserSearchChange()"
                       placeholder="Search users..."
                       class="form-input">
              </div>
              <div>
                <select [(ngModel)]="selectedUserRole" (change)="loadUsers()" class="form-input">
                  <option value="">All Roles</option>
                  <option value="STUDENT">Students</option>
                  <option value="MODERATOR">Moderators</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
              <div>
                <select [(ngModel)]="selectedUserStatus" (change)="loadUsers()" class="form-input">
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <!-- Users Table -->
            <div *ngIf="!isLoadingUsers" class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Study Program</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let user of users" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span class="text-sm font-medium text-gray-700">{{ getInitials(user) }}</span>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ user.firstName }} {{ user.lastName }}</div>
                          <div class="text-sm text-gray-500">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <select [value]="getPrimaryRole(user)" 
                              (change)="updateUserRole(user.id, $event)"
                              class="text-sm border-gray-300 rounded-md">
                        <option value="STUDENT">Student</option>
                        <option value="MODERATOR">Moderator</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <button (click)="toggleUserStatus(user)"
                              [class]="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {{ user.isActive ? 'Active' : 'Inactive' }}
                      </button>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ user.kierunek?.name || 'Not specified' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ user.createdAt | date:'shortDate' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button (click)="deleteUser(user.id)" 
                              [disabled]="user.id === getCurrentUserId()"
                              [class]="user.id === getCurrentUserId() ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'"
                              [title]="user.id === getCurrentUserId() ? 'Cannot delete your own account' : 'Delete user'">
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <!-- Empty State -->
              <div *ngIf="!isLoadingUsers && users.length === 0" class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
                <h3 class="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p class="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            </div>
          </div>

          <!-- Content Management Tab -->
          <div *ngIf="activeTab === 'content'">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Content Management</h3>
            <p class="text-gray-600">Content moderation tools coming soon...</p>
          </div>

          <!-- System Settings Tab -->
          <div *ngIf="activeTab === 'settings'">
            <h3 class="text-lg font-medium text-gray-900 mb-4">System Settings</h3>
            <p class="text-gray-600">Category and kierunek management coming soon...</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-12">
        <svg class="animate-spin mx-auto h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-sm text-gray-500">Loading admin data...</p>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private contentService = inject(ContentService);
  private authService = inject(AuthService);

  // State
  isLoading = true;
  activeTab: 'users' | 'content' | 'settings' | null = null;
  isLoadingUsers = false;

  // Statistics
  stats: SystemStats = {
    totalUsers: 0,
    activeUsers: 0,
    totalContent: 0,
    publishedContent: 0,
    draftContent: 0,
    totalCategories: 0,
    totalKieruneks: 0
  };

  // User Management
  users: User[] = [];
  userSearchQuery = '';
  selectedUserRole = '';
  selectedUserStatus = '';
  private userSearchTimeout: any;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    
    // For now, we'll calculate stats manually from existing endpoints
    // until we implement the stats endpoint
    this.calculateStats();
  }

  private calculateStats(): void {
    // Get content stats
    this.contentService.getPublishedContent(0, 1000).subscribe({
      next: (contentPage) => {
        this.stats.totalContent = contentPage.totalElements || 0;
        this.stats.publishedContent = contentPage.totalElements || 0;
      },
      error: () => {
        this.stats.totalContent = 0;
        this.stats.publishedContent = 0;
      }
    });

    // Get user stats
    this.adminService.getAllUsers({ page: 0, size: 1000 }).subscribe({
      next: (usersPage) => {
        this.stats.totalUsers = usersPage.totalElements || 0;
        this.stats.activeUsers = usersPage.content?.filter(user => user.isActive).length || 0;
      },
      error: () => {
        this.stats.totalUsers = 0;
        this.stats.activeUsers = 0;
      }
    });

    // Set some default stats for now
    this.stats.draftContent = 0;
    this.stats.totalCategories = 5;
    this.stats.totalKieruneks = 3;
    
    this.isLoading = false;
  }

  // User Management Methods
  onUserSearchChange(): void {
    if (this.userSearchTimeout) {
      clearTimeout(this.userSearchTimeout);
    }
    
    this.userSearchTimeout = setTimeout(() => {
      this.loadUsers();
    }, 300);
  }

  loadUsers(): void {
    this.isLoadingUsers = true;
    const params: any = {
      page: 0,
      size: 50,
      sortBy: 'createdAt',
      sortDir: 'desc'
    };

    if (this.userSearchQuery) {
      params.search = this.userSearchQuery;
    }
    if (this.selectedUserRole) {
      params.role = this.selectedUserRole;
    }

    this.adminService.getAllUsers(params).subscribe({
      next: (response) => {
        let users = response.content || [];
        
        // Apply status filter on frontend since backend doesn't support it yet
        if (this.selectedUserStatus) {
          const isActive = this.selectedUserStatus === 'true';
          users = users.filter(user => user.isActive === isActive);
        }
        
        this.users = users;
        this.isLoadingUsers = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        // Fallback to empty array
        this.users = [];
        this.isLoadingUsers = false;
      }
    });
  }

  updateUserRole(userId: number, event: any): void {
    const role = event.target.value;
    this.adminService.updateUserRole(userId, role).subscribe({
      next: () => {
        // Refresh user list
        this.loadUsers();
        // TODO: Show success message
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        alert('Error updating user role. Please try again.');
        // Refresh to revert the change
        this.loadUsers();
      }
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus = !user.isActive;
    this.adminService.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        user.isActive = newStatus;
        // TODO: Show success message
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        alert('Error updating user status. Please try again.');
        // Revert the change
        user.isActive = !newStatus;
      }
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.loadUsers();
          // TODO: Show success message
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Error deleting user. Please try again.');
        }
      });
    }
  }

  getPrimaryRole(user: User): string {
    // Get the highest role (assuming ADMIN > MODERATOR > STUDENT)
    if (user.roles && user.roles.length > 0) {
      const roleNames = user.roles.map(role => role.name);
      if (roleNames.includes('ADMIN')) return 'ADMIN';
      if (roleNames.includes('MODERATOR')) return 'MODERATOR';
      return 'STUDENT';
    }
    return 'STUDENT';
  }

  getInitials(user: User): string {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || '?';
  }

  getCurrentUserId(): number | null {
    return this.authService.getCurrentUser()?.id || null;
  }
}
