import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- About Section -->
          <div class="text-center md:text-left">
            <h3 class="text-lg font-semibold mb-3">PUT Help</h3>
            <p class="text-gray-300 text-sm mb-4">
              Your guide to student life at Poznan University of Technology. Created by students, for students.
            </p>
            <p class="text-gray-400 text-xs">
              © {{ currentYear }} PUT Help. Made with ❤️ by PUT students.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="text-center md:text-left">
            <h4 class="text-md font-semibold mb-3">Quick Links</h4>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/content" class="text-gray-300 hover:text-white transition-colors">Browse Content</a></li>
              <li><a routerLink="/content" [queryParams]="{type: 'GUIDE'}" class="text-gray-300 hover:text-white transition-colors">Guides</a></li>
              <li><a routerLink="/content" [queryParams]="{type: 'TUTORIAL'}" class="text-gray-300 hover:text-white transition-colors">Tutorials</a></li>
              <li><a routerLink="/content" [queryParams]="{type: 'FAQ'}" class="text-gray-300 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <!-- Contact Information -->
          <div class="text-center md:text-left">
            <h4 class="text-md font-semibold mb-3">Contact</h4>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-center md:justify-start">
                <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <a href="mailto:s4nngr10r@gmail.com" class="text-gray-300 hover:text-white transition-colors">
                  s4nngr10r&#64;gmail.com
                </a>
              </div>
              <div class="flex items-center justify-center md:justify-start">
                <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-gray-300">Poznan University of Technology</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
