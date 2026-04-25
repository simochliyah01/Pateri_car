import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <h1 class="text-3xl font-bold mb-2">Vehicle Detail Page</h1>
      <p class="text-ink-500">
        Vehicle Detail Page for id: {{ id() }} — Prompt 5/5.
      </p>
    </div>
  `,
})
export class VehicleDetailComponent {
  private route = inject(ActivatedRoute);
  id = signal<string | null>(null);

  constructor() {
    this.id.set(this.route.snapshot.paramMap.get('id'));
  }
}
