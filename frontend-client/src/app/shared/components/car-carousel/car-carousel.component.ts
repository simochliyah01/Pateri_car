import {
  Component, Input, OnInit, OnDestroy, signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface CarSlide {
  id: number;
  name: string;
  brand: string;
  image: string;
  pricePerDay: number;
  category: string;
  fuel: string;
  transmission: string;
}

@Component({
  selector: 'app-car-carousel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .car-floor-shadow {
      position: absolute;
      bottom: 4%;
      left: 50%;
      transform: translateX(-50%);
      width: 65%;
      height: 28px;
      background: radial-gradient(
        ellipse at center,
        rgba(0,0,0,0.22) 0%,
        rgba(0,0,0,0.10) 40%,
        rgba(0,0,0,0) 70%
      );
      filter: blur(8px);
      z-index: 1;
    }
  `],
  template: `
    <div class="relative w-full h-full flex flex-col items-center justify-center"
         (mouseenter)="pause()"
         (mouseleave)="resume()">

      <!-- Top label -->
      <div class="text-center mb-4">
        <p class="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
          Notre flotte
        </p>
        <p class="text-sm text-ink-500">{{ slides.length }} voitures disponibles</p>
      </div>

      <!-- Carousel viewport -->
      <div class="relative w-full max-w-lg" style="aspect-ratio: 4/3;">

        @for (car of slides; track car.id; let i = $index) {
          <div class="absolute inset-0 flex items-end justify-center
                      transition-opacity duration-700 ease-in-out"
               [style.opacity]="i === currentIndex() ? '1' : '0'"
               [style.pointer-events]="i === currentIndex() ? 'auto' : 'none'">

            <!-- Elliptical floor shadow -->
            <div class="car-floor-shadow"></div>

            <!-- Car image -->
            <img [src]="car.image"
                 [alt]="car.brand + ' ' + car.name"
                 class="relative z-10 max-w-[88%] max-h-[82%] object-contain
                        select-none"
                 style="filter: drop-shadow(0 18px 18px rgba(0,0,0,0.14))
                                drop-shadow(0 6px 10px rgba(0,0,0,0.08));"
                 draggable="false" />
          </div>
        }
      </div>

      <!-- Car info -->
      <div class="mt-5 text-center" style="min-height: 88px;">
        <h3 class="text-xl font-bold text-ink-900 mb-0.5">
          {{ currentSlide().brand }} {{ currentSlide().name }}
        </h3>
        <p class="text-xs text-ink-500 mb-2">
          {{ currentSlide().category }} · {{ currentSlide().transmission }} · {{ currentSlide().fuel }}
        </p>
        <div class="inline-flex items-baseline gap-1">
          <span class="text-2xl font-bold text-primary-600">
            {{ currentSlide().pricePerDay }}
          </span>
          <span class="text-sm text-ink-500">DH/jour</span>
        </div>
      </div>

      <!-- Dot indicators -->
      <div class="flex items-center gap-2 mt-5">
        @for (car of slides; track car.id; let i = $index) {
          <button (click)="goTo(i)"
                  class="h-2 rounded-full transition-all duration-300 hover:bg-primary-400"
                  [class.w-8]="i === currentIndex()"
                  [class.bg-primary-500]="i === currentIndex()"
                  [class.w-2]="i !== currentIndex()"
                  [class.bg-gray-300]="i !== currentIndex()">
          </button>
        }
      </div>

      <!-- Left arrow -->
      <button (click)="prev()"
              class="absolute left-0 top-1/2 -translate-y-1/2
                     w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm
                     border border-gray-200 shadow-sm
                     flex items-center justify-center
                     opacity-0 hover:opacity-100 transition-opacity duration-200">
        <lucide-icon name="chevron-left" [size]="18" class="text-ink-700"></lucide-icon>
      </button>

      <!-- Right arrow -->
      <button (click)="next()"
              class="absolute right-0 top-1/2 -translate-y-1/2
                     w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm
                     border border-gray-200 shadow-sm
                     flex items-center justify-center
                     opacity-0 hover:opacity-100 transition-opacity duration-200">
        <lucide-icon name="chevron-right" [size]="18" class="text-ink-700"></lucide-icon>
      </button>
    </div>
  `,
})
export class CarCarouselComponent implements OnInit, OnDestroy {
  @Input() slides: CarSlide[] = [];
  @Input() autoRotateMs = 4000;

  currentIndex = signal(0);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isPaused = false;

  currentSlide(): CarSlide {
    return this.slides[this.currentIndex()] ?? this.slides[0];
  }

  ngOnInit() {
    this.intervalId = setInterval(() => {
      if (!this.isPaused) this.next();
    }, this.autoRotateMs);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  pause()  { this.isPaused = true;  }
  resume() { this.isPaused = false; }

  next() {
    this.currentIndex.update(i => (i + 1) % this.slides.length);
  }

  prev() {
    this.currentIndex.update(i => (i === 0 ? this.slides.length - 1 : i - 1));
  }

  goTo(index: number) {
    this.currentIndex.set(index);
  }
}
