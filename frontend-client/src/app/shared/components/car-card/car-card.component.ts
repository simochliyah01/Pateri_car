import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Vehicle } from '../../../core/models/vehicle.model';

@Component({
  selector: 'app-car-card',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <a [routerLink]="['/voitures', vehicle.id]"
       class="block bg-white border border-gray-200 rounded-2xl shadow-sm
              overflow-hidden hover:shadow-lg hover:-translate-y-1
              hover:border-primary-500 transition-all duration-300 group">

      <!-- Real photo -->
      <div class="aspect-[4/3] overflow-hidden bg-surface-50 relative">
        <img [src]="getImageUrl(vehicle.brand, vehicle.model)"
             [alt]="vehicle.brand + ' ' + vehicle.model"
             class="w-full h-full object-cover group-hover:scale-105
                    transition-transform duration-500"
             loading="lazy" />

        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity"></div>

        @if (vehicle.status === 'AVAILABLE') {
          <span class="absolute top-3 left-3 glass text-ink-900 px-2.5 py-1
                       rounded-md text-xs font-medium flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 bg-primary-500 rounded-full animate-soft-pulse"></span>
            Disponible
          </span>
        } @else if (vehicle.status === 'RENTED') {
          <span class="absolute top-3 left-3 glass text-ink-900 px-2.5 py-1
                       rounded-md text-xs font-medium">
            Louée
          </span>
        }
      </div>

      <!-- Info -->
      <div class="p-4">
        <h3 class="font-semibold text-ink-900">
          {{ vehicle.brand }} {{ vehicle.model }}
        </h3>
        <p class="text-xs text-ink-500 mt-0.5 mb-3">{{ vehicle.year }}</p>

        <!-- Specs -->
        <div class="flex items-center gap-3 text-xs text-ink-500 mb-3">
          <span class="flex items-center gap-1">
            <lucide-icon name="settings-2" [size]="13"></lucide-icon>
            {{ vehicle.transmission === 'AUTO' ? 'Auto' : 'Manuel' }}
          </span>
          <span class="flex items-center gap-1">
            <lucide-icon name="fuel" [size]="13"></lucide-icon>
            {{ fuelLabel(vehicle.fuelType) }}
          </span>
          <span class="flex items-center gap-1">
            <lucide-icon name="users" [size]="13"></lucide-icon>
            {{ vehicle.seats }}
          </span>
        </div>

        <!-- Price -->
        <div class="flex items-baseline justify-between pt-3 border-t border-gray-100">
          <div>
            <span class="text-lg font-bold text-primary-600">
              {{ vehicle.pricePerDay }}
            </span>
            <span class="text-xs text-ink-500 ml-1">DH/jour</span>
          </div>
          <span class="text-xs font-semibold text-primary-600
                       group-hover:underline underline-offset-2">
            Voir →
          </span>
        </div>
      </div>
    </a>
  `,
})
export class CarCardComponent {
  @Input({ required: true }) vehicle!: Vehicle;

  fuelLabel(fuel: string): string {
    const labels: Record<string, string> = {
      ESSENCE:    'Essence',
      DIESEL:     'Diesel',
      HYBRIDE:    'Hybride',
      ELECTRIQUE: 'Électrique',
    };
    return labels[fuel] ?? fuel;
  }

  getImageUrl(brand: string, model: string): string {
    const carImages: Record<string, string> = {
      'Dacia Logan':    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&q=80',
      'Dacia Sandero':  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80',
      'Dacia Duster':   'https://images.unsplash.com/photo-1567343483496-bb5c12bd1d96?w=600&q=80',
      'Renault Clio':   'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80',
      'Renault Captur': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&q=80',
      'Peugeot 208':    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80',
      'Hyundai i20':    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80',
      'Toyota Yaris':   'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&q=80',
    };
    return carImages[`${brand} ${model}`]
      ?? 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80';
  }
}
