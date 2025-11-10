import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { AuthService } from '../../../core/services/auth.service';
import { Content, ContentRequest, ContentType, Category } from '../../../core/models/content.models';
import { Kierunek } from '../../../core/models/auth.models';

@Component({
  selector: 'app-content-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ isEditMode ? 'Edit Content' : 'Create New Content' }}
            </h1>
            <p class="mt-1 text-gray-600">
              {{ isEditMode ? 'Update your existing content' : 'Share your knowledge with PUT students' }}
            </p>
          </div>
          <a routerLink="/content" class="btn btn-outline">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Content
          </a>
        </div>
      </div>

      <!-- Content Form -->
      <div class="bg-white shadow rounded-lg">
        <form [formGroup]="contentForm" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
          
          <!-- Basic Information -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            
            <!-- Title -->
            <div class="mb-4">
              <label for="title" class="form-label">Title *</label>
              <input
                type="text"
                id="title"
                formControlName="title"
                class="form-input"
                [class.border-red-500]="isFieldInvalid('title')"
                placeholder="Enter a descriptive title for your content"
              >
              <div *ngIf="isFieldInvalid('title')" class="mt-1 text-sm text-red-600">
                <div *ngIf="contentForm.get('title')?.errors?.['required']">Title is required</div>
                <div *ngIf="contentForm.get('title')?.errors?.['minlength']">Title must be at least 5 characters long</div>
                <div *ngIf="contentForm.get('title')?.errors?.['maxlength']">Title cannot exceed 200 characters</div>
              </div>
            </div>

            <!-- Summary -->
            <div class="mb-4">
              <label for="summary" class="form-label">Summary</label>
              <textarea
                id="summary"
                formControlName="summary"
                rows="3"
                class="form-input"
                [class.border-red-500]="isFieldInvalid('summary')"
                placeholder="Brief summary of your content (optional but recommended)"
              ></textarea>
              <div *ngIf="isFieldInvalid('summary')" class="mt-1 text-sm text-red-600">
                <div *ngIf="contentForm.get('summary')?.errors?.['maxlength']">Summary cannot exceed 500 characters</div>
              </div>
              <p class="mt-1 text-sm text-gray-500">
                {{ contentForm.get('summary')?.value?.length || 0 }}/500 characters
              </p>
            </div>

            <!-- Content Type -->
            <div class="mb-4">
              <label for="type" class="form-label">Content Type *</label>
              <select
                id="type"
                formControlName="type"
                class="form-input"
                [class.border-red-500]="isFieldInvalid('type')"
              >
                <option value="">Select content type</option>
                <option value="GUIDE">Guide</option>
                <option value="TUTORIAL">Tutorial</option>
                <option value="FAQ">FAQ</option>
                <option value="NEWS">News</option>
                <option value="ANNOUNCEMENT">Announcement</option>
              </select>
              <div *ngIf="isFieldInvalid('type')" class="mt-1 text-sm text-red-600">
                Content type is required
              </div>
            </div>
          </div>

          <!-- Categorization -->
          <div class="border-b border-gray-200 pb-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Categorization</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Category -->
              <div>
                <label for="categoryId" class="form-label">Category</label>
                <select
                  id="categoryId"
                  formControlName="categoryId"
                  class="form-input"
                >
                  <option value="">Select category (optional)</option>
                  <option *ngFor="let category of categories" [value]="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- Kierunek -->
              <div>
                <label for="kierunekId" class="form-label">Study Program</label>
                <select
                  id="kierunekId"
                  formControlName="kierunekId"
                  class="form-input"
                >
                  <option value="">Select study program (optional)</option>
                  <option *ngFor="let kierunek of kieruneks" [value]="kierunek.id">
                    {{ kierunek.name }} ({{ kierunek.code }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Tags -->
            <div class="mt-4">
              <label for="tags" class="form-label">Tags</label>
              <input
                type="text"
                id="tags"
                formControlName="tags"
                class="form-input"
                placeholder="Enter tags separated by commas (e.g., programming, java, beginner)"
              >
              <p class="mt-1 text-sm text-gray-500">
                Separate multiple tags with commas. Tags help students find your content more easily.
              </p>
            </div>
          </div>

          <!-- Content Body -->
          <div class="pb-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Content</h2>
            
            <div class="mb-4">
              <label for="body" class="form-label">Content Body *</label>
              <textarea
                id="body"
                formControlName="body"
                rows="15"
                class="form-input font-mono text-sm"
                [class.border-red-500]="isFieldInvalid('body')"
                placeholder="Write your content here. You can use Markdown formatting for better presentation.

Examples:
# Heading 1
## Heading 2
**Bold text**
*Italic text*
- Bullet point
1. Numbered list
\`code\`
\`\`\`
code block
\`\`\`"
              ></textarea>
              <div *ngIf="isFieldInvalid('body')" class="mt-1 text-sm text-red-600">
                <div *ngIf="contentForm.get('body')?.errors?.['required']">Content body is required</div>
                <div *ngIf="contentForm.get('body')?.errors?.['minlength']">Content must be at least 50 characters long</div>
              </div>
              <p class="mt-1 text-sm text-gray-500">
                {{ contentForm.get('body')?.value?.length || 0 }} characters. Supports Markdown formatting.
              </p>
            </div>
          </div>

          <!-- Error/Success Messages -->
          <div *ngIf="errorMessage" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">{{ errorMessage }}</h3>
              </div>
            </div>
          </div>

          <div *ngIf="successMessage" class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">{{ successMessage }}</h3>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <div class="text-sm text-gray-500">
              * Required fields
            </div>
            <div class="flex space-x-3">
              <button
                type="button"
                (click)="onSaveAsDraft()"
                [disabled]="isLoading || !contentForm.valid"
                class="btn btn-outline"
              >
                <span *ngIf="isSavingDraft" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Draft...
                </span>
                <span *ngIf="!isSavingDraft">Save as Draft</span>
              </button>
              
              <button
                type="submit"
                [disabled]="contentForm.invalid || isLoading"
                class="btn btn-primary"
              >
                <span *ngIf="isLoading" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isEditMode ? 'Updating...' : 'Publishing...' }}
                </span>
                <span *ngIf="!isLoading">
                  {{ isEditMode ? 'Update Content' : 'Publish Content' }}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ContentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private contentService = inject(ContentService);
  private authService = inject(AuthService);

  contentForm: FormGroup;
  categories: Category[] = [];
  kieruneks: Kierunek[] = [];
  isEditMode = false;
  editingId: number | null = null;
  isLoading = false;
  isSavingDraft = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.contentForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      summary: ['', [Validators.maxLength(500)]],
      body: ['', [Validators.required, Validators.minLength(50)]],
      type: ['', [Validators.required]],
      categoryId: [''],
      kierunekId: [''],
      tags: ['']
    });
  }

  ngOnInit(): void {
    this.loadFormData();
    this.checkEditMode();
  }

  private loadFormData(): void {
    // Load categories
    this.contentService.getActiveCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });

    // Load kieruneks
    this.contentService.getActiveKieruneks().subscribe({
      next: (kieruneks) => {
        this.kieruneks = kieruneks;
      },
      error: (error) => {
        console.error('Error loading kieruneks:', error);
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editingId = parseInt(id, 10);
      this.loadContentForEdit(this.editingId);
    }
  }

  private loadContentForEdit(id: number): void {
    this.contentService.getContentById(id).subscribe({
      next: (content) => {
        this.contentForm.patchValue({
          title: content.title,
          summary: content.summary || '',
          body: content.body,
          type: content.type,
          categoryId: content.categoryId || '',
          kierunekId: content.kierunekId || '',
          tags: content.tags || ''
        });
      },
      error: (error) => {
        this.errorMessage = 'Error loading content for editing';
        console.error('Error loading content:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.contentForm.valid) {
      const formData = this.prepareFormData();
      
      if (this.isEditMode && this.editingId) {
        this.updateContent(this.editingId, formData);
      } else {
        this.createContent(formData);
      }
    }
  }

  onSaveAsDraft(): void {
    if (this.contentForm.valid) {
      this.isSavingDraft = true;
      const formData = this.prepareFormData();
      
      this.contentService.createContent(formData).subscribe({
        next: (content) => {
          this.isSavingDraft = false;
          this.successMessage = 'Content saved as draft successfully!';
          setTimeout(() => {
            this.router.navigate(['/content/my']);
          }, 2000);
        },
        error: (error) => {
          this.isSavingDraft = false;
          this.errorMessage = error.error?.message || 'Error saving draft';
        }
      });
    }
  }

  private createContent(formData: ContentRequest): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.contentService.createContent(formData).subscribe({
      next: (content) => {
        this.isLoading = false;
        this.successMessage = 'Content created successfully!';
        setTimeout(() => {
          this.router.navigate(['/content', content.id]);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error creating content';
      }
    });
  }

  private updateContent(id: number, formData: ContentRequest): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.contentService.updateContent(id, formData).subscribe({
      next: (content) => {
        this.isLoading = false;
        this.successMessage = 'Content updated successfully!';
        setTimeout(() => {
          this.router.navigate(['/content', content.id]);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error updating content';
      }
    });
  }

  private prepareFormData(): ContentRequest {
    const formValues = this.contentForm.value;
    return {
      title: formValues.title.trim(),
      summary: formValues.summary?.trim() || undefined,
      body: formValues.body.trim(),
      type: formValues.type as ContentType,
      categoryId: formValues.categoryId ? parseInt(formValues.categoryId, 10) : undefined,
      kierunekId: formValues.kierunekId ? parseInt(formValues.kierunekId, 10) : undefined,
      tags: formValues.tags?.trim() || undefined
    };
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
