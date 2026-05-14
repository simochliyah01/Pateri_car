import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ReservationService, ReservationDto, ReservationStatus } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';

interface StatusTab {
  key: 'ALL' | ReservationStatus;
  label: string;
}

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <!-- Header -->
    <section class="bg-gradient-to-br from-white via-surface-50
                    to-primary-50/20 border-b border-gray-200 pt-24 pb-8">
      <div class="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-[11px] font-bold text-primary-600 uppercase
                      tracking-[0.2em] mb-2">
              Espace personnel
            </p>
            <h1 class="text-3xl sm:text-4xl font-bold text-ink-900
                       tracking-tight mb-2">
              Mes réservations
            </h1>
            <p class="text-ink-500">
              {{ totalCount() }} réservation(s) ·
              Bonjour {{ authService.currentUser()?.firstName }}
            </p>
          </div>

          <a routerLink="/voitures"
             class="inline-flex items-center gap-2 bg-primary-500
                    hover:bg-primary-600 text-white font-semibold
                    px-5 py-2.5 rounded-xl transition-colors
                    shadow-lg shadow-primary-500/30">
            <lucide-icon name="plus" [size]="16"></lucide-icon>
            Nouvelle réservation
          </a>
        </div>
      </div>
    </section>

    <!-- Main content -->
    <section class="bg-white py-8 sm:py-10 min-h-[60vh]">
      <div class="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">

        <!-- Status tabs -->
        <div class="flex gap-1 mb-6 overflow-x-auto scrollbar-hide pb-1">
          @for (tab of tabs; track tab.key) {
            <button (click)="setActiveTab(tab.key)"
                    [class.bg-primary-500]="activeTab() === tab.key"
                    [class.text-white]="activeTab() === tab.key"
                    [class.shadow-lg]="activeTab() === tab.key"
                    [class.text-ink-700]="activeTab() !== tab.key"
                    [class.hover:bg-gray-100]="activeTab() !== tab.key"
                    class="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
              <span>{{ tab.label }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                    [class.bg-white]="activeTab() === tab.key"
                    [class.text-primary-700]="activeTab() === tab.key"
                    [class.bg-gray-200]="activeTab() !== tab.key">{{ countForStatus(tab.key) }}</span>
            </button>
          }
        </div>

        @if (loading()) {
          <div class="space-y-4">
            @for (i of [1,2,3]; track i) {
              <div class="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
                <div class="flex gap-4">
                  <div class="w-20 h-20 bg-gray-100 rounded-xl"></div>
                  <div class="flex-1 space-y-3">
                    <div class="h-4 bg-gray-100 rounded w-1/3"></div>
                    <div class="h-3 bg-gray-100 rounded w-1/2"></div>
                    <div class="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else if (filteredReservations().length === 0) {
          <div class="bg-surface-50 border-2 border-dashed border-gray-200 rounded-2xl py-16 px-6 text-center">
            <div class="w-20 h-20 bg-white rounded-full mx-auto mb-5 flex items-center justify-center border border-gray-200">
              <lucide-icon name="calendar-x" [size]="32" class="text-ink-400"></lucide-icon>
            </div>
            <h3 class="text-xl font-bold text-ink-900 mb-2">
              @if (activeTab() === 'ALL') {
                Aucune réservation pour le moment
              } @else {
                Aucune réservation dans cette catégorie
              }
            </h3>
            <p class="text-ink-500 mb-6 max-w-md mx-auto">
              @if (activeTab() === 'ALL') {
                Découvrez notre flotte et réservez votre première voiture en quelques clics.
              } @else {
                Essayez un autre filtre ou créez une nouvelle réservation.
              }
            </p>
            <a routerLink="/voitures"
               class="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Voir les voitures disponibles
              <lucide-icon name="arrow-right" [size]="16"></lucide-icon>
            </a>
          </div>
        } @else {
          <div class="space-y-4">
            @for (r of filteredReservations(); track r.id) {
              <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:border-primary-300 transition-all group">
                <div class="flex flex-col sm:flex-row gap-4">
                  <div class="w-full sm:w-24 h-24 bg-gradient-to-br from-primary-50 to-surface-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
                    <lucide-icon name="car" [size]="32" class="text-primary-600"></lucide-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider font-mono">{{ r.reservationNumber }}</span>
                          <span [class]="getStatusClasses(r.status)"
                                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border">
                            @if (r.status === 'PENDING') {
                              <span class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-soft-pulse"></span>
                            }
                            {{ getStatusLabel(r.status) }}
                          </span>
                        </div>
                        <h3 class="text-lg font-bold text-ink-900">
                          {{ r.vehicleBrand }}
                          <span class="text-primary-500">{{ r.vehicleModel }}</span>
                        </h3>
                      </div>
                      <div class="text-right">
                        <div class="text-xl font-bold text-ink-900">{{ r.totalPrice }} DH</div>
                        <div class="text-[10px] text-ink-500">{{ r.durationDays }} jour(s)</div>
                      </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">
                      <div class="flex items-center gap-2 text-ink-700">
                        <lucide-icon name="calendar" [size]="14" class="text-primary-600 flex-shrink-0"></lucide-icon>
                        <span class="truncate">{{ formatDate(r.startDate) }} → {{ formatDate(r.endDate) }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-ink-700">
                        <lucide-icon name="map-pin" [size]="14" class="text-primary-600 flex-shrink-0"></lucide-icon>
                        <span class="truncate">{{ getLocationLabel(r.pickupLocation) }}</span>
                      </div>
                    </div>
                    @if (r.options && r.options.length > 0) {
                      <div class="flex flex-wrap gap-1.5 mt-3">
                        @for (opt of r.options; track opt.id) {
                          <span class="inline-flex items-center bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">{{ getOptionLabel(opt.optionType) }}</span>
                        }
                      </div>
                    }
                    <div class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                      <span class="text-[11px] text-ink-500">Créée le {{ formatDateTime(r.createdAt) }}</span>
                      <div class="ml-auto flex gap-2">
                        @if (canCancel(r.status)) {
                          <button (click)="openCancelModal(r)"
                                  class="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5">
                            <lucide-icon name="x-circle" [size]="14"></lucide-icon>
                            Annuler
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </section>

    <!-- ═══ CANCEL MODAL ═══ -->
    @if (cancelTarget()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center
                  bg-ink-900/50 backdrop-blur-sm p-4 modal-overlay"
           (click)="closeCancelModal()">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
             (click)="$event.stopPropagation()">
          <div class="flex items-start gap-3 mb-5">
            <div class="w-10 h-10 bg-red-50 rounded-full flex
                        items-center justify-center flex-shrink-0">
              <lucide-icon name="alert-triangle" [size]="20"
                           class="text-red-600"></lucide-icon>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-ink-900 mb-1">
                Annuler cette réservation ?
              </h3>
              <p class="text-sm text-ink-500">
                Cette action est définitive.
                <strong class="text-ink-900 font-mono">
                  {{ cancelTarget()!.reservationNumber }}
                </strong>
                sera annulée.
              </p>
            </div>
          </div>

          <div class="mb-5">
            <label class="block text-sm font-semibold text-ink-900 mb-2">
              Raison de l'annulation
            </label>
            <textarea [(ngModel)]="cancelReason" rows="3"
                      placeholder="Ex: Changement de plans..."
                      class="w-full px-3 py-2.5 border border-gray-200
                             rounded-lg text-sm
                             focus:outline-none focus:border-primary-500
                             resize-none">
            </textarea>
          </div>

          @if (cancelError()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200
                        rounded-lg text-sm text-red-700">
              {{ cancelError() }}
            </div>
          }

          <div class="flex gap-3">
            <button (click)="closeCancelModal()"
                    [disabled]="cancelling()"
                    class="flex-1 px-4 py-2.5 border border-gray-300
                           text-ink-700 hover:bg-gray-50 font-semibold
                           rounded-lg transition-colors disabled:opacity-50">
              Garder
            </button>
            <button (click)="confirmCancel()"
                    [disabled]="cancelling() || !cancelReason.trim()"
                    class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600
                           text-white font-semibold rounded-lg transition-colors
                           disabled:bg-gray-300 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2">
              @if (cancelling()) {
                <lucide-icon name="loader-2" [size]="14"
                             class="animate-spin"></lucide-icon>
                Annulation...
              } @else {
                Confirmer l'annulation
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `],
})
export class MyReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  protected authService = inject(AuthService);

  reservations = signal<ReservationDto[]>([]);
  loading = signal(true);
  activeTab = signal<'ALL' | ReservationStatus>('ALL');

  cancelTarget = signal<ReservationDto | null>(null);
  cancelReason = '';
  cancelling = signal(false);
  cancelError = signal<string | null>(null);

  tabs: StatusTab[] = [
    { key: 'ALL',         label: 'Toutes' },
    { key: 'PENDING',     label: 'En attente' },
    { key: 'CONFIRMED',   label: 'Confirmées' },
    { key: 'IN_PROGRESS', label: 'En cours' },
    { key: 'COMPLETED',   label: 'Terminées' },
    { key: 'CANCELLED',   label: 'Annulées' },
  ];

  totalCount = computed(() => this.reservations().length);

  filteredReservations = computed(() => {
    const tab = this.activeTab();
    if (tab === 'ALL') return this.reservations();
    return this.reservations().filter(r => r.status === tab);
  });

  countForStatus(key: 'ALL' | ReservationStatus): number {
    if (key === 'ALL') return this.reservations().length;
    return this.reservations().filter(r => r.status === key).length;
  }

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.loading.set(true);
    this.reservationService.getMyReservations().subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.reservations.set([]);
        this.loading.set(false);
      },
    });
  }

  setActiveTab(key: 'ALL' | ReservationStatus) {
    this.activeTab.set(key);
  }

  canCancel(status: ReservationStatus): boolean {
    return status === 'PENDING' || status === 'CONFIRMED';
  }

  openCancelModal(reservation: ReservationDto) {
    this.cancelTarget.set(reservation);
    this.cancelReason = '';
    this.cancelError.set(null);
  }

  closeCancelModal() {
    if (this.cancelling()) return;
    this.cancelTarget.set(null);
    this.cancelReason = '';
    this.cancelError.set(null);
  }

  confirmCancel() {
    const target = this.cancelTarget();
    if (!target || !this.cancelReason.trim()) return;

    this.cancelling.set(true);
    this.cancelError.set(null);

    this.reservationService.cancel(target.id, this.cancelReason.trim())
      .subscribe({
        next: () => {
          this.cancelling.set(false);
          this.cancelTarget.set(null);
          this.loadReservations();
        },
        error: (err) => {
          this.cancelError.set(
            err.error?.message || "Impossible d'annuler. Réessayez."
          );
          this.cancelling.set(false);
        },
      });
  }

  getStatusLabel(status: ReservationStatus): string {
    const labels: Record<ReservationStatus, string> = {
      PENDING:     'En attente',
      CONFIRMED:   'Confirmée',
      IN_PROGRESS: 'En cours',
      COMPLETED:   'Terminée',
      CANCELLED:   'Annulée',
      DISPUTE:     'Litige',
    };
    return labels[status] ?? status;
  }

  getStatusClasses(status: ReservationStatus): string {
    const map: Record<ReservationStatus, string> = {
      PENDING:     'bg-amber-50 border-amber-200 text-amber-800',
      CONFIRMED:   'bg-primary-50 border-primary-200 text-primary-800',
      IN_PROGRESS: 'bg-blue-50 border-blue-200 text-blue-800',
      COMPLETED:   'bg-gray-50 border-gray-200 text-gray-700',
      CANCELLED:   'bg-red-50 border-red-200 text-red-700',
      DISPUTE:     'bg-orange-50 border-orange-200 text-orange-800',
    };
    return map[status] ?? 'bg-gray-50 border-gray-200 text-gray-700';
  }

  getLocationLabel(location: string): string {
    const labels: Record<string, string> = {
      AGENCE:   'Agence Taza',
      GARE:     'Gare ferroviaire',
      DOMICILE: 'Livraison à domicile',
    };
    return labels[location] ?? location;
  }

  getOptionLabel(type: string): string {
    const labels: Record<string, string> = {
      GPS:               'GPS',
      CHILD_SEAT:        'Siège enfant',
      ADDITIONAL_DRIVER: 'Conducteur sup.',
      FULL_INSURANCE:    'Assurance premium',
    };
    return labels[type] ?? type;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
}
