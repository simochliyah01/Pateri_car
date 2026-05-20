import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ReservationService, ReservationDto } from '../../../core/services/reservation.service';

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTE';
type SortKey = 'newest' | 'oldest' | 'priceDesc' | 'priceAsc' | 'startDate';
@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="p-5 sm:p-8">

      <!-- HEADER -->
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-[11px] font-bold text-primary-600 uppercase tracking-[0.2em] mb-1">Gestion</p>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 mb-1">Réservations</h1>
          <p class="text-sm text-ink-500">
            Suivi des locations · {{ allReservations().length }} au total
          </p>
        </div>
        <button (click)="refresh()" [disabled]="loading()"
                class="inline-flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 hover:border-primary-300 rounded-lg text-sm font-semibold text-ink-700 transition-colors disabled:opacity-50">
          <lucide-icon name="refresh-cw" [size]="14" [class.animate-spin]="loading()"></lucide-icon>
          Actualiser
        </button>
      </div>

      <!-- STAT CARDS (clickable filters) -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">

        <button (click)="setStatus('ALL')"
                [class.ring-2]="status() === 'ALL'"
                [class.ring-ink-900]="status() === 'ALL'"
                class="bg-white border border-gray-200 rounded-2xl p-4 hover:border-ink-300 transition-all text-left">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Total</span>
            <div class="w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center">
              <lucide-icon name="calendar" [size]="13" class="text-ink-700"></lucide-icon>
            </div>
          </div>
          <div class="text-2xl font-bold text-ink-900">{{ allReservations().length }}</div>
          <div class="text-[10px] text-ink-500 mt-0.5">{{ formatNumber(totalRevenue()) }} DH</div>
        </button>

        <button (click)="setStatus('PENDING')"
                [class.ring-2]="status() === 'PENDING'"
                [class.ring-amber-500]="status() === 'PENDING'"
                class="bg-white border border-gray-200 rounded-2xl p-4 hover:border-amber-300 transition-all text-left">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">En attente</span>
            <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              @if (countByStatus('PENDING') > 0) {
                <span class="relative flex">
                  <span class="absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75 animate-ping"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              } @else {
                <lucide-icon name="clock" [size]="13" class="text-amber-600"></lucide-icon>
              }
            </div>
          </div>
          <div class="text-2xl font-bold text-amber-700">{{ countByStatus('PENDING') }}</div>
          <div class="text-[10px] text-ink-500 mt-0.5">à traiter</div>
        </button>

        <button (click)="setStatus('CONFIRMED')"
                [class.ring-2]="status() === 'CONFIRMED'"
                [class.ring-primary-500]="status() === 'CONFIRMED'"
                class="bg-white border border-gray-200 rounded-2xl p-4 hover:border-primary-300 transition-all text-left">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Confirmées</span>
            <div class="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <lucide-icon name="check-circle" [size]="13" class="text-primary-600"></lucide-icon>
            </div>
          </div>
          <div class="text-2xl font-bold text-primary-700">{{ countByStatus('CONFIRMED') }}</div>
          <div class="text-[10px] text-ink-500 mt-0.5">validées</div>
        </button>

        <button (click)="setStatus('IN_PROGRESS')"
                [class.ring-2]="status() === 'IN_PROGRESS'"
                [class.ring-blue-500]="status() === 'IN_PROGRESS'"
                class="bg-white border border-gray-200 rounded-2xl p-4 hover:border-blue-300 transition-all text-left">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">En cours</span>
            <div class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <lucide-icon name="key" [size]="13" class="text-blue-600"></lucide-icon>
            </div>
          </div>
          <div class="text-2xl font-bold text-blue-700">{{ countByStatus('IN_PROGRESS') }}</div>
          <div class="text-[10px] text-ink-500 mt-0.5">actives</div>
        </button>

        <button (click)="setStatus('CANCELLED')"
                [class.ring-2]="status() === 'CANCELLED'"
                [class.ring-red-500]="status() === 'CANCELLED'"
                class="bg-white border border-gray-200 rounded-2xl p-4 hover:border-red-300 transition-all text-left">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Annulées</span>
            <div class="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <lucide-icon name="x-circle" [size]="13" class="text-red-600"></lucide-icon>
            </div>
          </div>
          <div class="text-2xl font-bold text-red-700">{{ countByStatus('CANCELLED') }}</div>
          <div class="text-[10px] text-ink-500 mt-0.5">annulées</div>
        </button>
      </div>

      <!-- FILTERS + SORT + VIEW TOGGLE -->
      <div class="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
        <div class="flex flex-col lg:flex-row gap-3">
          <div class="relative flex-1">
            <lucide-icon name="search" [size]="16"
                         class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none z-10"></lucide-icon>
            <input type="text"
                   [ngModel]="searchQuery()"
                   (ngModelChange)="onSearchChange($event)"
                   placeholder="Rechercher: N° réservation, client, véhicule..."
                   class="w-full pl-10 pr-3 py-2.5 bg-surface-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:bg-white" />
          </div>

          <div class="relative lg:w-52">
            <lucide-icon name="arrow-up-down" [size]="14"
                         class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none z-10"></lucide-icon>
            <select [ngModel]="sortBy()"
                    (ngModelChange)="sortBy.set($event)"
                    class="w-full pl-9 pr-8 py-2.5 bg-surface-50 border border-gray-200 rounded-lg text-sm font-semibold text-ink-900 cursor-pointer appearance-none focus:outline-none focus:border-primary-500">
              <option value="newest">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
              <option value="priceDesc">Prix décroissant</option>
              <option value="priceAsc">Prix croissant</option>
              <option value="startDate">Date de départ</option>
            </select>
            <lucide-icon name="chevron-down" [size]="14"
                         class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"></lucide-icon>
          </div>

        </div>
      </div>

      <!-- Results count -->
      <div class="mb-3 px-1">
        <span class="text-xs text-ink-500">
          {{ filteredReservations().length }} réservation(s)
          @if (status() !== 'ALL') {
            · filtré par "{{ getStatusLabel(status()) }}"
          }
        </span>
      </div>

      <!-- CONTENT -->
      @if (loading()) {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
              <div class="h-4 bg-gray-100 rounded w-1/2 mb-3"></div>
              <div class="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
              <div class="h-3 bg-gray-100 rounded w-full mb-1"></div>
              <div class="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
          }
        </div>
      } @else if (filteredReservations().length === 0) {
        <div class="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-12 px-6 text-center">
          <div class="w-16 h-16 bg-surface-50 rounded-full mx-auto mb-4 flex items-center justify-center">
            <lucide-icon name="calendar-x" [size]="28" class="text-ink-400"></lucide-icon>
          </div>
          <h3 class="text-lg font-bold text-ink-900 mb-2">Aucune réservation</h3>
          @if (searchQuery() || status() !== 'ALL') {
            <p class="text-sm text-ink-500 mb-4">Aucun résultat avec ces filtres</p>
            <button (click)="resetFilters()"
                    class="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
              Réinitialiser les filtres
            </button>
          } @else {
            <p class="text-sm text-ink-500">Les réservations apparaîtront ici</p>
          }
        </div>
      } @else {
        <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-surface-50 border-b border-gray-200">
                <tr>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider">N° / Date</th>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider">Client</th>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider hidden md:table-cell">Véhicule</th>
                  <th class="text-left px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider hidden lg:table-cell">Période</th>
                  <th class="text-right px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider">Total</th>
                  <th class="text-center px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider">Statut</th>
                  <th class="text-right px-4 py-3 text-[10px] font-bold text-ink-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (r of paginatedReservations(); track r.id) {
                  <tr class="border-b border-gray-100 hover:bg-surface-50 transition-colors cursor-pointer"
                      (click)="openDetails(r)">
                    <td class="px-4 py-3">
                      <div class="font-mono text-xs font-bold text-ink-900">{{ r.reservationNumber }}</div>
                      <div class="text-[10px] text-ink-500">{{ formatDate(r.createdAt) }}</div>
                    </td>
                    <td class="px-4 py-3">
                      <div class="font-semibold text-ink-900 text-sm">{{ r.clientName }}</div>
                      <div class="text-[10px] text-ink-500 truncate max-w-[180px]">{{ r.clientEmail }}</div>
                    </td>
                    <td class="px-4 py-3 hidden md:table-cell">
                      <div class="font-semibold text-ink-900 text-sm">{{ r.vehicleBrand }} {{ r.vehicleModel }}</div>
                      <div class="text-[10px] text-ink-500 font-mono">{{ r.vehicleLicensePlate }}</div>
                    </td>
                    <td class="px-4 py-3 hidden lg:table-cell">
                      <div class="text-xs text-ink-700">{{ formatDate(r.startDate) }} → {{ formatDate(r.endDate) }}</div>
                      <div class="text-[10px] text-ink-500">{{ r.durationDays }}j · {{ getPickupLabel(r.pickupLocation) }}</div>
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="font-bold text-ink-900">{{ r.totalPrice }} DH</div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span [ngClass]="getStatusBadgeClasses(r.status)"
                            class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                        {{ getStatusLabel(r.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-right" (click)="$event.stopPropagation()">
                      <div class="flex items-center justify-end gap-1">
                        @if (r.status === 'PENDING') {
                          <button (click)="doConfirm(r)" [disabled]="actioning() === r.id"
                                  title="Confirmer"
                                  class="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors disabled:opacity-50">
                            <lucide-icon name="check" [size]="14"></lucide-icon>
                          </button>
                        }
                        @if (r.status === 'PENDING' || r.status === 'CONFIRMED') {
                          <button (click)="openCancel(r)" title="Annuler"
                                  class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                            <lucide-icon name="x" [size]="14"></lucide-icon>
                          </button>
                        }
                        <button (click)="openDetails(r)" title="Détails"
                                class="p-1.5 text-ink-600 hover:bg-gray-100 rounded transition-colors">
                          <lucide-icon name="eye" [size]="14"></lucide-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages() > 1) {
            <div class="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <span class="text-xs text-ink-500">
                Page {{ currentPage() }} / {{ totalPages() }} · {{ filteredReservations().length }} résultats
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
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <p class="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em]">Détails</p>
                <h2 class="font-mono text-lg font-bold text-ink-900">{{ detailTarget()!.reservationNumber }}</h2>
              </div>
              <button (click)="closeDetails()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <lucide-icon name="x" [size]="18"></lucide-icon>
              </button>
            </div>

            <div class="p-6 space-y-5">
              <div>
                <p class="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2">Statut</p>
                <span [ngClass]="getStatusBadgeClasses(detailTarget()!.status)"
                      class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  {{ getStatusLabel(detailTarget()!.status) }}
                </span>
              </div>

              <div class="bg-surface-50 rounded-xl p-4">
                <p class="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2">Client</p>
                <div class="text-base font-bold text-ink-900">{{ detailTarget()!.clientName }}</div>
                @if (detailTarget()!.clientEmail) {
                  <div class="text-sm text-ink-600">{{ detailTarget()!.clientEmail }}</div>
                }
              </div>

              <div class="bg-surface-50 rounded-xl p-4">
                <p class="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2">Véhicule</p>
                <div class="text-base font-bold text-ink-900">
                  {{ detailTarget()!.vehicleBrand }} {{ detailTarget()!.vehicleModel }}
                </div>
                <div class="font-mono text-sm text-ink-600">{{ detailTarget()!.vehicleLicensePlate }}</div>
              </div>

              <div class="bg-surface-50 rounded-xl p-4">
                <p class="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2">Période</p>
                <div class="text-sm font-semibold text-ink-900">
                  {{ formatDate(detailTarget()!.startDate) }} → {{ formatDate(detailTarget()!.endDate) }}
                </div>
                <div class="text-xs text-ink-500 mt-1">
                  {{ detailTarget()!.durationDays }} jour(s) · {{ getPickupLabel(detailTarget()!.pickupLocation) }}
                </div>
              </div>

              <div class="bg-surface-50 rounded-xl p-4">
                <p class="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-3">Détails financiers</p>
                <div class="space-y-1.5 text-sm">
                  <div class="flex justify-between">
                    <span class="text-ink-600">Prix de base</span>
                    <span class="font-semibold text-ink-900">{{ detailTarget()!.basePrice }} DH</span>
                  </div>
                  @for (opt of detailTarget()!.options; track opt.id) {
                    <div class="flex justify-between">
                      <span class="text-ink-600">{{ opt.optionType }}</span>
                      <span class="font-semibold text-ink-900">{{ opt.totalPrice }} DH</span>
                    </div>
                  }
                  <div class="flex justify-between pt-2 border-t border-gray-200">
                    <span class="font-bold text-ink-900">Total</span>
                    <span class="font-bold text-lg text-primary-700">{{ detailTarget()!.totalPrice }} DH</span>
                  </div>
                </div>
              </div>

              @if (detailTarget()!.internalNotes) {
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p class="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">Notes internes</p>
                  <p class="text-sm text-amber-900">{{ detailTarget()!.internalNotes }}</p>
                </div>
              }

              <div class="flex gap-2 pt-4 border-t border-gray-200">
                @if (detailTarget()!.status === 'PENDING') {
                  <button (click)="doConfirm(detailTarget()!)" [disabled]="actioning() === detailTarget()!.id"
                          class="flex-1 inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors">
                    <lucide-icon name="check" [size]="14"></lucide-icon>
                    Confirmer
                  </button>
                }
                @if (detailTarget()!.status === 'PENDING' || detailTarget()!.status === 'CONFIRMED') {
                  <button (click)="openCancel(detailTarget()!)"
                          class="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-red-300 hover:bg-red-50 text-red-600 font-semibold px-4 py-2.5 rounded-lg transition-colors">
                    <lucide-icon name="x" [size]="14"></lucide-icon>
                    Annuler
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- CANCEL MODAL -->
      @if (cancelTarget()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/50 backdrop-blur-sm p-4"
             (click)="closeCancel()">
          <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
               (click)="$event.stopPropagation()">
            <div class="flex items-start gap-3 mb-5">
              <div class="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                <lucide-icon name="alert-triangle" [size]="20" class="text-red-600"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-bold text-ink-900 mb-1">Annuler la réservation ?</h3>
                <p class="text-sm text-ink-500">
                  <strong>{{ cancelTarget()!.reservationNumber }}</strong> sera annulée.
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-xs font-semibold text-ink-700 mb-2">
                Motif d'annulation (optionnel)
              </label>
              <textarea [(ngModel)]="cancelReason" rows="3"
                        placeholder="Indiquez la raison..."
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 resize-none"></textarea>
            </div>

            <div class="flex gap-3">
              <button (click)="closeCancel()" [disabled]="cancelling()"
                      class="flex-1 px-4 py-2.5 border border-gray-300 text-ink-700 hover:bg-gray-50 font-semibold rounded-lg transition-colors disabled:opacity-50">
                Retour
              </button>
              <button (click)="confirmCancel()" [disabled]="cancelling()"
                      class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                @if (cancelling()) {
                  <lucide-icon name="loader-2" [size]="14" class="animate-spin"></lucide-icon>
                  Annulation...
                } @else {
                  Confirmer l'annulation
                }
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
})
export class ReservationsAdminComponent implements OnInit {
  private reservationService = inject(ReservationService);

  allReservations = signal<ReservationDto[]>([]);
  loading        = signal(true);

  searchQuery = signal('');
  status      = signal<StatusFilter>('ALL');
  sortBy      = signal<SortKey>('newest');
  currentPage = signal(1);
  readonly pageSize = 8;

  detailTarget = signal<ReservationDto | null>(null);
  cancelTarget = signal<ReservationDto | null>(null);
  cancelReason = '';
  cancelling   = signal(false);
  actioning    = signal<number | null>(null);

  filteredReservations = computed(() => {
    let list = this.allReservations();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(r =>
        r.reservationNumber?.toLowerCase().includes(q) ||
        r.clientName?.toLowerCase().includes(q) ||
        r.clientEmail?.toLowerCase().includes(q) ||
        r.vehicleBrand?.toLowerCase().includes(q) ||
        r.vehicleModel?.toLowerCase().includes(q) ||
        r.vehicleLicensePlate?.toLowerCase().includes(q)
      );
    }

    const s = this.status();
    if (s !== 'ALL') list = list.filter(r => r.status === s);

    const sort = this.sortBy();
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest':    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'priceAsc':  return a.totalPrice - b.totalPrice;
        case 'priceDesc': return b.totalPrice - a.totalPrice;
        case 'startDate': return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        default:          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredReservations().length / this.pageSize))
  );

  paginatedReservations = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredReservations().slice(start, start + this.pageSize);
  });

  totalRevenue = computed(() =>
    this.allReservations()
      .filter(r => ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(r.status))
      .reduce((s, r) => s + (r.totalPrice || 0), 0)
  );

  countByStatus(s: string): number {
    return this.allReservations().filter(r => r.status === s).length;
  }

  formatNumber(n: number): string { return n.toLocaleString('fr-FR'); }

  ngOnInit() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.reservationService.getAllReservations(undefined, 0, 200).subscribe({
      next: (page) => { this.allReservations.set(page.content); this.loading.set(false); },
      error: ()     => this.loading.set(false),
    });
  }

  onSearchChange(q: string) { this.searchQuery.set(q); this.currentPage.set(1); }
  setStatus(s: StatusFilter) { this.status.set(s); this.currentPage.set(1); }

  resetFilters() {
    this.searchQuery.set('');
    this.status.set('ALL');
    this.sortBy.set('newest');
    this.currentPage.set(1);
  }

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

  openDetails(r: ReservationDto)  { this.detailTarget.set(r); }
  closeDetails()                  { this.detailTarget.set(null); }

  openCancel(r: ReservationDto) { this.cancelTarget.set(r); this.cancelReason = ''; }
  closeCancel()                 { if (!this.cancelling()) this.cancelTarget.set(null); }

  confirmCancel() {
    const target = this.cancelTarget();
    if (!target) return;
    this.cancelling.set(true);
    this.reservationService.cancel(target.id, this.cancelReason).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.cancelTarget.set(null);
        this.detailTarget.set(null);
        this.refresh();
      },
      error: () => this.cancelling.set(false),
    });
  }

  doConfirm(r: ReservationDto) {
    this.actioning.set(r.id);
    this.reservationService.confirm(r.id).subscribe({
      next: () => {
        this.actioning.set(null);
        this.detailTarget.set(null);
        this.refresh();
      },
      error: () => this.actioning.set(null),
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  getStatusLabel(s: string): string {
    const labels: Record<string, string> = {
      ALL: 'Tous', PENDING: 'En attente', CONFIRMED: 'Confirmée',
      IN_PROGRESS: 'En cours', COMPLETED: 'Terminée',
      CANCELLED: 'Annulée', DISPUTE: 'Litige',
    };
    return labels[s] ?? s;
  }

  getPickupLabel(p: string): string {
    const labels: Record<string, string> = {
      AGENCE: 'Agence Taza', GARE: 'Gare ferroviaire', DOMICILE: 'Livraison domicile',
    };
    return labels[p] ?? p;
  }

  getStatusBadgeClasses(status: string): Record<string, boolean> {
    return {
      'bg-amber-100 text-amber-800':     status === 'PENDING',
      'bg-primary-100 text-primary-800': status === 'CONFIRMED',
      'bg-blue-100 text-blue-800':       status === 'IN_PROGRESS',
      'bg-gray-100 text-gray-700':       status === 'COMPLETED',
      'bg-red-100 text-red-800':         status === 'CANCELLED',
      'bg-purple-100 text-purple-800':   status === 'DISPUTE',
    };
  }
}
