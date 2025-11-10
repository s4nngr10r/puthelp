import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ContentService } from '../../../core/services/content.service';
import { Kierunek } from '../../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or
            <a routerLink="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
              sign in to your existing account
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="username" class="form-label">Username</label>
              <input id="username" 
                     name="username" 
                     type="text" 
                     required 
                     formControlName="username"
                     class="form-input"
                     [class.border-red-500]="isFieldInvalid('username')"
                     placeholder="Choose a username">
              <div *ngIf="isFieldInvalid('username')" class="mt-1 text-sm text-red-600">
                <div *ngIf="registerForm.get('username')?.errors?.['required']">Username is required</div>
                <div *ngIf="registerForm.get('username')?.errors?.['minlength']">Username must be at least 3 characters</div>
                <div *ngIf="registerForm.get('username')?.errors?.['pattern']">Username can only contain letters, numbers, and underscores</div>
              </div>
            </div>
            
            <div>
              <label for="email" class="form-label">Email address</label>
              <input id="email" 
                     name="email" 
                     type="email" 
                     required 
                     formControlName="email"
                     class="form-input"
                     [class.border-red-500]="isFieldInvalid('email')"
                     placeholder="Enter your email">
              <div *ngIf="isFieldInvalid('email')" class="mt-1 text-sm text-red-600">
                <div *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</div>
                <div *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email address</div>
                <div *ngIf="registerForm.get('email')?.errors?.['invalidEmail']">Please enter a valid email address format</div>
                <div *ngIf="registerForm.get('email')?.errors?.['disposableEmail']">Disposable email addresses are not allowed</div>
              </div>
            </div>
            
            <div>
              <label for="password" class="form-label">Password</label>
              <input id="password" 
                     name="password" 
                     type="password" 
                     required 
                     formControlName="password"
                     class="form-input"
                     [class.border-red-500]="isFieldInvalid('password')"
                     placeholder="Choose a password">
              <div *ngIf="isFieldInvalid('password')" class="mt-1 text-sm text-red-600">
                <div *ngIf="registerForm.get('password')?.errors?.['required']">Password is required</div>
                <div *ngIf="registerForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</div>
                <div *ngIf="registerForm.get('password')?.errors?.['passwordStrength']">Password must contain at least one uppercase letter, one lowercase letter, and one number</div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="firstName" class="form-label">First Name</label>
                <input id="firstName" 
                       name="firstName" 
                       type="text" 
                       formControlName="firstName"
                       class="form-input"
                       placeholder="First name">
              </div>
              
              <div>
                <label for="lastName" class="form-label">Last Name</label>
                <input id="lastName" 
                       name="lastName" 
                       type="text" 
                       formControlName="lastName"
                       class="form-input"
                       placeholder="Last name">
              </div>
            </div>
            
            <div>
              <label for="kierunek" class="form-label">Study Program (Optional)</label>
              <select id="kierunek" 
                      name="kierunek" 
                      formControlName="kierunekId"
                      class="form-input">
                <option value="">Select your study program</option>
                <option *ngFor="let kierunek of kieruneks" [value]="kierunek.id">
                  {{ kierunek.name }} ({{ kierunek.code }})
                </option>
              </select>
            </div>
          </div>

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

          <div>
            <button type="submit" 
                    [disabled]="registerForm.invalid || isLoading"
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
              <span *ngIf="isLoading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ isLoading ? 'Creating account...' : 'Create account' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private contentService = inject(ContentService);
  private router = inject(Router);

  registerForm: FormGroup;
  kieruneks: Kierunek[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Disposable email domains (common ones)
  private disposableEmailDomains = [
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
    'throwaway.email', 'temp-mail.org', 'sharklasers.com', 'grr.la',
    'guerrillamailblock.com', 'pokemail.net', 'spam4.me', 'bccto.me',
    'chacuo.net', 'dispostable.com', 'fakeinbox.com', 'fakeinbox.net',
    'getairmail.com', 'getnada.com', 'inboxalias.com', 'mailnesia.com',
    'mailnull.com', 'mintemail.com', 'mohmal.com', 'mytrashmail.com',
    'nwldx.com', 'sharklasers.com', 'spamspot.com', 'tempr.email',
    'tmpeml.com', 'tmpmail.net', 'trashmail.com', 'trashmail.net',
    'yopmail.com', 'yopmail.net', 'yopmail.org', 'yopmail.fr',
    'yopmail.gq', 'yopmail.ml', 'yopmail.tk', 'yopmail.usa.cc'
  ];

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        this.emailValidator.bind(this)
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        this.passwordStrengthValidator.bind(this)
      ]],
      firstName: [''],
      lastName: [''],
      kierunekId: ['']
    });
  }

  ngOnInit(): void {
    this.loadKieruneks();
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = { ...this.registerForm.value };
      if (!formData.kierunekId || formData.kierunekId === '') {
        delete formData.kierunekId;
      } else {
        // Convert string to number for backend
        formData.kierunekId = parseInt(formData.kierunekId, 10);
      }

      this.authService.signup(formData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response.message;
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private loadKieruneks(): void {
    this.contentService.getActiveKieruneks().subscribe({
      next: (kieruneks) => {
        this.kieruneks = kieruneks;
      },
      error: (error) => {
        console.error('Error loading kieruneks:', error);
      }
    });
  }

  // Custom email validator
  private emailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) return null;

    // Basic email format check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { invalidEmail: true };
    }

    // Check for disposable email domains
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && this.disposableEmailDomains.includes(domain)) {
      return { disposableEmail: true };
    }

    return null;
  }

  // Custom password strength validator
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return { passwordStrength: true };
    }

    return null;
  }
}
