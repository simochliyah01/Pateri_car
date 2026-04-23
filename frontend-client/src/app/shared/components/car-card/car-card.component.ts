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
       class="block bg-white border border-gray-200 rounded-xl overflow-hidden
              hover:border-primary-500 transition-colors group">

      <!-- Image placeholder -->
      <div class="aspect-[4/3] bg-surface-50 flex items-center justify-center
                  border-b border-gray-200 relative">
        <lucide-icon name="car" [size]="64"
                     class="text-gray-300 group-hover:text-primary-400
                            transition-colors"></lucide-icon>

        @if (vehicle.status === 'AVAILABLE') {
          <span class="absolute top-3 left-3 badge badge-success">
            Disponible
          </span>
        } @else if (vehicle.status === 'RENTED') {
          <span class="absolute top-3 left-3 badge badge-warning">
            Louée
          </span>
        }
      </div>

      <!-- Info -->
      <div class="p-4">
        <div class="flex items-start justify-between mb-2">
          <div>
            <h3 class="font-semibold text-ink-900">
              {{ vehicle.brand }} {{ vehicle.model }}
            </h3>
            <p class="text-xs text-ink-500 mt-0.5">{{ vehicle.year }}</p>
          </div>
        </div>

        <!-- Specs -->
        <div class="flex items-center gap-3 text-xs text-ink-500 mb-3">
          <span class="flex items-center gap-1">
            <lucide-icon name="settings-2" [size]="14"></lucide-icon>
            {{ vehicle.transmission === 'AUTOMATIC' ? 'Auto' : 'Manuel' }}
          </span>
          <span class="flex items-center gap-1">
            <lucide-icon name="fuel" [size]="14"></lucide-icon>
            {{ fuelLabel(vehicle.fuelType) }}
          </span>
          <span class="flex items-center gap-1">
            <lucide-icon name="users" [size]="14"></lucide-icon>
            {{ vehicle.seats }}
          </span>
        </div>

        <!-- Price -->
        <div class="flex items-baseline justify-between pt-3
                    border-t border-gray-200">
          <div>
            <span class="text-lg font-bold text-primary-600">
              {{ vehicle.pricePerDay }}
            </span>
            <span class="text-xs text-ink-500 ml-1">DH/jour</span>
          </div>
          <span class="text-xs font-medium text-primary-600
                       group-hover:underline">
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
      PETROL:   'Essence',
      DIESEL:   'Diesel',
      HYBRID:   'Hybride',
      ELECTRIC: 'Électrique',
    };
    return labels[fuel] ?? fuel;
  }
}
