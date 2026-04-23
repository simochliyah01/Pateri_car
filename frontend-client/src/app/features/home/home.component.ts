import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { VehicleService } from '../../core/services/vehicle.service';
import { Vehicle } from '../../core/models/vehicle.model';
import { CarCardComponent } from '../../shared/components/car-card/car-card.component';

interface Category {
  key: string;
  label: string;
  icon: string;
}

interface Step {
  number: number;
  title: string;
  description: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, CarCardComponent],
  template: `
    <!-- HERO SECTION -->
    <section class="bg-surface-50 border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div class="text-center max-w-3xl mx-auto">
          <span class="inline-block px-3 py-1 rounded-full bg-primary-50
                       text-primary-700 text-xs font-medium mb-6">
            Service de location à Taza
          </span>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold
                     tracking-tight text-ink-900 mb-4">
            Location de voitures<br>
            <span class="text-primary-500">simple et fiable</span>
          </h1>
          <p class="text-lg text-ink-500 mb-8 max-w-2xl mx-auto">
            Réservez votre voiture en quelques clics. Tarifs transparents,
            assurance incluse, service 24/7.
          </p>
        </div>

        <!-- Search bar -->
        <div class="max-w-4xl mx-auto bg-white border border-gray-200
                    rounded-xl p-4 sm:p-5">
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div class="sm:col-span-1">
              <label class="block text-xs font-medium text-ink-500 mb-1.5">
                Lieu de retrait
              </label>
              <select class="input-field text-sm">
                <option>Agence Taza</option>
                <option>Gare ferroviaire</option>
                <option>Livraison domicile</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-500 mb-1.5">
                Date départ
              </label>
              <input type="date" class="input-field text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-ink-500 mb-1.5">
                Date retour
              </label>
              <input type="date" class="input-field text-sm" />
            </div>
            <div class="flex items-end">
              <a routerLink="/voitures"
                 class="btn-primary w-full text-sm flex items-center
                        justify-center gap-2">
                <lucide-icon name="search" [size]="16"></lucide-icon>
                Rechercher
              </a>
            </div>
          </div>
        </div>

        <!-- Trust badges -->
        <div class="flex flex-wrap items-center justify-center gap-6
                    mt-8 text-sm text-ink-500">
          <span class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
            500+ clients satisfaits
          </span>
          <span class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
            Assurance incluse
          </span>
          <span class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
            Service 24/7
          </span>
        </div>
      </div>
    </section>

    <!-- FEATURED CARS -->
    <section class="py-16 sm:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-8">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-ink-900 mb-2">
              Voitures disponibles
            </h2>
            <p class="text-ink-500">
              Notre sélection du moment — réservez en quelques clics
            </p>
          </div>
          <a routerLink="/voitures"
             class="hidden sm:flex items-center gap-1 text-sm
                    font-medium text-primary-600 hover:text-primary-700">
            Voir tout
            <lucide-icon name="arrow-right" [size]="16"></lucide-icon>
          </a>
        </div>

        @if (loading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (i of [1,2,3,4]; track i) {
              <div class="bg-white border border-gray-200 rounded-xl
                          overflow-hidden animate-pulse">
                <div class="aspect-[4/3] bg-gray-100"></div>
                <div class="p-4 space-y-3">
                  <div class="h-4 bg-gray-100 rounded w-3/4"></div>
                  <div class="h-3 bg-gray-100 rounded w-1/2"></div>
                  <div class="h-3 bg-gray-100 rounded w-2/3"></div>
                </div>
              </div>
            }
          </div>
        } @else if (error()) {
          <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p class="text-red-700 font-medium">Erreur de chargement</p>
            <p class="text-sm text-red-600 mt-1">{{ error() }}</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (vehicle of featuredVehicles(); track vehicle.id) {
              <app-car-card [vehicle]="vehicle"></app-car-card>
            }
          </div>
        }
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="py-16 sm:py-20 bg-surface-50 border-y border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold text-ink-900 mb-3">
            Explorer par catégorie
          </h2>
          <p class="text-ink-500">
            Trouvez la voiture qui correspond à votre besoin
          </p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          @for (cat of categories; track cat.key) {
            <a [routerLink]="['/voitures']" [queryParams]="{ category: cat.key }"
               class="bg-white border border-gray-200 rounded-xl p-5
                      hover:border-primary-500 transition-colors text-center
                      group cursor-pointer">
              <lucide-icon [name]="cat.icon" [size]="28"
                           class="mx-auto mb-3 text-ink-500
                                  group-hover:text-primary-600
                                  transition-colors"></lucide-icon>
              <p class="text-sm font-medium text-ink-900">{{ cat.label }}</p>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- WHY CHOOSE US -->
    <section class="py-16 sm:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold text-ink-900 mb-3">
            Pourquoi nous choisir
          </h2>
          <p class="text-ink-500">
            Une expérience de location pensée pour vous simplifier la vie
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (feature of features; track feature.title) {
            <div class="card-hover">
              <div class="w-10 h-10 bg-primary-50 rounded-lg flex
                          items-center justify-center mb-4">
                <lucide-icon [name]="feature.icon" [size]="20"
                             class="text-primary-600"></lucide-icon>
              </div>
              <h3 class="font-semibold text-ink-900 mb-2">{{ feature.title }}</h3>
              <p class="text-sm text-ink-500 leading-relaxed">
                {{ feature.description }}
              </p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="py-16 sm:py-20 bg-surface-50 border-y border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold text-ink-900 mb-3">
            Comment ça marche
          </h2>
          <p class="text-ink-500">
            Quatre étapes simples pour avoir votre voiture
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (step of steps; track step.number) {
            <div class="text-center">
              <div class="w-12 h-12 bg-primary-500 text-white rounded-full
                          flex items-center justify-center font-bold text-lg
                          mx-auto mb-4">
                {{ step.number }}
              </div>
              <h3 class="font-semibold text-ink-900 mb-2">{{ step.title }}</h3>
              <p class="text-sm text-ink-500 leading-relaxed">
                {{ step.description }}
              </p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- CTA BANNER -->
    <section class="py-16 sm:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-primary-500 rounded-2xl p-10 sm:p-14 text-center">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Prêt à prendre la route ?
          </h2>
          <p class="text-primary-50 text-lg mb-8 max-w-2xl mx-auto">
            Découvrez notre flotte complète et trouvez la voiture parfaite
            pour votre prochain voyage.
          </p>
          <a routerLink="/voitures"
             class="inline-flex items-center gap-2 bg-white text-primary-700
                    hover:bg-primary-50 font-semibold px-6 py-3 rounded-lg
                    transition-colors">
            Voir nos voitures
            <lucide-icon name="arrow-right" [size]="18"></lucide-icon>
          </a>
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent {
  private vehicleService = inject(VehicleService);

  vehicles  = signal<Vehicle[]>([]);
  loading   = signal(true);
  error     = signal<string | null>(null);

  featuredVehicles = computed(() =>
    this.vehicles().filter(v => v.status === 'AVAILABLE').slice(0, 4)
  );

  categories: Category[] = [
    { key: 'ECONOMY',     label: 'Économique', icon: 'wallet'    },
    { key: 'COMPACT',     label: 'Compacte',   icon: 'car'       },
    { key: 'SUV',         label: 'SUV',         icon: 'truck'     },
    { key: 'LUXURY',      label: 'Premium',     icon: 'sparkles'  },
    { key: 'VAN',         label: 'Utilitaire',  icon: 'package'   },
    { key: 'CONVERTIBLE', label: 'Cabriolet',   icon: 'car-front' },
  ];

  features: Feature[] = [
    {
      icon: 'tag',
      title: 'Prix transparents',
      description: 'Aucun frais caché. Le prix affiché est le prix final, tout inclus.',
    },
    {
      icon: 'clock',
      title: 'Service 24/7',
      description: 'Notre équipe est disponible à tout moment pour vous assister en cas de besoin.',
    },
    {
      icon: 'shield-check',
      title: 'Flotte récente',
      description: 'Toutes nos voitures ont moins de 3 ans, entretenues et contrôlées régulièrement.',
    },
  ];

  steps: Step[] = [
    {
      number: 1,
      title: 'Choisissez votre voiture',
      description: 'Parcourez notre catalogue et trouvez la voiture qui vous convient.',
    },
    {
      number: 2,
      title: 'Réservez en ligne',
      description: 'Sélectionnez vos dates et options, puis envoyez votre demande.',
    },
    {
      number: 3,
      title: 'Confirmation rapide',
      description: 'Notre équipe vous contacte pour confirmer et finaliser la réservation.',
    },
    {
      number: 4,
      title: 'Récupérez votre voiture',
      description: "Présentez-vous à l'agence le jour J et payez sur place.",
    },
  ];

  constructor() {
    this.vehicleService.getAllVehicles().subscribe({
      next: (data) => {
        this.vehicles.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Erreur de chargement');
        this.loading.set(false);
      },
    });
  }
}
