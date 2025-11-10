import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { Content } from '../../../core/models/content.models';
import { marked } from 'marked';

@Component({
  selector: 'app-content-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" *ngIf="content">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                [ngClass]="{
                  'bg-blue-100 text-blue-800': content.type === 'GUIDE',
                  'bg-green-100 text-green-800': content.type === 'TUTORIAL',
                  'bg-yellow-100 text-yellow-800': content.type === 'FAQ',
                  'bg-purple-100 text-purple-800': content.type === 'NEWS',
                  'bg-red-100 text-red-800': content.type === 'ANNOUNCEMENT'
                }">
            {{ content.type }}
          </span>
          <span class="text-sm text-gray-500">{{ content.createdAt | date:'fullDate' }}</span>
        </div>
        
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{{ content.title }}</h1>
        
        <div class="flex items-center justify-between text-sm text-gray-600 mb-6">
          <div class="flex items-center space-x-4">
            <span>By {{ content.authorUsername }}</span>
            <span>{{ content.viewCount }} views</span>
            <span *ngIf="content.publishedAt">Published {{ content.publishedAt | date:'shortDate' }}</span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-6" *ngIf="content.kierunekName || content.categoryName || content.tags">
          <span *ngIf="content.kierunekName" 
                class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
            📚 {{ content.kierunekName }}
          </span>
          <span *ngIf="content.categoryName" 
                class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
            📁 {{ content.categoryName }}
          </span>
          <span *ngFor="let tag of getTags()" 
                class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
            #{{ tag }}
          </span>
        </div>

        <div *ngIf="content.summary" class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
          <p class="text-blue-700 font-medium">{{ content.summary }}</p>
        </div>
      </div>

      <!-- Content -->
      <div class="prose prose-lg max-w-none">
        <div [innerHTML]="getFormattedContent()"></div>
      </div>

            <!-- Footer -->
      <div class="mt-12 pt-8 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Last updated: {{ content.updatedAt | date:'shortDate' }}
          </div>
          
          <!-- Share Button -->
          <button 
            (click)="shareContent()"
            class="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
            </svg>
            <span class="font-medium">Share</span>
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="mt-8 flex justify-center">
        <a routerLink="/content" 
           class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to Content
        </a>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="isLoading" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div class="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div *ngIf="!content && !isLoading" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Content not found</h1>
      <p class="text-gray-600 mb-8">The content you're looking for doesn't exist or has been removed.</p>
      <a routerLink="/content" class="btn btn-primary">Browse Content</a>
    </div>
  `
})
export class ContentDetailComponent implements OnInit {
  private contentService = inject(ContentService);
  private route = inject(ActivatedRoute);

  content: Content | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadContent(id);
      }
    });
  }

  shareContent(): void {
    if (!this.content) return;
    
    const url = window.location.href;
    const title = this.content.title;
    
    if (navigator.share) {
      // Use native sharing if available
      navigator.share({
        title: title,
        url: url
      }).catch((error) => {
        console.log('Error sharing:', error);
        this.fallbackShare(url, title);
      });
    } else {
      // Fallback to clipboard copy
      this.fallbackShare(url, title);
    }
  }

  private fallbackShare(url: string, title: string): void {
    // Copy to clipboard
    navigator.clipboard.writeText(`${title}\n\n${url}`).then(() => {
      // You could add a toast notification here
      console.log('Link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = `${title}\n\n${url}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('Link copied to clipboard!');
    });
  }

  getTags(): string[] {
    if (!this.content?.tags) return [];
    return this.content.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  }

  getFormattedContent(): string {
    if (!this.content?.body) return '';
    
    try {
      // Configure marked options for better security and formatting
      marked.setOptions({
        gfm: true, // GitHub Flavored Markdown
        breaks: true, // Convert \n to <br>
      });
      
      // Unescape double-escaped newlines and other escaped characters
      const unescapedContent = this.content.body
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\');
      
      // Parse markdown to HTML
      return marked.parse(unescapedContent) as string;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      // Fallback to basic formatting if markdown parsing fails
      const unescapedContent = this.content.body.replace(/\\n/g, '\n');
      return unescapedContent
        .split('\n\n')
        .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
        .join('');
    }
  }

  private loadContent(id: number): void {
    this.isLoading = true;
    
    this.contentService.getPublishedContentById(id).subscribe({
      next: (content) => {
        this.content = content;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading content:', error);
        this.content = null;
        this.isLoading = false;
      }
    });
  }
}
