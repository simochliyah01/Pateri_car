import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (password && confirmPassword && password !== confirmPassword) {
    return { passwordMismatch: true };
  }
  return null;
}

function moroccanPhoneValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const cleaned = control.value.replace(/\s/g, '');
  const pattern = /^(0[67]\d{8}|\+212[67]\d{8})$/;
  return pattern.test(cleaned) ? null : { invalidPhone: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen flex">

      <!-- ═══ LEFT: Visual side ═══ -->
      <div class="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=85"
             alt=""
             class="absolute inset-0 w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-br
                    from-ink-900/90 via-ink-900/70 to-primary-900/80"></div>

        <div class="relative w-full flex flex-col justify-between
                    p-12 xl:p-16 text-white">

          <div>
            <a routerLink="/home" class="inline-block">
              <img src="assets/logo/logo-full.png"
                   alt="PATERI CAR"
                   class="h-10 brightness-0 invert" />
            </a>
          </div>

          <div class="max-w-md">
            <div class="text-xs font-bold tracking-[0.3em]
                        text-primary-300 uppercase mb-4">
              Rejoignez-nous
            </div>
            <h1 class="text-4xl xl:text-5xl font-bold leading-tight
                       tracking-tight mb-6">
              Créez votre compte
              <span class="text-primary-400">en 30 secondes</span>.
            </h1>
            <p class="text-white/70 text-lg leading-relaxed mb-8">
              Rejoignez plus de 500 clients qui font confiance à
              PATERI CAR pour leurs déplacements à Taza et au Maroc.
            </p>

            <div class="space-y-3">
              @for (benefit of benefits; track benefit) {
                <div class="flex items-center gap-3 text-sm text-white/80">
                  <div class="w-5 h-5 rounded-full bg-primary-500/20
                              flex items-center justify-center flex-shrink-0">
                    <lucide-icon name="check" [size]="12"
                                 class="text-primary-400"></lucide-icon>
                  </div>
                  {{ benefit }}
                </div>
              }
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="flex -space-x-2">
              <div class="w-8 h-8 rounded-full bg-primary-500 border-2
                          border-ink-900 flex items-center justify-center
                          text-xs font-bold">K</div>
              <div class="w-8 h-8 rounded-full bg-primary-400 border-2
                          border-ink-900 flex items-center justify-center
                          text-xs font-bold">F</div>
              <div class="w-8 h-8 rounded-full bg-primary-600 border-2
                          border-ink-900 flex items-center justify-center
                          text-xs font-bold">Y</div>
            </div>
            <p class="text-sm text-white/70">
              <span class="font-bold text-white">500+</span>
              clients nous font confiance
            </p>
          </div>
        </div>
      </div>

      <!-- ═══ RIGHT: Form side ═══ -->
      <div class="w-full lg:w-2/5 flex flex-col bg-white overflow-y-auto">

        <div class="lg:hidden px-6 py-5 border-b border-gray-200">
          <a routerLink="/home" class="inline-block">
            <img src="assets/logo/logo-full.png" alt="PATERI CAR" class="h-9" />
          </a>
        </div>

        <div class="flex-1 flex items-center justify-center
                    px-6 sm:px-10 lg:px-12 py-8 lg:py-10">
          <div class="w-full max-w-md">

            <div class="mb-5">
              <h2 class="text-3xl font-bold text-ink-900 tracking-tight mb-2">
                Créer un compte
              </h2>
              <p class="text-ink-500 text-sm">Quelques infos et c'est parti</p>
            </div>

            @if (errorMessage()) {
              <div class="mb-5 p-3 bg-red-50 border border-red-200
                          rounded-lg text-sm text-red-700 flex items-start gap-2">
                <lucide-icon name="alert-circle" [size]="18"
                             class="flex-shrink-0 mt-0.5"></lucide-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-3.5">

              <!-- Prénom + Nom -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="firstName"
                         class="block text-sm font-semibold text-ink-900 mb-1.5">
                    Prénom
                  </label>
                  <input id="firstName" type="text" formControlName="firstName"
                         placeholder="Mohamed"
                         autocomplete="given-name"
                         [class.border-red-300]="isInvalid('firstName')"
                         class="w-full px-3 py-2.5 border border-gray-300
                                rounded-lg text-sm focus:outline-none
                                focus:border-primary-500 focus:ring-2
                                focus:ring-primary-500/20 transition-all" />
                  @if (isInvalid('firstName')) {
                    <p class="mt-1 text-xs text-red-600">Requis</p>
                  }
                </div>
                <div>
                  <label for="lastName"
                         class="block text-sm font-semibold text-ink-900 mb-1.5">
                    Nom
                  </label>
                  <input id="lastName" type="text" formControlName="lastName"
                         placeholder="El Idrissi"
                         autocomplete="family-name"
                         [class.border-red-300]="isInvalid('lastName')"
                         class="w-full px-3 py-2.5 border border-gray-300
                                rounded-lg text-sm focus:outline-none
                                focus:border-primary-500 focus:ring-2
                                focus:ring-primary-500/20 transition-all" />
                  @if (isInvalid('lastName')) {
                    <p class="mt-1 text-xs text-red-600">Requis</p>
                  }
                </div>
              </div>

              <!-- Email -->
              <div>
                <label for="email"
                       class="block text-sm font-semibold text-ink-900 mb-1.5">
                  Email
                </label>
                <div class="relative">
                  <lucide-icon name="mail" [size]="18"
                               class="absolute left-4 top-1/2 -translate-y-1/2
                                      text-ink-400 pointer-events-none z-10">
                  </lucide-icon>
                  <input id="email" type="email" formControlName="email"
                         placeholder="vous@example.com"
                         autocomplete="email"
                         [class.border-red-300]="isInvalid('email')"
                         class="w-full pl-14 pr-4 py-3 border border-gray-300
                                rounded-lg text-sm focus:outline-none
                                focus:border-primary-500 focus:ring-2
                                focus:ring-primary-500/20 transition-all" />
                </div>
                @if (isInvalid('email')) {
                  <p class="mt-1 text-xs text-red-600">
                    @if (form.get('email')?.errors?.['required']) {
                      Email requis
                    } @else if (form.get('email')?.errors?.['email']) {
                      Email invalide
                    }
                  </p>
                }
              </div>

              <!-- Téléphone -->
              <div>
                <label for="phone"
                       class="block text-sm font-semibold text-ink-900 mb-1.5">
                  Téléphone
                </label>
                <div class="relative">
                  <lucide-icon name="phone" [size]="18"
                               class="absolute left-4 top-1/2 -translate-y-1/2
                                      text-ink-400 pointer-events-none z-10">
                  </lucide-icon>
                  <input id="phone" type="tel" formControlName="phone"
                         placeholder="06 12 34 56 78"
                         autocomplete="tel"
                         [class.border-red-300]="isInvalid('phone')"
                         class="w-full pl-14 pr-4 py-3 border border-gray-300
                                rounded-lg text-sm focus:outline-none
                                focus:border-primary-500 focus:ring-2
                                focus:ring-primary-500/20 transition-all" />
                </div>
                @if (isInvalid('phone')) {
                  <p class="mt-1 text-xs text-red-600">
                    @if (form.get('phone')?.errors?.['required']) {
                      Téléphone requis
                    } @else {
                      Format invalide (ex: 06 12 34 56 78)
                    }
                  </p>
                }
              </div>

              <!-- Mot de passe -->
              <div>
                <label for="password"
                       class="block text-sm font-semibold text-ink-900 mb-1.5">
                  Mot de passe
                </label>
                <div class="relative">
                  <lucide-icon name="lock" [size]="18"
                               class="absolute left-4 top-1/2 -translate-y-1/2
                                      text-ink-400 pointer-events-none z-10">
                  </lucide-icon>
                  <input id="password"
                         [type]="showPassword() ? 'text' : 'password'"
                         formControlName="password"
                         placeholder="Minimum 8 caractères"
                         autocomplete="new-password"
                         [class.border-red-300]="isInvalid('password')"
                         class="w-full pl-14 pr-12 py-3 border border-gray-300
                                rounded-lg text-sm focus:outline-none
                                focus:border-primary-500 focus:ring-2
                                focus:ring-primary-500/20 transition-all" />
                  <button type="button" (click)="togglePassword()"
                          class="absolute right-4 top-1/2 -translate-y-1/2
                                 text-ink-400 hover:text-ink-700 z-10">
                    <lucide-icon [name]="showPassword() ? 'eye-off' : 'eye'"
                                 [size]="18"></lucide-icon>
                  </button>
                </div>

                @if (form.get('password')?.value) {
                  <div class="mt-2 flex items-center gap-2">
                    <div class="flex-1 grid grid-cols-3 gap-1">
                      <div class="h-1 rounded-full transition-colors"
                           [class.bg-red-400]="passwordStrength() === 'weak'"
                           [class.bg-amber-400]="passwordStrength() === 'medium' || passwordStrength() === 'strong'"
                           [class.bg-gray-200]="passwordStrength() === 'none'"></div>
                      <div class="h-1 rounded-full transition-colors"
                           [class.bg-amber-400]="passwordStrength() === 'medium'"
                           [class.bg-primary-500]="passwordStrength() === 'strong'"
                           [class.bg-gray-200]="passwordStrength() === 'none' || passwordStrength() === 'weak'"></div>
                      <div class="h-1 rounded-full transition-colors"
                           [class.bg-primary-500]="passwordStrength() === 'strong'"
                           [class.bg-gray-200]="passwordStrength() !== 'strong'"></div>
                    </div>
                    <span class="text-xs font-medium"
                          [class.text-red-600]="passwordStrength() === 'weak'"
                          [class.text-amber-600]="passwordStrength() === 'medium'"
                          [class.text-primary-600]="passwordStrength() === 'strong'">
                      {{ passwordStrengthLabel() }}
                    </span>
                  </div>
                }

                @if (isInvalid('password')) {
                  <p class="mt-1 text-xs text-red-600">
                    @if (form.get('password')?.errors?.['required']) {
                      Mot de passe requis
                    } @else if (form.get('password')?.errors?.['minlength']) {
                      Minimum 8 caractères
                    }
                  </p>
                }
              </div>

              <!-- Confirmer le mot de passe -->
              <div>
                <label for="confirmPassword"
                       class="block text-sm font-semibold text-ink-900 mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div class="relative">
                  <lucide-icon name="lock" [size]="18"
                               class="absolute left-4 top-1/2 -translate-y-1/2
                                      text-ink-400 pointer-events-none z-10">
                  </lucide-icon>
                  <input id="confirmPassword"
                         [type]="showPassword() ? 'text' : 'password'"
                         formControlName="confirmPassword"
                         placeholder="••••••••"
                         autocomplete="new-password"
                         [class.border-red-300]="confirmPasswordInvalid()"
                         class="w-full pl-14 pr-4 py-3 border border-gray-300
                                rounded-lg text-sm focus:outline-none
                                focus:border-primary-500 focus:ring-2
                                focus:ring-primary-500/20 transition-all" />
                </div>
                @if (confirmPasswordInvalid()) {
                  <p class="mt-1 text-xs text-red-600">
                    Les mots de passe ne correspondent pas
                  </p>
                }
              </div>

              <!-- Conditions -->
              <div>
                <div class="flex items-start gap-2">
                  <input id="terms" type="checkbox"
                         formControlName="acceptTerms"
                         class="mt-0.5 w-4 h-4 rounded border-gray-300
                                text-primary-500 focus:ring-primary-500" />
                  <label for="terms" class="text-sm text-ink-700 cursor-pointer">
                    J'accepte les
                    <a class="text-primary-600 hover:underline cursor-pointer">
                      Conditions d'utilisation
                    </a>
                    et la
                    <a class="text-primary-600 hover:underline cursor-pointer">
                      Politique de confidentialité
                    </a>
                  </label>
                </div>
                @if (isInvalid('acceptTerms')) {
                  <p class="mt-1 text-xs text-red-600">
                    Vous devez accepter les conditions
                  </p>
                }
              </div>

              <!-- Submit -->
              <button type="submit" [disabled]="loading()"
                      class="w-full bg-primary-500 hover:bg-primary-600
                             active:bg-primary-700 disabled:bg-primary-300
                             disabled:cursor-not-allowed
                             text-white font-semibold py-3 rounded-lg
                             transition-all flex items-center
                             justify-center gap-2 group mt-2">
                @if (loading()) {
                  <lucide-icon name="loader-2" [size]="18"
                               class="animate-spin"></lucide-icon>
                  Création...
                } @else {
                  Créer mon compte
                  <lucide-icon name="arrow-right" [size]="18"
                               class="group-hover:translate-x-0.5
                                      transition-transform"></lucide-icon>
                }
              </button>
            </form>

            <p class="mt-6 text-center text-sm text-ink-500">
              Déjà un compte ?
              <a routerLink="/login"
                 class="font-semibold text-primary-600 hover:text-primary-700 ml-1">
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  passwordStrength = signal<'none' | 'weak' | 'medium' | 'strong'>('none');
  passwordStrengthLabel = signal('');

  benefits = [
    'Réservation en 30 secondes',
    'Tarifs transparents — pas de frais cachés',
    'Suivi de vos locations en temps réel',
    'Support dédié 24/7',
  ];

  form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, moroccanPhoneValidator]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    acceptTerms: [false, Validators.requiredTrue],
  }, { validators: passwordMatchValidator });

  constructor() {
    this.form.get('password')?.valueChanges.subscribe(value => {
      if (!value) {
        this.passwordStrength.set('none');
        this.passwordStrengthLabel.set('');
        return;
      }
      const score = this.calculateStrength(value);
      if (score < 2) {
        this.passwordStrength.set('weak');
        this.passwordStrengthLabel.set('Faible');
      } else if (score < 4) {
        this.passwordStrength.set('medium');
        this.passwordStrengthLabel.set('Moyen');
      } else {
        this.passwordStrength.set('strong');
        this.passwordStrengthLabel.set('Fort');
      }
    });
  }

  private calculateStrength(password: string): number {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control.touched || control.dirty));
  }

  confirmPasswordInvalid(): boolean {
    const control = this.form.get('confirmPassword');
    if (!control || (!control.touched && !control.dirty)) return false;
    return this.form.errors?.['passwordMismatch'] === true && !!control.value;
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { firstName, lastName, email, phone, password } = this.form.getRawValue();

    this.authService.register({ firstName, lastName, email, phone, password, roleName: 'CLIENT' })
      .subscribe({
        next: () => this.router.navigate(['/home']),
        error: (err) => {
          console.error('Registration error:', err);
          this.errorMessage.set(err.message || 'Erreur lors de la création du compte');
          this.loading.set(false);
        },
      });
  }
}
