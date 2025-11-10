import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../core/services/content.service';
import { Content } from '../../../core/models/content.models';
import { marked } from 'marked';

@Component({
  selector: 'app-my-content',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">My Content</h1>
            <p class="text-lg text-gray-600">Manage your drafts and published content</p>
          </div>
          <a routerLink="/content/create" class="btn btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Create New Content
          </a>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total Content</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ totalElements }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

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
                  <dt class="text-sm font-medium text-gray-500 truncate">Published</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ publishedCount }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Drafts</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ draftCount }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label class="form-label">Search</label>
            <input type="text" 
                   [(ngModel)]="searchQuery"
                   (input)="onSearchChange()"
                   placeholder="Search your content..."
                   class="form-input">
          </div>

          <!-- Status Filter -->
          <div>
            <label class="form-label">Status</label>
            <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="form-input">
              <option value="">All Status</option>
              <option value="DRAFT">Drafts</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>

          <!-- Content Type -->
          <div>
            <label class="form-label">Type</label>
            <select [(ngModel)]="selectedType" (change)="applyFilters()" class="form-input">
              <option value="">All Types</option>
              <option value="GUIDE">Guides</option>
              <option value="TUTORIAL">Tutorials</option>
              <option value="FAQ">FAQ</option>
              <option value="NEWS">News</option>
              <option value="ANNOUNCEMENT">Announcements</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Content Table -->
      <div class="bg-white shadow rounded-lg overflow-hidden" *ngIf="contents.length > 0">
        <div class="px-4 py-5 sm:p-6">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let content of contents" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ content.title }}</div>
                    <div class="text-sm text-gray-500">{{ content.summary || getContentPreview(content.body) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-blue-100 text-blue-800': content.type === 'GUIDE',
                            'bg-green-100 text-green-800': content.type === 'TUTORIAL',
                            'bg-yellow-100 text-yellow-800': content.type === 'FAQ',
                            'bg-purple-100 text-purple-800': content.type === 'NEWS',
                            'bg-red-100 text-red-800': content.type === 'ANNOUNCEMENT'
                          }">
                      {{ content.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-green-100 text-green-800': content.status === 'PUBLISHED',
                            'bg-yellow-100 text-yellow-800': content.status === 'DRAFT'
                          }">
                      {{ content.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ content.viewCount }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ content.updatedAt | date:'shortDate' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <a [routerLink]="['/content', content.id]" 
                       class="text-indigo-600 hover:text-indigo-900">View</a>
                    <a [routerLink]="['/content/edit', content.id]" 
                       class="text-blue-600 hover:text-blue-900">Edit</a>
                    <button *ngIf="content.status === 'DRAFT'" 
                            (click)="publishContent(content.id)"
                            class="text-green-600 hover:text-green-900">Publish</button>
                    <button (click)="deleteContent(content.id)"
                            class="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="contents.length === 0 && !isLoading" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No content found</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating your first piece of content.</p>
        <div class="mt-6">
          <a routerLink="/content/create" class="btn btn-primary">Create Content</a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-12">
        <svg class="animate-spin mx-auto h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-sm text-gray-500">Loading your content...</p>
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8">
        <div class="flex flex-1 justify-between sm:hidden">
          <button [disabled]="currentPage === 0" 
                  (click)="goToPage(currentPage - 1)"
                  class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <button [disabled]="currentPage === totalPages - 1" 
                  (click)="goToPage(currentPage + 1)"
                  class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Next
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing page {{ currentPage + 1 }} of {{ totalPages }} ({{ totalElements }} total results)
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button [disabled]="currentPage === 0" 
                      (click)="goToPage(currentPage - 1)"
                      class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50">
                <span class="sr-only">Previous</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button *ngFor="let page of getPageNumbers()" 
                      (click)="goToPage(page)"
                      [class]="page === currentPage ? 'relative z-10 inline-flex items-center bg-primary-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600' : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'">
                {{ page + 1 }}
              </button>
              
              <button [disabled]="currentPage === totalPages - 1" 
                      (click)="goToPage(currentPage + 1)"
                      class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50">
                <span class="sr-only">Next</span>
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MyContentComponent implements OnInit {
  private contentService = inject(ContentService);

  contents: Content[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  pageSize = 10;
  isLoading = true;

  // Filters
  searchQuery = '';
  selectedStatus = '';
  selectedType = '';
  
  // Search debounce
  private searchTimeout: any;

  // Stats
  publishedCount = 0;
  draftCount = 0;

  ngOnInit(): void {
    this.loadMyContent();
  }

  onSearchChange(): void {
    // Debounce search to avoid too many API calls
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadMyContent();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadMyContent();
  }

  getPageNumbers(): number[] {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(0, this.currentPage - half);
    let end = Math.min(this.totalPages - 1, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  publishContent(id: number): void {
    this.contentService.publishContent(id).subscribe({
      next: () => {
        // Refresh the content list
        this.loadMyContent();
      },
      error: (error) => {
        console.error('Error publishing content:', error);
        // TODO: Show error message to user
      }
    });
  }

  deleteContent(id: number): void {
    if (confirm('Are you sure you want to delete this content?')) {
      this.contentService.deleteContent(id).subscribe({
        next: () => {
          // Refresh the content list
          this.loadMyContent();
        },
        error: (error) => {
          console.error('Error deleting content:', error);
          // TODO: Show error message to user
        }
      });
    }
  }

  private loadMyContent(): void {
    this.isLoading = true;

    // Build query parameters
    const params: any = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy: 'updatedAt',
      sortDir: 'desc'
    };

    // Add filters if they exist
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    if (this.selectedStatus) {
      params.status = this.selectedStatus;
    }
    if (this.selectedType) {
      params.type = this.selectedType;
    }

    this.contentService.getMyContent(params).subscribe({
      next: (response: any) => {
        this.contents = response.content || [];
        this.totalElements = response.totalElements || 0;
        this.totalPages = response.totalPages || 0;
        this.isLoading = false;
        
        // Calculate stats
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading my content:', error);
        this.contents = [];
        this.totalElements = 0;
        this.totalPages = 0;
        this.isLoading = false;
      }
    });
  }

  private calculateStats(): void {
    this.publishedCount = this.contents.filter(c => c.status === 'PUBLISHED').length;
    this.draftCount = this.contents.filter(c => c.status === 'DRAFT').length;
  }

  getContentPreview(body: string): string {
    if (!body) return '';
    
    try {
      // Configure marked options for better security and formatting
      marked.setOptions({
        gfm: true, // GitHub Flavored Markdown
        breaks: true, // Convert \n to <br>
      });
      
      // Unescape double-escaped newlines and other escaped characters
      const unescapedContent = body
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\');
      
      // Parse markdown to HTML
      const htmlContent = marked.parse(unescapedContent) as string;
      
      // Remove HTML tags and get plain text
      const plainText = htmlContent.replace(/<[^>]*>/g, '');
      
      // Return first 100 characters with ellipsis
      return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      // Fallback to basic text processing
      const plainText = body.replace(/\\n/g, ' ').replace(/\n/g, ' ');
      return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
    }
  }
}
