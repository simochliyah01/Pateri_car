import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { VehicleService } from '../../core/services/vehicle.service';
import { Vehicle } from '../../core/models/vehicle.model';
import { CarCardComponent } from '../../shared/components/car-card/car-card.component';
import { CarCarouselComponent, CarSlide } from '../../shared/components/car-carousel/car-carousel.component';
import { FadeInDirective } from '../../shared/directives/fade-in.directive';
import { CountUpDirective } from '../../shared/directives/count-up.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, RouterLink, LucideAngularModule,
    CarCardComponent, CarCarouselComponent,
    FadeInDirective, CountUpDirective,
  ],
  template: `
    <!-- ============================================================ -->
    <!-- HERO — PREMIUM MESH + BIG CAROUSEL                          -->
    <!-- ============================================================ -->
    <section class="relative bg-mesh-premium border-b border-gray-200
                    overflow-hidden min-h-[85vh] sm:min-h-[88vh]
                    flex items-center bg-aurora">

      <!-- Blurred background image — Moroccan road atmosphere -->
      <div class="absolute inset-0 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=2400&q=80"
             alt=""
             class="absolute inset-0 w-full h-full object-cover scale-110"
             style="filter: blur(40px) saturate(1.2);"
             aria-hidden="true" />
        <div class="absolute inset-0 bg-white/85"></div>
        <div class="absolute inset-0 bg-gradient-to-br from-white/60 via-primary-50/40 to-primary-100/30"></div>
      </div>

      <!-- Layered backgrounds for depth -->
      <div class="absolute inset-0 bg-noise pointer-events-none"></div>
      <div class="absolute inset-0 bg-dot-grid-premium pointer-events-none"></div>

      <!-- Decorative orbs -->
      <div class="absolute top-[10%] -right-32 w-96 h-96 rounded-full
                  bg-primary-200/30 blur-3xl pointer-events-none
                  animate-spotlight"></div>
      <div class="absolute bottom-[20%] -left-32 w-[28rem] h-[28rem] rounded-full
                  bg-primary-100/40 blur-3xl pointer-events-none"></div>

      <div class="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12
                  pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 w-full">

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-12 xl:gap-x-16 items-center">

          <!-- ═══ LEFT: Text + search (5 cols) ═══ -->
          <div class="lg:col-span-5 animate-fade-up">

            <!-- Premium badge with ping -->
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5
                        glass-premium rounded-full mb-7">
              <span class="relative flex">
                <span class="absolute inline-flex h-2 w-2 rounded-full
                             bg-primary-400 opacity-75 animate-ping"></span>
                <span class="relative inline-flex rounded-full h-2 w-2
                             bg-primary-500"></span>
              </span>
              <span class="text-xs font-semibold text-ink-900 tracking-wider uppercase">
                Disponible à Taza
              </span>
            </div>

            <!-- Premium headline -->
            <h1 class="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold
                       tracking-[-0.03em] text-ink-900 mb-6 leading-[1] lg:leading-[0.95]">
              La route est<br>
              <span class="relative inline-block">
                <span class="text-primary-500">à vous</span>
                <svg class="absolute -bottom-2 left-0 w-full"
                     height="12" viewBox="0 0 200 12" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 9C50 3 100 3 198 9"
                        stroke="#14B8A6" stroke-width="3"
                        stroke-linecap="round" stroke-opacity="0.4"/>
                </svg>
              </span>,<br>
              <span class="text-ink-700 font-medium">on s'occupe du reste.</span>
            </h1>

            <!-- Subtitle -->
            <p class="text-lg text-ink-500 mb-8 max-w-lg leading-relaxed">
              Réservez en quelques clics. Tarifs transparents, assurance
              incluse, service 24/7.
              <span class="text-ink-900 font-medium">Aucune surprise.</span>
            </p>

            <!-- Premium glass search card -->
            <div class="glass-premium rounded-2xl p-2 max-w-xl mb-8">
              <div class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-1.5 items-stretch">

                <div class="px-4 py-3 hover:bg-white/40 rounded-xl transition-colors cursor-pointer">
                  <label class="block text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">
                    Lieu
                  </label>
                  <select class="w-full bg-transparent border-0 p-0 text-sm
                                 font-medium text-ink-900 cursor-pointer
                                 focus:outline-none focus:ring-0">
                    <option>Agence Taza</option>
                    <option>Gare ferroviaire</option>
                    <option>Livraison domicile</option>
                  </select>
                </div>

                <div class="px-4 py-3 hover:bg-white/40 rounded-xl transition-colors cursor-pointer
                            sm:border-l sm:border-gray-200">
                  <label class="block text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">
                    Départ
                  </label>
                  <input type="date"
                         class="w-full bg-transparent border-0 p-0 text-sm
                                font-medium text-ink-900 cursor-pointer
                                focus:outline-none focus:ring-0" />
                </div>

                <div class="px-4 py-3 hover:bg-white/40 rounded-xl transition-colors cursor-pointer
                            sm:border-l sm:border-gray-200">
                  <label class="block text-[10px] font-bold text-primary-600 uppercase tracking-wider mb-1">
                    Retour
                  </label>
                  <input type="date"
                         class="w-full bg-transparent border-0 p-0 text-sm
                                font-medium text-ink-900 cursor-pointer
                                focus:outline-none focus:ring-0" />
                </div>

                <a routerLink="/voitures"
                   class="bg-ink-900 hover:bg-primary-500 text-white font-semibold
                          rounded-xl px-6 py-3 flex items-center justify-center gap-2
                          transition-all duration-300 group">
                  <lucide-icon name="search" [size]="18"></lucide-icon>
                  <span class="hidden sm:inline text-sm">Rechercher</span>
                  <lucide-icon name="arrow-right" [size]="16"
                               class="hidden sm:inline group-hover:translate-x-0.5
                                      transition-transform"></lucide-icon>
                </a>
              </div>
            </div>

            <!-- Trust stats -->
            <div class="flex items-center gap-6 sm:gap-8">
              <div>
                <div class="text-2xl font-bold shimmer-text">
                  {{ vehicles().length || 11 }}
                </div>
                <div class="text-xs text-ink-500 uppercase tracking-wider font-medium mt-0.5">
                  Voitures
                </div>
              </div>
              <div class="h-8 w-px bg-gray-200"></div>
              <div>
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-bold text-ink-900">4.9</span>
                  <lucide-icon name="star" [size]="14"
                               class="text-primary-500 fill-current"></lucide-icon>
                </div>
                <div class="text-xs text-ink-500 uppercase tracking-wider font-medium mt-0.5">
                  Note moyenne
                </div>
              </div>
              <div class="h-8 w-px bg-gray-200"></div>
              <div>
                <div class="text-2xl font-bold text-ink-900">500+</div>
                <div class="text-xs text-ink-500 uppercase tracking-wider font-medium mt-0.5">
                  Clients
                </div>
              </div>
            </div>
          </div>

          <!-- ═══ RIGHT: Big premium car carousel (7 cols) ═══ -->
          <div class="lg:col-span-7 animate-fade-up" style="animation-delay: 200ms;">
            <div class="relative h-[420px] sm:h-[500px] lg:h-[560px] xl:h-[600px]">
              <app-car-carousel [slides]="heroCars"></app-car-carousel>
            </div>
          </div>

        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-6 left-1/2 -translate-x-1/2
                  flex flex-col items-center gap-2 text-ink-500 animate-bounce">
        <span class="text-[10px] uppercase tracking-[0.2em] font-medium">Découvrir</span>
        <lucide-icon name="chevron-down" [size]="16"></lucide-icon>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- LIVE STATS BAR                                                -->
    <!-- ============================================================ -->
    <section class="bg-ink-900 border-b border-ink-800 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div class="text-center" appFadeIn>
            <div class="text-3xl sm:text-4xl font-bold text-white mb-1">
              <span [appCountUp]="500" suffix="+">0+</span>
            </div>
            <p class="text-xs sm:text-sm text-white/60 uppercase tracking-wider">
              Clients satisfaits
            </p>
          </div>
          <div class="text-center" appFadeIn>
            <div class="text-3xl sm:text-4xl font-bold text-primary-400 mb-1">
              <span [appCountUp]="vehicles().length || 50">0</span>
            </div>
            <p class="text-xs sm:text-sm text-white/60 uppercase tracking-wider">
              Voitures disponibles
            </p>
          </div>
          <div class="text-center" appFadeIn>
            <div class="text-3xl sm:text-4xl font-bold text-white mb-1">
              24<span class="text-primary-400">/</span>7
            </div>
            <p class="text-xs sm:text-sm text-white/60 uppercase tracking-wider">
              Service disponible
            </p>
          </div>
          <div class="text-center" appFadeIn>
            <div class="text-3xl sm:text-4xl font-bold text-white mb-1
                        flex items-center justify-center gap-1">
              4.9
              <lucide-icon name="star" [size]="24" class="text-primary-400"></lucide-icon>
            </div>
            <p class="text-xs sm:text-sm text-white/60 uppercase tracking-wider">
              Note moyenne
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- FEATURED CARS                                                 -->
    <!-- ============================================================ -->
    <section class="py-20 sm:py-24" appFadeIn>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-10">
          <div>
            <span class="text-xs font-semibold text-primary-600 uppercase
                         tracking-wider mb-3 block">Notre sélection</span>
            <h2 class="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
              Des voitures qui vous ressemblent
            </h2>
          </div>
          <a routerLink="/voitures"
             class="hidden sm:flex items-center gap-2 text-sm font-semibold
                    text-primary-600 hover:text-primary-700 group">
            Tout voir
            <lucide-icon name="arrow-right" [size]="16"
                         class="group-hover:translate-x-1 transition-transform">
            </lucide-icon>
          </a>
        </div>

        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            @for (i of [1,2,3,4]; track i) {
              <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
                <div class="aspect-[4/3] bg-gray-100"></div>
                <div class="p-4 space-y-3">
                  <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            @for (vehicle of featuredVehicles(); track vehicle.id) {
              <app-car-card [vehicle]="vehicle"></app-car-card>
            }
          </div>
        }
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- BENTO GRID — WHY CHOOSE US                                    -->
    <!-- ============================================================ -->
    <section class="py-20 sm:py-24 bg-surface-50 border-y border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-14" appFadeIn>
          <span class="text-xs font-semibold text-primary-600 uppercase
                       tracking-wider mb-3 block">L'expérience PATERI CAR</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
            Pensé pour vous simplifier la vie
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[260px]">

          <!-- Big card 2×2 -->
          <div class="md:col-span-2 md:row-span-2 bg-ink-900 text-white
                      rounded-3xl p-8 sm:p-10 flex flex-col justify-between
                      relative overflow-hidden group" appFadeIn>
            <div>
              <div class="w-12 h-12 bg-primary-500/20 rounded-xl
                          flex items-center justify-center mb-6">
                <lucide-icon name="shield-check" [size]="24" class="text-primary-400"></lucide-icon>
              </div>
              <h3 class="text-2xl sm:text-3xl font-bold mb-3 max-w-md">
                Une flotte récente, contrôlée et assurée
              </h3>
              <p class="text-white/70 max-w-md leading-relaxed">
                Toutes nos voitures ont moins de 3 ans, sont entretenues
                régulièrement et entièrement assurées. Aucune mauvaise
                surprise, juste la route.
              </p>
            </div>
            <div class="flex items-center gap-2 text-primary-400
                        font-semibold text-sm group-hover:gap-3 transition-all">
              En savoir plus
              <lucide-icon name="arrow-right" [size]="16"></lucide-icon>
            </div>
            <div class="absolute -bottom-20 -right-20 w-64 h-64
                        bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          <!-- Tag card -->
          <div class="bg-white border border-gray-200 rounded-3xl p-6
                      flex flex-col justify-between hover:border-primary-500
                      transition-colors" appFadeIn>
            <div class="w-10 h-10 bg-primary-50 rounded-lg flex items-center
                        justify-center mb-4">
              <lucide-icon name="tag" [size]="20" class="text-primary-600"></lucide-icon>
            </div>
            <div>
              <h3 class="font-semibold text-ink-900 mb-2">Prix transparents</h3>
              <p class="text-sm text-ink-500 leading-relaxed">
                Le prix affiché est le prix final. Pas de frais cachés.
              </p>
            </div>
          </div>

          <!-- Teal clock card -->
          <div class="bg-primary-500 text-white rounded-3xl p-6
                      flex flex-col justify-between" appFadeIn>
            <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center
                        justify-center mb-4">
              <lucide-icon name="clock" [size]="20" class="text-white"></lucide-icon>
            </div>
            <div>
              <h3 class="font-semibold mb-2">Service 24/7</h3>
              <p class="text-sm text-white/80 leading-relaxed">
                Notre équipe disponible à tout moment.
              </p>
            </div>
          </div>

          <!-- Wide payment card -->
          <div class="md:col-span-3 bg-white border border-gray-200
                      rounded-3xl p-6 sm:p-8 flex items-center justify-between
                      gap-6 hover:border-primary-500 transition-colors" appFadeIn>
            <div class="flex items-center gap-5">
              <div class="w-12 h-12 bg-primary-50 rounded-xl flex items-center
                          justify-center flex-shrink-0">
                <lucide-icon name="banknote" [size]="22" class="text-primary-600"></lucide-icon>
              </div>
              <div>
                <h3 class="font-semibold text-ink-900 mb-1 text-lg">
                  Paiement flexible à la remise
                </h3>
                <p class="text-sm text-ink-500">
                  Espèces, virement bancaire ou chèque. Vous choisissez.
                </p>
              </div>
            </div>
            <a routerLink="/voitures"
               class="hidden sm:inline-flex items-center gap-2 text-sm
                      font-semibold text-primary-600 hover:text-primary-700">
              Réserver
              <lucide-icon name="arrow-right" [size]="16"></lucide-icon>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- CATEGORIES — IMAGE CARDS                                      -->
    <!-- ============================================================ -->
    <section class="py-20 sm:py-24" appFadeIn>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="text-xs font-semibold text-primary-600 uppercase
                       tracking-wider mb-3 block">Trouvez votre style</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
            Explorer par catégorie
          </h2>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          @for (cat of categories; track cat.key) {
            <a [routerLink]="['/voitures']" [queryParams]="{category: cat.key}"
               class="group relative aspect-[3/4] rounded-2xl overflow-hidden
                      cursor-pointer block">
              <img [src]="cat.image" [alt]="cat.label"
                   class="w-full h-full object-cover group-hover:scale-110
                          transition-transform duration-700"
                   loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-ink-900/90
                          via-ink-900/30 to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4">
                <h3 class="text-white font-semibold text-base mb-1">{{ cat.label }}</h3>
                <p class="text-white/70 text-xs flex items-center gap-1
                          group-hover:gap-2 transition-all">
                  Découvrir
                  <lucide-icon name="arrow-right" [size]="12"></lucide-icon>
                </p>
              </div>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- HOW IT WORKS — DARK TIMELINE                                  -->
    <!-- ============================================================ -->
    <section class="py-20 sm:py-24 bg-ink-900 text-white" appFadeIn>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <span class="text-xs font-semibold text-primary-400 uppercase
                       tracking-wider mb-3 block">Comment ça marche</span>
          <h2 class="text-3xl sm:text-4xl font-bold tracking-tight">
            Quatre étapes, votre voiture
          </h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div class="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%]
                      h-px bg-gradient-to-r from-primary-500/30 via-primary-500
                      to-primary-500/30"></div>

          @for (step of steps; track step.number) {
            <div class="relative text-center" appFadeIn>
              <div class="relative z-10 w-14 h-14 bg-primary-500 text-white
                          rounded-full flex items-center justify-center
                          font-bold text-xl mx-auto mb-5 ring-4 ring-ink-900">
                {{ step.number }}
              </div>
              <h3 class="font-semibold text-lg mb-2">{{ step.title }}</h3>
              <p class="text-sm text-white/60 leading-relaxed">{{ step.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- TESTIMONIALS                                                   -->
    <!-- ============================================================ -->
    <section class="py-20 sm:py-24 relative overflow-hidden">
      <div class="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1920&q=80"
             alt="" class="w-full h-full object-cover" loading="lazy" />
        <div class="absolute inset-0 bg-white/95"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" appFadeIn>
        <div class="text-center max-w-2xl mx-auto mb-12">
          <span class="text-xs font-semibold text-primary-600 uppercase
                       tracking-wider mb-3 block">Témoignages</span>
          <h2 class="text-3xl sm:text-4xl font-bold text-ink-900 tracking-tight">
            Ce que nos clients disent
          </h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (t of testimonials; track t.name) {
            <div class="bg-white border border-gray-200 rounded-2xl p-6
                        hover:border-primary-500 hover:-translate-y-1
                        transition-all duration-300">
              <div class="flex gap-0.5 mb-4">
                @for (s of [1,2,3,4,5]; track s) {
                  <lucide-icon name="star" [size]="14" class="text-primary-500"></lucide-icon>
                }
              </div>
              <p class="text-ink-700 leading-relaxed mb-6 text-sm">"{{ t.text }}"</p>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary-50 text-primary-700
                            rounded-full flex items-center justify-center
                            font-semibold text-sm flex-shrink-0">
                  {{ t.initials }}
                </div>
                <div>
                  <p class="font-semibold text-ink-900 text-sm">{{ t.name }}</p>
                  <p class="text-xs text-ink-500">{{ t.role }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- CTA — IMAGE BACKGROUND                                        -->
    <!-- ============================================================ -->
    <section class="py-20 sm:py-24" appFadeIn>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative rounded-3xl overflow-hidden">
          <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
               alt="" class="absolute inset-0 w-full h-full object-cover"
               loading="lazy" />
          <div class="absolute inset-0 bg-gradient-to-r from-ink-900/95 to-ink-900/70"></div>

          <div class="relative px-8 sm:px-14 py-14 sm:py-20 max-w-2xl">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white
                       mb-4 tracking-tight">
              Prêt à prendre la route ?
            </h2>
            <p class="text-lg text-white/80 mb-8">
              Découvrez notre flotte complète et trouvez la voiture parfaite
              pour votre prochain voyage à travers le Maroc.
            </p>
            <div class="flex flex-col sm:flex-row gap-3">
              <a routerLink="/voitures"
                 class="inline-flex items-center justify-center gap-2
                        bg-primary-500 hover:bg-primary-600 text-white
                        font-semibold px-7 py-3.5 rounded-lg transition-colors">
                Voir nos voitures
                <lucide-icon name="arrow-right" [size]="18"></lucide-icon>
              </a>
              <a class="inline-flex items-center justify-center gap-2
                        glass text-white border border-white/30
                        hover:bg-white/10 font-semibold px-7 py-3.5
                        rounded-lg transition-colors cursor-pointer">
                <lucide-icon name="phone" [size]="18"></lucide-icon>
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent {
  private vehicleService = inject(VehicleService);

  vehicles  = signal<Vehicle[]>([]);
  loading   = signal(true);

  featuredVehicles = computed(() =>
    this.vehicles().filter(v => v.status === 'AVAILABLE').slice(0, 4)
  );

  heroCars: CarSlide[] = [
    {
      id: 1, brand: 'Renault', name: 'Clio 5',
      image: 'assets/cars/clio5.png',
      category: 'Compacte', transmission: 'Manuelle', fuel: 'Essence',
      pricePerDay: 280,
    },
    {
      id: 2, brand: 'Peugeot', name: '208',
      image: 'assets/cars/208.png',
      category: 'Compacte', transmission: 'Manuelle', fuel: 'Essence',
      pricePerDay: 300,
    },
    {
      id: 3, brand: 'Dacia', name: 'Logan',
      image: 'assets/cars/dacia.png',
      category: 'Économique', transmission: 'Manuelle', fuel: 'Essence',
      pricePerDay: 200,
    },
    {
      id: 4, brand: 'Opel', name: 'Corsa',
      image: 'assets/cars/opel.png',
      category: 'Compacte', transmission: 'Manuelle', fuel: 'Essence',
      pricePerDay: 290,
    },
  ];

  categories = [
    { key: 'ECONOMY',     label: 'Économique',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80' },
    { key: 'COMPACT',     label: 'Compacte',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80' },
    { key: 'SUV',         label: 'SUV',
      image: 'https://images.unsplash.com/photo-1567343483496-bb5c12bd1d96?w=600&q=80' },
    { key: 'LUXURY',      label: 'Premium',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80' },
    { key: 'VAN',         label: 'Utilitaire',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80' },
    { key: 'CONVERTIBLE', label: 'Cabriolet',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80' },
  ];

  steps = [
    { number: 1, title: 'Choisissez',
      description: 'Parcourez notre catalogue et trouvez votre voiture.' },
    { number: 2, title: 'Réservez',
      description: 'Sélectionnez vos dates et options en ligne.' },
    { number: 3, title: 'Confirmation',
      description: "Notre équipe vous contacte pour finaliser." },
    { number: 4, title: 'Roulez',
      description: "Récupérez votre voiture et profitez du voyage." },
  ];

  testimonials = [
    { name: 'Karim El Mansouri', initials: 'KM', role: 'Client depuis 2024',
      text: "Service impeccable, voiture en parfait état. Je recommande vivement PATERI CAR pour la location à Taza." },
    { name: 'Fatima Zahra', initials: 'FZ', role: 'Cliente régulière',
      text: "Tarifs très compétitifs et personnel à l'écoute. La réservation en ligne est super simple." },
    { name: 'Youssef Bennani', initials: 'YB', role: "Voyage d'affaires",
      text: "Voiture livrée à l'heure, sans frais cachés. Exactement ce que je cherchais pour mes déplacements." },
  ];

  constructor() {
    this.vehicleService.getAllVehicles().subscribe({
      next: (data) => { this.vehicles.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
