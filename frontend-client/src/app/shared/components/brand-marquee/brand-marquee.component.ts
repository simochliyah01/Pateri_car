import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Brand {
  name: string;
  logoUrl: string;
}

@Component({
  selector: 'app-brand-marquee',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="bg-gray-50 py-5 border-y border-gray-200 overflow-hidden">

      <!-- Marquee container with fade edges -->
      <div class="relative w-full">

        <!-- Left fade overlay -->
        <div class="absolute left-0 top-0 bottom-0 w-20 sm:w-28 z-10
                    bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent
                    pointer-events-none"></div>

        <!-- Right fade overlay -->
        <div class="absolute right-0 top-0 bottom-0 w-20 sm:w-28 z-10
                    bg-gradient-to-l from-gray-50 via-gray-50/80 to-transparent
                    pointer-events-none"></div>

        <!-- Marquee track (duplicated for seamless loop) -->
        <div class="flex gap-8 sm:gap-12 marquee-track py-2">

          <!-- First copy -->
          @for (brand of brands; track brand.name) {
            <div class="flex-shrink-0 flex items-center justify-center
                        h-10 sm:h-12 w-20 sm:w-24 group">
              <img [src]="brand.logoUrl"
                   [alt]="brand.name"
                   class="max-h-full max-w-full object-contain
                          opacity-80
                          group-hover:opacity-100 group-hover:scale-105
                          transition-all duration-300"
                   loading="lazy" />
            </div>
          }

          <!-- Second copy (seamless infinite loop) -->
          @for (brand of brands; track 'dup-' + brand.name) {
            <div class="flex-shrink-0 flex items-center justify-center
                        h-10 sm:h-12 w-20 sm:w-24 group"
                 aria-hidden="true">
              <img [src]="brand.logoUrl"
                   [alt]=""
                   class="max-h-full max-w-full object-contain
                          opacity-80
                          group-hover:opacity-100 group-hover:scale-105
                          transition-all duration-300"
                   loading="lazy" />
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .marquee-track {
      width: max-content;
      animation: marquee-scroll 35s linear infinite;
    }

    .marquee-track:hover {
      animation-play-state: paused;
    }

    @keyframes marquee-scroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    @media (prefers-reduced-motion: reduce) {
      .marquee-track {
        animation-duration: 70s;
      }
    }
  `],
})
export class BrandMarqueeComponent {
  brands: Brand[] = [
    { name: 'Renault',       logoUrl: 'assets/logo/Renault.png' },
    { name: 'Peugeot',       logoUrl: 'assets/logo/Peugeot.png' },
    { name: 'Dacia',         logoUrl: 'assets/logo/Dacia.png' },
    { name: 'Opel',          logoUrl: 'assets/logo/opel.png' },
    { name: 'Hyundai',       logoUrl: 'assets/logo/hyndai.png' },
    { name: 'BMW',           logoUrl: 'assets/logo/bmw.png' },
    { name: 'Mercedes-Benz', logoUrl: 'assets/logo/mercedes.png' },
    { name: 'Audi',          logoUrl: 'assets/logo/audi.png' },
    { name: 'Ford',          logoUrl: 'assets/logo/ford.png' },
  ];
}
