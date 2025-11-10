import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentService } from '../../core/services/content.service';
import { AuthService } from '../../core/services/auth.service';
import { Content, Category } from '../../core/models/content.models';
import { Kierunek, User } from '../../core/models/auth.models';
import { marked } from 'marked';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-gradient-to-br from-primary-50 to-blue-100">
      <!-- Hero Section -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span class="text-primary-600">PUT Help</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your comprehensive guide to student life at Poznan University of Technology. 
            Find guides, tutorials, and helpful information created by students, for students.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a routerLink="/content" class="btn btn-primary text-lg px-8 py-3">
              Browse Guides
            </a>
            <a *ngIf="!isAuthenticated" routerLink="/auth/register" class="btn btn-outline text-lg px-8 py-3">
              Join Community
            </a>
            <a *ngIf="isAuthenticated && canCreateContent" routerLink="/content/create" class="btn btn-outline text-lg px-8 py-3">
              Create Content
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Access Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Quick Access</h2>
        <p class="text-lg text-gray-600">Find what you need quickly</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card hover:shadow-lg transition-shadow duration-300">
          <div class="card-body text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Academic Guides</h3>
            <p class="text-gray-600 mb-4">Course information, exam tips, and study materials</p>
            <a routerLink="/content" [queryParams]="{type: 'GUIDE'}" class="text-primary-600 hover:text-primary-500 font-medium">
              View Guides →
            </a>
          </div>
        </div>

        <div class="card hover:shadow-lg transition-shadow duration-300">
          <div class="card-body text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Tutorials</h3>
            <p class="text-gray-600 mb-4">Step-by-step tutorials for various tasks and procedures</p>
            <a routerLink="/content" [queryParams]="{type: 'TUTORIAL'}" class="text-primary-600 hover:text-primary-500 font-medium">
              View Tutorials →
            </a>
          </div>
        </div>

        <div class="card hover:shadow-lg transition-shadow duration-300">
          <div class="card-body text-center">
            <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">FAQ</h3>
            <p class="text-gray-600 mb-4">Frequently asked questions and quick answers</p>
            <a routerLink="/content" [queryParams]="{type: 'FAQ'}" class="text-primary-600 hover:text-primary-500 font-medium">
              View FAQ →
            </a>
          </div>
        </div>

        <div class="card hover:shadow-lg transition-shadow duration-300">
          <div class="card-body text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">News</h3>
            <p class="text-gray-600 mb-4">Latest news and announcements from the university</p>
            <a routerLink="/content" [queryParams]="{type: 'NEWS'}" class="text-primary-600 hover:text-primary-500 font-medium">
              View News →
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Latest Content Section -->
    <div class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Latest Content</h2>
          <p class="text-lg text-gray-600">Recently published guides and tutorials</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="latestContent.length > 0">
          <div *ngFor="let content of latestContent" class="card hover:shadow-lg transition-shadow duration-300">
            <div class="card-body">
              <div class="flex items-center justify-between mb-2">
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
              
              <p class="text-gray-600 mb-4">{{ content.summary || getContentPreview(content.body) }}</p>
              
              <div class="flex items-center justify-between text-sm text-gray-500">
                <span>By {{ content.authorUsername }}</span>
                <span>{{ content.viewCount }} views</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-8">
          <a routerLink="/content" class="btn btn-primary">
            View All Content
          </a>
        </div>
      </div>
    </div>

    <!-- Study Programs Section -->
    <div class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Study Programs</h2>
          <p class="text-lg text-gray-600">Find content specific to your field of study</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="kieruneks.length > 0">
          <div *ngFor="let kierunek of kieruneks" 
               class="card hover:shadow-lg transition-shadow duration-300 cursor-pointer"
               [routerLink]="['/content']" [queryParams]="{kierunek: kierunek.id}">
            <div class="card-body text-center">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ kierunek.name }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ kierunek.code }}</p>
              <p class="text-gray-600">{{ kierunek.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  private contentService = inject(ContentService);
  private authService = inject(AuthService);
  
  latestContent: Content[] = [];
  categories: Category[] = [];
  kieruneks: Kierunek[] = [];
  isAuthenticated = false;
  canCreateContent = false;
  currentUser: User | null = null;

  ngOnInit(): void {
    this.loadLatestContent();
    this.loadCategories();
    this.loadKieruneks();
    this.checkAuthenticationStatus();
  }

  private checkAuthenticationStatus(): void {
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        this.checkUserPermissions();
      } else {
        this.canCreateContent = false;
        this.currentUser = null;
      }
    });
  }

  private checkUserPermissions(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.canCreateContent = this.authService.isModeratorOrAdmin();
    });
  }

  private loadLatestContent(): void {
    this.contentService.getPublishedContent(0, 6).subscribe({
      next: (page) => {
        this.latestContent = page.content;
      },
      error: (error) => {
        console.error('Error loading latest content:', error);
      }
    });
  }

  private loadCategories(): void {
    this.contentService.getActiveCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  private loadKieruneks(): void {
    this.contentService.getActiveKieruneks().subscribe({
      next: (kieruneks) => {
        this.kieruneks = kieruneks.slice(0, 6); // Show only first 6
      },
      error: (error) => {
        console.error('Error loading kieruneks:', error);
      }
    });
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
      
      // Return first 150 characters with ellipsis
      return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    } catch (error) {
      console.error('Error parsing markdown:', error);
      // Fallback to basic text processing
      const plainText = body.replace(/\\n/g, ' ').replace(/\n/g, ' ');
      return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
    }
  }
}
