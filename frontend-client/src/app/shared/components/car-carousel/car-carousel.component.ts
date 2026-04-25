import {
  Component, Input, OnInit, OnDestroy, signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface CarSlide {
  id: number;
  brand: string;
  name: string;
  image: string;
  category: string;
  transmission: string;
  fuel: string;
  pricePerDay: number;
}

@Component({
  selector: 'app-car-carousel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full h-full flex flex-col"
         (mouseenter)="pause()"
         (mouseleave)="resume()">

      <!-- Car image area -->
      <div class="relative flex-1 flex items-end justify-center min-h-[140px]">

        <!-- Floor shadow ellipse -->
        <div class="absolute bottom-1 left-1/2 -translate-x-1/2 w-[68%] h-5 rounded-full"
             style="background: radial-gradient(ellipse at center,
                    rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.07) 45%,
                    rgba(0,0,0,0) 70%); filter: blur(6px);">
        </div>

        @for (car of slides; track car.id; let i = $index) {
          <img [src]="car.image"
               [alt]="car.brand + ' ' + car.name"
               class="absolute bottom-2 max-h-[92%] max-w-[86%] object-contain
                      transition-opacity duration-700 ease-in-out select-none"
               [style.opacity]="i === currentIndex() ? '1' : '0'"
               [style.pointer-events]="i === currentIndex() ? 'auto' : 'none'"
               style="filter: drop-shadow(0 12px 12px rgba(0,0,0,0.10));"
               draggable="false" />
        }
      </div>

      <!-- Car info row -->
      <div class="flex items-center justify-between px-1 pt-3 pb-1">
        <div class="min-w-0">
          <h3 class="text-sm font-semibold text-ink-900 truncate">
            {{ currentSlide().brand }} {{ currentSlide().name }}
          </h3>
          <p class="text-[11px] text-ink-500 mt-0.5 truncate">
            {{ currentSlide().category }} · {{ currentSlide().transmission }} · {{ currentSlide().fuel }}
          </p>
        </div>
        <div class="text-right ml-3 flex-shrink-0">
          <div class="text-lg font-bold text-primary-600 leading-none">
            {{ currentSlide().pricePerDay }} DH
          </div>
          <div class="text-[10px] text-ink-500 mt-0.5">/jour</div>
        </div>
      </div>

      <!-- Dot indicators -->
      <div class="flex items-center justify-center gap-1.5 pt-2.5">
        @for (car of slides; track car.id; let i = $index) {
          <button (click)="goTo(i)"
                  class="h-1.5 rounded-full transition-all duration-300 hover:bg-primary-400"
                  [class.w-6]="i === currentIndex()"
                  [class.bg-primary-500]="i === currentIndex()"
                  [class.w-1.5]="i !== currentIndex()"
                  [class.bg-primary-200]="i !== currentIndex()">
          </button>
        }
      </div>
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
    if (this.slides.length > 1) {
      this.intervalId = setInterval(() => {
        if (!this.isPaused) this.next();
      }, this.autoRotateMs);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  pause()  { this.isPaused = true;  }
  resume() { this.isPaused = false; }

  next() { this.currentIndex.update(i => (i + 1) % this.slides.length); }
  prev() { this.currentIndex.update(i => i === 0 ? this.slides.length - 1 : i - 1); }
  goTo(i: number) { this.currentIndex.set(i); }
}
