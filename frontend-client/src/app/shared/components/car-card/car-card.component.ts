import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Vehicle } from '../../../core/models/vehicle.model';
import { VehicleService } from '../../../core/services/vehicle.service';

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
        <img [src]="imageUrl"
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
  private vehicleService = inject(VehicleService);

  private readonly PLACEHOLDER = 'assets/cars/dacia.png';

  get imageUrl(): string {
    return this.vehicle.hasImage
      ? this.vehicleService.getVehicleImageUrl(this.vehicle.id)
      : this.PLACEHOLDER;
  }

  fuelLabel(fuel: string): string {
    const labels: Record<string, string> = {
      ESSENCE:    'Essence',
      DIESEL:     'Diesel',
      HYBRIDE:    'Hybride',
      ELECTRIQUE: 'Électrique',
    };
    return labels[fuel] ?? fuel;
  }
}
