import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService, NotificationDto } from '../../../core/services/notification.service';

type NotifFilter = 'all' | 'unread' | 'reservations' | 'cancellations';

interface NotifGroup {
  label: string;
  items: NotificationDto[];
}

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-5 sm:p-8 max-w-4xl">

      <!-- PREMIUM HERO HEADER -->
      <div class="relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-primary-900 rounded-3xl p-6 sm:p-8 mb-6 shadow-xl">
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 -left-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl"></div>

        <div class="relative flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <lucide-icon name="bell" [size]="26" class="text-white"></lucide-icon>
            </div>
            <div>
              <p class="text-[11px] font-bold text-primary-300 uppercase tracking-[0.2em] mb-1">
                Centre d'activite
              </p>
              <h1 class="text-2xl sm:text-3xl font-bold text-white mb-1">Notifications</h1>
              <p class="text-sm text-white/70">
                @if (unreadCount() > 0) {
                  {{ unreadCount() }} non lue(s) sur {{ allNotifications().length }}
                } @else {
                  Toutes les notifications sont lues
                }
              </p>
            </div>
          </div>

          @if (unreadCount() > 0) {
            <button (click)="markAllRead()"
                    class="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-primary-50 text-ink-900 font-semibold text-sm rounded-xl shadow-lg transition-all">
              <lucide-icon name="check-check" [size]="14"></lucide-icon>
              Tout marquer comme lu
            </button>
          }
        </div>
      </div>

      <!-- FILTER TABS -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button (click)="filter.set('all')"
                [class.bg-ink-900]="filter() === 'all'"
                [class.text-white]="filter() === 'all'"
                [class.bg-white]="filter() !== 'all'"
                [class.text-ink-700]="filter() !== 'all'"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 transition-all">
          Toutes
          <span class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold"
                [class.bg-white]="filter() === 'all'"
                [class.text-ink-900]="filter() === 'all'"
                [class.bg-gray-100]="filter() !== 'all'"
                [class.text-ink-600]="filter() !== 'all'">
            {{ allNotifications().length }}
          </span>
        </button>

        <button (click)="filter.set('unread')"
                [class.bg-primary-500]="filter() === 'unread'"
                [class.text-white]="filter() === 'unread'"
                [class.bg-white]="filter() !== 'unread'"
                [class.text-ink-700]="filter() !== 'unread'"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 transition-all">
          Non lues
          @if (unreadCount() > 0) {
            <span class="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold"
                  [class.bg-white]="filter() === 'unread'"
                  [class.text-primary-700]="filter() === 'unread'"
                  [class.bg-primary-100]="filter() !== 'unread'"
                  [class.text-primary-700]="filter() !== 'unread'">
              {{ unreadCount() }}
            </span>
          }
        </button>

        <button (click)="filter.set('reservations')"
                [class.bg-blue-500]="filter() === 'reservations'"
                [class.text-white]="filter() === 'reservations'"
                [class.bg-white]="filter() !== 'reservations'"
                [class.text-ink-700]="filter() !== 'reservations'"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 transition-all">
          <lucide-icon name="calendar-plus" [size]="14"></lucide-icon>
          Reservations
        </button>

        <button (click)="filter.set('cancellations')"
                [class.bg-red-500]="filter() === 'cancellations'"
                [class.text-white]="filter() === 'cancellations'"
                [class.bg-white]="filter() !== 'cancellations'"
                [class.text-ink-700]="filter() !== 'cancellations'"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 transition-all">
          <lucide-icon name="x-circle" [size]="14"></lucide-icon>
          Annulations
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse flex gap-4">
              <div class="w-11 h-11 bg-gray-100 rounded-xl flex-shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-100 rounded w-1/2"></div>
                <div class="h-3 bg-gray-100 rounded w-3/4"></div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Empty -->
      @else if (filteredNotifications().length === 0) {
        <div class="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 px-6 text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-surface-50 to-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <lucide-icon name="bell-off" [size]="28" class="text-ink-400"></lucide-icon>
          </div>
          <h3 class="text-lg font-bold text-ink-900 mb-2">
            @if (filter() === 'unread') {
              Aucune notification non lue
            } @else if (filter() !== 'all') {
              Aucune notification dans cette categorie
            } @else {
              Aucune notification
            }
          </h3>
          <p class="text-sm text-ink-500">
            Les notifications apparaitront ici des qu'il y a de l'activite
          </p>
        </div>
      }

      <!-- DATE-GROUPED LIST -->
      @else {
        <div class="space-y-6">
          @for (group of groupedNotifications(); track group.label) {
            <div>
              <!-- Group label -->
              <div class="flex items-center gap-3 mb-3">
                <h2 class="text-[11px] font-bold text-ink-500 uppercase tracking-[0.2em]">
                  {{ group.label }}
                </h2>
                <div class="flex-1 h-px bg-gray-200"></div>
                <span class="text-[11px] font-semibold text-ink-400">
                  {{ group.items.length }}
                </span>
              </div>

              <!-- Group items -->
              <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                @for (n of group.items; track n.id; let last = $last) {
                  <button (click)="handleClick(n)"
                          [class.bg-primary-50]="!n.read"
                          [class.border-b]="!last"
                          [class.border-gray-100]="!last"
                          class="w-full px-4 sm:px-5 py-4 hover:bg-surface-50 flex items-start gap-4 text-left transition-colors group">
                    <!-- Icon -->
                    <div [ngClass]="getIconClasses(n.type)"
                         class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0">
                      <lucide-icon [name]="getIcon(n.type)" [size]="18"></lucide-icon>
                    </div>
                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-0.5">
                        <h3 class="font-bold text-ink-900 text-sm sm:text-base">{{ n.title }}</h3>
                        @if (!n.read) {
                          <span class="inline-flex items-center px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                            Nouveau
                          </span>
                        }
                      </div>
                      <p class="text-sm text-ink-600">{{ n.message }}</p>
                      <p class="text-[11px] text-ink-400 mt-1.5 flex items-center gap-1">
                        <lucide-icon name="clock" [size]="11"></lucide-icon>
                        {{ formatRelative(n.createdAt) }}
                      </p>
                    </div>
                    <!-- Arrow -->
                    @if (n.linkUrl) {
                      <div class="w-8 h-8 rounded-lg bg-surface-50 group-hover:bg-primary-100 flex items-center justify-center flex-shrink-0 transition-colors">
                        <lucide-icon name="arrow-right" [size]="14"
                          class="text-ink-400 group-hover:text-primary-600 transition-colors"></lucide-icon>
                      </div>
                    }
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class NotificationsAdminComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  allNotifications = signal<NotificationDto[]>([]);
  loading = signal(true);
  filter = signal<NotifFilter>('all');

  unreadCount = computed(() =>
    this.allNotifications().filter(n => !n.read).length
  );

  filteredNotifications = computed(() => {
    const list = this.allNotifications();
    switch (this.filter()) {
      case 'unread':
        return list.filter(n => !n.read);
      case 'reservations':
        return list.filter(n =>
          n.type === 'RESERVATION_CREATED' || n.type === 'RESERVATION_CONFIRMED'
        );
      case 'cancellations':
        return list.filter(n => n.type === 'RESERVATION_CANCELLED');
      case 'all':
      default:
        return list;
    }
  });

  groupedNotifications = computed<NotifGroup[]>(() => {
    const list = this.filteredNotifications();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: Record<string, NotificationDto[]> = {
      "Aujourd'hui": [],
      'Hier': [],
      'Cette semaine': [],
      'Plus ancien': [],
    };

    for (const n of list) {
      const d = new Date(n.createdAt);
      const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      if (dDay.getTime() === today.getTime()) {
        groups["Aujourd'hui"].push(n);
      } else if (dDay.getTime() === yesterday.getTime()) {
        groups['Hier'].push(n);
      } else if (dDay >= weekAgo) {
        groups['Cette semaine'].push(n);
      } else {
        groups['Plus ancien'].push(n);
      }
    }

    return Object.entries(groups)
      .filter(([, items]) => items.length > 0)
      .map(([label, items]) => ({ label, items }));
  });

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.notificationService.list(100).subscribe({
      next: (data) => {
        this.allNotifications.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  handleClick(n: NotificationDto) {
    if (!n.read) {
      this.notificationService.markAsRead(n.id).subscribe({
        next: () => {
          this.notificationService.refreshUnreadCount();
          this.allNotifications.update(list =>
            list.map(item => item.id === n.id ? { ...item, read: true } : item)
          );
        },
      });
    }
    if (n.linkUrl) {
      this.router.navigateByUrl(n.linkUrl);
    }
  }

  markAllRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notificationService.refreshUnreadCount();
        this.allNotifications.update(list =>
          list.map(item => ({ ...item, read: true }))
        );
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
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'RESERVATION_CREATED': return 'calendar-plus';
      case 'RESERVATION_CONFIRMED': return 'check-circle';
      case 'RESERVATION_CANCELLED': return 'x-circle';
      default: return 'bell';
    }
  }

  getIconClasses(type: string): Record<string, boolean> {
    return {
      'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md shadow-primary-500/30': type === 'RESERVATION_CREATED',
      'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md shadow-blue-500/30': type === 'RESERVATION_CONFIRMED',
      'bg-gradient-to-br from-red-400 to-red-600 text-white shadow-md shadow-red-500/30': type === 'RESERVATION_CANCELLED',
      'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/30':
        type !== 'RESERVATION_CREATED' && type !== 'RESERVATION_CONFIRMED' && type !== 'RESERVATION_CANCELLED',
    };
  }
}
