import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { AdminStatsService } from '../../../core/services/admin-stats.service';
import { NotificationService, NotificationDto } from '../../../core/services/notification.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: () => number;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-surface-50 flex">

      <!-- MOBILE OVERLAY -->
      @if (mobileMenuOpen()) {
        <div class="fixed inset-0 z-40 bg-ink-900/50 backdrop-blur-sm lg:hidden"
             (click)="closeMobileMenu()"></div>
      }

      <!-- PREMIUM SIDEBAR -->
      <aside [class.translate-x-0]="mobileMenuOpen()"
             [class.-translate-x-full]="!mobileMenuOpen()"
             class="fixed inset-y-0 left-0 z-50 w-72 bg-ink-900 transform transition-transform duration-300 lg:translate-x-0 flex flex-col">

        <!-- Brand -->
        <div class="relative px-5 pt-6 pb-5 border-b border-white/5">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <lucide-icon name="car" [size]="20" class="text-white"></lucide-icon>
              </div>
              <div class="absolute -top-1 -right-1 w-3 h-3 bg-primary-400 rounded-full ring-2 ring-ink-900">
                <span class="absolute inset-0 bg-primary-400 rounded-full animate-ping opacity-75"></span>
              </div>
            </div>
            <div>
              <div class="text-white font-bold tracking-tight">PATERI CAR</div>
              <div class="text-[10px] font-bold text-primary-400 uppercase tracking-[0.2em]">
                Administration
              </div>
            </div>
          </div>
          <button (click)="closeMobileMenu()"
                  class="lg:hidden absolute top-5 right-4 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <lucide-icon name="x" [size]="18"></lucide-icon>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          @for (section of navSections; track section.title) {
            <div>
              <p class="px-3 mb-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                {{ section.title }}
              </p>
              <div class="space-y-0.5">
                @for (item of section.items; track item.route) {
                  <a [routerLink]="item.route"
                     routerLinkActive="active-link"
                     [routerLinkActiveOptions]="{ exact: item.exact || false }"
                     (click)="closeMobileMenu()"
                     class="nav-link group">
                    <lucide-icon [name]="item.icon" [size]="16"
                                 class="flex-shrink-0 text-white/50 group-hover:text-white transition-colors"></lucide-icon>
                    <span class="flex-1 truncate">{{ item.label }}</span>
                    @if (item.badge && item.badge() > 0) {
                      <span class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-amber-500 text-ink-900 rounded-full text-[10px] font-bold leading-none">
                        {{ item.badge() }}
                      </span>
                    }
                  </a>
                }
              </div>
            </div>
          }
        </nav>

        <!-- User card -->
        <div class="p-3 border-t border-white/5">
          <div class="bg-white/5 rounded-xl p-3 hover:bg-white/8 transition-colors">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                {{ userInitials() }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-white truncate">
                  {{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}
                </div>
                <div class="text-[10px] text-primary-300 font-semibold uppercase tracking-wider">
                  {{ authService.currentUser()?.role }}
                </div>
              </div>
            </div>
            <div class="flex gap-1.5">
              <a routerLink="/"
                 class="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-semibold rounded-lg transition-colors">
                <lucide-icon name="external-link" [size]="11"></lucide-icon>
                Site
              </a>
              <button (click)="logout()"
                      class="flex-1 inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-[11px] font-semibold rounded-lg transition-colors">
                <lucide-icon name="log-out" [size]="11"></lucide-icon>
                Quitter
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- MAIN AREA -->
      <div class="flex-1 flex flex-col min-w-0 lg:ml-72">

        <!-- PREMIUM TOPBAR -->
        <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
          <div class="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-16">

            <!-- Left: hamburger + search -->
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <button (click)="toggleMobileMenu()"
                      class="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <lucide-icon name="menu" [size]="20" class="text-ink-700"></lucide-icon>
              </button>

              <div class="relative flex-1 max-w-md hidden sm:block">
                <lucide-icon name="search" [size]="14"
                             class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"></lucide-icon>
                <input type="text"
                       placeholder="Rechercher..."
                       class="w-full pl-9 pr-14 py-2 bg-surface-50 border border-gray-200/60 rounded-lg text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all" />
                <kbd class="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono font-semibold text-ink-500">
                  &#x2318;K
                </kbd>
              </div>
            </div>

            <!-- Right: actions -->
            <div class="flex items-center gap-2">
              <a routerLink="/"
                 class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-primary-300 text-ink-700 hover:text-primary-700 text-sm font-semibold rounded-lg transition-colors">
                <lucide-icon name="external-link" [size]="14"></lucide-icon>
                Voir le site
              </a>

              <!-- Bell + dropdown -->
              <div class="relative">
                <button (click)="toggleNotifications()"
                        class="relative p-2.5 bg-white border border-gray-200 hover:border-primary-300 rounded-lg transition-colors">
                  <lucide-icon name="bell" [size]="16" class="text-ink-700"></lucide-icon>
                  @if (notificationService.unreadCount() > 0) {
                    <span class="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {{ notificationService.unreadCount() > 9 ? '9+' : notificationService.unreadCount() }}
                    </span>
                  }
                </button>

                @if (notificationsOpen()) {
                  <div class="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50"
                       (click)="$event.stopPropagation()">
                    <!-- Header -->
                    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 class="font-bold text-ink-900 text-sm">Notifications</h3>
                      @if (notificationService.unreadCount() > 0) {
                        <button (click)="markAllRead()"
                                class="text-xs font-semibold text-primary-600 hover:text-primary-700">
                          Tout marquer lu
                        </button>
                      }
                    </div>

                    <!-- List -->
                    <div class="max-h-96 overflow-y-auto">
                      @if (loadingNotifs()) {
                        <div class="p-6 text-center text-sm text-ink-500">
                          Chargement...
                        </div>
                      } @else if (notifications().length === 0) {
                        <div class="p-8 text-center">
                          <lucide-icon name="bell-off" [size]="28" class="text-ink-300 mx-auto mb-2"></lucide-icon>
                          <p class="text-sm text-ink-500">Aucune notification</p>
                        </div>
                      } @else {
                        @for (n of notifications(); track n.id) {
                          <button (click)="handleNotificationClick(n)"
                                  [class.bg-primary-50]="!n.read"
                                  class="w-full px-4 py-3 hover:bg-surface-50 flex items-start gap-3 border-b border-gray-50 text-left transition-colors group">
                            <div [ngClass]="{
                              'bg-primary-100 text-primary-700': getNotifColor(n.type) === 'primary',
                              'bg-blue-100 text-blue-700': getNotifColor(n.type) === 'blue',
                              'bg-red-100 text-red-700': getNotifColor(n.type) === 'red',
                              'bg-amber-100 text-amber-700': getNotifColor(n.type) === 'amber'
                            }" class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                              <lucide-icon [name]="getNotifIcon(n.type)" [size]="14"></lucide-icon>
                            </div>
                            <div class="flex-1 min-w-0">
                              <div class="flex items-center gap-2 mb-0.5">
                                <p class="font-semibold text-ink-900 text-sm truncate">{{ n.title }}</p>
                                @if (!n.read) {
                                  <span class="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></span>
                                }
                              </div>
                              <p class="text-xs text-ink-500 line-clamp-2">{{ n.message }}</p>
                              <p class="text-[10px] text-ink-400 mt-1">{{ formatRelative(n.createdAt) }}</p>
                            </div>
                          </button>
                        }
                      }
                    </div>

                    <!-- Footer -->
                    <div class="px-4 py-2.5 border-t border-gray-100 bg-surface-50">
                      <a routerLink="/admin/notifications"
                         (click)="notificationsOpen.set(false)"
                         class="block text-center text-xs font-semibold text-primary-600 hover:text-primary-700">
                        Voir toutes les notifications
                      </a>
                    </div>
                  </div>
                }
              </div>

              <div class="relative">
                <button (click)="toggleUserMenu()"
                        class="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white text-sm">
                    {{ userInitials() }}
                  </div>
                  <lucide-icon name="chevron-down" [size]="14" class="text-ink-500 hidden sm:block"></lucide-icon>
                </button>

                @if (userMenuOpen()) {
                  <div class="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50"
                       (click)="$event.stopPropagation()">
                    <div class="p-4 bg-gradient-to-br from-primary-50 to-white border-b border-gray-100">
                      <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-white">
                          {{ userInitials() }}
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="font-bold text-ink-900 truncate">
                            {{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}
                          </div>
                          <div class="text-xs text-ink-500 truncate">
                            {{ authService.currentUser()?.email }}
                          </div>
                        </div>
                      </div>
                      <span class="inline-flex items-center mt-2 px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {{ authService.currentUser()?.role }}
                      </span>
                    </div>
                    <div class="p-2 space-y-0.5">
                      <a routerLink="/admin/parametres"
                         (click)="userMenuOpen.set(false)"
                         class="dropdown-item">
                        <lucide-icon name="settings" [size]="14"></lucide-icon>
                        Paramètres
                      </a>
                      <a routerLink="/"
                         (click)="userMenuOpen.set(false)"
                         class="dropdown-item">
                        <lucide-icon name="external-link" [size]="14"></lucide-icon>
                        Voir le site public
                      </a>
                      <button (click)="logout()" class="dropdown-item w-full text-left text-red-600 hover:bg-red-50">
                        <lucide-icon name="log-out" [size]="14"></lucide-icon>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 min-w-0" (click)="closeDropdowns()">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      color: rgba(255, 255, 255, 0.65);
      font-size: 13px;
      font-weight: 600;
      border-radius: 10px;
      transition: all 0.15s;
      text-decoration: none;
    }
    .nav-link:hover {
      background: rgba(255, 255, 255, 0.06);
      color: white;
    }
    .nav-link.active-link {
      background: linear-gradient(135deg, rgba(20,184,166,0.18) 0%, rgba(20,184,166,0.04) 100%);
      color: white;
      box-shadow: inset 3px 0 0 #14B8A6;
    }
    .nav-link.active-link lucide-icon {
      color: #14B8A6 !important;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      color: rgb(15 23 42);
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      transition: background 0.15s;
      cursor: pointer;
      text-decoration: none;
      width: 100%;
    }
    .dropdown-item:hover {
      background: rgb(248 250 252);
    }
  `],
})
export class AdminLayoutComponent implements OnInit {
  protected authService        = inject(AuthService);
  private statsService         = inject(AdminStatsService);
  private router               = inject(Router);
  protected notificationService = inject(NotificationService);

  mobileMenuOpen    = signal(false);
  userMenuOpen      = signal(false);
  notificationsOpen = signal(false);
  notifications     = signal<NotificationDto[]>([]);
  loadingNotifs     = signal(false);
  pendingCount      = signal(0);

  navSections: NavSection[] = [
    {
      title: 'Principal',
      items: [
        { label: 'Tableau de bord', icon: 'layout-dashboard', route: '/admin',               exact: true },
        { label: 'Réservations',    icon: 'calendar',          route: '/admin/reservations',  badge: () => this.pendingCount() },
        { label: 'Voitures',        icon: 'car',               route: '/admin/voitures' },
        { label: 'Clients',         icon: 'users',             route: '/admin/clients' },
      ],
    },
    {
      title: 'Analytics',
      items: [
        { label: 'Statistiques',   icon: 'trending-up', route: '/admin/stats' },
        { label: 'Paramètres',     icon: 'settings',    route: '/admin/parametres' },
        { label: 'Notifications',  icon: 'bell',        route: '/admin/notifications', badge: () => this.notificationService.unreadCount() },
      ],
    },
  ];

  userInitials(): string {
    const u = this.authService.currentUser();
    if (!u) return '';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase();
  }

  ngOnInit() {
    this.notificationService.refreshUnreadCount();
    this.loadPendingCount();
    setInterval(() => {
      this.notificationService.refreshUnreadCount();
      this.loadPendingCount();
    }, 30_000);
  }

  loadPendingCount() {
    this.statsService.getDashboardStats().subscribe({
      next: (s) => this.pendingCount.set(s.pendingCount),
      error: () => {},
    });
  }

  toggleNotifications() {
    this.notificationsOpen.update(v => !v);
    this.userMenuOpen.set(false);
    if (this.notificationsOpen()) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    this.loadingNotifs.set(true);
    this.notificationService.list(10).subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.loadingNotifs.set(false);
      },
      error: () => this.loadingNotifs.set(false),
    });
  }

  handleNotificationClick(notif: NotificationDto) {
    if (!notif.read) {
      this.notificationService.markAsRead(notif.id).subscribe({
        next: () => this.notificationService.refreshUnreadCount(),
      });
    }
    if (notif.linkUrl) {
      this.router.navigateByUrl(notif.linkUrl);
    }
    this.notificationsOpen.set(false);
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notificationService.refreshUnreadCount();
        this.loadNotifications();
      },
    });
  }

  formatRelative(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "A l'instant";
    if (diffMins < 60) return `il y a ${diffMins} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  getNotifIcon(type: string): string {
    switch (type) {
      case 'RESERVATION_CREATED': return 'calendar-plus';
      case 'RESERVATION_CONFIRMED': return 'check-circle';
      case 'RESERVATION_CANCELLED': return 'x-circle';
      default: return 'bell';
    }
  }

  getNotifColor(type: string): string {
    switch (type) {
      case 'RESERVATION_CREATED': return 'primary';
      case 'RESERVATION_CONFIRMED': return 'blue';
      case 'RESERVATION_CANCELLED': return 'red';
      default: return 'amber';
    }
  }

  toggleMobileMenu() { this.mobileMenuOpen.update(v => !v); }
  toggleUserMenu()   { this.userMenuOpen.update(v => !v); this.notificationsOpen.set(false); }
  closeMobileMenu()  { this.mobileMenuOpen.set(false); }
  closeDropdowns()   { this.userMenuOpen.set(false); this.notificationsOpen.set(false); }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
