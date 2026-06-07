import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { VehicleService } from '../../core/services/vehicle.service';
import { ReservationService, OptionType, PickupLocation, ReservationDto } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';
import { Vehicle } from '../../core/models/vehicle.model';

interface OptionItem {
  type: OptionType;
  label: string;
  description: string;
  pricePerDay: number;
  icon: string;
  selected: boolean;
}

@Component({
  selector: 'app-reservation-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  template: `
    @if (loading()) {
      <div class="min-h-[80vh] flex items-center justify-center pt-24">
        <div class="text-center">
          <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-500
                      rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-ink-500">Préparation de votre réservation...</p>
        </div>
      </div>
    } @else if (!vehicle()) {
      <div class="min-h-[80vh] flex items-center justify-center pt-24 px-5">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-ink-900 mb-2">Véhicule introuvable</h2>
          <a routerLink="/voitures"
             class="text-primary-600 hover:underline">Retour au catalogue</a>
        </div>
      </div>
    } @else if (success()) {
      <!-- ═══ SUCCESS STATE ═══ -->
      <div class="min-h-[80vh] flex items-center justify-center pt-24 pb-12 px-5">
        <div class="text-center max-w-lg">
          <div class="w-20 h-20 bg-primary-50 rounded-full mx-auto mb-6
                      flex items-center justify-center border-4
                      border-primary-100">
            <lucide-icon name="check" [size]="40"
                         class="text-primary-600"></lucide-icon>
          </div>
          <h1 class="text-3xl sm:text-4xl font-bold text-ink-900 mb-3">
            Réservation envoyée !
          </h1>
          <p class="text-ink-500 mb-6">
            Votre demande a bien été enregistrée. Nous vous contacterons
            sous peu pour confirmer.
          </p>

          <div class="bg-primary-50 border border-primary-200 rounded-2xl
                      p-5 mb-8 inline-block">
            <p class="text-[10px] font-bold text-primary-700 uppercase
                      tracking-[0.2em] mb-1">
              Numéro de réservation
            </p>
            <p class="text-2xl font-bold text-ink-900 font-mono">
              {{ success()!.reservationNumber }}
            </p>
          </div>

          <div class="bg-white border border-gray-200 rounded-2xl p-5
                      mb-6 text-left">
            <div class="flex justify-between mb-2">
              <span class="text-sm text-ink-500">Véhicule</span>
              <span class="text-sm font-semibold text-ink-900">
                {{ vehicle()!.brand }} {{ vehicle()!.model }}
              </span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-sm text-ink-500">Période</span>
              <span class="text-sm font-semibold text-ink-900">
                {{ formatDate(success()!.startDate) }}
                → {{ formatDate(success()!.endDate) }}
              </span>
            </div>
            <div class="flex justify-between mb-2">
              <span class="text-sm text-ink-500">Statut</span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5
                           bg-amber-50 border border-amber-200 rounded-full
                           text-xs font-semibold text-amber-800">
                En attente de confirmation
              </span>
            </div>
            <div class="flex justify-between pt-3 border-t border-gray-100">
              <span class="text-sm font-semibold text-ink-900">Total</span>
              <span class="text-lg font-bold text-primary-600">
                {{ success()!.totalPrice }} DH
              </span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a routerLink="/mes-reservations"
               class="bg-primary-500 hover:bg-primary-600 text-white
                      font-semibold px-6 py-3 rounded-lg transition-colors
                      inline-flex items-center justify-center gap-2">
              Mes réservations
              <lucide-icon name="arrow-right" [size]="16"></lucide-icon>
            </a>
            <a routerLink="/voitures"
               class="bg-white border border-gray-300 hover:border-primary-500
                      text-ink-700 hover:text-primary-600 font-semibold px-6 py-3
                      rounded-lg transition-colors">
              Voir d'autres voitures
            </a>
          </div>
        </div>
      </div>
    } @else {
      <!-- ═══ WIZARD ═══ -->
      <section class="bg-surface-50 min-h-screen pt-24 pb-12">
        <div class="max-w-4xl mx-auto px-5 sm:px-8">

          <!-- Back link -->
          <a [routerLink]="['/voitures', vehicle()!.id]"
             class="inline-flex items-center gap-2 text-sm text-ink-500
                    hover:text-primary-600 mb-6 transition-colors">
            <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
            Retour au véhicule
          </a>

          <!-- Progress bar -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-3">
              @for (s of [1,2,3,4]; track s; let i = $index; let isLast = $last) {
                <div class="flex items-center" [class.flex-1]="!isLast">
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                         [class.bg-primary-500]="step() >= s"
                         [class.text-white]="step() >= s"
                         [class.bg-white]="step() < s"
                         [class.text-ink-400]="step() < s"
                         [class.border-2]="step() < s"
                         [class.border-gray-300]="step() < s"
                         [class.shadow-lg]="step() === s">
                      @if (step() > s) {
                        <lucide-icon name="check" [size]="16"></lucide-icon>
                      } @else {
                        <span>{{ s }}</span>
                      }
                    </div>
                    <span class="text-[10px] font-semibold uppercase tracking-wider hidden sm:block"
                          [class.text-primary-600]="step() >= s"
                          [class.text-ink-400]="step() < s">{{ stepLabels[i] }}</span>
                  </div>
                  @if (!isLast) {
                    <div class="flex-1 h-0.5 mx-2 transition-colors"
                         [class.bg-primary-500]="step() > s"
                         [class.bg-gray-200]="step() <= s"></div>
                  }
                </div>
              }
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

            <!-- ═══ STEPS CONTENT ═══ -->
            <div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">

              <!-- STEP 1: Period & Location -->
              @if (step() === 1) {
                <div>
                  <h2 class="text-xl sm:text-2xl font-bold text-ink-900
                             mb-1">Confirmez votre période</h2>
                  <p class="text-sm text-ink-500 mb-6">
                    Vérifiez les dates et le lieu de retrait
                  </p>

                  <div class="space-y-5">
                    <div>
                      <label class="block text-sm font-semibold text-ink-900
                                    mb-2">Lieu de retrait</label>
                      <select [(ngModel)]="pickupLocation"
                              class="w-full px-4 py-3 border border-gray-200
                                     rounded-xl text-sm font-semibold
                                     text-ink-900 bg-white
                                     focus:outline-none focus:border-primary-500">
                        <option value="AGENCE">Agence Taza (gratuit)</option>
                        <option value="GARE">Gare ferroviaire (+50 DH)</option>
                        <option value="DOMICILE">Livraison à domicile (+100 DH)</option>
                      </select>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm font-semibold text-ink-900
                                      mb-2">Date de départ</label>
                        <input type="date" [(ngModel)]="startDate"
                               [min]="minDate"
                               class="w-full px-4 py-3 border border-gray-200
                                      rounded-xl text-sm font-semibold
                                      text-ink-900
                                      focus:outline-none focus:border-primary-500" />
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-ink-900
                                      mb-2">Date de retour</label>
                        <input type="date" [(ngModel)]="endDate"
                               [min]="startDate || minDate"
                               class="w-full px-4 py-3 border border-gray-200
                                      rounded-xl text-sm font-semibold
                                      text-ink-900
                                      focus:outline-none focus:border-primary-500" />
                      </div>
                    </div>

                    @if (durationDays() > 0) {
                      <div class="bg-primary-50 border border-primary-200
                                  rounded-xl p-3 flex items-center gap-2">
                        <lucide-icon name="calendar" [size]="16"
                                     class="text-primary-600"></lucide-icon>
                        <span class="text-sm text-ink-900 font-semibold">
                          Durée: {{ durationDays() }} jour(s)
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- STEP 2: Options -->
              @if (step() === 2) {
                <div>
                  <h2 class="text-xl sm:text-2xl font-bold text-ink-900
                             mb-1">Choisissez vos options</h2>
                  <p class="text-sm text-ink-500 mb-6">
                    Personnalisez votre location (optionnel)
                  </p>

                  <div class="space-y-3">
                    @for (opt of options; track opt.type) {
                      <label class="flex items-start gap-3 p-4 border
                                    rounded-xl cursor-pointer transition-all"
                             [class.border-primary-500]="opt.selected"
                             [class.bg-primary-50]="opt.selected"
                             [class.border-gray-200]="!opt.selected">
                        <input type="checkbox"
                               [(ngModel)]="opt.selected"
                               class="mt-1 w-4 h-4 rounded text-primary-500
                                      focus:ring-primary-500" />
                        <div class="flex-1">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                              <lucide-icon [name]="opt.icon" [size]="18"
                                           class="text-primary-600"></lucide-icon>
                              <span class="font-semibold text-ink-900">
                                {{ opt.label }}
                              </span>
                            </div>
                            <span class="font-bold text-primary-600">
                              +{{ opt.pricePerDay }} DH/jour
                            </span>
                          </div>
                          <p class="text-xs text-ink-500 mt-1">
                            {{ opt.description }}
                          </p>
                        </div>
                      </label>
                    }
                  </div>
                </div>
              }

              <!-- STEP 3: User info -->
              @if (step() === 3) {
                <div>
                  <h2 class="text-xl sm:text-2xl font-bold text-ink-900
                             mb-1">Vos informations</h2>
                  <p class="text-sm text-ink-500 mb-6">
                    Vérifiez vos coordonnées
                  </p>

                  <div class="bg-primary-50 border border-primary-200
                              rounded-xl p-4 mb-5 flex items-start gap-3">
                    <lucide-icon name="info" [size]="18"
                                 class="text-primary-600 flex-shrink-0 mt-0.5">
                    </lucide-icon>
                    <p class="text-sm text-ink-700">
                      Connecté en tant que
                      <strong>{{ currentUser()?.email }}</strong>.
                      Vos informations sont récupérées automatiquement.
                    </p>
                  </div>

                  <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-sm font-semibold text-ink-900
                                      mb-2">Prénom</label>
                        <input type="text"
                               [value]="currentUser()?.firstName || ''"
                               disabled
                               class="w-full px-4 py-3 border border-gray-200
                                      rounded-xl text-sm bg-gray-50
                                      text-ink-700" />
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-ink-900
                                      mb-2">Nom</label>
                        <input type="text"
                               [value]="currentUser()?.lastName || ''"
                               disabled
                               class="w-full px-4 py-3 border border-gray-200
                                      rounded-xl text-sm bg-gray-50
                                      text-ink-700" />
                      </div>
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-ink-900
                                    mb-2">Email</label>
                      <input type="email"
                             [value]="currentUser()?.email || ''"
                             disabled
                             class="w-full px-4 py-3 border border-gray-200
                                    rounded-xl text-sm bg-gray-50
                                    text-ink-700" />
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-ink-900
                                    mb-2">Téléphone</label>
                      @if (currentUser()?.phone) {
                        <input type="tel"
                               [value]="currentUser()!.phone"
                               disabled
                               class="w-full px-4 py-3 border border-gray-200
                                      rounded-xl text-sm bg-gray-50
                                      text-ink-700" />
                      } @else {
                        <input type="tel"
                               [ngModel]="phoneInput()"
                               (ngModelChange)="phoneInput.set($event)"
                               placeholder="Ex: 0612345678"
                               class="w-full px-4 py-3 border border-amber-300
                                      rounded-xl text-sm
                                      focus:outline-none focus:border-primary-500" />
                        <p class="text-xs text-amber-600 mt-1">
                          Votre numéro n'est pas enregistré — saisissez-le pour continuer.
                        </p>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- STEP 4: Summary -->
              @if (step() === 4) {
                <div>
                  <h2 class="text-xl sm:text-2xl font-bold text-ink-900
                             mb-1">Récapitulatif</h2>
                  <p class="text-sm text-ink-500 mb-6">
                    Vérifiez votre réservation avant de confirmer
                  </p>

                  <div class="space-y-4">
                    <div class="bg-surface-50 rounded-xl p-4">
                      <h4 class="text-[10px] font-bold text-ink-500 uppercase
                                 tracking-[0.15em] mb-3">Véhicule</h4>
                      <div class="flex items-center gap-3">
                        <div class="w-16 h-12 bg-white rounded-lg
                                    border border-gray-200 flex items-center
                                    justify-center">
                          <lucide-icon name="car" [size]="20"
                                       class="text-primary-600"></lucide-icon>
                        </div>
                        <div>
                          <div class="font-bold text-ink-900">
                            {{ vehicle()!.brand }} {{ vehicle()!.model }}
                          </div>
                          <div class="text-xs text-ink-500">
                            {{ vehicle()!.year }} ·
                            {{ getCategoryLabel(vehicle()!.category) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="bg-surface-50 rounded-xl p-4">
                      <h4 class="text-[10px] font-bold text-ink-500 uppercase
                                 tracking-[0.15em] mb-3">Période</h4>
                      <div class="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div class="text-xs text-ink-500 mb-0.5">Départ</div>
                          <div class="font-semibold text-ink-900">
                            {{ formatDate(startDate) }}
                          </div>
                        </div>
                        <div>
                          <div class="text-xs text-ink-500 mb-0.5">Retour</div>
                          <div class="font-semibold text-ink-900">
                            {{ formatDate(endDate) }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="bg-surface-50 rounded-xl p-4">
                      <h4 class="text-[10px] font-bold text-ink-500 uppercase
                                 tracking-[0.15em] mb-3">Lieu de retrait</h4>
                      <p class="font-semibold text-ink-900">
                        {{ getLocationLabel() }}
                      </p>
                    </div>

                    @if (selectedOptions().length > 0) {
                      <div class="bg-surface-50 rounded-xl p-4">
                        <h4 class="text-[10px] font-bold text-ink-500 uppercase
                                   tracking-[0.15em] mb-3">Options</h4>
                        <ul class="space-y-1.5">
                          @for (opt of selectedOptions(); track opt.type) {
                            <li class="flex items-center gap-2 text-sm
                                       text-ink-700">
                              <lucide-icon name="check" [size]="14"
                                           class="text-primary-600">
                              </lucide-icon>
                              {{ opt.label }}
                              <span class="text-ink-500 ml-auto">
                                +{{ opt.pricePerDay * durationDays() }} DH
                              </span>
                            </li>
                          }
                        </ul>
                      </div>
                    }

                    <div>
                      <label class="block text-sm font-semibold text-ink-900
                                    mb-2">
                        Notes (optionnel)
                      </label>
                      <textarea [(ngModel)]="notes" rows="3"
                                placeholder="Demandes spéciales, instructions..."
                                class="w-full px-4 py-3 border border-gray-200
                                       rounded-xl text-sm
                                       focus:outline-none focus:border-primary-500
                                       resize-none">
                      </textarea>
                    </div>
                  </div>

                  @if (errorMessage()) {
                    <div class="mt-4 p-3 bg-red-50 border border-red-200
                                rounded-lg text-sm text-red-700 flex
                                items-start gap-2">
                      <lucide-icon name="alert-circle" [size]="16"
                                   class="flex-shrink-0 mt-0.5"></lucide-icon>
                      <span>{{ errorMessage() }}</span>
                    </div>
                  }
                </div>
              }

              <!-- Navigation buttons -->
              <div class="flex items-center justify-between pt-6 mt-6
                          border-t border-gray-100">
                <button (click)="prevStep()"
                        [disabled]="step() === 1"
                        class="flex items-center gap-2 px-4 py-2.5 text-sm
                               font-semibold text-ink-700
                               hover:text-primary-600
                               disabled:opacity-30 disabled:cursor-not-allowed
                               transition-colors">
                  <lucide-icon name="arrow-left" [size]="16"></lucide-icon>
                  Précédent
                </button>

                @if (step() < 4) {
                  <button (click)="nextStep()"
                          [disabled]="!canProceed()"
                          class="bg-primary-500 hover:bg-primary-600
                                 disabled:bg-gray-300 disabled:cursor-not-allowed
                                 text-white font-bold px-6 py-2.5 rounded-lg
                                 transition-colors flex items-center gap-2">
                    Suivant
                    <lucide-icon name="arrow-right" [size]="16"></lucide-icon>
                  </button>
                } @else {
                  <button (click)="submit()"
                          [disabled]="submitting()"
                          class="bg-primary-500 hover:bg-primary-600
                                 disabled:bg-gray-300 disabled:cursor-not-allowed
                                 text-white font-bold px-6 py-2.5 rounded-lg
                                 transition-colors flex items-center gap-2
                                 shadow-lg shadow-primary-500/30">
                    @if (submitting()) {
                      <lucide-icon name="loader-2" [size]="16"
                                   class="animate-spin"></lucide-icon>
                      Envoi...
                    } @else {
                      Confirmer la réservation
                      <lucide-icon name="check" [size]="16"></lucide-icon>
                    }
                  </button>
                }
              </div>
            </div>

            <!-- ═══ STICKY SUMMARY (right) ═══ -->
            <div>
              <div class="lg:sticky lg:top-24 bg-white rounded-2xl
                          border border-gray-200 p-5">
                <h3 class="font-bold text-ink-900 mb-4">Votre réservation</h3>

                <!-- Vehicle mini -->
                <div class="flex items-center gap-3 pb-4 mb-4
                            border-b border-gray-100">
                  <div class="w-14 h-14 bg-primary-50 rounded-lg
                              flex items-center justify-center
                              flex-shrink-0">
                    <lucide-icon name="car" [size]="22"
                                 class="text-primary-600"></lucide-icon>
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-ink-900 truncate">
                      {{ vehicle()!.brand }} {{ vehicle()!.model }}
                    </div>
                    <div class="text-xs text-ink-500">
                      {{ vehicle()!.pricePerDay }} DH/jour
                    </div>
                  </div>
                </div>

                <!-- Breakdown -->
                <div class="space-y-2 text-sm pb-4 mb-4
                            border-b border-gray-100">
                  @if (durationDays() > 0) {
                    <div class="flex justify-between text-ink-700">
                      <span>{{ durationDays() }} jour(s) ×
                            {{ vehicle()!.pricePerDay }} DH</span>
                      <span class="font-semibold">
                        {{ basePrice() }} DH
                      </span>
                    </div>
                  }
                  @for (opt of selectedOptions(); track opt.type) {
                    <div class="flex justify-between text-ink-700 text-xs">
                      <span>+ {{ opt.label }}</span>
                      <span class="font-semibold">
                        {{ opt.pricePerDay * durationDays() }} DH
                      </span>
                    </div>
                  }
                  @if (deliveryFee() > 0) {
                    <div class="flex justify-between text-ink-700 text-xs">
                      <span>+ Livraison</span>
                      <span class="font-semibold">
                        {{ deliveryFee() }} DH
                      </span>
                    </div>
                  }
                </div>

                <div class="flex justify-between items-baseline mb-1">
                  <span class="text-sm font-semibold text-ink-900">Total</span>
                  <span class="text-2xl font-bold text-primary-600">
                    {{ totalPrice() }} DH
                  </span>
                </div>
                <p class="text-[10px] text-ink-500">
                  Paiement à la remise du véhicule
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    }
  `,
})
export class ReservationWizardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vehicleService = inject(VehicleService);
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);

  vehicle = signal<Vehicle | null>(null);
  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  success = signal<ReservationDto | null>(null);

  step = signal(1);
  stepLabels = ['Période', 'Options', 'Infos', 'Confirmer'];

  pickupLocation: PickupLocation = 'AGENCE';
  startDate = '';
  endDate = '';
  notes = '';
  phoneInput = signal('');

  minDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  currentUser = this.authService.currentUser;

  options: OptionItem[] = [
    {
      type: 'GPS',
      label: 'GPS',
      description: 'Système de navigation embarqué',
      pricePerDay: 50,
      icon: 'navigation',
      selected: false,
    },
    {
      type: 'CHILD_SEAT',
      label: 'Siège enfant',
      description: 'Siège bébé homologué (0-12 ans)',
      pricePerDay: 30,
      icon: 'baby',
      selected: false,
    },
    {
      type: 'ADDITIONAL_DRIVER',
      label: 'Conducteur additionnel',
      description: 'Ajoutez un deuxième conducteur autorisé',
      pricePerDay: 100,
      icon: 'user-plus',
      selected: false,
    },
    {
      type: 'FULL_INSURANCE',
      label: 'Assurance premium',
      description: 'Couverture tous risques sans franchise',
      pricePerDay: 80,
      icon: 'shield-check',
      selected: false,
    },
  ];

  durationDays = computed(() => {
    if (!this.startDate || !this.endDate) return 0;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.ceil(diff) : 0;
  });

  selectedOptions = computed(() =>
    this.options.filter(o => o.selected)
  );

  basePrice = computed(() => {
    const veh = this.vehicle();
    if (!veh) return 0;
    return veh.pricePerDay * this.durationDays();
  });

  optionsTotal = computed(() => {
    const days = this.durationDays();
    return this.selectedOptions()
      .reduce((sum, o) => sum + o.pricePerDay * days, 0);
  });

  deliveryFee = computed(() => {
    return this.pickupLocation === 'GARE' ? 50
         : this.pickupLocation === 'DOMICILE' ? 100
         : 0;
  });

  totalPrice = computed(() =>
    this.basePrice() + this.optionsTotal() + this.deliveryFee()
  );

  canProceed = computed(() => {
    if (this.step() === 1) {
      return !!this.startDate && !!this.endDate && this.durationDays() > 0;
    }
    if (this.step() === 3) {
      const phone = (this.currentUser()?.phone || this.phoneInput()).trim();
      return phone.length >= 10;
    }
    return true;
  });

  ngOnInit() {
    this.phoneInput.set(this.currentUser()?.phone || '');

    this.route.queryParamMap.subscribe(params => {
      this.startDate = params.get('startDate') || '';
      this.endDate = params.get('endDate') || '';
      this.pickupLocation = (params.get('pickupLocation') as PickupLocation) || 'AGENCE';
    });

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.vehicleService.getVehicleById(id).subscribe({
          next: (data) => {
            this.vehicle.set(data);
            this.loading.set(false);
          },
          error: () => {
            this.vehicle.set(null);
            this.loading.set(false);
          },
        });
      }
    });
  }

  nextStep() {
    if (this.step() < 4 && this.canProceed()) {
      this.step.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep() {
    if (this.step() > 1) {
      this.step.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  submit() {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.errorMessage.set(null);

    const phone = (this.currentUser()?.phone || this.phoneInput()).trim();

    const request = {
      vehicleId: this.vehicle()!.id,
      pickupLocation: this.pickupLocation,
      startDate: this.startDate,
      endDate: this.endDate,
      internalNotes: this.notes || undefined,
      clientPhone: phone || undefined,
      options: this.selectedOptions().map(o => ({
        optionType: o.type,
        quantity: 1,
      })),
    };

    this.reservationService.create(request).subscribe({
      next: (reservation) => {
        this.success.set(reservation);
        this.submitting.set(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      error: (err) => {
        const body = err?.error ?? err;
        let message = 'Une erreur est survenue. Veuillez réessayer.';

        if (Array.isArray(body?.fieldErrors) && body.fieldErrors.length > 0) {
          message = body.fieldErrors
            .map((fe: { field: string; message: string }) => `${fe.message} (${fe.field})`)
            .join(' · ');
        } else if (body?.message && body.message !== 'Validation failed') {
          message = body.message;
        } else if (err?.status === 409) {
          message = 'Ce véhicule n\'est pas disponible sur cette période.';
        } else if (err?.status === 400) {
          message = 'Données invalides. Vérifiez tous les champs.';
        } else if (err?.status === 401) {
          message = 'Session expirée. Reconnectez-vous.';
        }

        this.errorMessage.set(message);
        this.submitting.set(false);
        console.error('Reservation creation failed:', err);
      },
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      'ECONOMIQUE': 'Économique',
      'COMPACTE': 'Compacte',
      'BERLINE': 'Berline',
      'SUV': 'SUV',
      'PREMIUM': 'Premium',
      'UTILITAIRE': 'Utilitaire',
    };
    return labels[cat] || cat;
  }

  getLocationLabel(): string {
    return this.pickupLocation === 'AGENCE' ? 'Agence Taza'
         : this.pickupLocation === 'GARE' ? 'Gare ferroviaire (+50 DH)'
         : 'Livraison à domicile (+100 DH)';
  }
}
