import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Phone, Mail, MapPin,
  Facebook, Instagram } from 'lucide-angular';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <footer class="bg-ink-900 text-white mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div>
            <div class="mb-3">
              <img src="assets/logo/logo-full.png"
                   alt="PATERI CAR"
                   class="h-10 w-auto bg-white p-2 rounded-md inline-block" />
            </div>
            <p class="text-sm text-gray-400 leading-relaxed">
              Location de voitures à Taza. Tarifs transparents,
              service 24/7, flotte récente.
            </p>
          </div>

          <!-- Quick links -->
          <div>
            <h3 class="text-sm font-semibold mb-4 uppercase tracking-wider">
              Liens rapides
            </h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li><a routerLink="/home" class="hover:text-primary-400 transition-colors">Accueil</a></li>
              <li><a routerLink="/voitures" class="hover:text-primary-400 transition-colors">Nos voitures</a></li>
              <li><a class="hover:text-primary-400 transition-colors cursor-pointer">Services</a></li>
              <li><a class="hover:text-primary-400 transition-colors cursor-pointer">À propos</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="text-sm font-semibold mb-4 uppercase tracking-wider">
              Contact
            </h3>
            <ul class="space-y-3 text-sm text-gray-400">
              <li class="flex items-start gap-2">
                <lucide-icon [img]="MapPin" [size]="16" class="mt-0.5 flex-shrink-0"></lucide-icon>
                <span>{{ settings().address }}, {{ settings().city }}</span>
              </li>
              <li class="flex items-center gap-2">
                <lucide-icon [img]="Phone" [size]="16"></lucide-icon>
                <span>{{ settings().phone }}</span>
              </li>
              <li class="flex items-center gap-2">
                <lucide-icon [img]="Mail" [size]="16"></lucide-icon>
                <span>{{ settings().email }}</span>
              </li>
            </ul>
          </div>

          <!-- Payment methods + social -->
          <div>
            <h3 class="text-sm font-semibold mb-4 uppercase tracking-wider">
              Paiements acceptés
            </h3>
            <p class="text-sm text-gray-400 mb-4">
              Espèces · Virement · Chèque
            </p>
            <h3 class="text-sm font-semibold mb-3 uppercase tracking-wider">
              Suivez-nous
            </h3>
            <div class="flex gap-3">
              <a class="p-2 border border-gray-700 hover:border-primary-400 hover:text-primary-400 rounded-lg transition-colors cursor-pointer">
                <lucide-icon [img]="Facebook" [size]="18"></lucide-icon>
              </a>
              <a class="p-2 border border-gray-700 hover:border-primary-400 hover:text-primary-400 rounded-lg transition-colors cursor-pointer">
                <lucide-icon [img]="Instagram" [size]="18"></lucide-icon>
              </a>
            </div>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="mt-10 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-3">
          <p class="text-xs text-gray-500">
            © 2026 PATERI CAR. Tous droits réservés.
          </p>
          <div class="flex gap-6 text-xs text-gray-500">
            <a class="hover:text-primary-400 transition-colors cursor-pointer">Mentions légales</a>
            <a class="hover:text-primary-400 transition-colors cursor-pointer">Politique de confidentialité</a>
            <a class="hover:text-primary-400 transition-colors cursor-pointer">CGV</a>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  private settingsService = inject(SettingsService);
  settings = this.settingsService.settings;

  Phone = Phone;
  Mail = Mail;
  MapPin = MapPin;
  Facebook = Facebook;
  Instagram = Instagram;
}
