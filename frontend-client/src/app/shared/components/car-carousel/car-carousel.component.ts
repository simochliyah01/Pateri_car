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
    <div class="relative w-full h-full"
         (mouseenter)="pause()"
         (mouseleave)="resume()">

      <!-- ═══ PREMIUM CARD CONTAINER ═══ -->
      <div class="relative w-full h-full bg-white/40 backdrop-blur-sm
                  rounded-3xl border border-white/60 overflow-hidden
                  shadow-[0_20px_60px_-15px_rgba(20,184,166,0.15)]">

        <!-- Subtle inner gradient -->
        <div class="absolute inset-0 bg-gradient-to-br
                    from-primary-50/50 via-transparent to-primary-100/30
                    pointer-events-none"></div>

        <!-- ═══ TOP HEADER ROW ═══ -->
        <div class="absolute top-0 left-0 right-0 p-6 sm:p-7
                    flex items-start justify-between z-20">
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-bold tracking-[0.25em]
                      text-primary-600 uppercase mb-2">
              Notre flotte
            </p>
            <h3 class="text-2xl sm:text-3xl font-bold text-ink-900
                       tracking-tight leading-tight transition-all
                       duration-500 ease-out truncate">
              {{ currentSlide().brand }}
              <span class="text-primary-500">{{ currentSlide().name }}</span>
            </h3>
          </div>

          <!-- Price (top right) -->
          <div class="text-right ml-4 flex-shrink-0">
            <div class="text-[10px] text-ink-500 uppercase
                        tracking-wider font-semibold mb-0.5">
              Dès
            </div>
            <div class="flex items-baseline gap-1 justify-end">
              <span class="text-2xl sm:text-3xl font-bold
                           text-ink-900 leading-none">
                {{ currentSlide().pricePerDay }}
              </span>
              <span class="text-sm font-semibold text-ink-500">DH</span>
            </div>
            <div class="text-[10px] text-ink-500 mt-0.5 font-medium">
              par jour
            </div>
          </div>
        </div>

        <!-- ═══ STATUS PILL (under header, left) ═══ -->
        <div class="absolute top-[88px] sm:top-[100px] left-6 sm:left-7 z-20">
          <div class="inline-flex items-center gap-2 bg-white
                      px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <span class="relative flex">
              <span class="absolute inline-flex h-2 w-2 rounded-full
                           bg-primary-400 opacity-75 animate-ping"></span>
              <span class="relative inline-flex rounded-full h-2 w-2
                           bg-primary-500"></span>
            </span>
            <span class="text-xs font-semibold text-ink-900">
              Disponible maintenant
            </span>
          </div>
        </div>

        <!-- ═══ CATEGORY PILL (under header, right) ═══ -->
        <div class="absolute top-[88px] sm:top-[100px] right-6 sm:right-7 z-20">
          <div class="inline-flex items-center bg-ink-900 text-white
                      px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide">
            {{ currentSlide().category }}
          </div>
        </div>

        <!-- ═══ CAR IMAGE STAGE ═══ -->
        <div class="absolute inset-0 flex items-center justify-center
                    pt-36 pb-20 px-8">

          <!-- Stage glow -->
          <div class="absolute bottom-[18%] left-1/2 -translate-x-1/2
                      w-[60%] aspect-square rounded-full
                      bg-primary-200/30 blur-3xl pointer-events-none"></div>

          <!-- Floor shadow -->
          <div class="absolute bottom-[20%] left-1/2 -translate-x-1/2
                      w-[60%] h-6 rounded-full pointer-events-none"
               style="background: radial-gradient(ellipse at center,
                      rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.12) 45%,
                      rgba(0,0,0,0) 75%); filter: blur(10px);">
          </div>

          <!-- Ambient particles -->
          <div class="absolute top-4 left-8 w-1.5 h-1.5
                      bg-primary-400/60 rounded-full animate-float pointer-events-none"></div>
          <div class="absolute top-12 right-10 w-1 h-1
                      bg-primary-500/40 rounded-full animate-float-delayed pointer-events-none"></div>
          <div class="absolute bottom-8 left-14 w-1 h-1
                      bg-primary-300/60 rounded-full animate-float pointer-events-none"></div>

          <!-- Car images stacked -->
          <div class="relative w-full h-full flex items-center justify-center">
            @for (car of slides; track car.id; let i = $index) {
              <img [src]="car.image"
                   [alt]="car.brand + ' ' + car.name"
                   class="absolute max-w-[90%] max-h-[85%] object-contain
                          transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)]"
                   [class.opacity-100]="i === currentIndex()"
                   [class.opacity-0]="i !== currentIndex()"
                   [class.scale-100]="i === currentIndex()"
                   [class.scale-95]="i !== currentIndex()"
                   [class.pointer-events-none]="i !== currentIndex()"
                   style="filter: drop-shadow(0 25px 25px rgba(0,0,0,0.2))
                                  drop-shadow(0 10px 10px rgba(20,184,166,0.1));" />
            }
          </div>
        </div>

        <!-- ═══ BOTTOM ROW: Specs + Dots ═══ -->
        <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-7
                    bg-gradient-to-t from-white/80 via-white/40 to-transparent">
          <div class="flex items-center justify-between gap-4">

            <!-- Specs -->
            <div class="flex items-center gap-3 text-xs sm:text-sm
                        text-ink-700 font-medium">
              <span class="flex items-center gap-1.5">
                <lucide-icon name="settings-2" [size]="14"
                             class="text-primary-600"></lucide-icon>
                {{ currentSlide().transmission }}
              </span>
              <span class="w-1 h-1 bg-ink-400 rounded-full"></span>
              <span class="flex items-center gap-1.5">
                <lucide-icon name="fuel" [size]="14"
                             class="text-primary-600"></lucide-icon>
                {{ currentSlide().fuel }}
              </span>
            </div>

            <!-- Dot indicators -->
            <div class="flex items-center gap-1.5 flex-shrink-0">
              @for (car of slides; track car.id; let i = $index) {
                <button (click)="goTo(i)"
                        class="h-1.5 rounded-full transition-all
                               duration-500 hover:bg-primary-400"
                        [class.w-7]="i === currentIndex()"
                        [class.bg-primary-500]="i === currentIndex()"
                        [class.w-1\.5]="i !== currentIndex()"
                        [class.bg-gray-300]="i !== currentIndex()">
                </button>
              }
            </div>
          </div>
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
