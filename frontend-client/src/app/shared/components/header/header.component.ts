import { Component, signal, HostListener, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      [class.is-scrolled]="scrolled()"
      [class.is-mobile-open]="mobileOpen()">

      <!-- Glass background that fades in on scroll -->
      <div class="absolute inset-0 transition-all duration-300 pointer-events-none"
           [class.bg-white-glass]="scrolled() || mobileOpen()"
           [class.opacity-100]="scrolled() || mobileOpen()"
           [class.opacity-0]="!scrolled() && !mobileOpen()">
      </div>

      <nav class="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div class="flex items-center justify-between h-16 sm:h-18">

          <!-- Logo -->
          <a routerLink="/home" class="flex items-center gap-2 z-10">
            <img src="assets/logo/logo-full.png"
                 alt="PATERI CAR"
                 class="h-9 sm:h-10 w-auto" />
          </a>

          <!-- Desktop nav -->
          <div class="hidden lg:flex items-center gap-1">
            <a routerLink="/home"
               routerLinkActive="active-link"
               [routerLinkActiveOptions]="{exact: true}"
               class="nav-link">Accueil</a>
            <a routerLink="/voitures"
               routerLinkActive="active-link"
               class="nav-link">Voitures</a>
            <a class="nav-link cursor-pointer">Services</a>
            <a class="nav-link cursor-pointer">Contact</a>
          </div>

          <!-- Right side -->
          <div class="hidden lg:flex items-center gap-3">
            <button class="nav-link flex items-center gap-1.5">
              <lucide-icon name="globe" [size]="14"></lucide-icon>
              <span class="text-sm">FR</span>
            </button>
            <a routerLink="/login" class="nav-link">Connexion</a>
            <a routerLink="/voitures"
               class="bg-primary-500 hover:bg-primary-600 text-white
                      font-semibold text-sm px-5 py-2 rounded-lg
                      transition-colors">
              Réserver
            </a>
          </div>

          <!-- Mobile menu button -->
          <button (click)="toggleMobile()"
                  class="lg:hidden p-2 text-ink-700 z-10">
            <lucide-icon [name]="mobileOpen() ? 'x' : 'menu'" [size]="24"></lucide-icon>
          </button>
        </div>

        <!-- Mobile menu -->
        @if (mobileOpen()) {
          <div class="lg:hidden border-t border-gray-200/50 py-4
                      space-y-1 animate-fade-up">
            <a routerLink="/home" (click)="closeMobile()"
               class="mobile-link">Accueil</a>
            <a routerLink="/voitures" (click)="closeMobile()"
               class="mobile-link">Voitures</a>
            <a class="mobile-link cursor-pointer">Services</a>
            <a class="mobile-link cursor-pointer">Contact</a>
            <div class="pt-3 mt-3 border-t border-gray-200/50 space-y-2">
              <a routerLink="/login" (click)="closeMobile()"
                 class="mobile-link">Connexion</a>
              <a routerLink="/voitures" (click)="closeMobile()"
                 class="block mx-4 bg-primary-500 hover:bg-primary-600
                        text-white font-semibold text-sm px-5 py-2.5
                        rounded-lg text-center transition-colors">
                Réserver
              </a>
            </div>
          </div>
        }
      </nav>
    </header>

    <!-- No spacer needed — hero has pt-24+ to clear fixed header -->
  `,
  styles: [`
    :host {
      display: contents;
    }

    .bg-white-glass {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(229, 231, 235, 0.6);
    }

    .nav-link {
      padding: 0.5rem 0.875rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #334155;
      border-radius: 0.5rem;
      transition: all 0.15s;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    .nav-link:hover {
      color: #14B8A6;
      background: rgba(20, 184, 166, 0.05);
    }
    .active-link {
      color: #14B8A6 !important;
      font-weight: 600;
    }

    .mobile-link {
      display: block;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      color: #334155;
      border-radius: 0.5rem;
      transition: all 0.15s;
      text-decoration: none;
    }
    .mobile-link:hover {
      background: rgba(20, 184, 166, 0.05);
      color: #14B8A6;
    }

    .animate-fade-up {
      animation: fadeUp 0.2s ease-out;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* When NOT scrolled, nav links are slightly darker for hero readability */
    header:not(.is-scrolled):not(.is-mobile-open) .nav-link {
      color: #1E293B;
    }
  `],
})
export class HeaderComponent {
  scrolled    = signal(false);
  mobileOpen  = signal(false);
  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.mobileOpen.set(false));
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile()  { this.mobileOpen.set(false); }
}
