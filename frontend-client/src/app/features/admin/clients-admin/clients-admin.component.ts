import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ClientService } from '../../../core/services/client.service';
import { Client, ClientStatus } from '../../../core/models/client.model';

type StatusFilter = 'ALL' | ClientStatus;
type SortKey = 'newest' | 'name' | 'reservationsDesc' | 'reservationsAsc';
@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-5 sm:p-8">

      <!-- HEADER -->
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-[11px] font-bold text-primary-600 uppercase tracking-[0.2em] mb-1">Gestion clientèle</p>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 mb-1">Clients</h1>
          <p class="text-sm text-ink-500">Suivez et gérez votre base clients</p>
        </div>
        <button (click)="refresh()" [disabled]="loading()"
                class="inline-flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 hover:border-primary-300 rounded-lg text-sm font-semibold text-ink-700 transition-colors disabled:opacity-50">
          <lucide-icon name="refresh-cw" [size]="14" [class.animate-spin]="loading()"></lucide-icon>
          Actualiser
        </button>
      </div>

      <!-- STAT CARDS (clickable filters) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

        <button (click)="setStatus('ALL')"
                [class.ring-2]="status() === 'ALL'"
                [class.ring-ink-900]="status() === 'ALL'"
                class="bg-white border border-gray-200 rounded-2xl p-4 hover:border-ink-300 transition-all text-left">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Total</span>
            <div class="w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center">
              <lucide-icon name="users" [size]="13" class="text-ink-700"></lucide-icon>
            </div>
          </div>
          <div class="text-2xl font-bold text-ink-900">{{ allClients().length }}</div>
          <div class="text-[10px] text-ink-500 mt-0.5">clients enregistrés</div>
        </button>

        <button (click)="setStatus('ACTIVE')"
                [class.ring-2]="status() === 'ACTIVE'"
                [class.ring-primary-500]="status() === 'ACTIVE'"
                class="bg-white border border-gray-200 rounded-2xl p-4 hover:border-primary-300 transition-all text-left">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Actifs</span>
            <div class="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <lucide-icon name="check-circle" [size]="13" class="text-primary-600"></lucide-icon>
            </div>
          </div>
          <div class="text-2xl font-bold text-primary-700">{{ countByStatus('ACTIVE') }}</div>
          <div class="text-[10px] text-ink-500 mt-0.5">comptes actifs</div>
        </button>

        <button (click)="setStatus('VIP')"
                [class.ring-2]="status() === 'VIP'"
                [class.ring-amber-500]="status() === 'VIP'"
                class="bg-white border border-gray-200 rounded-2xl p-4 hover:border-amber-300 transition-all text-left">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">VIP</span>
            <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <lucide-icon name="star" [size]="13" class="text-amber-600"></lucide-icon>
            </div>
          </div>
          <div class="text-2xl font-bold text-amber-700">{{ countByStatus('VIP') }}</div>
          <div class="text-[10px] text-ink-500 mt-0.5">clients premium</div>
        </button>

        <button (click)="setStatus('BLOCKED')"
                [class.ring-2]="status() === 'BLOCKED'"
                [class.ring-red-500]="status() === 'BLOCKED'"
                class="bg-white border border-gray-200 rounded-2xl p-4 hover:border-red-300 transition-all text-left">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Bloqués</span>
            <div class="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <lucide-icon name="ban" [size]="13" class="text-red-600"></lucide-icon>
            </div>
          </div>
          <div class="text-2xl font-bold text-red-700">{{ countByStatus('BLOCKED') }}</div>
          <div class="text-[10px] text-ink-500 mt-0.5">comptes bloqués</div>
        </button>
      </div>

      <!-- FILTERS BAR -->
      <div class="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
        <div class="flex flex-col lg:flex-row gap-3">
          <div class="relative flex-1">
            <lucide-icon name="search" [size]="16"
                         class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none z-10"></lucide-icon>
            <input type="text"
                   [ngModel]="searchQuery()"
                   (ngModelChange)="onSearchChange($event)"
                   placeholder="Rechercher: nom, email, téléphone..."
                   class="w-full pl-10 pr-3 py-2.5 bg-surface-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:bg-white" />
          </div>

          <div class="relative lg:w-56">
            <lucide-icon name="arrow-up-down" [size]="14"
                         class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none z-10"></lucide-icon>
            <select [ngModel]="sortBy()"
                    (ngModelChange)="sortBy.set($event)"
                    class="w-full pl-9 pr-8 py-2.5 bg-surface-50 border border-gray-200 rounded-lg text-sm font-semibold text-ink-900 cursor-pointer appearance-none focus:outline-none focus:border-primary-500">
              <option value="newest">Plus récents</option>
              <option value="name">Nom A → Z</option>
              <option value="reservationsDesc">Plus de réservations</option>
              <option value="reservationsAsc">Moins de réservations</option>
            </select>
            <lucide-icon name="chevron-down" [size]="14"
                         class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"></lucide-icon>
          </div>

        </div>
      </div>

      <!-- Results count -->
      <div class="mb-3 px-1">
        <span class="text-xs text-ink-500">
          {{ filteredClients().length }} client(s)
          @if (status() !== 'ALL') {
            · filtré par "{{ getStatusLabel(status()) }}"
          }
        </span>
      </div>

      <!-- CONTENT -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-12 h-12 bg-gray-100 rounded-xl"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                  <div class="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
              <div class="h-3 bg-gray-100 rounded w-full mb-2"></div>
              <div class="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
          }
        </div>
      } @else if (filteredClients().length === 0) {
        <div class="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-12 px-6 text-center">
          <div class="w-16 h-16 bg-surface-50 rounded-full mx-auto mb-4 flex items-center justify-center">
            <lucide-icon name="users" [size]="28" class="text-ink-400"></lucide-icon>
          </div>
          <h3 class="text-lg font-bold text-ink-900 mb-2">Aucun client</h3>
          <p class="text-sm text-ink-500">
            @if (searchQuery() || status() !== 'ALL') {
              Aucun résultat avec ces filtres
            } @else {
              Les clients enregistrés apparaîtront ici
            }
          </p>
        </div>
      } @else {
        <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-surface-50 border-b border-gray-200">
                <tr>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider">Client</th>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider hidden lg:table-cell">CIN / Passeport</th>
                  <th class="text-center px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider">Réservations</th>
                  <th class="text-center px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider">Statut</th>
                  <th class="text-right px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider hidden sm:table-cell">Inscrit</th>
                </tr>
              </thead>
              <tbody>
                @for (c of paginatedClients(); track c.id) {
                  <tr (click)="openDetails(c)"
                      class="border-b border-gray-100 hover:bg-surface-50 transition-colors cursor-pointer">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div [ngClass]="getAvatarClasses(c)"
                             class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                          {{ getInitials(c) }}
                        </div>
                        <div class="min-w-0">
                          <div class="font-bold text-ink-900 text-sm truncate">{{ c.firstName }} {{ c.lastName }}</div>
                          <div class="text-[10px] text-ink-500 truncate max-w-[200px]">{{ c.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 hidden md:table-cell">
                      <div class="text-xs text-ink-700">{{ c.phone || '—' }}</div>
                      <div class="text-[10px] text-ink-500">{{ c.city || '' }}</div>
                    </td>
                    <td class="px-4 py-3 hidden lg:table-cell">
                      <span class="font-mono text-[11px] text-ink-700">{{ c.cinPassport || '—' }}</span>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <div class="text-sm font-bold text-ink-900">{{ c.reservationCount ?? 0 }}</div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span [ngClass]="getStatusBadgeClasses(c.status)"
                            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                        @if (c.status === 'VIP') {
                          <lucide-icon name="star" [size]="10"></lucide-icon>
                        }
                        {{ getStatusLabel(c.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right text-xs text-ink-500 hidden sm:table-cell">
                      {{ formatDate(c.createdAt) }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages() > 1) {
            <div class="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <span class="text-xs text-ink-500">
                Page {{ currentPage() }} / {{ totalPages() }} · {{ filteredClients().length }} résultats
              </span>
              <div class="flex gap-1">
                <button (click)="prevPage()" [disabled]="currentPage() === 1"
                        class="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:border-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  Précédent
                </button>
                <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                        class="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:border-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  Suivant
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- DETAIL SLIDE-IN PANEL -->
      @if (detailTarget()) {
        <div class="fixed inset-0 z-50 flex justify-end" (click)="closeDetails()">
          <div class="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"></div>
          <div class="relative w-full max-w-xl bg-white shadow-2xl overflow-y-auto"
               (click)="$event.stopPropagation()">
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <p class="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em]">Profil client</p>
                <h2 class="text-lg font-bold text-ink-900">
                  {{ detailTarget()!.firstName }} {{ detailTarget()!.lastName }}
                </h2>
              </div>
              <button (click)="closeDetails()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <lucide-icon name="x" [size]="18"></lucide-icon>
              </button>
            </div>

            <div class="p-6 space-y-5">
              <!-- Avatar header -->
              <div class="flex items-center gap-4 p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100">
                <div [ngClass]="getAvatarClasses(detailTarget()!)"
                     class="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-white text-xl flex-shrink-0 shadow-lg">
                  {{ getInitials(detailTarget()!) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-ink-900">
                    {{ detailTarget()!.firstName }} {{ detailTarget()!.lastName }}
                  </div>
                  <div class="text-sm text-ink-500 truncate">{{ detailTarget()!.email }}</div>
                  <span [ngClass]="getStatusBadgeClasses(detailTarget()!.status)"
                        class="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    @if (detailTarget()!.status === 'VIP') {
                      <lucide-icon name="star" [size]="10"></lucide-icon>
                    }
                    {{ getStatusLabel(detailTarget()!.status) }}
                  </span>
                </div>
              </div>

              <!-- Status change -->
              <div>
                <p class="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2">Changer le statut</p>
                <div class="flex gap-2">
                  <button (click)="changeStatus(detailTarget()!, 'ACTIVE')"
                          [disabled]="statusChanging() === detailTarget()!.id || detailTarget()!.status === 'ACTIVE'"
                          class="flex-1 px-3 py-2 text-xs font-semibold border rounded-lg transition-colors disabled:cursor-not-allowed"
                          [class.bg-primary-500]="detailTarget()!.status === 'ACTIVE'"
                          [class.text-white]="detailTarget()!.status === 'ACTIVE'"
                          [class.border-primary-500]="detailTarget()!.status === 'ACTIVE'"
                          [class.bg-white]="detailTarget()!.status !== 'ACTIVE'"
                          [class.text-primary-700]="detailTarget()!.status !== 'ACTIVE'"
                          [class.border-primary-300]="detailTarget()!.status !== 'ACTIVE'">
                    Actif
                  </button>
                  <button (click)="changeStatus(detailTarget()!, 'VIP')"
                          [disabled]="statusChanging() === detailTarget()!.id || detailTarget()!.status === 'VIP'"
                          class="flex-1 px-3 py-2 text-xs font-semibold border rounded-lg transition-colors disabled:cursor-not-allowed"
                          [class.bg-amber-500]="detailTarget()!.status === 'VIP'"
                          [class.text-white]="detailTarget()!.status === 'VIP'"
                          [class.border-amber-500]="detailTarget()!.status === 'VIP'"
                          [class.bg-white]="detailTarget()!.status !== 'VIP'"
                          [class.text-amber-700]="detailTarget()!.status !== 'VIP'"
                          [class.border-amber-300]="detailTarget()!.status !== 'VIP'">
                    VIP
                  </button>
                  <button (click)="changeStatus(detailTarget()!, 'BLOCKED')"
                          [disabled]="statusChanging() === detailTarget()!.id || detailTarget()!.status === 'BLOCKED'"
                          class="flex-1 px-3 py-2 text-xs font-semibold border rounded-lg transition-colors disabled:cursor-not-allowed"
                          [class.bg-red-500]="detailTarget()!.status === 'BLOCKED'"
                          [class.text-white]="detailTarget()!.status === 'BLOCKED'"
                          [class.border-red-500]="detailTarget()!.status === 'BLOCKED'"
                          [class.bg-white]="detailTarget()!.status !== 'BLOCKED'"
                          [class.text-red-700]="detailTarget()!.status !== 'BLOCKED'"
                          [class.border-red-300]="detailTarget()!.status !== 'BLOCKED'">
                    Bloqué
                  </button>
                </div>
              </div>

              <!-- Contact info -->
              <div class="bg-surface-50 rounded-xl p-4">
                <p class="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-3">Informations</p>
                <div class="space-y-2.5">
                  <div class="flex items-center gap-2.5">
                    <lucide-icon name="mail" [size]="14" class="text-ink-400 flex-shrink-0"></lucide-icon>
                    <span class="text-sm text-ink-700 truncate">{{ detailTarget()!.email }}</span>
                  </div>
                  @if (detailTarget()!.phone) {
                    <div class="flex items-center gap-2.5">
                      <lucide-icon name="phone" [size]="14" class="text-ink-400 flex-shrink-0"></lucide-icon>
                      <span class="text-sm text-ink-700">{{ detailTarget()!.phone }}</span>
                    </div>
                  }
                  @if (detailTarget()!.cinPassport) {
                    <div class="flex items-center gap-2.5">
                      <lucide-icon name="file-text" [size]="14" class="text-ink-400 flex-shrink-0"></lucide-icon>
                      <span class="text-sm text-ink-700 font-mono">{{ detailTarget()!.cinPassport }}</span>
                    </div>
                  }
                  @if (detailTarget()!.city) {
                    <div class="flex items-center gap-2.5">
                      <lucide-icon name="map-pin" [size]="14" class="text-ink-400 flex-shrink-0"></lucide-icon>
                      <span class="text-sm text-ink-700">
                        {{ detailTarget()!.address ? detailTarget()!.address + ', ' : '' }}{{ detailTarget()!.city }}
                      </span>
                    </div>
                  }
                </div>
              </div>

              <!-- Reservation stats -->
              <div class="bg-primary-50 rounded-xl p-4">
                <div class="text-[10px] font-bold text-primary-700 uppercase tracking-wider">Réservations</div>
                <div class="text-3xl font-bold text-primary-700 mt-1">{{ detailTarget()!.reservationCount ?? 0 }}</div>
                <div class="text-[11px] text-primary-600 mt-1">au total</div>
              </div>

              <!-- Member since -->
              <div class="bg-surface-50 rounded-xl p-4">
                <p class="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2">Membre depuis</p>
                <div class="text-sm font-semibold text-ink-900">{{ formatLongDate(detailTarget()!.createdAt) }}</div>
              </div>
            </div>
          </div>
        </div>
      }

    </div>
  `,
})
export class ClientsAdminComponent implements OnInit {
  private clientService = inject(ClientService);

  allClients  = signal<Client[]>([]);
  loading     = signal(true);

  searchQuery = signal('');
  status      = signal<StatusFilter>('ALL');
  sortBy      = signal<SortKey>('newest');
  currentPage = signal(1);
  readonly pageSize = 9;

  detailTarget   = signal<Client | null>(null);
  statusChanging = signal<number | null>(null);

  filteredClients = computed(() => {
    let list = this.allClients();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(c =>
        c.firstName?.toLowerCase().includes(q) ||
        c.lastName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.cinPassport?.toLowerCase().includes(q)
      );
    }

    const s = this.status();
    if (s !== 'ALL') list = list.filter(c => c.status === s);

    const sort = this.sortBy();
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'name':             return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
        case 'reservationsDesc': return (b.reservationCount ?? 0) - (a.reservationCount ?? 0);
        case 'reservationsAsc':  return (a.reservationCount ?? 0) - (b.reservationCount ?? 0);
        default:                 return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      }
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredClients().length / this.pageSize))
  );

  paginatedClients = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredClients().slice(start, start + this.pageSize);
  });

  countByStatus(s: ClientStatus): number {
    return this.allClients().filter(c => c.status === s).length;
  }

  ngOnInit() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.clientService.getAll().subscribe({
      next: (data) => { this.allClients.set(data); this.loading.set(false); },
      error: ()     => this.loading.set(false),
    });
  }

  onSearchChange(q: string) { this.searchQuery.set(q); this.currentPage.set(1); }
  setStatus(s: StatusFilter) { this.status.set(s); this.currentPage.set(1); }

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

  openDetails(c: Client)  { this.detailTarget.set(c); }
  closeDetails()          { this.detailTarget.set(null); }

  changeStatus(c: Client, newStatus: ClientStatus) {
    if (c.status === newStatus) return;
    this.statusChanging.set(c.id);
    this.clientService.updateStatus(c.id, newStatus).subscribe({
      next: (updated) => {
        this.statusChanging.set(null);
        this.detailTarget.set(updated);
        this.refresh();
      },
      error: () => this.statusChanging.set(null),
    });
  }

  getInitials(c: Client): string {
    return ((c.firstName?.[0] ?? '') + (c.lastName?.[0] ?? '')).toUpperCase();
  }

  getAvatarClasses(c: Client): Record<string, boolean> {
    return {
      'bg-gradient-to-br from-primary-400 to-primary-600': c.status === 'ACTIVE',
      'bg-gradient-to-br from-amber-400 to-amber-600':     c.status === 'VIP',
      'bg-gradient-to-br from-red-400 to-red-600':         c.status === 'BLOCKED',
    };
  }

  getStatusLabel(s: string): string {
    const labels: Record<string, string> = {
      ALL: 'Tous', ACTIVE: 'Actif', VIP: 'VIP', BLOCKED: 'Bloqué',
    };
    return labels[s] ?? s;
  }

  getStatusBadgeClasses(status: string): Record<string, boolean> {
    return {
      'bg-primary-100 text-primary-800': status === 'ACTIVE',
      'bg-amber-100 text-amber-800':     status === 'VIP',
      'bg-red-100 text-red-800':         status === 'BLOCKED',
    };
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  formatLongDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }
}
