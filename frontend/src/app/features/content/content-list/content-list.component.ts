import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../core/services/content.service';
import { Content, Category, ContentType } from '../../../core/models/content.models';
import { Kierunek } from '../../../core/models/auth.models';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Content Library</h1>
        <p class="text-lg text-gray-600">Browse guides, tutorials, and helpful resources</p>
      </div>

      <!-- Filters -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div>
            <label class="form-label">Search</label>
            <input type="text" 
                   [(ngModel)]="searchQuery"
                   (input)="onSearchChange()"
                   placeholder="Search content..."
                   class="form-input">
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

          <!-- Study Program -->
          <div>
            <label class="form-label">Study Program</label>
            <select [(ngModel)]="selectedKierunek" (change)="applyFilters()" class="form-input">
              <option value="">All Programs</option>
              <option *ngFor="let kierunek of kieruneks" [value]="kierunek.id">
                {{ kierunek.name }}
              </option>
            </select>
          </div>

          <!-- Category -->
          <div>
            <label class="form-label">Category</label>
            <select [(ngModel)]="selectedCategory" (change)="applyFilters()" class="form-input">
              <option value="">All Categories</option>
              <option *ngFor="let category of categories" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" *ngIf="contents.length > 0">
        <div *ngFor="let content of contents" class="card hover:shadow-lg transition-shadow duration-300">
          <div class="card-body">
            <div class="flex items-center justify-between mb-3">
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
              <span class="text-sm text-gray-500">{{ content.createdAt | date:'shortDate' }}</span>
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              <a [routerLink]="['/content', content.id]" class="hover:text-primary-600">
                {{ content.title }}
              </a>
            </h3>
            
            <p class="text-gray-600 mb-4">{{ getContentPreview(content) }}</p>
            
            <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>By {{ content.authorUsername }}</span>
              <span>{{ content.viewCount }} views</span>
            </div>

            <div class="flex flex-wrap gap-1 mb-3" *ngIf="content.kierunekName || content.categoryName">
              <span *ngIf="content.kierunekName" 
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {{ content.kierunekName }}
              </span>
              <span *ngIf="content.categoryName" 
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {{ content.categoryName }}
              </span>
            </div>

            <a [routerLink]="['/content', content.id]" 
               class="inline-flex items-center text-primary-600 hover:text-primary-500 font-medium">
              Read more
              <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="contents.length === 0 && !isLoading" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20.4a7.962 7.962 0 01-8-7.927c0-2.68.99-5.127 2.622-7.006l1.17 1.171A6 6 0 006 12.073c0 1.32.537 2.51 1.41 3.377z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No content found</h3>
        <p class="mt-1 text-sm text-gray-500">Try adjusting your search criteria or filters.</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-12">
        <svg class="animate-spin mx-auto h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-sm text-gray-500">Loading content...</p>
      </div>

      <!-- Pagination -->
      <div *ngIf="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
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
export class ContentListComponent implements OnInit {
  private contentService = inject(ContentService);
  private route = inject(ActivatedRoute);

  contents: Content[] = [];
  categories: Category[] = [];
  kieruneks: Kierunek[] = [];
  
  isLoading = false;
  searchQuery = '';
  selectedType = '';
  selectedKierunek = '';
  selectedCategory = '';
  
  currentPage = 0;
  pageSize = 12;
  totalElements = 0;
  totalPages = 0;
  
  private searchTimeout: any;

  ngOnInit(): void {
    this.loadFilters();
    this.loadQueryParams();
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 500);
  }

  applyFilters(): void {
    this.currentPage = 0;
    this.loadContent();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadContent();
  }

  getPageNumbers(): number[] {
    const pages = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getContentPreview(content: Content): string {
    // Use summary if available, otherwise strip markdown from body
    if (content.summary) {
      return content.summary;
    }
    
    if (!content.body) {
      return '';
    }
    
    // Strip markdown formatting for preview
    let plainText = content.body
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italic markers
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      // Remove list markers
      .replace(/^[\s]*[-*+]\s+/gm, '')
      .replace(/^[\s]*\d+\.\s+/gm, '')
      // Remove blockquotes
      .replace(/^>\s+/gm, '')
      // Unescape escaped characters
      .replace(/\\n/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\\\/g, '\\')
      // Replace multiple spaces/newlines with single space
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit to 150 characters and add ellipsis
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  }

  private loadContent(): void {
    this.isLoading = true;
    
    if (this.searchQuery) {
      this.contentService.searchContent(this.searchQuery, this.currentPage, this.pageSize).subscribe({
        next: (page) => {
          this.contents = this.applyClientSideFilters(page.content);
          this.updatePagination(page);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading content:', error);
          this.isLoading = false;
        }
      });
    } else if (this.selectedKierunek) {
      this.contentService.getContentByKierunek(+this.selectedKierunek, this.currentPage, this.pageSize).subscribe({
        next: (page) => {
          this.contents = this.applyClientSideFilters(page.content);
          this.updatePagination(page);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading content:', error);
          this.isLoading = false;
        }
      });
    } else if (this.selectedCategory) {
      this.contentService.getContentByCategory(+this.selectedCategory, this.currentPage, this.pageSize).subscribe({
        next: (page) => {
          this.contents = this.applyClientSideFilters(page.content);
          this.updatePagination(page);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading content:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.contentService.getPublishedContent(this.currentPage, this.pageSize).subscribe({
        next: (page) => {
          this.contents = this.applyClientSideFilters(page.content);
          this.updatePagination(page);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading content:', error);
          this.isLoading = false;
        }
      });
    }
  }

  private applyClientSideFilters(content: Content[]): Content[] {
    let filteredContent = content;
    
    // Filter by content type if selected
    if (this.selectedType) {
      filteredContent = filteredContent.filter(item => item.type === this.selectedType);
    }
    
    return filteredContent;
  }

  private updatePagination(page: any): void {
    // Since we're applying client-side filters, we need to recalculate pagination
    const filteredContent = this.applyClientSideFilters(page.content);
    this.totalElements = filteredContent.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    
    // If current page is beyond the new total pages, reset to first page
    if (this.currentPage >= this.totalPages && this.totalPages > 0) {
      this.currentPage = 0;
    }
  }

  private loadFilters(): void {
    this.contentService.getActiveCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });

    this.contentService.getActiveKieruneks().subscribe({
      next: (kieruneks) => {
        this.kieruneks = kieruneks;
      },
      error: (error) => {
        console.error('Error loading kieruneks:', error);
      }
    });
  }

  private loadQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      if (params['type']) {
        this.selectedType = params['type'];
      }
      if (params['kierunek']) {
        this.selectedKierunek = params['kierunek'];
      }
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      this.loadContent();
    });
  }
}
