import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { VehicleService } from '../../core/services/vehicle.service';
import { Vehicle } from '../../core/models/vehicle.model';
import { CarCardComponent } from '../../shared/components/car-card/car-card.component';

interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, CarCardComponent],
  template: `
    <!-- ═══ COMPACT PREMIUM HERO ═══ -->
    <section class="relative bg-mesh-premium border-b border-gray-200
                    overflow-hidden bg-aurora pt-24 pb-8 sm:pb-10">

      <!-- Layered patterns (subtle) -->
      <div class="absolute inset-0 bg-noise pointer-events-none"></div>
      <div class="absolute inset-0 bg-dot-grid-premium pointer-events-none
                  opacity-50"></div>

      <!-- Decorative orbs (smaller) -->
      <div class="absolute top-0 -right-20 w-64 h-64 rounded-full
                  bg-primary-200/30 blur-3xl pointer-events-none
                  animate-spotlight"></div>
      <div class="absolute -bottom-10 -left-20 w-72 h-72 rounded-full
                  bg-primary-100/40 blur-3xl pointer-events-none">
      </div>

      <div class="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">

        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 mb-3 animate-fade-up">
          <a routerLink="/home"
             class="text-xs text-ink-500 hover:text-primary-600
                    transition-colors font-medium">
            Accueil
          </a>
          <lucide-icon name="chevron-right" [size]="12"
                       class="text-ink-400"></lucide-icon>
          <span class="text-xs font-semibold text-primary-600">
            Notre flotte
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4
                    sm:gap-8 items-center">

          <!-- LEFT: Compact title block -->
          <div class="animate-fade-up">
            <div class="flex items-center gap-3 mb-2">
              <!-- Inline badge -->
              <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5
                          bg-white border border-primary-200 rounded-full
                          shadow-sm">
                <span class="relative flex">
                  <span class="absolute inline-flex h-1.5 w-1.5 rounded-full
                               bg-primary-400 opacity-75 animate-ping"></span>
                  <span class="relative inline-flex rounded-full h-1.5 w-1.5
                               bg-primary-500"></span>
                </span>
                <span class="text-[10px] font-semibold text-ink-900
                             tracking-wider uppercase">
                  <span class="shimmer-text">{{ filteredVehicles().length }}</span>
                  dispo
                </span>
              </div>
            </div>

            <!-- Compact headline (single line on desktop) -->
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold
                       tracking-[-0.02em] text-ink-900 mb-2 leading-[1.1]">
              Trouvez
              <span class="relative inline-block">
                <span class="text-primary-500">votre voiture</span>
                <svg class="absolute -bottom-0.5 left-0 w-full"
                     height="6" viewBox="0 0 200 6" fill="none">
                  <path d="M2 4C50 0 100 0 198 4"
                        stroke="#14B8A6" stroke-width="2"
                        stroke-linecap="round" stroke-opacity="0.4"/>
                </svg>
              </span>
              <span class="text-ink-700 font-medium">en quelques clics.</span>
            </h1>

            <!-- Short description -->
            <p class="text-sm text-ink-500 max-w-xl">
              Flotte récente · Assurance incluse · Livraison à Taza
            </p>
          </div>

          <!-- RIGHT: Mini stats inline -->
          <div class="hidden lg:flex items-center gap-4 animate-fade-up"
               style="animation-delay: 150ms;">
            <div class="flex items-center gap-2 px-3 py-2 bg-white
                        border border-gray-200 rounded-xl shadow-sm">
              <lucide-icon name="shield-check" [size]="16"
                           class="text-primary-600"></lucide-icon>
              <div>
                <div class="text-xs font-bold text-ink-900 leading-none">
                  100%
                </div>
                <div class="text-[10px] text-ink-500 font-medium mt-0.5">
                  Assurance
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 px-3 py-2 bg-white
                        border border-gray-200 rounded-xl shadow-sm">
              <lucide-icon name="clock" [size]="16"
                           class="text-primary-600"></lucide-icon>
              <div>
                <div class="text-xs font-bold text-ink-900 leading-none">
                  24/7
                </div>
                <div class="text-[10px] text-ink-500 font-medium mt-0.5">
                  Service
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 px-3 py-2 bg-white
                        border border-gray-200 rounded-xl shadow-sm">
              <lucide-icon name="star" [size]="16"
                           class="text-primary-600 fill-current"></lucide-icon>
              <div>
                <div class="text-xs font-bold text-ink-900 leading-none">
                  4.9
                </div>
                <div class="text-[10px] text-ink-500 font-medium mt-0.5">
                  500+ avis
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick category pills (horizontal scroll) -->
        <div class="mt-5 -mx-5 px-5 sm:mx-0 sm:px-0 overflow-x-auto
                    scrollbar-hide animate-fade-up"
             style="animation-delay: 200ms;">
          <div class="flex gap-2 pb-1 w-max sm:w-auto sm:flex-wrap">
            <span class="text-[10px] font-bold text-ink-500 uppercase
                         tracking-[0.15em] self-center mr-2
                         hidden sm:inline">
              Catégories:
            </span>
            @for (cat of categoryOptions; track cat.value) {
              <button (click)="quickSelectCategory(cat.value)"
                      [class.is-active]="selectedCategories().includes(cat.value)
                                         && selectedCategories().length === 1"
                      class="quick-pill flex-shrink-0">
                {{ cat.label }}
              </button>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- Main content -->
    <section class="bg-white py-8 sm:py-12">
      <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-10">

          <!-- ═══ FILTERS SIDEBAR ═══ -->
          <aside class="lg:sticky lg:top-24 lg:self-start">

            <!-- Mobile toggle -->
            <button (click)="toggleMobileFilters()"
                    class="lg:hidden w-full flex items-center justify-between
                           px-4 py-3 bg-white border border-gray-200
                           rounded-xl mb-4 font-semibold text-ink-900">
              <span class="flex items-center gap-2">
                <lucide-icon name="filter" [size]="18"></lucide-icon>
                Filtres
                @if (activeFiltersCount() > 0) {
                  <span class="bg-primary-500 text-white text-xs font-bold
                               px-1.5 py-0.5 rounded-full">
                    {{ activeFiltersCount() }}
                  </span>
                }
              </span>
              <lucide-icon [name]="mobileFiltersOpen() ? 'chevron-up' : 'chevron-down'"
                           [size]="18"></lucide-icon>
            </button>

            <div [class.hidden]="!mobileFiltersOpen()"
                 class="lg:block bg-white border border-gray-200
                        rounded-2xl p-5 lg:p-6 space-y-6">

              <!-- Header with reset -->
              <div class="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 class="font-bold text-ink-900 text-lg flex items-center gap-2">
                  <lucide-icon name="filter" [size]="18" class="text-primary-600"></lucide-icon>
                  Filtres
                </h3>
                @if (activeFiltersCount() > 0) {
                  <button (click)="resetFilters()"
                          class="text-xs font-semibold text-primary-600 hover:text-primary-700">
                    Réinitialiser
                  </button>
                }
              </div>

              <!-- Catégorie -->
              <div>
                <h4 class="text-[11px] font-bold text-ink-500 uppercase tracking-[0.15em] mb-3">
                  Catégorie
                </h4>
                <div class="space-y-2">
                  @for (cat of categoryOptions; track cat.value) {
                    <label class="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox"
                             [checked]="selectedCategories().includes(cat.value)"
                             (change)="toggleCategory(cat.value)"
                             class="w-4 h-4 rounded border-gray-300
                                    text-primary-500 focus:ring-primary-500" />
                      <span class="text-sm text-ink-700 group-hover:text-ink-900">
                        {{ cat.label }}
                      </span>
                    </label>
                  }
                </div>
              </div>

              <!-- Carburant -->
              <div class="pt-4 border-t border-gray-100">
                <h4 class="text-[11px] font-bold text-ink-500 uppercase tracking-[0.15em] mb-3">
                  Carburant
                </h4>
                <div class="space-y-2">
                  @for (fuel of fuelOptions; track fuel.value) {
                    <label class="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox"
                             [checked]="selectedFuels().includes(fuel.value)"
                             (change)="toggleFuel(fuel.value)"
                             class="w-4 h-4 rounded border-gray-300
                                    text-primary-500 focus:ring-primary-500" />
                      <span class="text-sm text-ink-700 group-hover:text-ink-900">
                        {{ fuel.label }}
                      </span>
                    </label>
                  }
                </div>
              </div>

              <!-- Transmission -->
              <div class="pt-4 border-t border-gray-100">
                <h4 class="text-[11px] font-bold text-ink-500 uppercase tracking-[0.15em] mb-3">
                  Transmission
                </h4>
                <div class="space-y-2">
                  @for (t of transmissionOptions; track t.value) {
                    <label class="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox"
                             [checked]="selectedTransmissions().includes(t.value)"
                             (change)="toggleTransmission(t.value)"
                             class="w-4 h-4 rounded border-gray-300
                                    text-primary-500 focus:ring-primary-500" />
                      <span class="text-sm text-ink-700 group-hover:text-ink-900">
                        {{ t.label }}
                      </span>
                    </label>
                  }
                </div>
              </div>

              <!-- Prix -->
              <div class="pt-4 border-t border-gray-100">
                <h4 class="text-[11px] font-bold text-ink-500 uppercase tracking-[0.15em] mb-3">
                  Prix par jour
                </h4>
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <input type="number"
                           [ngModel]="minPrice()"
                           (ngModelChange)="setMinPrice($event)"
                           placeholder="Min"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                                  focus:outline-none focus:border-primary-500" />
                    <span class="text-ink-400 shrink-0">—</span>
                    <input type="number"
                           [ngModel]="maxPrice()"
                           (ngModelChange)="setMaxPrice($event)"
                           placeholder="Max"
                           class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                                  focus:outline-none focus:border-primary-500" />
                  </div>
                  <div class="text-xs text-ink-500 font-medium">
                    {{ minPrice() ?? 100 }} — {{ maxPrice() ?? 500 }} DH/jour
                  </div>
                </div>
              </div>

              <!-- Disponibilité -->
              <div class="pt-4 border-t border-gray-100">
                <label class="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox"
                         [checked]="onlyAvailable()"
                         (change)="toggleOnlyAvailable()"
                         class="w-4 h-4 rounded border-gray-300
                                text-primary-500 focus:ring-primary-500" />
                  <span class="text-sm font-medium text-ink-900">
                    Disponibles uniquement
                  </span>
                </label>
              </div>

            </div>
          </aside>

          <!-- ═══ RESULTS AREA ═══ -->
          <div>

            <!-- Search + Sort bar -->
            <div class="flex flex-col sm:flex-row gap-3 mb-6">
              <div class="relative flex-1">
                <lucide-icon name="search" [size]="18"
                             class="absolute left-4 top-1/2 -translate-y-1/2
                                    text-ink-400 pointer-events-none z-10">
                </lucide-icon>
                <input type="text"
                       [ngModel]="searchQuery()"
                       (ngModelChange)="setSearch($event)"
                       placeholder="Rechercher une marque ou modèle..."
                       class="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm
                              focus:outline-none focus:border-primary-500
                              focus:ring-2 focus:ring-primary-500/20" />
              </div>

              <div class="relative sm:w-56">
                <select [ngModel]="sortBy()"
                        (ngModelChange)="setSort($event)"
                        class="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl
                               text-sm font-medium text-ink-900 appearance-none cursor-pointer
                               focus:outline-none focus:border-primary-500">
                  <option value="newest">Plus récents</option>
                  <option value="priceAsc">Prix croissant</option>
                  <option value="priceDesc">Prix décroissant</option>
                  <option value="name">Nom (A-Z)</option>
                </select>
                <lucide-icon name="chevron-down" [size]="16"
                             class="absolute right-4 top-1/2 -translate-y-1/2
                                    text-ink-400 pointer-events-none">
                </lucide-icon>
              </div>
            </div>

            <!-- Active filter chips -->
            @if (activeFiltersCount() > 0) {
              <div class="flex flex-wrap items-center gap-2 mb-5">
                <span class="text-xs font-medium text-ink-500">Filtres actifs:</span>
                @for (cat of selectedCategories(); track cat) {
                  <button (click)="toggleCategory(cat)" class="filter-chip">
                    {{ getCategoryLabel(cat) }}
                    <lucide-icon name="x" [size]="12"></lucide-icon>
                  </button>
                }
                @for (fuel of selectedFuels(); track fuel) {
                  <button (click)="toggleFuel(fuel)" class="filter-chip">
                    {{ getFuelLabel(fuel) }}
                    <lucide-icon name="x" [size]="12"></lucide-icon>
                  </button>
                }
                @for (t of selectedTransmissions(); track t) {
                  <button (click)="toggleTransmission(t)" class="filter-chip">
                    {{ getTransmissionLabel(t) }}
                    <lucide-icon name="x" [size]="12"></lucide-icon>
                  </button>
                }
                @if (searchQuery()) {
                  <button (click)="setSearch('')" class="filter-chip">
                    "{{ searchQuery() }}"
                    <lucide-icon name="x" [size]="12"></lucide-icon>
                  </button>
                }
              </div>
            }

            <!-- Loading skeleton -->
            @if (loading()) {
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                @for (i of [1,2,3,4,5,6]; track i) {
                  <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
                    <div class="aspect-[4/3] bg-gray-100"></div>
                    <div class="p-4 space-y-3">
                      <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                      <div class="h-3 bg-gray-100 rounded w-1/2"></div>
                      <div class="h-3 bg-gray-100 rounded w-2/3"></div>
                      <div class="h-8 bg-gray-100 rounded mt-4"></div>
                    </div>
                  </div>
                }
              </div>
            } @else if (filteredVehicles().length === 0) {
              <div class="bg-surface-50 border-2 border-dashed border-gray-200
                          rounded-2xl py-16 px-6 text-center">
                <div class="w-16 h-16 bg-white rounded-full mx-auto mb-4
                            flex items-center justify-center border border-gray-200">
                  <lucide-icon name="search-x" [size]="28" class="text-ink-400"></lucide-icon>
                </div>
                <h3 class="text-lg font-bold text-ink-900 mb-2">Aucune voiture trouvée</h3>
                <p class="text-sm text-ink-500 mb-5 max-w-sm mx-auto">
                  Essayez d'ajuster vos filtres ou de modifier votre recherche.
                </p>
                <button (click)="resetFilters()"
                        class="bg-primary-500 hover:bg-primary-600 text-white
                               font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors">
                  Réinitialiser les filtres
                </button>
              </div>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                @for (vehicle of paginatedVehicles(); track vehicle.id) {
                  <app-car-card [vehicle]="vehicle"></app-car-card>
                }
              </div>

              <!-- Pagination -->
              @if (totalPages() > 1) {
                <div class="mt-10 flex items-center justify-between
                            border-t border-gray-200 pt-6">
                  <button (click)="prevPage()"
                          [disabled]="currentPage() === 1"
                          class="flex items-center gap-2 px-4 py-2 border border-gray-200
                                 rounded-lg text-sm font-semibold text-ink-700
                                 hover:border-primary-500 hover:text-primary-600
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <lucide-icon name="chevron-left" [size]="16"></lucide-icon>
                    Précédent
                  </button>

                  <span class="text-sm text-ink-500">
                    Page <strong class="text-ink-900">{{ currentPage() }}</strong>
                    sur <strong class="text-ink-900">{{ totalPages() }}</strong>
                  </span>

                  <button (click)="nextPage()"
                          [disabled]="currentPage() === totalPages()"
                          class="flex items-center gap-2 px-4 py-2 border border-gray-200
                                 rounded-lg text-sm font-semibold text-ink-700
                                 hover:border-primary-500 hover:text-primary-600
                                 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Suivant
                    <lucide-icon name="chevron-right" [size]="16"></lucide-icon>
                  </button>
                </div>
              }
            }

          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: rgb(240 253 250);
      color: rgb(15 118 110);
      font-size: 12px;
      font-weight: 600;
      border-radius: 100px;
      transition: all 0.15s;
      cursor: pointer;
    }
    .filter-chip:hover {
      background: rgb(204 251 241);
    }
    .quick-pill {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(20, 184, 166, 0.2);
      color: #334155;
      font-size: 12px;
      font-weight: 600;
      border-radius: 100px;
      transition: all 0.2s;
      cursor: pointer;
      white-space: nowrap;
    }
    .quick-pill:hover {
      background: rgba(20, 184, 166, 0.08);
      border-color: rgba(20, 184, 166, 0.4);
      color: #0F766E;
      transform: translateY(-1px);
    }
    .quick-pill.is-active {
      background: #14B8A6;
      border-color: #14B8A6;
      color: white;
      box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
    }
    .quick-pill.is-active:hover {
      background: #0D9488;
      color: white;
    }
  `],
})
export class CatalogComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private route          = inject(ActivatedRoute);

  vehicles = signal<Vehicle[]>([]);
  loading  = signal(true);

  searchQuery          = signal('');
  selectedCategories   = signal<string[]>([]);
  selectedFuels        = signal<string[]>([]);
  selectedTransmissions = signal<string[]>([]);
  minPrice             = signal<number | null>(null);
  maxPrice             = signal<number | null>(null);
  onlyAvailable        = signal(true);
  sortBy               = signal<'priceAsc' | 'priceDesc' | 'newest' | 'name'>('newest');

  mobileFiltersOpen = signal(false);

  currentPage = signal(1);
  readonly pageSize = 9;

  quickCategories = [
    { value: 'ECONOMIQUE', label: 'Économique'  },
    { value: 'COMPACTE',   label: 'Compacte'    },
    { value: 'BERLINE',    label: 'Berline'     },
    { value: 'SUV',        label: 'SUV'         },
    { value: 'PREMIUM',    label: 'Premium'     },
    { value: 'UTILITAIRE', label: 'Utilitaire'  },
  ];

  categoryOptions: FilterOption[] = [
    { value: 'ECONOMIQUE',  label: 'Économique'  },
    { value: 'COMPACTE',    label: 'Compacte'    },
    { value: 'BERLINE',     label: 'Berline'     },
    { value: 'SUV',         label: 'SUV'         },
    { value: 'PREMIUM',     label: 'Premium'     },
    { value: 'UTILITAIRE',  label: 'Utilitaire'  },
  ];

  fuelOptions: FilterOption[] = [
    { value: 'ESSENCE',    label: 'Essence'    },
    { value: 'DIESEL',     label: 'Diesel'     },
    { value: 'HYBRIDE',    label: 'Hybride'    },
    { value: 'ELECTRIQUE', label: 'Électrique' },
  ];

  transmissionOptions: FilterOption[] = [
    { value: 'MANUAL', label: 'Manuelle'     },
    { value: 'AUTO',   label: 'Automatique'  },
  ];

  filteredVehicles = computed(() => {
    let list = this.vehicles();

    if (this.onlyAvailable()) {
      list = list.filter(v => v.status === 'AVAILABLE');
    }

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(v =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
      );
    }

    const cats = this.selectedCategories();
    if (cats.length > 0) list = list.filter(v => cats.includes(v.category));

    const fuels = this.selectedFuels();
    if (fuels.length > 0) list = list.filter(v => fuels.includes(v.fuelType));

    const trans = this.selectedTransmissions();
    if (trans.length > 0) list = list.filter(v => trans.includes(v.transmission));

    const min = this.minPrice();
    const max = this.maxPrice();
    if (min !== null) list = list.filter(v => v.pricePerDay >= min);
    if (max !== null) list = list.filter(v => v.pricePerDay <= max);

    const sort = this.sortBy();
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'priceAsc':  return a.pricePerDay - b.pricePerDay;
        case 'priceDesc': return b.pricePerDay - a.pricePerDay;
        case 'name':      return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
        case 'newest':    return (b.year ?? 0) - (a.year ?? 0);
        default:          return 0;
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

  activeFiltersCount = computed(() =>
    this.selectedCategories().length +
    this.selectedFuels().length +
    this.selectedTransmissions().length +
    (this.searchQuery() ? 1 : 0) +
    (this.minPrice() !== null ? 1 : 0) +
    (this.maxPrice() !== null ? 1 : 0)
  );

  ngOnInit() {
    this.loadVehicles();
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategories.set([params['category']]);
      }
    });
  }

  loadVehicles() {
    this.loading.set(true);
    this.vehicleService.getAllVehicles().subscribe({
      next:  (data) => { this.vehicles.set(data); this.loading.set(false); },
      error: ()     => { this.vehicles.set([]);    this.loading.set(false); },
    });
  }

  toggleCategory(value: string) {
    this.selectedCategories.update(arr =>
      arr.includes(value) ? arr.filter(c => c !== value) : [...arr, value]
    );
    this.currentPage.set(1);
  }

  toggleFuel(value: string) {
    this.selectedFuels.update(arr =>
      arr.includes(value) ? arr.filter(f => f !== value) : [...arr, value]
    );
    this.currentPage.set(1);
  }

  toggleTransmission(value: string) {
    this.selectedTransmissions.update(arr =>
      arr.includes(value) ? arr.filter(t => t !== value) : [...arr, value]
    );
    this.currentPage.set(1);
  }

  setSearch(q: string)           { this.searchQuery.set(q);    this.currentPage.set(1); }
  setMinPrice(v: number | null)  { this.minPrice.set(v);       this.currentPage.set(1); }
  setMaxPrice(v: number | null)  { this.maxPrice.set(v);       this.currentPage.set(1); }
  setSort(s: any)                { this.sortBy.set(s); }
  toggleOnlyAvailable()          { this.onlyAvailable.update(v => !v); this.currentPage.set(1); }
  toggleMobileFilters()          { this.mobileFiltersOpen.update(v => !v); }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedCategories.set([]);
    this.selectedFuels.set([]);
    this.selectedTransmissions.set([]);
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.onlyAvailable.set(true);
    this.sortBy.set('newest');
    this.currentPage.set(1);
  }

  quickSelectCategory(value: string) {
    if (this.selectedCategories().length === 1 && this.selectedCategories()[0] === value) {
      this.selectedCategories.set([]);
    } else {
      this.selectedCategories.set([value]);
    }
    this.currentPage.set(1);
    setTimeout(() => {
      const results = document.querySelector('section.bg-white');
      if (results) results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  getCategoryLabel(v: string)    { return this.categoryOptions.find(c => c.value === v)?.label ?? v; }
  getFuelLabel(v: string)        { return this.fuelOptions.find(f => f.value === v)?.label ?? v; }
  getTransmissionLabel(v: string){ return this.transmissionOptions.find(t => t.value === v)?.label ?? v; }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
