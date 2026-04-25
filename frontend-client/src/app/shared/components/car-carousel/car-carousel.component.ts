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

      <!-- Premium label header -->
      <div class="flex items-center justify-between mb-6 px-1">
        <div>
          <p class="text-[11px] font-semibold tracking-[0.2em] text-primary-600 uppercase mb-1">
            Notre flotte
          </p>
          <h3 class="text-3xl font-bold text-ink-900 tracking-tight transition-all duration-500 ease-out">
            {{ currentSlide().brand }}
            <span class="text-primary-500">{{ currentSlide().name }}</span>
          </h3>
        </div>
        <div class="text-right">
          <div class="text-[11px] text-ink-500 uppercase tracking-wider mb-0.5 font-medium">
            À partir de
          </div>
          <div class="flex items-baseline gap-1 justify-end">
            <span class="text-3xl font-bold text-ink-900 leading-none">
              {{ currentSlide().pricePerDay }}
            </span>
            <span class="text-sm font-medium text-ink-500">DH</span>
          </div>
          <div class="text-[10px] text-ink-500 mt-0.5">par jour</div>
        </div>
      </div>

      <!-- HERO CAR DISPLAY — the centrepiece -->
      <div class="relative flex-1 flex items-end justify-center
                  min-h-[280px] sm:min-h-[340px] car-stage rounded-3xl overflow-hidden">

        <!-- Floating ambient particles -->
        <div class="absolute top-10 left-10 w-2 h-2 bg-primary-400/40
                    rounded-full animate-float pointer-events-none"></div>
        <div class="absolute top-20 right-12 w-1.5 h-1.5 bg-primary-500/30
                    rounded-full animate-float-delayed pointer-events-none"></div>
        <div class="absolute bottom-32 left-16 w-1 h-1 bg-primary-300/50
                    rounded-full animate-float pointer-events-none"></div>

        <!-- Realistic floor shadow ellipse -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2
                    w-[75%] h-8 rounded-full pointer-events-none"
             style="background: radial-gradient(ellipse at center,
                    rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 40%,
                    rgba(0,0,0,0) 70%); filter: blur(12px);">
        </div>

        <!-- Stacked car images — premium fade + scale -->
        @for (car of slides; track car.id; let i = $index) {
          <img [src]="car.image"
               [alt]="car.brand + ' ' + car.name"
               class="absolute bottom-8 max-h-[80%] max-w-[90%] object-contain
                      transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
               [class.opacity-100]="i === currentIndex()"
               [class.opacity-0]="i !== currentIndex()"
               [class.scale-100]="i === currentIndex()"
               [class.scale-95]="i !== currentIndex()"
               [class.pointer-events-none]="i !== currentIndex()"
               style="filter: drop-shadow(0 30px 30px rgba(0,0,0,0.18))
                              drop-shadow(0 12px 12px rgba(20,184,166,0.08));" />
        }

        <!-- Floating spec chips -->
        <div class="absolute top-6 left-6 glass-premium px-3 py-1.5
                    rounded-full flex items-center gap-2 animate-fade-up">
          <span class="w-1.5 h-1.5 bg-primary-500 rounded-full animate-soft-pulse"></span>
          <span class="text-xs font-medium text-ink-900">Disponible</span>
        </div>

        <div class="absolute top-6 right-6 glass-premium px-3 py-1.5
                    rounded-full text-xs font-medium text-ink-900 animate-fade-up">
          {{ currentSlide().category }}
        </div>
      </div>

      <!-- Bottom: specs + dot indicators -->
      <div class="mt-6 flex items-center justify-between">
        <div class="flex items-center gap-4 text-xs text-ink-500">
          <span class="flex items-center gap-1.5">
            <lucide-icon name="settings-2" [size]="14"></lucide-icon>
            {{ currentSlide().transmission }}
          </span>
          <span class="flex items-center gap-1.5">
            <lucide-icon name="fuel" [size]="14"></lucide-icon>
            {{ currentSlide().fuel }}
          </span>
        </div>

        <div class="flex items-center gap-2">
          @for (car of slides; track car.id; let i = $index) {
            <button (click)="goTo(i)"
                    class="h-1.5 rounded-full transition-all duration-500 hover:bg-primary-400"
                    [class.w-8]="i === currentIndex()"
                    [class.bg-primary-500]="i === currentIndex()"
                    [class.w-1\.5]="i !== currentIndex()"
                    [class.bg-gray-300]="i !== currentIndex()">
            </button>
          }
        </div>
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
