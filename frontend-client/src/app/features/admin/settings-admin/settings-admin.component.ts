import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { SettingsService, AgencySettings } from '../../../core/services/settings.service';
import { AuthService } from '../../../core/services/auth.service';

interface DayConfig {
  key: keyof AgencySettings['hours'];
  label: string;
}

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-5 sm:p-8">

      <!-- PREMIUM HERO HEADER -->
      <div class="relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-primary-900 rounded-3xl p-6 sm:p-8 mb-6 shadow-xl">
        <!-- Decorative orbs -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary-400/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 -left-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl"></div>

        <div class="relative flex flex-wrap items-center justify-between gap-4">
          <div class="flex-1 min-w-0">
            <p class="text-[11px] font-bold text-primary-300 uppercase tracking-[0.2em] mb-2">
              Configuration
            </p>
            <h1 class="text-2xl sm:text-3xl font-bold text-white mb-1">
              Paramètres de l'agence
            </h1>
            <p class="text-sm text-white/70">
              Personnalisez votre agence, horaires, tarifs et règles
            </p>

            @if (hasChanges()) {
              <div class="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-amber-500/20 border border-amber-400/30 rounded-full backdrop-blur-sm">
                <span class="relative flex">
                  <span class="absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75 animate-ping"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                <span class="text-xs font-semibold text-amber-100">
                  Modifications non enregistrées
                </span>
              </div>
            } @else {
              <div class="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-primary-500/20 border border-primary-400/30 rounded-full backdrop-blur-sm">
                <lucide-icon name="check-circle" [size]="12" class="text-primary-300"></lucide-icon>
                <span class="text-xs font-semibold text-primary-100">
                  Tous les paramètres sont à jour
                </span>
              </div>
            }
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button (click)="resetToDefaults()"
                    class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold text-sm rounded-xl transition-all">
              <lucide-icon name="rotate-ccw" [size]="14"></lucide-icon>
              Réinitialiser
            </button>
            <button (click)="saveAll()"
                    [disabled]="!hasChanges() || saving()"
                    class="inline-flex items-center gap-2 bg-white hover:bg-primary-50 disabled:bg-white/40 disabled:cursor-not-allowed text-ink-900 disabled:text-ink-500 font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all">
              @if (saving()) {
                <lucide-icon name="loader-2" [size]="14" class="animate-spin"></lucide-icon>
                Enregistrement...
              } @else {
                <lucide-icon name="check" [size]="14"></lucide-icon>
                Enregistrer
              }
            </button>
          </div>
        </div>
      </div>

      <!-- Saved confirmation toast -->
      @if (savedMessage()) {
        <div class="mb-4 p-4 bg-gradient-to-r from-primary-50 to-emerald-50 border border-primary-200 rounded-2xl flex items-center gap-3 animate-fade-in shadow-sm">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0">
            <lucide-icon name="check" [size]="18" class="text-white"></lucide-icon>
          </div>
          <div class="flex-1">
            <div class="font-bold text-ink-900 text-sm">Paramètres enregistrés</div>
            <div class="text-xs text-ink-600">Vos modifications ont été sauvegardées avec succès</div>
          </div>
        </div>
      }

      <!-- Main grid: sidebar + content -->
      <div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

        <!-- PREMIUM TABS SIDEBAR -->
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <!-- Header -->
            <div class="px-4 py-3 border-b border-gray-100 bg-gradient-to-br from-surface-50 to-white">
              <p class="text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em]">
                Navigation
              </p>
            </div>

            <!-- Tabs -->
            <nav class="p-2 space-y-1">
              @for (tab of tabs; track tab.key) {
                <button (click)="activeTab.set(tab.key)"
                        [class.active-tab]="activeTab() === tab.key"
                        class="settings-tab group">
                  <div [ngClass]="getTabIconClasses(tab, activeTab() === tab.key)"
                       class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all">
                    <lucide-icon [name]="tab.icon" [size]="16"></lucide-icon>
                  </div>
                  <div class="flex-1 min-w-0 text-left">
                    <div class="text-sm font-bold text-ink-900">{{ tab.label }}</div>
                    <div class="text-[10px] text-ink-500 truncate">{{ tab.desc }}</div>
                  </div>
                  @if (activeTab() === tab.key) {
                    <lucide-icon name="chevron-right" [size]="14" class="text-primary-600 flex-shrink-0"></lucide-icon>
                  }
                </button>
              }
            </nav>
          </div>
        </aside>

        <!-- CONTENT AREA -->
        <div class="space-y-4">

          <!-- AGENCY -->
          @if (activeTab() === 'agency') {
            <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-primary-50/50 to-white">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <lucide-icon name="building-2" [size]="20" class="text-white"></lucide-icon>
                  </div>
                  <div>
                    <h2 class="text-lg font-bold text-ink-900">Informations de l'agence</h2>
                    <p class="text-xs text-ink-500">Ces informations apparaissent sur les contrats et factures</p>
                  </div>
                </div>
              </div>

              <div class="p-6 space-y-4">
                <div>
                  <label class="form-label">Nom de l'agence *</label>
                  <input type="text" [(ngModel)]="form().agencyName"
                         (ngModelChange)="markDirty()"
                         class="form-input" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Email professionnel *</label>
                    <div class="relative">
                      <lucide-icon name="mail" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"></lucide-icon>
                      <input type="email" [(ngModel)]="form().email"
                             (ngModelChange)="markDirty()"
                             class="form-input pl-10" />
                    </div>
                  </div>
                  <div>
                    <label class="form-label">Téléphone *</label>
                    <div class="relative">
                      <lucide-icon name="phone" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"></lucide-icon>
                      <input type="tel" [(ngModel)]="form().phone"
                             (ngModelChange)="markDirty()"
                             class="form-input pl-10" />
                    </div>
                  </div>
                </div>

                <div>
                  <label class="form-label">Adresse</label>
                  <div class="relative">
                    <lucide-icon name="map-pin" [size]="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"></lucide-icon>
                    <input type="text" [(ngModel)]="form().address"
                           (ngModelChange)="markDirty()"
                           placeholder="Avenue, rue, numéro..."
                           class="form-input pl-10" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Ville</label>
                    <input type="text" [(ngModel)]="form().city"
                           (ngModelChange)="markDirty()"
                           class="form-input" />
                  </div>
                  <div>
                    <label class="form-label">ICE (Identifiant fiscal)</label>
                    <input type="text" [(ngModel)]="form().taxId"
                           (ngModelChange)="markDirty()"
                           placeholder="Optionnel"
                           class="form-input font-mono" />
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- HOURS -->
          @if (activeTab() === 'hours') {
            <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-blue-50/50 to-white">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <lucide-icon name="clock" [size]="20" class="text-white"></lucide-icon>
                  </div>
                  <div>
                    <h2 class="text-lg font-bold text-ink-900">Horaires d'ouverture</h2>
                    <p class="text-xs text-ink-500">Définissez vos jours et heures d'activité</p>
                  </div>
                </div>
              </div>

              <div class="p-6">
                <div class="space-y-2">
                  @for (day of days; track day.key) {
                    <div class="flex items-center gap-3 p-3 rounded-xl transition-colors"
                         [class.bg-primary-50]="form().hours[day.key].open"
                         [class.bg-gray-50]="!form().hours[day.key].open">
                      <div class="w-24 flex-shrink-0">
                        <span class="text-sm font-bold text-ink-900">{{ day.label }}</span>
                      </div>

                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox"
                               [(ngModel)]="form().hours[day.key].open"
                               (ngModelChange)="markDirty()"
                               class="sr-only peer" />
                        <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>

                      <span class="text-xs font-bold w-16"
                            [class.text-primary-700]="form().hours[day.key].open"
                            [class.text-ink-400]="!form().hours[day.key].open">
                        {{ form().hours[day.key].open ? 'Ouvert' : 'Fermé' }}
                      </span>

                      @if (form().hours[day.key].open) {
                        <div class="flex items-center gap-2 ml-auto">
                          <input type="time"
                                 [(ngModel)]="form().hours[day.key].start"
                                 (ngModelChange)="markDirty()"
                                 class="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-ink-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10" />
                          <span class="text-ink-400 font-bold">&rarr;</span>
                          <input type="time"
                                 [(ngModel)]="form().hours[day.key].end"
                                 (ngModelChange)="markDirty()"
                                 class="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-ink-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10" />
                        </div>
                      } @else {
                        <span class="ml-auto text-xs text-ink-400 italic">
                          Aucune ouverture
                        </span>
                      }
                    </div>
                  }
                </div>

                <div class="mt-5 p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                    <lucide-icon name="info" [size]="14" class="text-white"></lucide-icon>
                  </div>
                  <p class="text-xs text-amber-900 leading-relaxed">
                    Les clients peuvent réserver à tout moment via le site, mais le retrait
                    et retour des véhicules sont limités aux heures d'ouverture.
                  </p>
                </div>
              </div>
            </div>
          }

          <!-- FEES -->
          @if (activeTab() === 'fees') {
            <div class="space-y-4">
              <!-- Pickup fees card -->
              <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-amber-50/50 to-white">
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <lucide-icon name="map-pin" [size]="20" class="text-white"></lucide-icon>
                    </div>
                    <div>
                      <h2 class="text-lg font-bold text-ink-900">Frais de retrait</h2>
                      <p class="text-xs text-ink-500">Appliqués selon le lieu de prise en charge</p>
                    </div>
                  </div>
                </div>
                <div class="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label class="form-label">Agence Taza</label>
                    <div class="relative">
                      <input type="number" min="0" [(ngModel)]="form().feeAgence"
                             (ngModelChange)="markDirty()"
                             class="form-input pr-12" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-bold">DH</span>
                    </div>
                  </div>
                  <div>
                    <label class="form-label">Gare ferroviaire</label>
                    <div class="relative">
                      <input type="number" min="0" [(ngModel)]="form().feeGare"
                             (ngModelChange)="markDirty()"
                             class="form-input pr-12" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-bold">DH</span>
                    </div>
                  </div>
                  <div>
                    <label class="form-label">Livraison domicile</label>
                    <div class="relative">
                      <input type="number" min="0" [(ngModel)]="form().feeDomicile"
                             (ngModelChange)="markDirty()"
                             class="form-input pr-12" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-bold">DH</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Options pricing card -->
              <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-purple-50/50 to-white">
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <lucide-icon name="package" [size]="20" class="text-white"></lucide-icon>
                    </div>
                    <div>
                      <h2 class="text-lg font-bold text-ink-900">Tarif des options</h2>
                      <p class="text-xs text-ink-500">Prix par jour pour chaque option additionnelle</p>
                    </div>
                  </div>
                </div>
                <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">GPS</label>
                    <div class="relative">
                      <input type="number" min="0" [(ngModel)]="form().pricingGps"
                             (ngModelChange)="markDirty()"
                             class="form-input pr-16" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-bold">DH/jour</span>
                    </div>
                  </div>
                  <div>
                    <label class="form-label">Siège enfant</label>
                    <div class="relative">
                      <input type="number" min="0" [(ngModel)]="form().pricingChildSeat"
                             (ngModelChange)="markDirty()"
                             class="form-input pr-16" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-bold">DH/jour</span>
                    </div>
                  </div>
                  <div>
                    <label class="form-label">Conducteur additionnel</label>
                    <div class="relative">
                      <input type="number" min="0" [(ngModel)]="form().pricingAdditionalDriver"
                             (ngModelChange)="markDirty()"
                             class="form-input pr-16" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-bold">DH/jour</span>
                    </div>
                  </div>
                  <div>
                    <label class="form-label">Assurance premium</label>
                    <div class="relative">
                      <input type="number" min="0" [(ngModel)]="form().pricingFullInsurance"
                             (ngModelChange)="markDirty()"
                             class="form-input pr-16" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-bold">DH/jour</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- RULES -->
          @if (activeTab() === 'rules') {
            <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-emerald-50/50 to-white">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <lucide-icon name="shield-check" [size]="20" class="text-white"></lucide-icon>
                  </div>
                  <div>
                    <h2 class="text-lg font-bold text-ink-900">Règles de location</h2>
                    <p class="text-xs text-ink-500">Limites et politiques d'annulation</p>
                  </div>
                </div>
              </div>

              <div class="p-6 space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Durée minimale</label>
                    <div class="relative">
                      <input type="number" min="1" [(ngModel)]="form().minRentalDays"
                             (ngModelChange)="markDirty()"
                             class="form-input pr-16" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-bold">jours</span>
                    </div>
                  </div>
                  <div>
                    <label class="form-label">Durée maximale</label>
                    <div class="relative">
                      <input type="number" min="1" [(ngModel)]="form().maxRentalDays"
                             (ngModelChange)="markDirty()"
                             class="form-input pr-16" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-bold">jours</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="form-label">Délai d'annulation avant départ</label>
                  <div class="relative">
                    <input type="number" min="0" [(ngModel)]="form().cancellationHours"
                           (ngModelChange)="markDirty()"
                           class="form-input pr-20" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-bold">heures</span>
                  </div>
                  <p class="text-xs text-ink-500 mt-2 flex items-center gap-1.5">
                    <lucide-icon name="info" [size]="12"></lucide-icon>
                    Les clients peuvent annuler gratuitement {{ form().cancellationHours }}h avant le départ
                  </p>
                </div>
              </div>
            </div>
          }

          <!-- NOTIFICATIONS -->
          @if (activeTab() === 'notifications') {
            <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-pink-50/50 to-white">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                    <lucide-icon name="bell" [size]="20" class="text-white"></lucide-icon>
                  </div>
                  <div>
                    <h2 class="text-lg font-bold text-ink-900">Notifications</h2>
                    <p class="text-xs text-ink-500">Comment vous voulez être notifié</p>
                  </div>
                </div>
              </div>

              <div class="p-6 space-y-3">
                <label class="flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all"
                       [class.border-primary-500]="form().notifyEmail"
                       [class.bg-primary-50]="form().notifyEmail"
                       [class.border-gray-200]="!form().notifyEmail">
                  <input type="checkbox"
                         [(ngModel)]="form().notifyEmail"
                         (ngModelChange)="markDirty()"
                         class="mt-1 w-4 h-4 rounded text-primary-500 focus:ring-primary-500" />
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <lucide-icon name="mail" [size]="18" class="text-white"></lucide-icon>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-ink-900 mb-0.5">Notifications par email</div>
                    <div class="text-xs text-ink-500">
                      Recevez un email pour chaque nouvelle réservation, annulation ou paiement
                    </div>
                  </div>
                </label>

                <label class="flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all"
                       [class.border-primary-500]="form().notifySms"
                       [class.bg-primary-50]="form().notifySms"
                       [class.border-gray-200]="!form().notifySms">
                  <input type="checkbox"
                         [(ngModel)]="form().notifySms"
                         (ngModelChange)="markDirty()"
                         class="mt-1 w-4 h-4 rounded text-primary-500 focus:ring-primary-500" />
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
                    <lucide-icon name="phone" [size]="18" class="text-white"></lucide-icon>
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-ink-900 mb-0.5 flex items-center gap-2">
                      Notifications par SMS
                      <span class="inline-flex items-center px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Bientôt
                      </span>
                    </div>
                    <div class="text-xs text-ink-500">
                      Recevez un SMS pour les événements urgents
                    </div>
                  </div>
                </label>
              </div>
            </div>
          }

          <!-- ACCOUNT -->
          @if (activeTab() === 'account') {
            <div class="space-y-4">
              <!-- Profile card -->
              <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div class="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-violet-50/50 to-white">
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <lucide-icon name="user" [size]="20" class="text-white"></lucide-icon>
                    </div>
                    <div>
                      <h2 class="text-lg font-bold text-ink-900">Mon compte</h2>
                      <p class="text-xs text-ink-500">Informations de votre profil administrateur</p>
                    </div>
                  </div>
                </div>

                <div class="p-6">
                  <div class="flex items-center gap-4 p-5 bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl border border-primary-100/50">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-xl shadow-primary-500/30">
                      {{ userInitials() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-ink-900 text-lg">
                        {{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}
                      </div>
                      <div class="text-sm text-ink-600 truncate">{{ authService.currentUser()?.email }}</div>
                      <div class="flex items-center gap-2 mt-2">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <span class="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                          {{ authService.currentUser()?.role }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <div class="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <lucide-icon name="info" [size]="14" class="text-white"></lucide-icon>
                    </div>
                    <p class="text-xs text-amber-900 leading-relaxed">
                      La gestion du mot de passe et email sera disponible prochainement.
                      Contactez le support pour modifier ces informations.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Danger zone -->
              <div class="bg-white border-2 border-red-200 rounded-2xl overflow-hidden">
                <div class="px-6 py-5 border-b border-red-100 bg-gradient-to-br from-red-50/50 to-white">
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                      <lucide-icon name="alert-triangle" [size]="20" class="text-white"></lucide-icon>
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-red-700">Zone dangereuse</h3>
                      <p class="text-xs text-red-600">Actions irréversibles — soyez prudent</p>
                    </div>
                  </div>
                </div>
                <div class="p-6">
                  <button (click)="logout()"
                          class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold text-sm rounded-xl transition-colors">
                    <lucide-icon name="log-out" [size]="14"></lucide-icon>
                    Se déconnecter de la session
                  </button>
                </div>
              </div>
            </div>
          }

        </div>
      </div>

      <!-- Reset confirmation modal -->
      @if (showResetConfirm()) {
        <div class="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/50 backdrop-blur-sm p-4"
             (click)="showResetConfirm.set(false)">
          <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
               (click)="$event.stopPropagation()">
            <div class="flex items-start gap-3 mb-5">
              <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
                <lucide-icon name="alert-triangle" [size]="22" class="text-white"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-bold text-ink-900 mb-1">Réinitialiser tous les paramètres ?</h3>
                <p class="text-sm text-ink-500">
                  Toutes vos modifications seront perdues. Les valeurs par défaut seront restaurées.
                </p>
              </div>
            </div>
            <div class="flex gap-3">
              <button (click)="showResetConfirm.set(false)"
                      class="flex-1 px-4 py-2.5 border border-gray-300 text-ink-700 hover:bg-gray-50 font-semibold rounded-xl transition-colors">
                Annuler
              </button>
              <button (click)="confirmReset()"
                      class="flex-1 px-4 py-2.5 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/30">
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .form-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .form-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      font-size: 14px;
      color: #0F172A;
      background: white;
      transition: all 0.15s;
    }
    .form-input:focus {
      outline: none;
      border-color: #14B8A6;
      box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
    }

    .settings-tab {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px;
      border-radius: 12px;
      transition: all 0.15s;
      cursor: pointer;
    }
    .settings-tab:hover {
      background: rgb(248 250 252);
    }
    .settings-tab.active-tab {
      background: linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(20, 184, 166, 0.02) 100%);
    }

    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
  `],
})
export class SettingsAdminComponent implements OnInit {
  private settingsService = inject(SettingsService);
  protected authService = inject(AuthService);

  form = signal<AgencySettings>({} as AgencySettings);
  saving = signal(false);
  savedMessage = signal(false);
  hasChanges = signal(false);
  showResetConfirm = signal(false);

  activeTab = signal<'agency' | 'hours' | 'fees' | 'rules' | 'notifications' | 'account'>('agency');

  tabs = [
    { key: 'agency'        as const, label: 'Agence',        desc: 'Informations générales', icon: 'building-2',  color: 'primary'  },
    { key: 'hours'         as const, label: 'Horaires',       desc: 'Jours et heures',        icon: 'clock',       color: 'blue'     },
    { key: 'fees'          as const, label: 'Tarifs',         desc: 'Frais et options',        icon: 'banknote',    color: 'amber'    },
    { key: 'rules'         as const, label: 'Règles',         desc: 'Politiques de location',  icon: 'shield-check',color: 'emerald'  },
    { key: 'notifications' as const, label: 'Notifications',  desc: 'Email et SMS',            icon: 'bell',        color: 'pink'     },
    { key: 'account'       as const, label: 'Mon compte',     desc: 'Profil admin',            icon: 'user',        color: 'violet'   },
  ];

  days: DayConfig[] = [
    { key: 'mon', label: 'Lundi'    },
    { key: 'tue', label: 'Mardi'    },
    { key: 'wed', label: 'Mercredi' },
    { key: 'thu', label: 'Jeudi'    },
    { key: 'fri', label: 'Vendredi' },
    { key: 'sat', label: 'Samedi'   },
    { key: 'sun', label: 'Dimanche' },
  ];

  userInitials = (): string => {
    const u = this.authService.currentUser();
    if (!u) return '';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase();
  };

  getTabIconClasses(tab: { color: string }, isActive: boolean): Record<string, boolean> {
    if (isActive) {
      return {
        'bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-md shadow-primary-500/30': tab.color === 'primary',
        'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md shadow-blue-500/30':         tab.color === 'blue',
        'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/30':      tab.color === 'amber',
        'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md shadow-emerald-500/30':tab.color === 'emerald',
        'bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-md shadow-pink-500/30':         tab.color === 'pink',
        'bg-gradient-to-br from-violet-400 to-violet-600 text-white shadow-md shadow-violet-500/30':   tab.color === 'violet',
      };
    }
    return { 'bg-gray-100 text-ink-500 group-hover:bg-gray-200': true };
  }

  ngOnInit() {
    this.form.set(JSON.parse(JSON.stringify(this.settingsService.settings())));
  }

  markDirty() {
    this.hasChanges.set(true);
  }

  saveAll() {
    this.saving.set(true);
    this.settingsService.save(this.form());
    setTimeout(() => {
      this.saving.set(false);
      this.hasChanges.set(false);
      this.savedMessage.set(true);
      setTimeout(() => this.savedMessage.set(false), 3000);
    }, 500);
  }

  resetToDefaults() {
    this.showResetConfirm.set(true);
  }

  confirmReset() {
    this.settingsService.reset();
    this.form.set(JSON.parse(JSON.stringify(this.settingsService.getDefaults())));
    this.hasChanges.set(false);
    this.showResetConfirm.set(false);
    this.savedMessage.set(true);
    setTimeout(() => this.savedMessage.set(false), 3000);
  }

  logout() {
    this.authService.logout();
  }
}
