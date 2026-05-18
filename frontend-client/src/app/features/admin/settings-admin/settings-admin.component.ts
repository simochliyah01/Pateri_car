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
  selector: 'app-settings-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="p-5 sm:p-8">
      <!-- Header -->
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-[11px] font-bold text-primary-600 uppercase tracking-[0.2em] mb-1">
            Configuration
          </p>
          <h1 class="text-2xl sm:text-3xl font-bold text-ink-900 mb-1">Paramètres</h1>
          <p class="text-sm text-ink-500">
            Configurez votre agence et les règles de location
          </p>
        </div>
        <div class="flex gap-2">
          <button (click)="resetToDefaults()"
                  class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 rounded-lg text-sm font-semibold text-ink-700 transition-colors">
            <lucide-icon name="rotate-ccw" [size]="14"></lucide-icon>
            Réinitialiser
          </button>
          <button (click)="saveAll()"
                  [disabled]="!hasChanges() || saving()"
                  class="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-primary-500/30 transition-all">
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

      @if (savedMessage()) {
        <div class="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-800 flex items-center gap-2 animate-fade-in">
          <lucide-icon name="check-circle" [size]="16" class="text-primary-600"></lucide-icon>
          <span class="font-medium">Paramètres enregistrés avec succès</span>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">

        <!-- TABS SIDEBAR -->
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <nav class="bg-white border border-gray-200 rounded-2xl p-2 space-y-1">
            @for (tab of tabs; track tab.key) {
              <button (click)="activeTab.set(tab.key)"
                      [class.bg-primary-50]="activeTab() === tab.key"
                      [class.text-primary-700]="activeTab() === tab.key"
                      [class.text-ink-700]="activeTab() !== tab.key"
                      class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:bg-surface-50 text-left">
                <lucide-icon [name]="tab.icon" [size]="16"></lucide-icon>
                <span>{{ tab.label }}</span>
              </button>
            }
          </nav>
        </aside>

        <!-- TAB CONTENT -->
        <div class="space-y-4">

          <!-- AGENCY INFO -->
          @if (activeTab() === 'agency') {
            <div class="bg-white border border-gray-200 rounded-2xl p-6">
              <div class="mb-5">
                <h2 class="text-lg font-bold text-ink-900 mb-1">Informations de l'agence</h2>
                <p class="text-sm text-ink-500">Ces informations apparaissent sur les contrats et factures</p>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="form-label">Nom de l'agence *</label>
                  <input type="text" [(ngModel)]="form().agencyName"
                         (ngModelChange)="markDirty()"
                         class="form-input" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="form-label">Email *</label>
                    <input type="email" [(ngModel)]="form().email"
                           (ngModelChange)="markDirty()"
                           class="form-input" />
                  </div>
                  <div>
                    <label class="form-label">Téléphone *</label>
                    <input type="tel" [(ngModel)]="form().phone"
                           (ngModelChange)="markDirty()"
                           class="form-input" />
                  </div>
                </div>

                <div>
                  <label class="form-label">Adresse</label>
                  <input type="text" [(ngModel)]="form().address"
                         (ngModelChange)="markDirty()"
                         placeholder="Avenue, rue, numéro..."
                         class="form-input" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="form-label">Ville</label>
                    <input type="text" [(ngModel)]="form().city"
                           (ngModelChange)="markDirty()"
                           class="form-input" />
                  </div>
                  <div>
                    <label class="form-label">Identifiant fiscal (ICE)</label>
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
            <div class="bg-white border border-gray-200 rounded-2xl p-6">
              <div class="mb-5">
                <h2 class="text-lg font-bold text-ink-900 mb-1">Horaires d'ouverture</h2>
                <p class="text-sm text-ink-500">Définissez vos jours et heures d'activité</p>
              </div>

              <div class="space-y-2">
                @for (day of days; track day.key) {
                  <div class="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
                    <div class="w-24 flex-shrink-0">
                      <span class="text-sm font-bold text-ink-900">{{ day.label }}</span>
                    </div>

                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox"
                             [(ngModel)]="form().hours[day.key].open"
                             (ngModelChange)="markDirty()"
                             class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500" />
                      <span class="text-xs font-semibold"
                            [class.text-primary-700]="form().hours[day.key].open"
                            [class.text-ink-400]="!form().hours[day.key].open">
                        {{ form().hours[day.key].open ? 'Ouvert' : 'Fermé' }}
                      </span>
                    </label>

                    @if (form().hours[day.key].open) {
                      <div class="flex items-center gap-2 ml-auto">
                        <input type="time"
                               [(ngModel)]="form().hours[day.key].start"
                               (ngModelChange)="markDirty()"
                               class="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-ink-900 focus:outline-none focus:border-primary-500" />
                        <span class="text-ink-400">&#x2192;</span>
                        <input type="time"
                               [(ngModel)]="form().hours[day.key].end"
                               (ngModelChange)="markDirty()"
                               class="px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-ink-900 focus:outline-none focus:border-primary-500" />
                      </div>
                    } @else {
                      <span class="ml-auto text-xs text-ink-400 italic">Aucune ouverture</span>
                    }
                  </div>
                }
              </div>

              <div class="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <lucide-icon name="info" [size]="14" class="text-amber-600 flex-shrink-0 mt-0.5"></lucide-icon>
                <p class="text-xs text-amber-800">
                  Les clients peuvent réserver à tout moment, mais le retrait/retour
                  des véhicules est limité aux heures d'ouverture.
                </p>
              </div>
            </div>
          }

          <!-- FEES -->
          @if (activeTab() === 'fees') {
            <div class="bg-white border border-gray-200 rounded-2xl p-6">
              <div class="mb-5">
                <h2 class="text-lg font-bold text-ink-900 mb-1">Tarifs et frais</h2>
                <p class="text-sm text-ink-500">Frais appliqués automatiquement lors des réservations</p>
              </div>

              <div class="space-y-5">
                <div>
                  <h3 class="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-3">
                    Frais de retrait
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label class="form-label">Agence Taza</label>
                      <div class="relative">
                        <input type="number" min="0" [(ngModel)]="form().feeAgence"
                               (ngModelChange)="markDirty()"
                               class="form-input pr-12" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-semibold">DH</span>
                      </div>
                    </div>
                    <div>
                      <label class="form-label">Gare ferroviaire</label>
                      <div class="relative">
                        <input type="number" min="0" [(ngModel)]="form().feeGare"
                               (ngModelChange)="markDirty()"
                               class="form-input pr-12" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-semibold">DH</span>
                      </div>
                    </div>
                    <div>
                      <label class="form-label">Livraison domicile</label>
                      <div class="relative">
                        <input type="number" min="0" [(ngModel)]="form().feeDomicile"
                               (ngModelChange)="markDirty()"
                               class="form-input pr-12" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-semibold">DH</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="pt-4 border-t border-gray-100">
                  <h3 class="text-[11px] font-bold text-ink-500 uppercase tracking-wider mb-3">
                    Tarif des options (par jour)
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="form-label">GPS</label>
                      <div class="relative">
                        <input type="number" min="0" [(ngModel)]="form().pricingGps"
                               (ngModelChange)="markDirty()"
                               class="form-input pr-14" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-semibold">DH/j</span>
                      </div>
                    </div>
                    <div>
                      <label class="form-label">Siège enfant</label>
                      <div class="relative">
                        <input type="number" min="0" [(ngModel)]="form().pricingChildSeat"
                               (ngModelChange)="markDirty()"
                               class="form-input pr-14" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-semibold">DH/j</span>
                      </div>
                    </div>
                    <div>
                      <label class="form-label">Conducteur additionnel</label>
                      <div class="relative">
                        <input type="number" min="0" [(ngModel)]="form().pricingAdditionalDriver"
                               (ngModelChange)="markDirty()"
                               class="form-input pr-14" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-semibold">DH/j</span>
                      </div>
                    </div>
                    <div>
                      <label class="form-label">Assurance premium</label>
                      <div class="relative">
                        <input type="number" min="0" [(ngModel)]="form().pricingFullInsurance"
                               (ngModelChange)="markDirty()"
                               class="form-input pr-14" />
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-500 font-semibold">DH/j</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- RULES -->
          @if (activeTab() === 'rules') {
            <div class="bg-white border border-gray-200 rounded-2xl p-6">
              <div class="mb-5">
                <h2 class="text-lg font-bold text-ink-900 mb-1">Règles de location</h2>
                <p class="text-sm text-ink-500">Limites et politiques d'annulation</p>
              </div>

              <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="form-label">Durée minimale (jours)</label>
                    <input type="number" min="1" [(ngModel)]="form().minRentalDays"
                           (ngModelChange)="markDirty()"
                           class="form-input" />
                  </div>
                  <div>
                    <label class="form-label">Durée maximale (jours)</label>
                    <input type="number" min="1" [(ngModel)]="form().maxRentalDays"
                           (ngModelChange)="markDirty()"
                           class="form-input" />
                  </div>
                </div>

                <div>
                  <label class="form-label">Délai d'annulation (heures avant départ)</label>
                  <input type="number" min="0" [(ngModel)]="form().cancellationHours"
                         (ngModelChange)="markDirty()"
                         class="form-input" />
                  <p class="text-xs text-ink-500 mt-1.5">
                    Les clients peuvent annuler gratuitement {{ form().cancellationHours }}h avant le départ
                  </p>
                </div>
              </div>
            </div>
          }

          <!-- NOTIFICATIONS -->
          @if (activeTab() === 'notifications') {
            <div class="bg-white border border-gray-200 rounded-2xl p-6">
              <div class="mb-5">
                <h2 class="text-lg font-bold text-ink-900 mb-1">Notifications</h2>
                <p class="text-sm text-ink-500">Comment vous voulez être notifié</p>
              </div>

              <div class="space-y-3">
                <label class="flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all"
                       [class.border-primary-500]="form().notifyEmail"
                       [class.bg-primary-50]="form().notifyEmail"
                       [class.border-gray-200]="!form().notifyEmail">
                  <input type="checkbox"
                         [(ngModel)]="form().notifyEmail"
                         (ngModelChange)="markDirty()"
                         class="mt-1 w-4 h-4 rounded text-primary-500 focus:ring-primary-500" />
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <lucide-icon name="mail" [size]="16" class="text-primary-600"></lucide-icon>
                      <span class="font-semibold text-ink-900">Notifications par email</span>
                    </div>
                    <p class="text-xs text-ink-500">
                      Recevez un email pour chaque nouvelle réservation, annulation ou paiement
                    </p>
                  </div>
                </label>

                <label class="flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all"
                       [class.border-primary-500]="form().notifySms"
                       [class.bg-primary-50]="form().notifySms"
                       [class.border-gray-200]="!form().notifySms">
                  <input type="checkbox"
                         [(ngModel)]="form().notifySms"
                         (ngModelChange)="markDirty()"
                         class="mt-1 w-4 h-4 rounded text-primary-500 focus:ring-primary-500" />
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <lucide-icon name="phone" [size]="16" class="text-primary-600"></lucide-icon>
                      <span class="font-semibold text-ink-900">Notifications par SMS</span>
                    </div>
                    <p class="text-xs text-ink-500">
                      Recevez un SMS pour les événements urgents (bientôt disponible)
                    </p>
                  </div>
                </label>
              </div>
            </div>
          }

          <!-- ACCOUNT -->
          @if (activeTab() === 'account') {
            <div class="space-y-4">
              <div class="bg-white border border-gray-200 rounded-2xl p-6">
                <div class="mb-5">
                  <h2 class="text-lg font-bold text-ink-900 mb-1">Mon compte</h2>
                  <p class="text-sm text-ink-500">Informations de votre compte administrateur</p>
                </div>

                <div class="space-y-4">
                  <div class="flex items-center gap-4 p-4 bg-surface-50 rounded-xl">
                    <div class="w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-xl flex-shrink-0">
                      {{ userInitials() }}
                    </div>
                    <div>
                      <div class="font-bold text-ink-900">
                        {{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}
                      </div>
                      <div class="text-sm text-ink-500">{{ authService.currentUser()?.email }}</div>
                      <span class="inline-flex items-center mt-1 px-2 py-0.5 bg-primary-100 text-primary-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {{ authService.currentUser()?.role }}
                      </span>
                    </div>
                  </div>

                  <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <lucide-icon name="info" [size]="14" class="text-amber-600 flex-shrink-0 mt-0.5"></lucide-icon>
                    <p class="text-xs text-amber-800">
                      La gestion du mot de passe et email sera disponible prochainement.
                      Contactez le support pour modifier ces informations.
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-white border border-red-200 rounded-2xl p-6">
                <h3 class="font-bold text-red-700 mb-1">Zone dangereuse</h3>
                <p class="text-sm text-ink-500 mb-4">Action irréversible — soyez prudent</p>
                <button (click)="logout()"
                        class="px-4 py-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 font-semibold text-sm rounded-lg transition-colors">
                  Se déconnecter de la session
                </button>
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
              <div class="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
                <lucide-icon name="alert-triangle" [size]="20" class="text-amber-600"></lucide-icon>
              </div>
              <div>
                <h3 class="text-lg font-bold text-ink-900 mb-1">Réinitialiser les paramètres ?</h3>
                <p class="text-sm text-ink-500">
                  Toutes vos modifications seront perdues. Les valeurs par défaut seront restaurées.
                </p>
              </div>
            </div>
            <div class="flex gap-3">
              <button (click)="showResetConfirm.set(false)"
                      class="flex-1 px-4 py-2.5 border border-gray-300 text-ink-700 hover:bg-gray-50 font-semibold rounded-lg transition-colors">
                Annuler
              </button>
              <button (click)="confirmReset()"
                      class="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors">
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
      margin-bottom: 6px;
    }
    .form-input {
      width: 100%;
      padding: 9px 12px;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
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
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.25s ease-out;
    }
  `],
})
export class SettingsAdminComponent implements OnInit {
  private settingsService = inject(SettingsService);
  protected authService   = inject(AuthService);

  form           = signal<AgencySettings>({} as AgencySettings);
  saving         = signal(false);
  savedMessage   = signal(false);
  hasChanges     = signal(false);
  showResetConfirm = signal(false);

  activeTab = signal<'agency' | 'hours' | 'fees' | 'rules' | 'notifications' | 'account'>('agency');

  tabs = [
    { key: 'agency'        as const, label: 'Agence',        icon: 'building-2' },
    { key: 'hours'         as const, label: 'Horaires',       icon: 'clock' },
    { key: 'fees'          as const, label: 'Tarifs',         icon: 'banknote' },
    { key: 'rules'         as const, label: 'Règles',         icon: 'shield-check' },
    { key: 'notifications' as const, label: 'Notifications',  icon: 'bell' },
    { key: 'account'       as const, label: 'Mon compte',     icon: 'user' },
  ];

  days: DayConfig[] = [
    { key: 'mon', label: 'Lundi' },
    { key: 'tue', label: 'Mardi' },
    { key: 'wed', label: 'Mercredi' },
    { key: 'thu', label: 'Jeudi' },
    { key: 'fri', label: 'Vendredi' },
    { key: 'sat', label: 'Samedi' },
    { key: 'sun', label: 'Dimanche' },
  ];

  userInitials = () => {
    const u = this.authService.currentUser();
    if (!u) return '';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase();
  };

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
