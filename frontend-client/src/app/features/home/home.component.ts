import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../core/services/vehicle.service';
import { Vehicle } from '../../core/models/vehicle.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 class="text-3xl font-bold mb-2">Home Page</h1>
      <p class="text-ink-500 mb-8">
        Welcome to PATERI CAR. Hero section coming in Prompt 3/5.
      </p>
      @if (!loading()) {
        <p class="text-sm text-ink-600">
          Backend connected — {{ vehicles().length }} vehicles available.
        </p>
      }
    </div>
  `,
})
export class HomeComponent {
  private vehicleService = inject(VehicleService);
  vehicles = signal<Vehicle[]>([]);
  loading = signal(true);

  constructor() {
    this.vehicleService.getAllVehicles().subscribe({
      next: (data) => { this.vehicles.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
