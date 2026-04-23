import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Menu, X, User, Globe } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <header class="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <a routerLink="/home" class="flex items-center">
            <img src="assets/logo/logo-full.png"
                 alt="PATERI CAR"
                 class="h-10 w-auto" />
          </a>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-8">
            <a routerLink="/home" routerLinkActive="text-primary-600"
               [routerLinkActiveOptions]="{exact: true}"
               class="text-sm font-medium text-ink-700 hover:text-primary-600 transition-colors">
              Accueil
            </a>
            <a routerLink="/voitures" routerLinkActive="text-primary-600"
               class="text-sm font-medium text-ink-700 hover:text-primary-600 transition-colors">
              Voitures
            </a>
            <a class="text-sm font-medium text-ink-700 hover:text-primary-600 transition-colors cursor-pointer">
              Services
            </a>
            <a class="text-sm font-medium text-ink-700 hover:text-primary-600 transition-colors cursor-pointer">
              Contact
            </a>
          </div>

          <!-- Right side -->
          <div class="hidden md:flex items-center gap-3">
            <button class="btn-ghost text-sm flex items-center gap-1.5">
              <lucide-icon [img]="Globe" [size]="16"></lucide-icon>
              FR
            </button>
            <a routerLink="/login" class="btn-ghost text-sm">
              Connexion
            </a>
            <a routerLink="/voitures" class="btn-primary text-sm">
              Réserver
            </a>
          </div>

          <!-- Mobile menu button -->
          <button (click)="toggleMenu()" class="md:hidden p-2 text-ink-700">
            <lucide-icon [img]="menuOpen() ? X : Menu" [size]="24"></lucide-icon>
          </button>
        </div>

        <!-- Mobile menu -->
        @if (menuOpen()) {
          <div class="md:hidden border-t border-gray-200 py-4 space-y-2">
            <a routerLink="/home" (click)="closeMenu()"
               class="block px-4 py-2 text-sm text-ink-700 hover:bg-surface-50 rounded-lg">
              Accueil
            </a>
            <a routerLink="/voitures" (click)="closeMenu()"
               class="block px-4 py-2 text-sm text-ink-700 hover:bg-surface-50 rounded-lg">
              Voitures
            </a>
            <a class="block px-4 py-2 text-sm text-ink-700 hover:bg-surface-50 rounded-lg cursor-pointer">
              Services
            </a>
            <a class="block px-4 py-2 text-sm text-ink-700 hover:bg-surface-50 rounded-lg cursor-pointer">
              Contact
            </a>
            <div class="pt-2 border-t border-gray-200 mt-2 space-y-2">
              <a routerLink="/login" (click)="closeMenu()"
                 class="block px-4 py-2 text-sm text-ink-700 hover:bg-surface-50 rounded-lg">
                Connexion
              </a>
              <a routerLink="/voitures" (click)="closeMenu()"
                 class="block mx-4 btn-primary text-sm text-center">
                Réserver
              </a>
            </div>
          </div>
        }
      </nav>
    </header>
  `,
})
export class HeaderComponent {
  Menu = Menu;
  X = X;
  User = User;
  Globe = Globe;
  menuOpen = signal(false);

  toggleMenu() { this.menuOpen.update(v => !v); }
  closeMenu() { this.menuOpen.set(false); }
}
