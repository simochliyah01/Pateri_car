import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ClientService } from '../../../core/services/client.service';
import { Client, ClientStatus } from '../../../core/models/client.model';

type SortKey = 'newest' | 'name' | 'reservationsDesc' | 'city';
type ViewMode = 'table' | 'grid';

@Component({
  selector: 'app-clients-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <!-- ═══ HEADER ═══ -->
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-[11px] font-bold text-primary-600 uppercase tracking-[0.2em] mb-1">
          Gestion clientèle
        </p>
        <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 mb-1">Clients</h1>
        <p class="text-sm text-ink-500">Gérez vos clients et leur statut</p>
      </div>
      <div class="flex gap-2">
        <button (click)="refresh()" [disabled]="loading()" title="Actualiser"
                class="inline-flex items-center gap-2 px-3 py-2.5 bg-white border
                       border-gray-200 hover:border-primary-300 rounded-lg text-sm
                       font-semibold text-ink-700 transition-colors disabled:opacity-50">
          <lucide-icon name="refresh-cw" [size]="14"
                       [class.animate-spin]="loading()"></lucide-icon>
        </button>
        <button (click)="openCreate()"
                class="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600
                       text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-lg
                       shadow-primary-500/30 transition-all hover:shadow-xl
                       hover:shadow-primary-500/40">
          <lucide-icon name="user-plus" [size]="16"></lucide-icon>
          Ajouter un client
        </button>
      </div>
    </div>

    <!-- ═══ STATS CARDS ═══ -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

      <button (click)="filterStatus.set('ALL')"
              [class.ring-2]="filterStatus() === 'ALL'"
              [class.ring-ink-900]="filterStatus() === 'ALL'"
              class="bg-white border border-gray-200 rounded-2xl p-4
                     hover:border-ink-300 transition-all text-left">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Total</span>
          <div class="w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center">
            <lucide-icon name="users" [size]="14" class="text-ink-700"></lucide-icon>
          </div>
        </div>
        <div class="text-2xl font-bold text-ink-900">{{ allClients().length }}</div>
        <div class="text-[10px] text-ink-500 mt-0.5">clients</div>
      </button>

      <button (click)="filterStatus.set('ACTIVE')"
              [class.ring-2]="filterStatus() === 'ACTIVE'"
              [class.ring-primary-500]="filterStatus() === 'ACTIVE'"
              class="bg-white border border-gray-200 rounded-2xl p-4
                     hover:border-primary-300 transition-all text-left">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Actifs</span>
          <div class="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
            <lucide-icon name="check-circle" [size]="14" class="text-primary-600"></lucide-icon>
          </div>
        </div>
        <div class="text-2xl font-bold text-primary-700">{{ countByStatus('ACTIVE') }}</div>
        <div class="text-[10px] text-ink-500 mt-0.5">comptes actifs</div>
      </button>

      <button (click)="filterStatus.set('VIP')"
              [class.ring-2]="filterStatus() === 'VIP'"
              [class.ring-amber-500]="filterStatus() === 'VIP'"
              class="bg-white border border-gray-200 rounded-2xl p-4
                     hover:border-amber-300 transition-all text-left">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">VIP</span>
          <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <lucide-icon name="star" [size]="14" class="text-amber-500"></lucide-icon>
          </div>
        </div>
        <div class="text-2xl font-bold text-amber-600">{{ countByStatus('VIP') }}</div>
        <div class="text-[10px] text-ink-500 mt-0.5">clients VIP</div>
      </button>

      <button (click)="filterStatus.set('BLOCKED')"
              [class.ring-2]="filterStatus() === 'BLOCKED'"
              [class.ring-red-500]="filterStatus() === 'BLOCKED'"
              class="bg-white border border-gray-200 rounded-2xl p-4
                     hover:border-red-300 transition-all text-left">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">Bloqués</span>
          <div class="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <lucide-icon name="x-circle" [size]="14" class="text-red-500"></lucide-icon>
          </div>
        </div>
        <div class="text-2xl font-bold text-red-600">{{ countByStatus('BLOCKED') }}</div>
        <div class="text-[10px] text-ink-500 mt-0.5">comptes bloqués</div>
      </button>
    </div>

    <!-- ═══ FILTERS BAR ═══ -->
    <div class="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
      <div class="flex flex-col lg:flex-row gap-3">

        <!-- Search -->
        <div class="relative flex-1">
          <lucide-icon name="search" [size]="16"
                       class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400
                              pointer-events-none z-10"></lucide-icon>
          <input type="text"
                 [ngModel]="searchQuery()"
                 (ngModelChange)="onSearchChange($event)"
                 placeholder="Rechercher: nom, CIN, email, téléphone..."
                 class="w-full pl-10 pr-3 py-2.5 bg-surface-50 border border-gray-200
                        rounded-lg text-sm focus:outline-none focus:border-primary-500
                        focus:bg-white" />
        </div>

        <!-- Sort -->
        <div class="relative lg:w-52">
          <lucide-icon name="arrow-up-down" [size]="14"
                       class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400
                              pointer-events-none z-10"></lucide-icon>
          <select [ngModel]="sortBy()"
                  (ngModelChange)="sortBy.set($event)"
                  class="w-full pl-9 pr-8 py-2.5 bg-surface-50 border border-gray-200
                         rounded-lg text-sm font-semibold text-ink-900 cursor-pointer
                         appearance-none focus:outline-none focus:border-primary-500">
            <option value="newest">Plus récents</option>
            <option value="name">A → Z (nom)</option>
            <option value="reservationsDesc">Réservations (desc)</option>
            <option value="city">Ville</option>
          </select>
          <lucide-icon name="chevron-down" [size]="14"
                       class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400
                              pointer-events-none"></lucide-icon>
        </div>

        <!-- Blacklisted filter -->
        <button (click)="toggleBlacklistFilter()"
                [class.bg-red-50]="showBlacklistedOnly()"
                [class.border-red-300]="showBlacklistedOnly()"
                [class.text-red-700]="showBlacklistedOnly()"
                [class.bg-surface-50]="!showBlacklistedOnly()"
                [class.text-ink-600]="!showBlacklistedOnly()"
                class="inline-flex items-center gap-2 px-3 py-2.5 border
                       border-gray-200 rounded-lg text-sm font-semibold transition-colors
                       whitespace-nowrap">
          <lucide-icon name="alert-triangle" [size]="14"></lucide-icon>
          Liste noire
        </button>

        <!-- View toggle -->
        <div class="flex border border-gray-200 rounded-lg overflow-hidden bg-surface-50">
          <button (click)="viewMode.set('table')"
                  [class.bg-white]="viewMode() === 'table'"
                  [class.text-primary-600]="viewMode() === 'table'"
                  [class.text-ink-500]="viewMode() !== 'table'"
                  class="px-3 py-2.5 font-semibold text-sm transition-colors"
                  title="Vue tableau">
            <lucide-icon name="list" [size]="16"></lucide-icon>
          </button>
          <button (click)="viewMode.set('grid')"
                  [class.bg-white]="viewMode() === 'grid'"
                  [class.text-primary-600]="viewMode() === 'grid'"
                  [class.text-ink-500]="viewMode() !== 'grid'"
                  class="px-3 py-2.5 font-semibold text-sm transition-colors"
                  title="Vue grille">
            <lucide-icon name="layout-grid" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- Active filter chips -->
      @if (hasActiveFilters()) {
        <div class="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <span class="text-xs font-medium text-ink-500">Filtres actifs:</span>
          @if (searchQuery()) {
            <button (click)="searchQuery.set('')" class="filter-chip">
              "{{ searchQuery() }}"
              <lucide-icon name="x" [size]="12"></lucide-icon>
            </button>
          }
          @if (filterStatus() !== 'ALL') {
            <button (click)="filterStatus.set('ALL')" class="filter-chip">
              {{ getStatusLabel(filterStatus()) }}
              <lucide-icon name="x" [size]="12"></lucide-icon>
            </button>
          }
          @if (showBlacklistedOnly()) {
            <button (click)="showBlacklistedOnly.set(false)" class="filter-chip">
              Liste noire
              <lucide-icon name="x" [size]="12"></lucide-icon>
            </button>
          }
          <button (click)="resetFilters()"
                  class="ml-auto text-xs font-semibold text-primary-600
                         hover:text-primary-700">
            Tout réinitialiser
          </button>
        </div>
      }
    </div>

    <!-- Results bar -->
    <div class="flex items-center justify-between mb-3 px-1">
      <span class="text-xs text-ink-500">
        {{ filteredClients().length }} client(s)
      </span>
      @if (selectedIds().size > 0) {
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-primary-600">
            {{ selectedIds().size }} sélectionné(s)
          </span>
          <button (click)="bulkChangeStatus('ACTIVE')"
                  class="px-2 py-1 text-[11px] font-semibold text-primary-700
                         bg-primary-50 hover:bg-primary-100 rounded transition-colors">
            → Actif
          </button>
          <button (click)="bulkChangeStatus('BLOCKED')"
                  class="px-2 py-1 text-[11px] font-semibold text-red-700
                         bg-red-50 hover:bg-red-100 rounded transition-colors">
            → Bloquer
          </button>
          <button (click)="bulkChangeStatus('VIP')"
                  class="px-2 py-1 text-[11px] font-semibold text-amber-700
                         bg-amber-50 hover:bg-amber-100 rounded transition-colors">
            → VIP
          </button>
          <button (click)="clearSelection()"
                  class="text-[11px] text-ink-500 hover:text-ink-900">
            Annuler
          </button>
        </div>
      }
    </div>

    <!-- ═══ EMPTY STATE ═══ -->
    @if (filteredClients().length === 0 && !loading()) {
      <div class="bg-white border-2 border-dashed border-gray-200 rounded-2xl
                  py-12 px-6 text-center">
        <div class="w-16 h-16 bg-surface-50 rounded-full mx-auto mb-4
                    flex items-center justify-center">
          <lucide-icon name="users" [size]="28" class="text-ink-400"></lucide-icon>
        </div>
        <h3 class="text-lg font-bold text-ink-900 mb-2">Aucun client</h3>
        @if (hasActiveFilters()) {
          <p class="text-sm text-ink-500 mb-4">Aucun résultat avec ces filtres</p>
          <button (click)="resetFilters()"
                  class="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600
                         text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
            Réinitialiser les filtres
          </button>
        } @else {
          <button (click)="openCreate()"
                  class="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600
                         text-white font-semibold px-5 py-2.5 rounded-lg transition-colors">
            <lucide-icon name="user-plus" [size]="16"></lucide-icon>
            Ajouter un client
          </button>
        }
      </div>
    } @else if (viewMode() === 'table') {
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-surface-50 border-b border-gray-200">
              <tr>
                <th class="px-3 py-3 w-10">
                  <input type="checkbox"
                         [checked]="isAllSelected()"
                         (change)="toggleAll()"
                         class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500" />
                </th>
                <th class="th-cell">
                  <button (click)="toggleSort('name')"
                          class="flex items-center gap-1 hover:text-ink-900">
                    Client
                    @if (sortBy() === 'name') {
                      <lucide-icon name="arrow-up" [size]="10"
                                   class="text-primary-600"></lucide-icon>
                    }
                  </button>
                </th>
                <th class="th-cell hidden sm:table-cell">CIN / Passeport</th>
                <th class="th-cell hidden md:table-cell">Contact</th>
                <th class="th-cell hidden lg:table-cell">Ville</th>
                <th class="th-cell text-center">Statut</th>
                <th class="th-cell text-center hidden md:table-cell">
                  <button (click)="toggleSort('reservationsDesc')"
                          class="flex items-center gap-1 hover:text-ink-900 mx-auto">
                    Rés.
                    @if (sortBy() === 'reservationsDesc') {
                      <lucide-icon name="arrow-down" [size]="10"
                                   class="text-primary-600"></lucide-icon>
                    } @else {
                      <lucide-icon name="arrow-up-down" [size]="10"
                                   class="opacity-40"></lucide-icon>
                    }
                  </button>
                </th>
                <th class="th-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (c of paginatedClients(); track c.id) {
                <tr [class.bg-primary-50]="selectedIds().has(c.id)"
                    [class.bg-red-50]="c.isBlacklisted && !selectedIds().has(c.id)"
                    class="border-b border-gray-100 hover:bg-surface-50 transition-colors">

                  <!-- Checkbox -->
                  <td class="px-3 py-3">
                    <input type="checkbox"
                           [checked]="selectedIds().has(c.id)"
                           (change)="toggleSelect(c.id)"
                           class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500" />
                  </td>

                  <!-- Client -->
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center
                                  flex-shrink-0 text-sm font-bold"
                           [class]="getAvatarClasses(c.status)">
                        {{ getInitials(c) }}
                      </div>
                      <div>
                        <div class="font-bold text-ink-900 text-sm flex items-center gap-1.5">
                          {{ c.firstName }} {{ c.lastName }}
                          @if (c.isBlacklisted) {
                            <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5
                                         bg-red-100 text-red-700 rounded text-[9px] font-bold">
                              <lucide-icon name="alert-triangle" [size]="8"></lucide-icon>
                              Liste noire
                            </span>
                          }
                        </div>
                        <div class="text-[11px] text-ink-500">
                          {{ c.email || '—' }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- CIN -->
                  <td class="px-4 py-3 hidden sm:table-cell">
                    <span class="font-mono text-xs font-semibold text-ink-900">
                      {{ c.cinPassport || '—' }}
                    </span>
                  </td>

                  <!-- Contact -->
                  <td class="px-4 py-3 hidden md:table-cell">
                    <div class="flex items-center gap-1.5 text-xs text-ink-700">
                      <lucide-icon name="phone" [size]="11" class="text-ink-400"></lucide-icon>
                      {{ c.phone || '—' }}
                    </div>
                  </td>

                  <!-- City -->
                  <td class="px-4 py-3 hidden lg:table-cell">
                    <span class="text-xs text-ink-700">{{ c.city || '—' }}</span>
                  </td>

                  <!-- Status -->
                  <td class="px-4 py-3 text-center">
                    <select [ngModel]="c.status"
                            (ngModelChange)="quickChangeStatus(c, $event)"
                            [disabled]="statusChanging() === c.id"
                            [ngClass]="getStatusSelectClasses(c.status)"
                            class="text-[11px] font-semibold border rounded-full
                                   px-2.5 py-1 cursor-pointer appearance-none
                                   text-center min-w-[90px] transition-colors">
                      <option value="ACTIVE">Actif</option>
                      <option value="VIP">VIP</option>
                      <option value="BLOCKED">Bloqué</option>
                    </select>
                  </td>

                  <!-- Reservations count -->
                  <td class="px-4 py-3 text-center hidden md:table-cell">
                    <span class="inline-flex items-center justify-center w-7 h-7
                                 bg-surface-50 border border-gray-200 rounded-full
                                 text-xs font-bold text-ink-900">
                      {{ c.reservationCount ?? 0 }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-1">
                      @if (c.isBlacklisted) {
                        <button (click)="openUnblacklist(c)" title="Retirer de la liste noire"
                                class="p-1.5 text-green-600 hover:bg-green-50 rounded
                                       transition-colors">
                          <lucide-icon name="shield-check" [size]="14"></lucide-icon>
                        </button>
                      } @else {
                        <button (click)="openBlacklist(c)" title="Mettre en liste noire"
                                class="p-1.5 text-red-400 hover:bg-red-50
                                       hover:text-red-600 rounded transition-colors">
                          <lucide-icon name="alert-triangle" [size]="14"></lucide-icon>
                        </button>
                      }
                      <button (click)="openEdit(c)" title="Modifier"
                              class="p-1.5 text-ink-600 hover:bg-primary-50
                                     hover:text-primary-600 rounded transition-colors">
                        <lucide-icon name="pencil" [size]="14"></lucide-icon>
                      </button>
                      <button (click)="openDelete(c)" title="Supprimer"
                              class="p-1.5 text-red-600 hover:bg-red-50 rounded
                                     transition-colors">
                        <lucide-icon name="trash-2" [size]="14"></lucide-icon>
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
              Page {{ currentPage() }} / {{ totalPages() }} ·
              {{ filteredClients().length }} résultats
            </span>
            <div class="flex gap-1">
              <button (click)="prevPage()" [disabled]="currentPage() === 1"
                      class="px-3 py-1.5 text-xs font-semibold border border-gray-200
                             rounded hover:border-primary-500 hover:text-primary-600
                             disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                ← Précédent
              </button>
              <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                      class="px-3 py-1.5 text-xs font-semibold border border-gray-200
                             rounded hover:border-primary-500 hover:text-primary-600
                             disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                Suivant →
              </button>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        @for (c of paginatedClients(); track c.id) {
          <div class="bg-white border rounded-2xl overflow-hidden transition-all
                      hover:shadow-lg group"
               [class.border-red-200]="c.isBlacklisted"
               [class.border-gray-200]="!c.isBlacklisted"
               [class.hover:border-red-300]="c.isBlacklisted"
               [class.hover:border-primary-300]="!c.isBlacklisted">

            <!-- Header band -->
            <div class="h-16 relative"
                 [class]="getCardHeaderClass(c.status)">
              <!-- Avatar -->
              <div class="absolute -bottom-5 left-4">
                <div class="w-10 h-10 rounded-full border-2 border-white flex items-center
                            justify-center text-sm font-bold shadow-sm"
                     [class]="getAvatarClasses(c.status)">
                  {{ getInitials(c) }}
                </div>
              </div>
              <!-- Status badge -->
              <div class="absolute top-3 right-3">
                <span [ngClass]="getStatusSelectClasses(c.status)"
                      class="inline-flex items-center px-2 py-0.5 rounded-full
                             text-[10px] font-bold border">
                  {{ getStatusLabel(c.status) }}
                </span>
              </div>
            </div>

            <!-- Body -->
            <div class="pt-7 px-4 pb-4">
              <div class="flex items-start justify-between mb-0.5">
                <h3 class="font-bold text-ink-900 text-sm">
                  {{ c.firstName }} {{ c.lastName }}
                </h3>
                @if (c.isBlacklisted) {
                  <lucide-icon name="alert-triangle" [size]="13"
                               class="text-red-500 flex-shrink-0 mt-0.5"></lucide-icon>
                }
              </div>
              @if (c.cinPassport) {
                <p class="font-mono text-[11px] text-ink-500 mb-2">{{ c.cinPassport }}</p>
              }

              <div class="space-y-1 mb-3">
                @if (c.phone) {
                  <div class="flex items-center gap-1.5 text-xs text-ink-600">
                    <lucide-icon name="phone" [size]="11" class="text-ink-400"></lucide-icon>
                    {{ c.phone }}
                  </div>
                }
                @if (c.email) {
                  <div class="flex items-center gap-1.5 text-xs text-ink-600 truncate">
                    <lucide-icon name="mail" [size]="11" class="text-ink-400 flex-shrink-0">
                    </lucide-icon>
                    <span class="truncate">{{ c.email }}</span>
                  </div>
                }
                @if (c.city) {
                  <div class="flex items-center gap-1.5 text-xs text-ink-600">
                    <lucide-icon name="map-pin" [size]="11" class="text-ink-400"></lucide-icon>
                    {{ c.city }}
                  </div>
                }
              </div>

              <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                <div class="flex items-center gap-1 text-xs text-ink-500">
                  <lucide-icon name="calendar" [size]="11"></lucide-icon>
                  {{ c.reservationCount ?? 0 }} rés.
                </div>
                <div class="flex gap-1">
                  @if (c.isBlacklisted) {
                    <button (click)="openUnblacklist(c)" title="Retirer de la liste noire"
                            class="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors">
                      <lucide-icon name="shield-check" [size]="14"></lucide-icon>
                    </button>
                  } @else {
                    <button (click)="openBlacklist(c)" title="Liste noire"
                            class="p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600
                                   rounded transition-colors">
                      <lucide-icon name="alert-triangle" [size]="14"></lucide-icon>
                    </button>
                  }
                  <button (click)="openEdit(c)" title="Modifier"
                          class="p-1.5 text-ink-600 hover:bg-primary-50
                                 hover:text-primary-600 rounded transition-colors">
                    <lucide-icon name="pencil" [size]="14"></lucide-icon>
                  </button>
                  <button (click)="openDelete(c)" title="Supprimer"
                          class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                    <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      @if (totalPages() > 1) {
        <div class="mt-6 flex items-center justify-between">
          <span class="text-xs text-ink-500">
            Page {{ currentPage() }} / {{ totalPages() }}
          </span>
          <div class="flex gap-1">
            <button (click)="prevPage()" [disabled]="currentPage() === 1"
                    class="px-3 py-1.5 text-xs font-semibold border border-gray-200
                           rounded hover:border-primary-500 disabled:opacity-30
                           disabled:cursor-not-allowed transition-colors">
              ← Précédent
            </button>
            <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                    class="px-3 py-1.5 text-xs font-semibold border border-gray-200
                           rounded hover:border-primary-500 disabled:opacity-30
                           disabled:cursor-not-allowed transition-colors">
              Suivant →
            </button>
          </div>
        </div>
      }
    }

    <!-- ═══ FORM MODAL (create / edit) ═══ -->
    @if (showForm()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center
                  bg-ink-900/50 backdrop-blur-sm p-4"
           (click)="closeForm()">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh]
                    overflow-y-auto"
             (click)="$event.stopPropagation()">

          <!-- Modal header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 class="text-xl font-bold text-ink-900">
                {{ editTarget() ? 'Modifier le client' : 'Nouveau client' }}
              </h2>
              @if (editTarget()) {
                <p class="text-sm text-ink-500 mt-0.5">
                  {{ editTarget()!.firstName }} {{ editTarget()!.lastName }}
                </p>
              }
            </div>
            <button (click)="closeForm()"
                    class="p-2 text-ink-400 hover:text-ink-900 hover:bg-gray-100
                           rounded-lg transition-colors">
              <lucide-icon name="x" [size]="20"></lucide-icon>
            </button>
          </div>

          <!-- Form body -->
          <form [formGroup]="clientForm" (ngSubmit)="saveClient()" class="p-6 space-y-5">

            <!-- Row 1: First + Last name -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Prénom *</label>
                <input formControlName="firstName" type="text" class="form-input"
                       placeholder="Prénom" />
                @if (f['firstName'].invalid && f['firstName'].touched) {
                  <p class="form-error">Prénom requis</p>
                }
              </div>
              <div>
                <label class="form-label">Nom *</label>
                <input formControlName="lastName" type="text" class="form-input"
                       placeholder="Nom" />
                @if (f['lastName'].invalid && f['lastName'].touched) {
                  <p class="form-error">Nom requis</p>
                }
              </div>
            </div>

            <!-- Row 2: CIN + Date of birth -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">CIN / Passeport</label>
                <input formControlName="cinPassport" type="text" class="form-input"
                       placeholder="AB123456" />
              </div>
              <div>
                <label class="form-label">Date de naissance</label>
                <input formControlName="dateOfBirth" type="date" class="form-input" />
              </div>
            </div>

            <!-- Row 3: Phone + Email -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Téléphone</label>
                <input formControlName="phone" type="tel" class="form-input"
                       placeholder="+212 6XX XXX XXX" />
              </div>
              <div>
                <label class="form-label">Email</label>
                <input formControlName="email" type="email" class="form-input"
                       placeholder="client@example.com" />
                @if (f['email'].invalid && f['email'].touched) {
                  <p class="form-error">Email invalide</p>
                }
              </div>
            </div>

            <!-- Row 4: City + Status -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="form-label">Ville</label>
                <input formControlName="city" type="text" class="form-input"
                       placeholder="Taza, Fès, Casablanca..." />
              </div>
              <div>
                <label class="form-label">Statut</label>
                <select formControlName="status" class="form-input">
                  <option value="ACTIVE">Actif</option>
                  <option value="VIP">VIP</option>
                  <option value="BLOCKED">Bloqué</option>
                </select>
              </div>
            </div>

            <!-- Address -->
            <div>
              <label class="form-label">Adresse</label>
              <textarea formControlName="address" rows="2" class="form-input resize-none"
                        placeholder="Adresse complète..."></textarea>
            </div>

            <!-- Server error -->
            @if (formError()) {
              <div class="p-3 bg-red-50 border border-red-200 rounded-lg
                          text-sm text-red-700">
                {{ formError() }}
              </div>
            }

            <!-- Footer -->
            <div class="flex gap-3 pt-2">
              <button type="button" (click)="closeForm()" [disabled]="saving()"
                      class="flex-1 px-4 py-2.5 border border-gray-300 text-ink-700
                             hover:bg-gray-50 font-semibold rounded-lg transition-colors
                             disabled:opacity-50">
                Annuler
              </button>
              <button type="submit" [disabled]="saving()"
                      class="flex-1 px-4 py-2.5 bg-primary-500 hover:bg-primary-600
                             disabled:bg-gray-300 text-white font-semibold rounded-lg
                             transition-colors flex items-center justify-center gap-2">
                @if (saving()) {
                  <lucide-icon name="loader-2" [size]="14" class="animate-spin"></lucide-icon>
                  Enregistrement...
                } @else {
                  {{ editTarget() ? 'Enregistrer' : 'Créer le client' }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- ═══ BLACKLIST MODAL ═══ -->
    @if (blacklistTarget()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center
                  bg-ink-900/50 backdrop-blur-sm p-4"
           (click)="closeBlacklist()">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
             (click)="$event.stopPropagation()">
          <div class="flex items-start gap-3 mb-5">
            <div class="w-10 h-10 bg-red-50 rounded-full flex items-center
                        justify-center flex-shrink-0">
              <lucide-icon name="alert-triangle" [size]="20" class="text-red-600"></lucide-icon>
            </div>
            <div>
              <h3 class="text-lg font-bold text-ink-900 mb-1">Mettre en liste noire</h3>
              <p class="text-sm text-ink-500">
                <strong>{{ blacklistTarget()!.firstName }} {{ blacklistTarget()!.lastName }}</strong>
                sera bloqué et signalé.
              </p>
            </div>
          </div>
          <div class="mb-5">
            <label class="form-label">Raison (optionnel)</label>
            <textarea [ngModel]="blacklistReason()"
                      (ngModelChange)="blacklistReason.set($event)"
                      rows="3" class="form-input resize-none"
                      placeholder="Impayés, dommages non déclarés..."></textarea>
          </div>
          @if (blacklistError()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg
                        text-sm text-red-700">
              {{ blacklistError() }}
            </div>
          }
          <div class="flex gap-3">
            <button (click)="closeBlacklist()" [disabled]="blacklisting()"
                    class="flex-1 px-4 py-2.5 border border-gray-300 text-ink-700
                           hover:bg-gray-50 font-semibold rounded-lg transition-colors
                           disabled:opacity-50">
              Annuler
            </button>
            <button (click)="confirmBlacklist()" [disabled]="blacklisting()"
                    class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600
                           disabled:bg-gray-300 text-white font-semibold rounded-lg
                           transition-colors flex items-center justify-center gap-2">
              @if (blacklisting()) {
                <lucide-icon name="loader-2" [size]="14" class="animate-spin"></lucide-icon>
              }
              Confirmer
            </button>
          </div>
        </div>
      </div>
    }

    <!-- ═══ DELETE MODAL ═══ -->
    @if (deleteTarget()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center
                  bg-ink-900/50 backdrop-blur-sm p-4"
           (click)="closeDelete()">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
             (click)="$event.stopPropagation()">
          <div class="flex items-start gap-3 mb-5">
            <div class="w-10 h-10 bg-red-50 rounded-full flex items-center
                        justify-center flex-shrink-0">
              <lucide-icon name="alert-triangle" [size]="20" class="text-red-600"></lucide-icon>
            </div>
            <div>
              <h3 class="text-lg font-bold text-ink-900 mb-1">Supprimer ce client ?</h3>
              <p class="text-sm text-ink-500">
                <strong>{{ deleteTarget()!.firstName }} {{ deleteTarget()!.lastName }}</strong>
                sera supprimé définitivement. Cette action est irréversible.
              </p>
            </div>
          </div>

          @if (deleteError()) {
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg
                        text-sm text-red-700">
              {{ deleteError() }}
            </div>
          }

          <div class="flex gap-3">
            <button (click)="closeDelete()" [disabled]="deleting()"
                    class="flex-1 px-4 py-2.5 border border-gray-300 text-ink-700
                           hover:bg-gray-50 font-semibold rounded-lg transition-colors
                           disabled:opacity-50">
              Annuler
            </button>
            <button (click)="confirmDelete()" [disabled]="deleting()"
                    class="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600
                           disabled:bg-gray-300 text-white font-semibold rounded-lg
                           transition-colors flex items-center justify-center gap-2">
              @if (deleting()) {
                <lucide-icon name="loader-2" [size]="14" class="animate-spin"></lucide-icon>
                Suppression...
              } @else {
                Confirmer
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .th-cell {
      padding: 12px 16px;
      text-align: left;
      font-size: 10px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.075em;
      white-space: nowrap;
    }
    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgb(240 253 250);
      color: rgb(15 118 110);
      font-size: 11px;
      font-weight: 600;
      border-radius: 100px;
      transition: all 0.15s;
    }
    .filter-chip:hover { background: rgb(204 251 241); }
    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 6px;
    }
    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      font-size: 14px;
      color: #111827;
      background: #F9FAFB;
      outline: none;
      transition: border-color 0.15s, background 0.15s;
    }
    .form-input:focus {
      border-color: #14B8A6;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgb(20 184 166 / 0.1);
    }
    .form-error {
      margin-top: 4px;
      font-size: 11px;
      color: #DC2626;
    }
  `],
})
export class ClientsAdminComponent implements OnInit {
  private clientService = inject(ClientService);
  private fb            = inject(FormBuilder);

  allClients        = signal<Client[]>([]);
  loading           = signal(true);
  searchQuery       = signal('');
  filterStatus      = signal<'ALL' | ClientStatus>('ALL');
  showBlacklistedOnly = signal(false);
  sortBy            = signal<SortKey>('newest');
  viewMode          = signal<ViewMode>('table');
  currentPage       = signal(1);
  pageSize          = 10;

  selectedIds       = signal<Set<number>>(new Set());
  statusChanging    = signal<number | null>(null);

  showForm          = signal(false);
  editTarget        = signal<Client | null>(null);
  saving            = signal(false);
  formError         = signal<string | null>(null);

  deleteTarget      = signal<Client | null>(null);
  deleting          = signal(false);
  deleteError       = signal<string | null>(null);

  blacklistTarget   = signal<Client | null>(null);
  blacklistReason   = signal('');
  blacklisting      = signal(false);
  blacklistError    = signal<string | null>(null);

  clientForm = this.fb.group({
    firstName:   ['', Validators.required],
    lastName:    ['', Validators.required],
    cinPassport: [''],
    dateOfBirth: [''],
    phone:       [''],
    email:       ['', Validators.email],
    address:     [''],
    city:        [''],
    status:      ['ACTIVE'],
  });

  get f() { return this.clientForm.controls; }

  filteredClients = computed(() => {
    let list = this.allClients();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(c =>
        (c.firstName + ' ' + c.lastName).toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.cinPassport?.toLowerCase().includes(q)
      );
    }

    const status = this.filterStatus();
    if (status !== 'ALL') list = list.filter(c => c.status === status);

    if (this.showBlacklistedOnly()) list = list.filter(c => c.isBlacklisted);

    const sort = this.sortBy();
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'name':             return (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
        case 'reservationsDesc': return (b.reservationCount ?? 0) - (a.reservationCount ?? 0);
        case 'city':             return (a.city ?? '').localeCompare(b.city ?? '');
        default:                 return b.id - a.id;
      }
    });
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredClients().length / this.pageSize) || 1
  );

  paginatedClients = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredClients().slice(start, start + this.pageSize);
  });

  hasActiveFilters = computed(() =>
    this.searchQuery().length > 0 ||
    this.filterStatus() !== 'ALL' ||
    this.showBlacklistedOnly()
  );

  isAllSelected = computed(() => {
    const visible = this.paginatedClients();
    return visible.length > 0 && visible.every(c => this.selectedIds().has(c.id));
  });

  countByStatus(status: ClientStatus): number {
    return this.allClients().filter(c => c.status === status).length;
  }

  ngOnInit() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.clientService.getAll().subscribe({
      next: (data) => { this.allClients.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onSearchChange(q: string) { this.searchQuery.set(q); this.currentPage.set(1); }

  toggleBlacklistFilter() {
    this.showBlacklistedOnly.update(v => !v);
    this.currentPage.set(1);
  }

  resetFilters() {
    this.searchQuery.set('');
    this.filterStatus.set('ALL');
    this.showBlacklistedOnly.set(false);
    this.sortBy.set('newest');
    this.currentPage.set(1);
  }

  toggleSort(key: SortKey) { this.sortBy.set(key); }

  prevPage() { if (this.currentPage() > 1)                this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

  toggleSelect(id: number) {
    const set = new Set(this.selectedIds());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.selectedIds.set(set);
  }

  toggleAll() {
    if (this.isAllSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.paginatedClients().map(c => c.id)));
    }
  }

  clearSelection() { this.selectedIds.set(new Set()); }

  bulkChangeStatus(newStatus: string) {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;
    let done = 0;
    ids.forEach(id => {
      this.clientService.updateStatus(id, newStatus as ClientStatus).subscribe({
        next:  () => { if (++done === ids.length) { this.clearSelection(); this.refresh(); } },
        error: () => { done++; },
      });
    });
  }

  openCreate() {
    this.editTarget.set(null);
    this.clientForm.reset({ status: 'ACTIVE' });
    this.formError.set(null);
    this.showForm.set(true);
  }

  openEdit(c: Client) {
    this.editTarget.set(c);
    this.clientForm.patchValue({
      firstName:   c.firstName,
      lastName:    c.lastName,
      cinPassport: c.cinPassport ?? '',
      dateOfBirth: c.dateOfBirth ?? '',
      phone:       c.phone ?? '',
      email:       c.email ?? '',
      address:     c.address ?? '',
      city:        c.city ?? '',
      status:      c.status,
    });
    this.formError.set(null);
    this.showForm.set(true);
  }

  closeForm() {
    if (this.saving()) return;
    this.showForm.set(false);
    this.editTarget.set(null);
  }

  saveClient() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.formError.set(null);

    const raw = this.clientForm.value;
    const payload: Partial<Client> = {
      firstName:   raw.firstName ?? '',
      lastName:    raw.lastName ?? '',
      cinPassport: raw.cinPassport || undefined,
      dateOfBirth: raw.dateOfBirth || undefined,
      phone:       raw.phone || undefined,
      email:       raw.email || undefined,
      address:     raw.address || undefined,
      city:        raw.city || undefined,
      status:      (raw.status as ClientStatus) ?? 'ACTIVE',
    };

    const target = this.editTarget();
    const req = target
      ? this.clientService.update(target.id, payload)
      : this.clientService.create(payload);

    req.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.refresh(); },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(err?.error?.message ?? 'Une erreur est survenue.');
      },
    });
  }

  quickChangeStatus(client: Client, newStatus: string) {
    if (client.status === newStatus) return;
    this.statusChanging.set(client.id);
    this.clientService.updateStatus(client.id, newStatus as ClientStatus).subscribe({
      next:  () => { this.statusChanging.set(null); this.refresh(); },
      error: () => this.statusChanging.set(null),
    });
  }

  openBlacklist(c: Client) {
    this.blacklistTarget.set(c);
    this.blacklistReason.set('');
    this.blacklistError.set(null);
  }

  closeBlacklist() {
    if (this.blacklisting()) return;
    this.blacklistTarget.set(null);
  }

  confirmBlacklist() {
    const target = this.blacklistTarget();
    if (!target) return;
    this.blacklisting.set(true);
    this.blacklistError.set(null);
    this.clientService.setBlacklist(target.id, true, this.blacklistReason() || undefined).subscribe({
      next: () => { this.blacklisting.set(false); this.blacklistTarget.set(null); this.refresh(); },
      error: (err) => {
        this.blacklisting.set(false);
        this.blacklistError.set(err?.error?.message ?? 'Une erreur est survenue.');
      },
    });
  }

  openUnblacklist(c: Client) {
    this.blacklisting.set(true);
    this.clientService.setBlacklist(c.id, false).subscribe({
      next:  () => { this.blacklisting.set(false); this.refresh(); },
      error: () => this.blacklisting.set(false),
    });
  }

  openDelete(c: Client)  { this.deleteTarget.set(c); this.deleteError.set(null); }
  closeDelete()          {
    if (this.deleting()) return;
    this.deleteTarget.set(null);
    this.deleteError.set(null);
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.deleteError.set(null);
    this.clientService.delete(target.id).subscribe({
      next: () => { this.deleting.set(false); this.deleteTarget.set(null); this.refresh(); },
      error: (err) => {
        this.deleting.set(false);
        this.deleteError.set(err?.error?.message ?? 'Suppression impossible.');
      },
    });
  }

  getInitials(c: Client): string {
    return ((c.firstName?.[0] ?? '') + (c.lastName?.[0] ?? '')).toUpperCase();
  }

  getAvatarClasses(status: string): string {
    if (status === 'VIP')     return 'bg-amber-100 text-amber-700';
    if (status === 'BLOCKED') return 'bg-red-100 text-red-700';
    return 'bg-primary-100 text-primary-700';
  }

  getCardHeaderClass(status: string): string {
    if (status === 'VIP')     return 'bg-gradient-to-br from-amber-100 to-amber-50';
    if (status === 'BLOCKED') return 'bg-gradient-to-br from-red-100 to-red-50';
    return 'bg-gradient-to-br from-primary-100 to-primary-50';
  }

  getStatusLabel(status: string): string {
    const m: Record<string, string> = {
      ACTIVE: 'Actif', VIP: 'VIP', BLOCKED: 'Bloqué', ALL: 'Tous',
    };
    return m[status] || status;
  }

  getStatusSelectClasses(status: string): Record<string, boolean> {
    return {
      'bg-primary-50':    status === 'ACTIVE',
      'border-primary-200': status === 'ACTIVE',
      'text-primary-800': status === 'ACTIVE',
      'bg-amber-50':      status === 'VIP',
      'border-amber-200': status === 'VIP',
      'text-amber-800':   status === 'VIP',
      'bg-red-50':        status === 'BLOCKED',
      'border-red-200':   status === 'BLOCKED',
      'text-red-800':     status === 'BLOCKED',
    };
  }
}
