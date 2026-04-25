import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { VehicleService } from '../../core/services/vehicle.service';
import { Vehicle } from '../../core/models/vehicle.model';
import { CarCardComponent } from '../../shared/components/car-card/car-card.component';
import { CarCarouselComponent, CarSlide } from '../../shared/components/car-carousel/car-carousel.component';
import { TazaMapComponent } from '../../shared/components/taza-map/taza-map.component';
import { FadeInDirective } from '../../shared/directives/fade-in.directive';
import { CountUpDirective } from '../../shared/directives/count-up.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, RouterLink, LucideAngularModule,
    CarCardComponent, CarCarouselComponent, TazaMapComponent,
    FadeInDirective, CountUpDirective,
  ],
  template: `
    <!-- ============================================================ -->
    <!-- HERO — MESH GRADIENT + MAP + CAROUSEL                        -->
    <!-- ============================================================ -->
    <section class="relative bg-mesh-hero border-b border-gray-200
                    overflow-hidden min-h-[88vh] flex items-center">

      <!-- Decorative orbs -->
      <div class="absolute -top-20 -right-20 w-96 h-96 rounded-full
                  bg-primary-100/40 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] rounded-full
                  bg-primary-50/60 blur-3xl pointer-events-none"></div>

      <!-- Dot grid overlay -->
      <div class="absolute inset-0 bg-dot-grid pointer-events-none"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">

          <!-- ── LEFT: Text + search + stats ── -->
          <div>
            <!-- Kicker badge -->
            <div class="inline-flex items-center gap-2 px-3 py-1.5
                        bg-primary-50 border border-primary-200 rounded-full mb-7">
              <span class="w-1.5 h-1.5 bg-primary-500 rounded-full animate-soft-pulse"></span>
              <span class="text-xs font-semibold text-primary-700 uppercase tracking-wider">
                Service à Taza
              </span>
            </div>

            <!-- Headline: strikethrough + italic serif accent -->
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight
                       text-ink-900 mb-5 leading-[1.05]">
              <span class="line-through decoration-primary-500/40 decoration-[3px]
                           text-ink-500 font-normal text-3xl sm:text-4xl lg:text-5xl">
                Louer une voiture
              </span><br>
              c'est <span class="font-serif italic text-primary-500">simple, ici.</span>
            </h1>

            <p class="text-base sm:text-lg text-ink-500 mb-7 max-w-xl leading-relaxed">
              Réservez en quelques clics. Tarifs transparents, assurance incluse,
              service 24/7. Aucune surprise — promis.
            </p>

            <!-- Glass search card -->
            <div class="bg-white/80 backdrop-blur-md border border-primary-100
                        rounded-2xl p-4 sm:p-5 shadow-sm max-w-2xl mb-6">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label class="block text-[10px] font-semibold text-ink-500
                                uppercase tracking-wider mb-1.5">Lieu</label>
                  <select class="w-full px-3 py-2 border border-gray-200 bg-white
                                 rounded-lg text-sm focus:outline-none focus:border-primary-500">
                    <option>Agence Taza</option>
                    <option>Gare ferroviaire</option>
                    <option>Livraison domicile</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-semibold text-ink-500
                                uppercase tracking-wider mb-1.5">Départ</label>
                  <input type="date" class="w-full px-3 py-2 border border-gray-200 bg-white
                                 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
                </div>
                <div>
                  <label class="block text-[10px] font-semibold text-ink-500
                                uppercase tracking-wider mb-1.5">Retour</label>
                  <input type="date" class="w-full px-3 py-2 border border-gray-200 bg-white
                                 rounded-lg text-sm focus:outline-none focus:border-primary-500" />
                </div>
                <div class="col-span-2 sm:col-span-1 flex items-end">
                  <a routerLink="/voitures"
                     class="w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700
                            text-white font-semibold px-4 py-2.5 rounded-lg transition-colors
                            flex items-center justify-center gap-1.5 text-sm">
                    <lucide-icon name="search" [size]="16"></lucide-icon>
                    Rechercher
                  </a>
                </div>
              </div>
            </div>

            <!-- Live stats row -->
            <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-500">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-primary-500 rounded-full animate-soft-pulse"></span>
                <span>
                  <strong class="text-ink-900 font-semibold">{{ vehicles().length || 11 }}</strong> dispos
                </span>
              </div>
              <div class="flex items-center gap-1">
                <strong class="text-ink-900 font-semibold">4.9</strong>
                <lucide-icon name="star" [size]="14" class="text-primary-500"></lucide-icon>
              </div>
              <div>
                <strong class="text-ink-900 font-semibold">500+</strong> clients
              </div>
            </div>
          </div>

          <!-- ── RIGHT: Map + Carousel panel ── -->
          <div>
            <div class="bg-white border border-primary-100 rounded-3xl p-5 shadow-sm">

              <!-- Panel header -->
              <div class="flex items-start justify-between mb-4">
                <div class="inline-flex items-center gap-1.5 bg-primary-50
                            text-primary-700 px-3 py-1 rounded-full text-xs font-medium">
                  <lucide-icon name="map-pin" [size]="12"></lucide-icon>
                  Centre Taza
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-primary-500 leading-none">
                    {{ vehicles().length || 11 }}
                  </div>
                  <div class="text-[10px] text-ink-500 uppercase tracking-wider mt-1">
                    Voitures
                  </div>
                </div>
              </div>

              <!-- Mini Taza map -->
              <div class="h-44 sm:h-52 mb-4">
                <app-taza-map></app-taza-map>
              </div>

              <!-- Car carousel (compact) -->
              <div class="h-52 sm:h-60">
                <app-car-carousel [slides]="heroCars"></app-car-carousel>
              </div>
            </div>
          </div>

        </div>
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
