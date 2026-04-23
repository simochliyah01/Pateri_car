import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl font-bold mb-2">Login Page</h1>
      <p class="text-ink-500">
        Authentication form — coming soon.
      </p>
    </div>
  `,
})
export class LoginComponent {}
