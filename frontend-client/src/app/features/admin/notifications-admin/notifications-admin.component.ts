import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService, NotificationDto } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="p-5 sm:p-8 max-w-4xl">
      <!-- Header -->
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-[11px] font-bold text-primary-600 uppercase tracking-[0.2em] mb-1">Activité</p>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 mb-1">Notifications</h1>
          <p class="text-sm text-ink-500">
            @if (unreadCount() > 0) {
              {{ unreadCount() }} non lu(es) sur {{ notifications().length }}
            } @else {
              Toutes les notifications
            }
          </p>
        </div>
        @if (unreadCount() > 0) {
          <button (click)="markAllRead()"
                  class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-primary-300 rounded-lg text-sm font-semibold text-ink-700 transition-colors">
            <lucide-icon name="check-check" [size]="14"></lucide-icon>
            Tout marquer comme lu
          </button>
        }
      </div>

      @if (loading()) {
        <div class="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p class="text-sm text-ink-500">Chargement...</p>
        </div>
      } @else if (notifications().length === 0) {
        <div class="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 px-6 text-center">
          <div class="w-16 h-16 bg-surface-50 rounded-full mx-auto mb-4 flex items-center justify-center">
            <lucide-icon name="bell-off" [size]="28" class="text-ink-400"></lucide-icon>
          </div>
          <h3 class="text-lg font-bold text-ink-900 mb-2">Aucune notification</h3>
          <p class="text-sm text-ink-500">Les notifications apparaîtront ici dès qu'il y a de l'activité</p>
        </div>
      } @else {
        <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          @for (n of notifications(); track n.id; let last = $last) {
            <button (click)="handleClick(n)"
                    [class.bg-primary-50]="!n.read"
                    [class.border-b]="!last"
                    [class.border-gray-100]="!last"
                    class="w-full px-5 py-4 hover:bg-surface-50 flex items-start gap-4 text-left transition-colors group">
              <div [ngClass]="{
                'bg-primary-100 text-primary-700': getNotifColor(n.type) === 'primary',
                'bg-blue-100 text-blue-700': getNotifColor(n.type) === 'blue',
                'bg-red-100 text-red-700': getNotifColor(n.type) === 'red',
                'bg-amber-100 text-amber-700': getNotifColor(n.type) === 'amber'
              }" class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0">
                <lucide-icon [name]="getNotifIcon(n.type)" [size]="18"></lucide-icon>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-bold text-ink-900">{{ n.title }}</h3>
                  @if (!n.read) {
                    <span class="inline-flex items-center px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Nouveau
                    </span>
                  }
                </div>
                <p class="text-sm text-ink-600 mb-2">{{ n.message }}</p>
                <p class="text-xs text-ink-400">{{ formatLong(n.createdAt) }}</p>
              </div>
              @if (n.linkUrl) {
                <lucide-icon name="chevron-right" [size]="16"
                  class="text-ink-400 group-hover:text-primary-600 transition-colors mt-3 flex-shrink-0"></lucide-icon>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class NotificationsAdminComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  notifications = signal<NotificationDto[]>([]);
  loading = signal(true);
  unreadCount = signal(0);

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.notificationService.list(100).subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.unreadCount.set(data.filter(n => !n.read).length);
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
          this.refresh();
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
        this.refresh();
      },
    });
  }

  formatLong(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
}
