import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-taza-map',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @keyframes pulse-ring {
      0%   { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    .animate-pulse-ring {
      animation: pulse-ring 2.2s ease-out infinite;
    }
  `],
  template: `
    <div class="relative w-full h-full bg-primary-50/40 rounded-xl
                overflow-hidden border border-primary-100">

      <!-- Road pattern -->
      <div class="absolute inset-0" style="background-image:
        linear-gradient(45deg,  transparent 48%, rgba(20,184,166,0.18) 49%, rgba(20,184,166,0.18) 51%, transparent 52%),
        linear-gradient(-30deg, transparent 48%, rgba(20,184,166,0.12) 49%, rgba(20,184,166,0.12) 51%, transparent 52%),
        linear-gradient(80deg,  transparent 48%, rgba(20,184,166,0.14) 49%, rgba(20,184,166,0.14) 51%, transparent 52%),
        linear-gradient(120deg, transparent 48%, rgba(20,184,166,0.10) 49%, rgba(20,184,166,0.10) 51%, transparent 52%);">
      </div>

      <!-- Cardinal indicator -->
      <div class="absolute top-3 right-3 text-[10px] text-ink-500 font-medium tracking-wider select-none">
        N ↑
      </div>

      <!-- City name -->
      <div class="absolute bottom-3 left-3 text-[10px] font-semibold
                  text-primary-700 tracking-widest uppercase select-none">
        Taza
      </div>

      <!-- Secondary location dots -->
      <div class="absolute w-2 h-2 rounded-full bg-primary-400/50" style="top:25%;left:30%"></div>
      <div class="absolute w-2 h-2 rounded-full bg-primary-400/50" style="top:65%;left:75%"></div>
      <div class="absolute w-2 h-2 rounded-full bg-primary-400/50" style="top:30%;left:70%"></div>
      <div class="absolute w-2 h-2 rounded-full bg-primary-400/50" style="top:70%;left:25%"></div>

      <!-- Animated main pin -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <!-- Pulse ring -->
        <div class="absolute w-8 h-8 rounded-full bg-primary-500/25 -inset-0
                    animate-pulse-ring"></div>
        <!-- Pin body -->
        <div class="relative w-8 h-8 rounded-full bg-primary-500
                    border-4 border-white shadow-lg z-10"></div>
        <!-- Tooltip -->
        <div class="absolute -top-10 left-1/2 -translate-x-1/2
                    bg-ink-900 text-white text-[10px] font-medium
                    px-2.5 py-1 rounded-md whitespace-nowrap z-20 select-none">
          Vous êtes ici
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2
                      w-2 h-2 bg-ink-900 rotate-45"></div>
        </div>
      </div>
    </div>
  `,
})
export class TazaMapComponent {}
