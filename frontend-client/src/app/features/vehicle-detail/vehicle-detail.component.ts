import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { VehicleService, AvailabilityResponse } from '../../core/services/vehicle.service';
import { Vehicle } from '../../core/models/vehicle.model';
import { CarCardComponent } from '../../shared/components/car-card/car-card.component';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, CarCardComponent],
  template: `
    @if (loading()) {
      <div class="min-h-[80vh] flex items-center justify-center pt-24">
        <div class="text-center">
          <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-500
                      rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-ink-500">Chargement du véhicule...</p>
        </div>
      </div>
    } @else if (!vehicle()) {
      <div class="min-h-[80vh] flex items-center justify-center pt-24 px-5">
        <div class="text-center max-w-md">
          <div class="w-16 h-16 bg-red-50 rounded-full mx-auto mb-4
                      flex items-center justify-center">
            <lucide-icon name="alert-circle" [size]="28"
                         class="text-red-500"></lucide-icon>
          </div>
          <h2 class="text-2xl font-bold text-ink-900 mb-2">
            Véhicule introuvable
          </h2>
          <p class="text-ink-500 mb-6">
            Ce véhicule n'existe pas ou n'est plus disponible.
          </p>
          <a routerLink="/voitures"
             class="inline-flex items-center gap-2 bg-primary-500
                    hover:bg-primary-600 text-white font-semibold px-6 py-3
                    rounded-lg transition-colors">
            <lucide-icon name="arrow-left" [size]="18"></lucide-icon>
            Retour aux voitures
          </a>
        </div>
      </div>
    } @else {
      <!-- ═══ HEADER + BREADCRUMB ═══ -->
      <section class="bg-gradient-to-br from-white via-surface-50
                      to-primary-50/20 border-b border-gray-200 pt-24 pb-6">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div class="flex items-center gap-2 text-xs">
            <a routerLink="/home"
               class="text-ink-500 hover:text-primary-600 font-medium">
              Accueil
            </a>
            <lucide-icon name="chevron-right" [size]="12"
                         class="text-ink-400"></lucide-icon>
            <a routerLink="/voitures"
               class="text-ink-500 hover:text-primary-600 font-medium">
              Voitures
            </a>
            <lucide-icon name="chevron-right" [size]="12"
                         class="text-ink-400"></lucide-icon>
            <span class="text-primary-600 font-semibold">
              {{ vehicle()!.brand }} {{ vehicle()!.model }}
            </span>
          </div>
        </div>
      </section>

      <!-- ═══ MAIN CONTENT ═══ -->
      <section class="bg-white py-8 sm:py-10">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">

          <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12">

            <!-- ═══ LEFT: Image gallery + info ═══ -->
            <div>
              <!-- Big image area with stage glow -->
              <div class="relative bg-gradient-to-br from-primary-50/50
                          to-surface-50 rounded-3xl overflow-hidden
                          border border-gray-200 mb-4
                          aspect-[4/3] sm:aspect-[16/10]">

                <!-- Decorative orbs -->
                <div class="absolute top-0 right-0 w-64 h-64
                            bg-primary-200/30 rounded-full blur-3xl
                            pointer-events-none"></div>
                <div class="absolute bottom-0 left-0 w-72 h-72
                            bg-primary-100/40 rounded-full blur-3xl
                            pointer-events-none"></div>

                <!-- Status badges -->
                <div class="absolute top-5 left-5 z-10 flex gap-2">
                  @if (vehicle()!.status === 'AVAILABLE') {
                    <span class="inline-flex items-center gap-1.5
                                 bg-white px-3 py-1.5 rounded-full
                                 border border-gray-200 shadow-sm
                                 text-xs font-semibold text-ink-900">
                      <span class="w-1.5 h-1.5 bg-primary-500 rounded-full
                                   animate-soft-pulse"></span>
                      Disponible
                    </span>
                  } @else {
                    <span class="inline-flex items-center bg-amber-100
                                 text-amber-800 px-3 py-1.5 rounded-full
                                 text-xs font-semibold">
                      Non disponible
                    </span>
                  }
                  <span class="inline-flex items-center bg-ink-900
                               text-white px-3 py-1.5 rounded-full
                               text-xs font-semibold">
                    {{ getCategoryLabel(vehicle()!.category) }}
                  </span>
                </div>

                <!-- Year badge top right -->
                <div class="absolute top-5 right-5 z-10">
                  <span class="inline-flex items-center bg-white/90
                               backdrop-blur-sm px-3 py-1.5 rounded-full
                               border border-gray-200 text-xs
                               font-semibold text-ink-900">
                    {{ vehicle()!.year }}
                  </span>
                </div>

                <!-- Floor shadow -->
                <div class="absolute bottom-[15%] left-1/2 -translate-x-1/2
                            w-[55%] h-8 rounded-full pointer-events-none"
                     style="background: radial-gradient(ellipse at center,
                            rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.1) 45%,
                            rgba(0,0,0,0) 75%); filter: blur(12px);">
                </div>

                <!-- Car image -->
                <div class="absolute inset-0 flex items-center justify-center px-8">
                  <img [src]="getImageUrl()"
                       [alt]="vehicle()!.brand + ' ' + vehicle()!.model"
                       class="max-h-[80%] max-w-[85%] object-contain"
                       style="filter: drop-shadow(0 25px 25px rgba(0,0,0,0.18));" />
                </div>
              </div>

              <!-- Title + rating row -->
              <div class="mb-6">
                <h1 class="text-3xl sm:text-4xl font-bold tracking-tight
                           text-ink-900 mb-2">
                  {{ vehicle()!.brand }}
                  <span class="text-primary-500">{{ vehicle()!.model }}</span>
                </h1>
                <div class="flex flex-wrap items-center gap-4 text-sm">
                  <div class="flex items-center gap-1">
                    @for (s of [1,2,3,4,5]; track s) {
                      <lucide-icon name="star" [size]="14"
                                   class="text-primary-500 fill-current">
                      </lucide-icon>
                    }
                    <span class="text-ink-700 font-semibold ml-1">4.9</span>
                    <span class="text-ink-500">(87 avis)</span>
                  </div>
                  <span class="text-ink-300">•</span>
                  <span class="text-ink-500">
                    Plaque: <span class="font-semibold text-ink-900">
                      {{ vehicle()!.licensePlate }}
                    </span>
                  </span>
                </div>
              </div>

              <!-- Specs grid -->
              <div class="mb-8">
                <h3 class="text-[11px] font-bold text-ink-500 uppercase
                           tracking-[0.2em] mb-4">
                  Caractéristiques
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div class="spec-card">
                    <lucide-icon name="settings-2" [size]="20"
                                 class="text-primary-600"></lucide-icon>
                    <div>
                      <div class="text-[10px] text-ink-500 uppercase
                                  tracking-wider font-semibold">
                        Boîte
                      </div>
                      <div class="text-sm font-bold text-ink-900">
                        {{ vehicle()!.transmission === 'AUTO' ? 'Auto' : 'Manuelle' }}
                      </div>
                    </div>
                  </div>
                  <div class="spec-card">
                    <lucide-icon name="fuel" [size]="20"
                                 class="text-primary-600"></lucide-icon>
                    <div>
                      <div class="text-[10px] text-ink-500 uppercase
                                  tracking-wider font-semibold">
                        Carburant
                      </div>
                      <div class="text-sm font-bold text-ink-900">
                        {{ getFuelLabel(vehicle()!.fuelType) }}
                      </div>
                    </div>
                  </div>
                  <div class="spec-card">
                    <lucide-icon name="users" [size]="20"
                                 class="text-primary-600"></lucide-icon>
                    <div>
                      <div class="text-[10px] text-ink-500 uppercase
                                  tracking-wider font-semibold">
                        Places
                      </div>
                      <div class="text-sm font-bold text-ink-900">
                        {{ vehicle()!.seats || 5 }}
                      </div>
                    </div>
                  </div>
                  <div class="spec-card">
                    <lucide-icon name="door-open" [size]="20"
                                 class="text-primary-600"></lucide-icon>
                    <div>
                      <div class="text-[10px] text-ink-500 uppercase
                                  tracking-wider font-semibold">
                        Portes
                      </div>
                      <div class="text-sm font-bold text-ink-900">
                        {{ vehicle()!.doors || 4 }}
                      </div>
                    </div>
                  </div>
                  <div class="spec-card">
                    <lucide-icon name="calendar" [size]="20"
                                 class="text-primary-600"></lucide-icon>
                    <div>
                      <div class="text-[10px] text-ink-500 uppercase
                                  tracking-wider font-semibold">
                        Année
                      </div>
                      <div class="text-sm font-bold text-ink-900">
                        {{ vehicle()!.year }}
                      </div>
                    </div>
                  </div>
                  <div class="spec-card">
                    <lucide-icon name="gauge" [size]="20"
                                 class="text-primary-600"></lucide-icon>
                    <div>
                      <div class="text-[10px] text-ink-500 uppercase
                                  tracking-wider font-semibold">
                        Kilométrage
                      </div>
                      <div class="text-sm font-bold text-ink-900">
                        {{ formatMileage(vehicle()!.currentMileage) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Description -->
              @if (vehicle()!.description) {
                <div class="mb-8">
                  <h3 class="text-[11px] font-bold text-ink-500 uppercase
                             tracking-[0.2em] mb-4">
                    Description
                  </h3>
                  <p class="text-ink-700 leading-relaxed">
                    {{ vehicle()!.description }}
                  </p>
                </div>
              }

              <!-- Equipments / Features -->
              <div class="mb-8">
                <h3 class="text-[11px] font-bold text-ink-500 uppercase
                           tracking-[0.2em] mb-4">
                  Équipements inclus
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  @for (eq of standardEquipments; track eq) {
                    <div class="flex items-center gap-2 text-sm
                                text-ink-700">
                      <div class="w-5 h-5 rounded-full bg-primary-50
                                  flex items-center justify-center
                                  flex-shrink-0">
                        <lucide-icon name="check" [size]="12"
                                     class="text-primary-600"></lucide-icon>
                      </div>
                      {{ eq }}
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- ═══ RIGHT: Sticky Reservation Card ═══ -->
            <div>
              <div class="lg:sticky lg:top-24">
                <div class="bg-white border border-gray-200 rounded-2xl
                            shadow-[0_20px_60px_-20px_rgba(20,184,166,0.2)]
                            overflow-hidden">

                  <!-- Price header -->
                  <div class="bg-gradient-to-br from-primary-50 to-white
                              p-5 border-b border-gray-100">
                    <div class="text-[10px] font-bold text-primary-700
                                uppercase tracking-[0.2em] mb-1">
                      À partir de
                    </div>
                    <div class="flex items-baseline gap-1">
                      <span class="text-3xl sm:text-4xl font-bold
                                   text-ink-900 leading-none">
                        {{ vehicle()!.pricePerDay }}
                      </span>
                      <span class="text-lg font-semibold text-ink-500">
                        DH
                      </span>
                      <span class="text-sm text-ink-500 ml-1">/jour</span>
                    </div>
                  </div>

                  <!-- Form -->
                  <div class="p-5 space-y-4">
                    <h3 class="font-bold text-ink-900">
                      Réservez maintenant
                    </h3>

                    <!-- Lieu -->
                    <div>
                      <label class="block text-[10px] font-bold
                                    text-primary-600 uppercase
                                    tracking-[0.15em] mb-1.5">
                        Lieu de retrait
                      </label>
                      <select [(ngModel)]="pickupLocation"
                              class="w-full px-3 py-2.5 border border-gray-200
                                     rounded-lg text-sm font-semibold
                                     text-ink-900 bg-white
                                     focus:outline-none focus:border-primary-500
                                     focus:ring-2 focus:ring-primary-500/20">
                        <option value="AGENCE">Agence Taza</option>
                        <option value="GARE">Gare ferroviaire (+50 DH)</option>
                        <option value="DOMICILE">Livraison domicile (+100 DH)</option>
                      </select>
                    </div>

                    <!-- Dates -->
                    <div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="block text-[10px] font-bold
                                      text-primary-600 uppercase
                                      tracking-[0.15em] mb-1.5">
                          Départ
                        </label>
                        <input type="date"
                               [(ngModel)]="startDate"
                               (ngModelChange)="onDateChange()"
                               [min]="minDate"
                               class="w-full px-3 py-2.5 border border-gray-200
                                      rounded-lg text-sm font-semibold
                                      text-ink-900 bg-white
                                      focus:outline-none focus:border-primary-500" />
                      </div>
                      <div>
                        <label class="block text-[10px] font-bold
                                      text-primary-600 uppercase
                                      tracking-[0.15em] mb-1.5">
                          Retour
                        </label>
                        <input type="date"
                               [(ngModel)]="endDate"
                               (ngModelChange)="onDateChange()"
                               [min]="startDate || minDate"
                               class="w-full px-3 py-2.5 border border-gray-200
                                      rounded-lg text-sm font-semibold
                                      text-ink-900 bg-white
                                      focus:outline-none focus:border-primary-500" />
                      </div>
                    </div>

                    <!-- Availability status -->
                    @if (checkingAvailability()) {
                      <div class="flex items-center gap-2 px-3 py-2
                                  bg-gray-50 rounded-lg text-xs text-ink-500">
                        <div class="w-3 h-3 border-2 border-gray-300
                                    border-t-primary-500 rounded-full
                                    animate-spin"></div>
                        Vérification disponibilité...
                      </div>
                    } @else if (availabilityResult()) {
                      @if (availabilityResult()!.available) {
                        <div class="flex items-start gap-2 px-3 py-2
                                    bg-primary-50 border border-primary-200
                                    rounded-lg text-xs">
                          <lucide-icon name="check-circle" [size]="14"
                                       class="text-primary-600 flex-shrink-0 mt-0.5">
                          </lucide-icon>
                          <span class="text-primary-800 font-medium">
                            Disponible pour {{ availabilityResult()!.daysCount }}
                            jour(s)
                          </span>
                        </div>
                      } @else {
                        <div class="flex items-start gap-2 px-3 py-2
                                    bg-red-50 border border-red-200
                                    rounded-lg text-xs">
                          <lucide-icon name="alert-circle" [size]="14"
                                       class="text-red-600 flex-shrink-0 mt-0.5">
                          </lucide-icon>
                          <span class="text-red-800 font-medium">
                            Non disponible sur cette période
                          </span>
                        </div>
                      }
                    }

                    <!-- Price breakdown -->
                    @if (priceBreakdown()) {
                      <div class="pt-3 border-t border-gray-100 space-y-2">
                        <div class="flex justify-between text-xs text-ink-700">
                          <span>
                            {{ priceBreakdown()!.days }} jour(s) ×
                            {{ vehicle()!.pricePerDay }} DH
                          </span>
                          <span class="font-semibold">
                            {{ priceBreakdown()!.basePrice }} DH
                          </span>
                        </div>
                        @if (priceBreakdown()!.deliveryFee > 0) {
                          <div class="flex justify-between text-xs text-ink-700">
                            <span>Livraison</span>
                            <span class="font-semibold">
                              +{{ priceBreakdown()!.deliveryFee }} DH
                            </span>
                          </div>
                        }
                        <div class="flex justify-between pt-2 border-t
                                    border-gray-100">
                          <span class="text-sm font-semibold text-ink-900">
                            Total
                          </span>
                          <span class="text-lg font-bold text-primary-600">
                            {{ priceBreakdown()!.total }} DH
                          </span>
                        </div>
                      </div>
                    }

                    <!-- Reserve button -->
                    <button (click)="proceedToReservation()"
                            [disabled]="!canReserve()"
                            class="w-full bg-primary-500 hover:bg-primary-600
                                   active:bg-primary-700 disabled:bg-gray-300
                                   disabled:cursor-not-allowed
                                   text-white font-bold py-3.5 rounded-xl
                                   transition-all flex items-center
                                   justify-center gap-2 group
                                   shadow-lg shadow-primary-500/30
                                   hover:shadow-xl hover:shadow-primary-500/40
                                   disabled:shadow-none">
                      Réserver maintenant
                      <lucide-icon name="arrow-right" [size]="18"
                                   class="group-hover:translate-x-0.5
                                          transition-transform">
                      </lucide-icon>
                    </button>

                    <!-- Info notes -->
                    <div class="space-y-1.5 pt-2">
                      <div class="flex items-center gap-2 text-[11px]
                                  text-ink-500">
                        <lucide-icon name="shield-check" [size]="12"
                                     class="text-primary-600 flex-shrink-0">
                        </lucide-icon>
                        Assurance tous risques incluse
                      </div>
                      <div class="flex items-center gap-2 text-[11px]
                                  text-ink-500">
                        <lucide-icon name="x-circle" [size]="12"
                                     class="text-primary-600 flex-shrink-0">
                        </lucide-icon>
                        Annulation gratuite jusqu'à 24h avant
                      </div>
                      <div class="flex items-center gap-2 text-[11px]
                                  text-ink-500">
                        <lucide-icon name="phone" [size]="12"
                                     class="text-primary-600 flex-shrink-0">
                        </lucide-icon>
                        Support 24/7: +212 6XX XXX XXX
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══ SIMILAR VEHICLES ═══ -->
      @if (similarVehicles().length > 0) {
        <section class="bg-surface-50 border-t border-gray-200 py-12 sm:py-16">
          <div class="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
            <div class="flex items-end justify-between mb-8">
              <div>
                <p class="text-[11px] font-bold text-primary-600 uppercase
                          tracking-[0.2em] mb-2">
                  Aussi disponibles
                </p>
                <h2 class="text-2xl sm:text-3xl font-bold text-ink-900
                           tracking-tight">
                  Voitures similaires
                </h2>
              </div>
              <a routerLink="/voitures"
                 class="hidden sm:flex items-center gap-1 text-sm
                        font-semibold text-primary-600 hover:text-primary-700">
                Voir toutes
                <lucide-icon name="arrow-right" [size]="16"></lucide-icon>
              </a>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              @for (v of similarVehicles(); track v.id) {
                <app-car-card [vehicle]="v"></app-car-card>
              }
            </div>
          </div>
        </section>
      }
    }
  `,
  styles: [`
    .spec-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background: white;
      border: 1px solid rgb(229 231 235);
      border-radius: 12px;
      transition: all 0.2s;
    }
    .spec-card:hover {
      border-color: rgb(94 234 212);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(20, 184, 166, 0.08);
    }
  `],
})
export class VehicleDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehicleService = inject(VehicleService);

  vehicle = signal<Vehicle | null>(null);
  similarVehicles = signal<Vehicle[]>([]);
  loading = signal(true);

  pickupLocation = 'AGENCE';
  startDate = '';
  endDate = '';

  checkingAvailability = signal(false);
  availabilityResult = signal<AvailabilityResponse | null>(null);

  minDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  private destroy$ = new Subject<void>();
  private dateChange$ = new Subject<void>();

  standardEquipments = [
    'Climatisation',
    'Direction assistée',
    'Vitres électriques',
    'Verrouillage centralisé',
    'ABS + Airbags',
    'Bluetooth',
    'Radio FM',
    'Pneus 4 saisons',
  ];

  priceBreakdown = computed(() => {
    const veh = this.vehicle();
    const avail = this.availabilityResult();
    if (!veh || !avail || !avail.available) return null;

    const days = avail.daysCount;
    const basePrice = days * veh.pricePerDay;
    const deliveryFee = this.pickupLocation === 'GARE' ? 50
                      : this.pickupLocation === 'DOMICILE' ? 100
                      : 0;
    return { days, basePrice, deliveryFee, total: basePrice + deliveryFee };
  });

  canReserve = computed(() => {
    const veh = this.vehicle();
    const avail = this.availabilityResult();
    return veh?.status === 'AVAILABLE' && avail !== null && avail.available;
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) this.loadVehicle(id);
    });

    this.dateChange$
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => this.checkAvailability());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVehicle(id: number) {
    this.loading.set(true);
    this.vehicleService.getVehicleById(id).subscribe({
      next: (data) => {
        this.vehicle.set(data);
        this.loading.set(false);
        this.loadSimilarVehicles(data);
      },
      error: () => {
        this.vehicle.set(null);
        this.loading.set(false);
      },
    });
  }

  loadSimilarVehicles(current: Vehicle) {
    this.vehicleService.getAllVehicles().subscribe({
      next: (all) => {
        const similar = all
          .filter(v => v.id !== current.id
                  && v.status === 'AVAILABLE'
                  && v.category === current.category)
          .slice(0, 3);
        if (similar.length < 3) {
          const others = all
            .filter(v => v.id !== current.id
                    && v.status === 'AVAILABLE'
                    && v.category !== current.category)
            .slice(0, 3 - similar.length);
          similar.push(...others);
        }
        this.similarVehicles.set(similar);
      },
    });
  }

  onDateChange() {
    this.dateChange$.next();
  }

  checkAvailability() {
    const veh = this.vehicle();
    if (!veh || !this.startDate || !this.endDate) {
      this.availabilityResult.set(null);
      return;
    }
    if (this.endDate <= this.startDate) {
      this.availabilityResult.set(null);
      return;
    }

    this.checkingAvailability.set(true);
    this.vehicleService.checkAvailability(veh.id, this.startDate, this.endDate)
      .subscribe({
        next: (result) => {
          this.availabilityResult.set(result);
          this.checkingAvailability.set(false);
        },
        error: () => {
          this.availabilityResult.set(null);
          this.checkingAvailability.set(false);
        },
      });
  }

  proceedToReservation() {
    if (!this.canReserve()) return;
    const veh = this.vehicle()!;
    this.router.navigate(['/voitures', veh.id, 'reserver'], {
      queryParams: {
        startDate: this.startDate,
        endDate: this.endDate,
        pickupLocation: this.pickupLocation,
      },
    });
  }

  getImageUrl(): string {
    const veh = this.vehicle();
    if (!veh) return '';
    const map: Record<string, string> = {
      'Renault Clio': 'assets/cars/clio5.png',
      'Renault Clio 5': 'assets/cars/clio5.png',
      'Peugeot 208': 'assets/cars/208.png',
      'Dacia Logan': 'assets/cars/dacia.png',
      'Dacia Sandero': 'assets/cars/dacia.png',
      'Dacia Duster': 'assets/cars/dacia.png',
      'Opel Corsa': 'assets/cars/opel.png',
    };
    const key = `${veh.brand} ${veh.model}`;
    return map[key] || 'assets/cars/clio5.png';
  }

  getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      'ECONOMIQUE': 'Économique',
      'COMPACTE': 'Compacte',
      'BERLINE': 'Berline',
      'SUV': 'SUV',
      'PREMIUM': 'Premium',
      'UTILITAIRE': 'Utilitaire',
    };
    return labels[cat] || cat;
  }

  getFuelLabel(fuel: string): string {
    const labels: Record<string, string> = {
      'ESSENCE': 'Essence',
      'DIESEL': 'Diesel',
      'HYBRIDE': 'Hybride',
      'ELECTRIQUE': 'Électrique',
    };
    return labels[fuel] || fuel;
  }

  formatMileage(km?: number): string {
    if (!km) return '-';
    return km.toLocaleString('fr-FR') + ' km';
  }
}
