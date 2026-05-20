import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle, VehicleStatus } from '../../../core/models/vehicle.model';
import { VehicleFormModalComponent } from './vehicle-form-modal.component';

type SortKey = 'newest' | 'priceAsc' | 'priceDesc' | 'name' | 'mileageAsc' | 'mileageDesc' | 'yearDesc';
@Component({
  selector: 'app-vehicles-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, VehicleFormModalComponent],
  template: `
    <div class="p-5 sm:p-8">
    <!-- ═══ HEADER ═══ -->
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-[11px] font-bold text-primary-600 uppercase tracking-[0.2em] mb-1">
          Gestion de flotte
        </p>
        <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 mb-1">Voitures</h1>
        <p class="text-sm text-ink-500">Gérez votre catalogue de véhicules</p>
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
          <lucide-icon name="plus" [size]="16"></lucide-icon>
          Ajouter une voiture
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
          <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">
            Total
          </span>
          <div class="w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center">
            <lucide-icon name="car" [size]="14" class="text-ink-700"></lucide-icon>
          </div>
        </div>
        <div class="text-2xl font-bold text-ink-900">{{ allVehicles().length }}</div>
        <div class="text-[10px] text-ink-500 mt-0.5">véhicules</div>
      </button>

      <button (click)="filterStatus.set('AVAILABLE')"
              [class.ring-2]="filterStatus() === 'AVAILABLE'"
              [class.ring-primary-500]="filterStatus() === 'AVAILABLE'"
              class="bg-white border border-gray-200 rounded-2xl p-4
                     hover:border-primary-300 transition-all text-left">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">
            Disponibles
          </span>
          <div class="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
            <span class="w-2 h-2 bg-primary-500 rounded-full"></span>
          </div>
        </div>
        <div class="text-2xl font-bold text-primary-700">
          {{ countByStatus('AVAILABLE') }}
        </div>
        <div class="text-[10px] text-ink-500 mt-0.5">prêtes à louer</div>
      </button>

      <button (click)="filterStatus.set('RENTED')"
              [class.ring-2]="filterStatus() === 'RENTED'"
              [class.ring-blue-500]="filterStatus() === 'RENTED'"
              class="bg-white border border-gray-200 rounded-2xl p-4
                     hover:border-blue-300 transition-all text-left">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">
            Louées
          </span>
          <div class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <lucide-icon name="key" [size]="13" class="text-blue-600"></lucide-icon>
          </div>
        </div>
        <div class="text-2xl font-bold text-blue-700">{{ countByStatus('RENTED') }}</div>
        <div class="text-[10px] text-ink-500 mt-0.5">en location</div>
      </button>

      <button (click)="filterStatus.set('MAINTENANCE')"
              [class.ring-2]="filterStatus() === 'MAINTENANCE'"
              [class.ring-amber-500]="filterStatus() === 'MAINTENANCE'"
              class="bg-white border border-gray-200 rounded-2xl p-4
                     hover:border-amber-300 transition-all text-left">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[10px] font-bold text-ink-500 uppercase tracking-wider">
            Maintenance
          </span>
          <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <lucide-icon name="wrench" [size]="13" class="text-amber-600"></lucide-icon>
          </div>
        </div>
        <div class="text-2xl font-bold text-amber-700">
          {{ countByStatus('MAINTENANCE') }}
        </div>
        <div class="text-[10px] text-ink-500 mt-0.5">indisponibles</div>
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
                 placeholder="Rechercher: marque, modèle, plaque..."
                 class="w-full pl-10 pr-3 py-2.5 bg-surface-50 border border-gray-200
                        rounded-lg text-sm focus:outline-none focus:border-primary-500
                        focus:bg-white" />
        </div>

        <!-- Sort -->
        <div class="relative lg:w-56">
          <lucide-icon name="arrow-up-down" [size]="14"
                       class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400
                              pointer-events-none z-10"></lucide-icon>
          <select [ngModel]="sortBy()"
                  (ngModelChange)="sortBy.set($event)"
                  class="w-full pl-9 pr-8 py-2.5 bg-surface-50 border border-gray-200
                         rounded-lg text-sm font-semibold text-ink-900 cursor-pointer
                         appearance-none focus:outline-none focus:border-primary-500">
            <option value="newest">Plus récents</option>
            <option value="priceAsc">Prix croissant</option>
            <option value="priceDesc">Prix décroissant</option>
            <option value="name">A → Z (nom)</option>
            <option value="yearDesc">Année récente</option>
            <option value="mileageAsc">Km croissant</option>
            <option value="mileageDesc">Km décroissant</option>
          </select>
          <lucide-icon name="chevron-down" [size]="14"
                       class="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400
                              pointer-events-none"></lucide-icon>
        </div>

        <!-- Category -->
        <select [ngModel]="filterCategory()"
                (ngModelChange)="onCategoryChange($event)"
                class="lg:w-44 px-3 py-2.5 bg-surface-50 border border-gray-200
                       rounded-lg text-sm font-semibold text-ink-900 cursor-pointer
                       focus:outline-none focus:border-primary-500">
          <option value="ALL">Toutes catégories</option>
          <option value="ECONOMIQUE">Économique</option>
          <option value="COMPACTE">Compacte</option>
          <option value="BERLINE">Berline</option>
          <option value="SUV">SUV</option>
          <option value="PREMIUM">Premium</option>
          <option value="UTILITAIRE">Utilitaire</option>
        </select>

      </div>

      <!-- Active filter chips -->
      @if (hasActiveFilters()) {
        <div class="flex flex-wrap items-center gap-2 mt-3 pt-3
                    border-t border-gray-100">
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
          @if (filterCategory() !== 'ALL') {
            <button (click)="filterCategory.set('ALL')" class="filter-chip">
              {{ getCategoryLabel(filterCategory()) }}
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

    <!-- Results + bulk actions bar -->
    <div class="flex items-center justify-between mb-3 px-1">
      <span class="text-xs text-ink-500">
        {{ filteredVehicles().length }} véhicule(s)
        @if (sortBy() === 'priceAsc') { · trié par prix croissant }
        @if (sortBy() === 'priceDesc') { · trié par prix décroissant }
        @if (filteredVehicles().length > 0) {
          · {{ getMinPrice() }}&nbsp;–&nbsp;{{ getMaxPrice() }} DH/jour
        }
      </span>
      @if (selectedIds().size > 0) {
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-primary-600">
            {{ selectedIds().size }} sélectionné(s)
          </span>
          <button (click)="bulkChangeStatus('AVAILABLE')"
                  class="px-2 py-1 text-[11px] font-semibold text-primary-700
                         bg-primary-50 hover:bg-primary-100 rounded transition-colors">
            → Disponible
          </button>
          <button (click)="bulkChangeStatus('MAINTENANCE')"
                  class="px-2 py-1 text-[11px] font-semibold text-amber-700
                         bg-amber-50 hover:bg-amber-100 rounded transition-colors">
            → Maintenance
          </button>
          <button (click)="clearSelection()"
                  class="text-[11px] text-ink-500 hover:text-ink-900">
            Annuler
          </button>
        </div>
      }
    </div>

    <!-- ═══ EMPTY STATE ═══ -->
    @if (filteredVehicles().length === 0 && !loading()) {
      <div class="bg-white border-2 border-dashed border-gray-200 rounded-2xl
                  py-12 px-6 text-center">
        <div class="w-16 h-16 bg-surface-50 rounded-full mx-auto mb-4
                    flex items-center justify-center">
          <lucide-icon name="car" [size]="28" class="text-ink-400"></lucide-icon>
        </div>
        <h3 class="text-lg font-bold text-ink-900 mb-2">Aucune voiture</h3>
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
            <lucide-icon name="plus" [size]="16"></lucide-icon>
            Ajouter une voiture
          </button>
        }
      </div>
    } @else {
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
                    Véhicule
                    @if (sortBy() === 'name') {
                      <lucide-icon name="arrow-up" [size]="10"
                                   class="text-primary-600"></lucide-icon>
                    }
                  </button>
                </th>
                <th class="th-cell">Plaque</th>
                <th class="th-cell hidden sm:table-cell">Catégorie</th>
                <th class="th-cell hidden md:table-cell">Specs</th>
                <th class="th-cell text-center">Statut</th>
                <th class="th-cell text-right">
                  <button (click)="togglePriceSort()"
                          class="flex items-center gap-1 hover:text-ink-900 ml-auto">
                    Prix
                    @if (sortBy() === 'priceAsc') {
                      <lucide-icon name="arrow-up" [size]="10"
                                   class="text-primary-600"></lucide-icon>
                    } @else if (sortBy() === 'priceDesc') {
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
              @for (v of paginatedVehicles(); track v.id) {
                <tr [class.bg-primary-50]="selectedIds().has(v.id)"
                    class="border-b border-gray-100 hover:bg-surface-50 transition-colors">

                  <!-- Checkbox -->
                  <td class="px-3 py-3">
                    <input type="checkbox"
                           [checked]="selectedIds().has(v.id)"
                           (change)="toggleSelect(v.id)"
                           class="w-4 h-4 rounded text-primary-500
                                  focus:ring-primary-500" />
                  </td>

                  <!-- Vehicle -->
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-14 h-14 bg-gradient-to-br from-primary-50
                                  to-surface-50 rounded-lg overflow-hidden flex
                                  items-center justify-center flex-shrink-0
                                  border border-gray-100">
                        @if (v.hasImage) {
                          <img [src]="getImageUrl(v.id)"
                               [alt]="v.brand + ' ' + v.model"
                               class="w-full h-full object-cover"
                               loading="lazy" />
                        } @else {
                          <lucide-icon name="car" [size]="20"
                                       class="text-primary-400"></lucide-icon>
                        }
                      </div>
                      <div>
                        <div class="font-bold text-ink-900 text-sm">
                          {{ v.brand }} {{ v.model }}
                        </div>
                        <div class="text-[11px] text-ink-500">
                          {{ v.year }} · {{ v.color || '—' }}
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Plate -->
                  <td class="px-4 py-3">
                    <span class="font-mono text-xs font-semibold text-ink-900 uppercase">
                      {{ v.licensePlate }}
                    </span>
                  </td>

                  <!-- Category -->
                  <td class="px-4 py-3 hidden sm:table-cell">
                    <span class="inline-flex items-center px-2 py-0.5 bg-ink-100
                                 text-ink-700 rounded text-[11px] font-semibold">
                      {{ getCategoryLabel(v.category) }}
                    </span>
                  </td>

                  <!-- Specs -->
                  <td class="px-4 py-3 hidden md:table-cell">
                    <div class="text-xs text-ink-700">
                      {{ getFuelLabel(v.fuelType) }} · {{ v.transmission === 'AUTO' ? 'Auto' : 'Man.' }}
                    </div>
                    <div class="text-[10px] text-ink-500 mt-0.5">
                      {{ v.seats || 5 }} pl · {{ formatMileage(v.currentMileage) }}
                    </div>
                  </td>

                  <!-- Status quick select -->
                  <td class="px-4 py-3 text-center">
                    <select [ngModel]="v.status"
                            (ngModelChange)="quickChangeStatus(v, $event)"
                            [disabled]="statusChanging() === v.id"
                            [ngClass]="getStatusSelectClasses(v.status)"
                            class="text-[11px] font-semibold border rounded-full
                                   px-2.5 py-1 cursor-pointer appearance-none
                                   text-center min-w-[110px] transition-colors">
                      <option value="AVAILABLE">● Disponible</option>
                      <option value="RENTED">→ Louée</option>
                      <option value="MAINTENANCE">⚠ Maintenance</option>
                      <option value="INACTIVE">✗ Inactive</option>
                    </select>
                  </td>

                  <!-- Price -->
                  <td class="px-4 py-3 text-right">
                    <div class="text-base font-bold text-ink-900">
                      {{ v.pricePerDay }}
                      <span class="text-[10px] font-semibold text-ink-500">DH</span>
                    </div>
                    <div class="text-[10px] text-ink-500">/jour</div>
                  </td>

                  <!-- Actions -->
                  <td class="px-4 py-3 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button (click)="openEdit(v)" title="Modifier"
                              class="p-1.5 text-ink-600 hover:bg-primary-50
                                     hover:text-primary-600 rounded transition-colors">
                        <lucide-icon name="pencil" [size]="14"></lucide-icon>
                      </button>
                      <button (click)="openDelete(v)" title="Supprimer"
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
          <div class="px-4 py-3 border-t border-gray-200 flex items-center
                      justify-between">
            <span class="text-xs text-ink-500">
              Page {{ currentPage() }} / {{ totalPages() }} ·
              {{ filteredVehicles().length }} résultats
            </span>
            <div class="flex gap-1">
              <button (click)="prevPage()" [disabled]="currentPage() === 1"
                      class="px-3 py-1.5 text-xs font-semibold border border-gray-200
                             rounded hover:border-primary-500 hover:text-primary-600
                             disabled:opacity-30 disabled:cursor-not-allowed
                             transition-colors">
                ← Précédent
              </button>
              <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                      class="px-3 py-1.5 text-xs font-semibold border border-gray-200
                             rounded hover:border-primary-500 hover:text-primary-600
                             disabled:opacity-30 disabled:cursor-not-allowed
                             transition-colors">
                Suivant →
              </button>
            </div>
          </div>
        }
      </div>
    }

    <!-- Form modal -->
    @if (showForm()) {
      <app-vehicle-form-modal
        [vehicle]="editTarget()"
        (saved)="onFormSaved($event)"
        (cancelled)="closeForm()">
      </app-vehicle-form-modal>
    }

    <!-- Delete modal -->
    @if (deleteTarget()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center
                  bg-ink-900/50 backdrop-blur-sm p-4"
           (click)="closeDelete()">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
             (click)="$event.stopPropagation()">
          <div class="flex items-start gap-3 mb-5">
            <div class="w-10 h-10 bg-red-50 rounded-full flex items-center
                        justify-center flex-shrink-0">
              <lucide-icon name="alert-triangle" [size]="20"
                           class="text-red-600"></lucide-icon>
            </div>
            <div>
              <h3 class="text-lg font-bold text-ink-900 mb-1">
                Supprimer ce véhicule ?
              </h3>
              <p class="text-sm text-ink-500">
                <strong>{{ deleteTarget()!.brand }} {{ deleteTarget()!.model }}</strong>
                (<span class="font-mono">{{ deleteTarget()!.licensePlate }}</span>)
                sera supprimée définitivement.
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
                <lucide-icon name="loader-2" [size]="14"
                             class="animate-spin"></lucide-icon>
                Suppression...
              } @else {
                Confirmer
              }
            </button>
          </div>
        </div>
      </div>
    }
    </div>
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
    .filter-chip:hover {
      background: rgb(204 251 241);
    }
  `],
})
export class VehiclesAdminComponent implements OnInit {
  private vehicleService = inject(VehicleService);

  allVehicles    = signal<Vehicle[]>([]);
  loading        = signal(true);
  searchQuery    = signal('');
  filterStatus   = signal<'ALL' | VehicleStatus>('ALL');
  filterCategory = signal<string>('ALL');
  sortBy         = signal<SortKey>('newest');
  currentPage    = signal(1);
  pageSize       = 10;

  selectedIds    = signal<Set<number>>(new Set());
  showForm       = signal(false);
  editTarget     = signal<Vehicle | null>(null);
  deleteTarget   = signal<Vehicle | null>(null);
  deleting       = signal(false);
  deleteError    = signal<string | null>(null);
  statusChanging = signal<number | null>(null);

  filteredVehicles = computed(() => {
    let list = this.allVehicles();

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(v =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.licensePlate.toLowerCase().includes(q)
      );
    }

    const status = this.filterStatus();
    if (status !== 'ALL') list = list.filter(v => v.status === status);

    const cat = this.filterCategory();
    if (cat !== 'ALL') list = list.filter(v => v.category === cat);

    const sort = this.sortBy();
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'priceAsc':    return a.pricePerDay - b.pricePerDay;
        case 'priceDesc':   return b.pricePerDay - a.pricePerDay;
        case 'name':        return (a.brand + a.model).localeCompare(b.brand + b.model);
        case 'yearDesc':    return (b.year || 0) - (a.year || 0);
        case 'mileageAsc':  return (a.currentMileage || 0) - (b.currentMileage || 0);
        case 'mileageDesc': return (b.currentMileage || 0) - (a.currentMileage || 0);
        default:            return b.id - a.id;
      }
    });
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredVehicles().length / this.pageSize) || 1
  );

  paginatedVehicles = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredVehicles().slice(start, start + this.pageSize);
  });

  hasActiveFilters = computed(() =>
    this.searchQuery().length > 0 ||
    this.filterStatus() !== 'ALL' ||
    this.filterCategory() !== 'ALL'
  );

  isAllSelected = computed(() => {
    const visible = this.paginatedVehicles();
    return visible.length > 0 && visible.every(v => this.selectedIds().has(v.id));
  });

  countByStatus(status: VehicleStatus): number {
    return this.allVehicles().filter(v => v.status === status).length;
  }

  getMinPrice(): number {
    const prices = this.filteredVehicles().map(v => v.pricePerDay);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }

  getMaxPrice(): number {
    const prices = this.filteredVehicles().map(v => v.pricePerDay);
    return prices.length > 0 ? Math.max(...prices) : 0;
  }

  ngOnInit() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.vehicleService.getAllVehicles().subscribe({
      next: (data) => { this.allVehicles.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onSearchChange(q: string)  { this.searchQuery.set(q);    this.currentPage.set(1); }
  onCategoryChange(c: string){ this.filterCategory.set(c); this.currentPage.set(1); }

  resetFilters() {
    this.searchQuery.set('');
    this.filterStatus.set('ALL');
    this.filterCategory.set('ALL');
    this.sortBy.set('newest');
    this.currentPage.set(1);
  }

  togglePriceSort() {
    this.sortBy.set(this.sortBy() === 'priceAsc' ? 'priceDesc' : 'priceAsc');
  }

  toggleSort(key: SortKey) { this.sortBy.set(key); }

  prevPage() { if (this.currentPage() > 1)               this.currentPage.update(p => p - 1); }
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
      this.selectedIds.set(new Set(this.paginatedVehicles().map(v => v.id)));
    }
  }

  clearSelection() { this.selectedIds.set(new Set()); }

  bulkChangeStatus(newStatus: string) {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;
    let done = 0;
    ids.forEach(id => {
      this.vehicleService.updateVehicleStatus(id, newStatus as VehicleStatus).subscribe({
        next: () => { if (++done === ids.length) { this.clearSelection(); this.refresh(); } },
        error: () => { done++; },
      });
    });
  }

  openCreate()              { this.editTarget.set(null); this.showForm.set(true); }
  openEdit(v: Vehicle)      { this.editTarget.set(v);    this.showForm.set(true); }
  closeForm()               { this.showForm.set(false);  this.editTarget.set(null); }
  onFormSaved(_v: Vehicle)  { this.closeForm(); this.refresh(); }

  openDelete(v: Vehicle)    { this.deleteTarget.set(v);   this.deleteError.set(null); }
  closeDelete()             {
    if (this.deleting()) return;
    this.deleteTarget.set(null);
    this.deleteError.set(null);
  }

  confirmDelete() {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.deleteError.set(null);
    this.vehicleService.deleteVehicle(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.refresh();
      },
      error: (err) => {
        this.deleting.set(false);
        const body = err?.error;
        this.deleteError.set(
          body?.message ||
          'Impossible de supprimer. Le véhicule a peut-être des réservations.'
        );
      },
    });
  }

  quickChangeStatus(vehicle: Vehicle, newStatus: string) {
    if (vehicle.status === newStatus) return;
    this.statusChanging.set(vehicle.id);
    this.vehicleService.updateVehicleStatus(vehicle.id, newStatus as VehicleStatus).subscribe({
      next: () => { this.statusChanging.set(null); this.refresh(); },
      error: () => this.statusChanging.set(null),
    });
  }

  getImageUrl(vehicleId: number): string {
    return this.vehicleService.getVehicleImageUrl(vehicleId);
  }

  getCategoryLabel(cat: string): string {
    const m: Record<string, string> = {
      ECONOMIQUE: 'Économique', COMPACTE: 'Compacte', BERLINE: 'Berline',
      SUV: 'SUV', PREMIUM: 'Premium', UTILITAIRE: 'Utilitaire',
    };
    return m[cat] || cat;
  }

  getFuelLabel(fuel: string): string {
    const m: Record<string, string> = {
      ESSENCE: 'Essence', DIESEL: 'Diesel', HYBRIDE: 'Hybride', ELECTRIQUE: 'Élec.',
    };
    return m[fuel] || fuel;
  }

  getStatusLabel(status: string): string {
    const m: Record<string, string> = {
      AVAILABLE: 'Disponible', RENTED: 'Louée',
      MAINTENANCE: 'Maintenance', INACTIVE: 'Inactive', ALL: 'Tous',
    };
    return m[status] || status;
  }

  getStatusSelectClasses(status: string): Record<string, boolean> {
    return {
      'bg-primary-50':    status === 'AVAILABLE',
      'border-primary-200': status === 'AVAILABLE',
      'text-primary-800': status === 'AVAILABLE',
      'bg-blue-50':       status === 'RENTED',
      'border-blue-200':  status === 'RENTED',
      'text-blue-800':    status === 'RENTED',
      'bg-amber-50':      status === 'MAINTENANCE',
      'border-amber-200': status === 'MAINTENANCE',
      'text-amber-800':   status === 'MAINTENANCE',
      'bg-gray-100':      status === 'INACTIVE',
      'border-gray-200':  status === 'INACTIVE',
      'text-gray-700':    status === 'INACTIVE',
    };
  }

  formatMileage(km: number | undefined): string {
    if (!km) return '— km';
    return km.toLocaleString('fr-FR') + ' km';
  }
}
