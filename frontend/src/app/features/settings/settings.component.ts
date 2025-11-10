import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p class="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div class="bg-white shadow rounded-lg">
        <!-- Change Password Section -->
        <div class="px-6 py-6 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
          
          <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-4">
            <!-- Current Password -->
            <div>
              <label for="currentPassword" class="form-label">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                formControlName="currentPassword"
                class="form-input"
                [class.border-red-500]="passwordForm.get('currentPassword')?.touched && passwordForm.get('currentPassword')?.errors"
                placeholder="Enter your current password"
              >
              <div *ngIf="passwordForm.get('currentPassword')?.touched && passwordForm.get('currentPassword')?.errors" 
                   class="mt-1 text-sm text-red-600">
                Current password is required
              </div>
            </div>

            <!-- New Password -->
            <div>
              <label for="newPassword" class="form-label">New Password</label>
              <input
                type="password"
                id="newPassword"
                formControlName="newPassword"
                class="form-input"
                [class.border-red-500]="passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.errors"
                placeholder="Enter your new password"
              >
              <div *ngIf="passwordForm.get('newPassword')?.touched && passwordForm.get('newPassword')?.errors" 
                   class="mt-1 text-sm text-red-600">
                <div *ngIf="passwordForm.get('newPassword')?.errors?.['required']">New password is required</div>
                <div *ngIf="passwordForm.get('newPassword')?.errors?.['minlength']">Password must be at least 8 characters long</div>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="form-label">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                formControlName="confirmPassword"
                class="form-input"
                [class.border-red-500]="passwordForm.get('confirmPassword')?.touched && passwordForm.get('confirmPassword')?.errors"
                placeholder="Confirm your new password"
              >
              <div *ngIf="passwordForm.get('confirmPassword')?.touched && passwordForm.get('confirmPassword')?.errors" 
                   class="mt-1 text-sm text-red-600">
                <div *ngIf="passwordForm.get('confirmPassword')?.errors?.['required']">Please confirm your password</div>
                <div *ngIf="passwordForm.get('confirmPassword')?.errors?.['mismatch']">Passwords do not match</div>
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4">
              <div class="flex">
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Error</h3>
                  <div class="mt-2 text-sm text-red-700">{{ errorMessage }}</div>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div *ngIf="successMessage" class="bg-green-50 border border-green-200 rounded-md p-4">
              <div class="flex">
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-green-800">Success</h3>
                  <div class="mt-2 text-sm text-green-700">{{ successMessage }}</div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end">
              <button
                type="submit"
                [disabled]="passwordForm.invalid || isLoading"
                class="btn btn-primary"
              >
                <span *ngIf="isLoading" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                {{ isLoading ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Account Information Section -->
        <div class="px-6 py-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Username</label>
              <div class="mt-1 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                {{ (currentUser$ | async)?.username }}
              </div>
            </div>
            
            <div>
              <label class="form-label">Email</label>
              <div class="mt-1 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                {{ (currentUser$ | async)?.email }}
              </div>
            </div>
            
            <div>
              <label class="form-label">Role</label>
              <div class="mt-1 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                {{ (currentUser$ | async)?.roles?.[0]?.name || 'Student' }}
              </div>
            </div>
            
            <div>
              <label class="form-label">Study Program</label>
              <div class="mt-1 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                {{ (currentUser$ | async)?.kierunek?.name || 'Not specified' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  currentUser$ = this.authService.currentUser$;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    } else if (confirmPassword?.errors?.['mismatch']) {
      delete confirmPassword.errors['mismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { currentPassword, newPassword } = this.passwordForm.value;

      this.authService.changePassword(currentPassword, newPassword).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Password updated successfully!';
          this.passwordForm.reset();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to update password';
        }
      });
    }
  }
}
