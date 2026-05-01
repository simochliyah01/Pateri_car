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
    <!-- Premium hero -->
    <section class="relative overflow-hidden pt-24 pb-14">
      <!-- Background image + dark gradient overlay -->
      <div class="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80"
             alt="" class="w-full h-full object-cover scale-105" aria-hidden="true" />
        <div class="absolute inset-0 bg-gradient-to-br from-black/88 via-gray-900/80
                    to-primary-900/60 backdrop-blur-sm"></div>
      </div>
      <!-- Animated orbs -->
      <div class="absolute -top-40 -left-24 w-[500px] h-[500px] rounded-full
                  bg-primary-500/25 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 right-1/3 w-80 h-80 rounded-full
                  bg-teal-400/20 blur-3xl pointer-events-none"></div>
      <!-- Dot grid -->
      <div class="absolute inset-0 pointer-events-none opacity-[0.13]"
           style="background-image: radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px);
                  background-size: 28px 28px;"></div>

      <!-- Content -->
      <div class="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div class="grid lg:grid-cols-[1fr_280px] gap-12 items-start">

          <!-- Left column -->
          <div>
            <!-- Breadcrumb -->
            <div class="flex items-center gap-2 mb-5">
              <a routerLink="/home"
                 class="text-sm text-white/60 hover:text-white transition-colors">
                Accueil
              </a>
              <lucide-icon name="chevron-right" [size]="14" class="text-white/40"></lucide-icon>
              <span class="text-sm font-semibold text-white/90">Notre flotte</span>
            </div>

            <!-- Live badge -->
            <span class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm
                         border border-white/20 rounded-full px-4 py-1.5 mb-5">
              <span class="w-2 h-2 rounded-full bg-primary-400 animate-pulse shrink-0"></span>
              <span class="text-xs font-semibold text-white/90 tracking-wide">
                Flotte disponible maintenant
              </span>
            </span>

            <!-- Headline with hand-drawn underline -->
            <h1 class="text-4xl sm:text-[52px] font-extrabold text-white
                       leading-[1.1] tracking-tight mb-4">
              Trouvez<br>
              <span class="relative whitespace-nowrap">
                votre voiture
                <svg class="absolute -bottom-2 left-0 w-full overflow-visible"
                     height="10" viewBox="0 0 280 10"
                     preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 7 C55 2, 130 9, 195 5 C232 3, 260 8, 278 4"
                        stroke="rgb(45 212 191)" stroke-width="3.5"
                        stroke-linecap="round" fill="none" opacity="0.9"/>
                </svg>
              </span>
            </h1>

            <!-- Description -->
            <p class="text-white/65 text-base sm:text-lg max-w-lg mb-9 leading-relaxed">
              {{ filteredVehicles().length }}
              voiture{{ filteredVehicles().length !== 1 ? 's' : '' }}
              disponible{{ filteredVehicles().length !== 1 ? 's' : '' }}
              à la location à Taza et alentours.
            </p>

            <!-- Trust badges row -->
            <div class="flex flex-wrap items-center gap-x-8 gap-y-4">
              <div class="flex items-center gap-2">
                <lucide-icon name="shield-check" [size]="20"
                             class="text-primary-400 shrink-0"></lucide-icon>
                <div>
                  <p class="text-sm font-bold text-white leading-none">100%</p>
                  <p class="text-[11px] text-white/50 mt-0.5">Sécurisé</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <lucide-icon name="clock" [size]="20"
                             class="text-primary-400 shrink-0"></lucide-icon>
                <div>
                  <p class="text-sm font-bold text-white leading-none">24/7</p>
                  <p class="text-[11px] text-white/50 mt-0.5">Support</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <lucide-icon name="map-pin" [size]="20"
                             class="text-primary-400 shrink-0"></lucide-icon>
                <div>
                  <p class="text-sm font-bold text-white leading-none">Taza</p>
                  <p class="text-[11px] text-white/50 mt-0.5">Livraison</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <lucide-icon name="star" [size]="20"
                             class="text-primary-400 shrink-0"></lucide-icon>
                <div>
                  <p class="text-sm font-bold text-white leading-none">4.9</p>
                  <p class="text-[11px] text-white/50 mt-0.5">Note clients</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right column: quick category pills (desktop) -->
          <div class="hidden lg:block pt-1">
            <p class="text-[10px] font-bold text-white/40 uppercase
                      tracking-[0.2em] mb-3">
              Par catégorie
            </p>
            <div class="flex flex-col gap-2">
              @for (cat of quickCategories; track cat.value) {
                <button (click)="quickSelectCategory(cat.value)"
                        [class.is-active]="selectedCategories().includes(cat.value)"
                        class="quick-pill">
                  {{ cat.label }}
                </button>
              }
            </div>
          </div>

        </div>

        <!-- Mobile horizontal scroll pills -->
        <div class="lg:hidden mt-7 -mx-5 px-5 overflow-x-auto">
          <div class="flex gap-2 pb-2 w-max">
            @for (cat of quickCategories; track cat.value) {
              <button (click)="quickSelectCategory(cat.value)"
                      [class.is-active]="selectedCategories().includes(cat.value)"
                      class="quick-pill shrink-0">
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
      padding: 9px 18px;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.80);
      font-size: 13px;
      font-weight: 600;
      border-radius: 100px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      transition: all 0.2s;
      cursor: pointer;
      backdrop-filter: blur(8px);
      text-align: left;
      width: 100%;
    }
    .quick-pill:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.30);
      color: white;
    }
    .quick-pill.is-active {
      background: rgb(20 184 166);
      border-color: rgb(20 184 166);
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
    this.toggleCategory(value);
    setTimeout(() => {
      document.querySelector('aside')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
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
