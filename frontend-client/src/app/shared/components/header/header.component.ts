import { Component, signal, HostListener, inject, computed,
  ChangeDetectionStrategy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

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

            @if (authService.isAuthenticated()) {
              <!-- User avatar + dropdown -->
              <div class="relative">
                <button (click)="toggleUserMenu($event)"
                        class="flex items-center gap-2 px-2 py-1.5
                               rounded-lg hover:bg-primary-50 transition-colors">
                  <div class="w-8 h-8 rounded-full bg-primary-500
                              text-white flex items-center justify-center
                              font-semibold text-sm">
                    {{ userInitials() }}
                  </div>
                  <span class="text-sm font-medium text-ink-900 max-w-[120px] truncate">
                    {{ authService.currentUser()?.firstName }}
                  </span>
                  <lucide-icon name="chevron-down" [size]="14"
                               class="text-ink-500 transition-transform"
                               [class.rotate-180]="userMenuOpen()">
                  </lucide-icon>
                </button>

                @if (userMenuOpen()) {
                  <div class="absolute right-0 top-full mt-2 w-64
                              bg-white border border-gray-200 rounded-xl
                              shadow-lg overflow-hidden animate-fade-up
                              ring-1 ring-black/5">

                    <!-- User info -->
                    <div class="px-4 py-3 bg-primary-50/50 border-b border-gray-100">
                      <p class="font-semibold text-ink-900 text-sm truncate">
                        {{ authService.currentUser()?.firstName }}
                        {{ authService.currentUser()?.lastName }}
                      </p>
                      <p class="text-xs text-ink-500 truncate">
                        {{ authService.currentUser()?.email }}
                      </p>
                      @if (authService.isAdmin()) {
                        <span class="inline-block mt-1.5 px-2 py-0.5
                                     bg-primary-500 text-white text-[10px]
                                     font-semibold rounded uppercase tracking-wide">
                          {{ authService.currentUser()?.role }}
                        </span>
                      }
                    </div>

                    <!-- Menu items -->
                    <div class="py-1.5">
                      <a class="dropdown-item">
                        <lucide-icon name="user" [size]="16"></lucide-icon>
                        Mon profil
                      </a>
                      <a class="dropdown-item">
                        <lucide-icon name="calendar" [size]="16"></lucide-icon>
                        Mes réservations
                      </a>
                      <a class="dropdown-item">
                        <lucide-icon name="file-text" [size]="16"></lucide-icon>
                        Mes factures
                      </a>
                      <a class="dropdown-item">
                        <lucide-icon name="settings" [size]="16"></lucide-icon>
                        Paramètres
                      </a>

                      @if (authService.isAdmin()) {
                        <div class="my-1.5 border-t border-gray-100"></div>
                        <a class="dropdown-item text-primary-600">
                          <lucide-icon name="layout-dashboard" [size]="16"></lucide-icon>
                          Tableau de bord
                        </a>
                      }

                      <div class="my-1.5 border-t border-gray-100"></div>
                      <button (click)="logout()"
                              class="dropdown-item w-full text-red-600 hover:bg-red-50">
                        <lucide-icon name="log-out" [size]="16"></lucide-icon>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/login" class="nav-link">Connexion</a>
              <a routerLink="/register"
                 class="border border-primary-500 text-primary-600
                        hover:bg-primary-50 font-semibold text-sm
                        px-4 py-2 rounded-lg transition-colors">
                Inscription
              </a>
              <a routerLink="/voitures"
                 class="bg-primary-500 hover:bg-primary-600 text-white
                        font-semibold text-sm px-5 py-2 rounded-lg transition-colors">
                Réserver
              </a>
            }
          </div>

          <!-- Mobile button -->
          <button (click)="toggleMobile()"
                  class="lg:hidden p-2 text-ink-700 z-10">
            <lucide-icon [name]="mobileOpen() ? 'x' : 'menu'" [size]="24"></lucide-icon>
          </button>
        </div>

        <!-- Mobile menu -->
        @if (mobileOpen()) {
          <div class="lg:hidden border-t border-gray-200/50 py-4
                      space-y-1 animate-fade-up">

            @if (authService.isAuthenticated()) {
              <div class="px-4 pb-3 mb-2 border-b border-gray-200/50">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary-500
                              text-white flex items-center justify-center font-semibold">
                    {{ userInitials() }}
                  </div>
                  <div>
                    <p class="font-semibold text-ink-900 text-sm">
                      {{ authService.currentUser()?.firstName }}
                      {{ authService.currentUser()?.lastName }}
                    </p>
                    <p class="text-xs text-ink-500">
                      {{ authService.currentUser()?.email }}
                    </p>
                  </div>
                </div>
              </div>
            }

            <a routerLink="/home" (click)="closeMobile()" class="mobile-link">Accueil</a>
            <a routerLink="/voitures" (click)="closeMobile()" class="mobile-link">Voitures</a>
            <a class="mobile-link cursor-pointer">Services</a>
            <a class="mobile-link cursor-pointer">Contact</a>

            <div class="pt-3 mt-3 border-t border-gray-200/50 space-y-2">
              @if (authService.isAuthenticated()) {
                <a class="mobile-link cursor-pointer">Mon profil</a>
                <a class="mobile-link cursor-pointer">Mes réservations</a>
                @if (authService.isAdmin()) {
                  <a class="mobile-link cursor-pointer text-primary-600">
                    Tableau de bord
                  </a>
                }
                <button (click)="logout()"
                        class="mobile-link w-full text-left text-red-600">
                  Déconnexion
                </button>
              } @else {
                <a routerLink="/login" (click)="closeMobile()" class="mobile-link">
                  Connexion
                </a>
                <a routerLink="/register" (click)="closeMobile()" class="mobile-link">
                  Inscription
                </a>
                <a routerLink="/voitures" (click)="closeMobile()"
                   class="block mx-4 bg-primary-500 hover:bg-primary-600
                          text-white font-semibold text-sm px-5 py-2.5
                          rounded-lg text-center transition-colors mt-2">
                  Réserver
                </a>
              }
            </div>
          </div>
        }
      </nav>
    </header>
  `,
  styles: [`
    :host { display: contents; }

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
    .nav-link:hover { color: #14B8A6; background: rgba(20, 184, 166, 0.05); }
    .active-link { color: #14B8A6 !important; font-weight: 600; }

    .mobile-link {
      display: block;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      color: #334155;
      border-radius: 0.5rem;
      transition: all 0.15s;
      text-decoration: none;
    }
    .mobile-link:hover { background: rgba(20, 184, 166, 0.05); color: #14B8A6; }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      color: #334155;
      transition: all 0.15s;
      cursor: pointer;
      text-decoration: none;
      width: 100%;
      background: none;
      border: none;
      text-align: left;
    }
    .dropdown-item:hover { background: rgba(20, 184, 166, 0.05); color: #14B8A6; }

    .animate-fade-up { animation: fadeUp 0.2s ease-out; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    header:not(.is-scrolled):not(.is-mobile-open) .nav-link { color: #1E293B; }
  `],
})
export class HeaderComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  scrolled = signal(false);
  mobileOpen = signal(false);
  userMenuOpen = signal(false);

  userInitials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    return ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase();
  });

  constructor() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.mobileOpen.set(false);
        this.userMenuOpen.set(false);
      });
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 20); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.userMenuOpen.set(false);
    }
  }

  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile() { this.mobileOpen.set(false); }

  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    this.userMenuOpen.update(v => !v);
  }

  logout() {
    this.userMenuOpen.set(false);
    this.mobileOpen.set(false);
    this.authService.logout();
  }
}
