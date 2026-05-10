import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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

          <!-- Logo -->
          <div>
            <a routerLink="/home" class="inline-block">
              <img src="assets/logo/logo-full.png"
                   alt="PATERI CAR"
                   class="h-10 brightness-0 invert" />
            </a>
          </div>

          <!-- Tagline -->
          <div class="max-w-md">
            <div class="text-xs font-bold tracking-[0.3em]
                        text-primary-300 uppercase mb-4">
              Bienvenue
            </div>
            <h1 class="text-4xl xl:text-5xl font-bold leading-tight
                       tracking-tight mb-6">
              La route est
              <span class="text-primary-400">à vous</span>,<br>
              on s'occupe du reste.
            </h1>
            <p class="text-white/70 text-lg leading-relaxed mb-8">
              Connectez-vous pour gérer vos réservations, accéder à
              vos factures et plus encore.
            </p>

            <!-- Benefits -->
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

          <!-- Stats -->
          <div class="flex items-center gap-6 text-sm">
            <div>
              <div class="text-2xl font-bold text-primary-400">500+</div>
              <div class="text-xs text-white/60 uppercase tracking-wider">Clients</div>
            </div>
            <div class="h-8 w-px bg-white/20"></div>
            <div>
              <div class="text-2xl font-bold flex items-center gap-1">
                4.9
                <lucide-icon name="star" [size]="18"
                             class="text-primary-400 fill-current"></lucide-icon>
              </div>
              <div class="text-xs text-white/60 uppercase tracking-wider">Note</div>
            </div>
            <div class="h-8 w-px bg-white/20"></div>
            <div>
              <div class="text-2xl font-bold">24/7</div>
              <div class="text-xs text-white/60 uppercase tracking-wider">Service</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ RIGHT: Form side ═══ -->
      <div class="w-full lg:w-2/5 flex flex-col bg-white">

        <!-- Mobile logo header -->
        <div class="lg:hidden px-6 py-5 border-b border-gray-200">
          <a routerLink="/home" class="inline-block">
            <img src="assets/logo/logo-full.png" alt="PATERI CAR" class="h-9" />
          </a>
        </div>

        <!-- Form container -->
        <div class="flex-1 flex items-center justify-center
                    px-6 sm:px-10 lg:px-12 py-8 lg:py-12">
          <div class="w-full max-w-md">

            <!-- Header -->
            <div class="mb-8">
              <h2 class="text-3xl font-bold text-ink-900 tracking-tight mb-2">
                Bon retour
              </h2>
              <p class="text-ink-500">
                Connectez-vous à votre compte PATERI CAR
              </p>
            </div>

            <!-- Session expired warning -->
            @if (sessionExpired()) {
              <div class="mb-5 p-3 bg-amber-50 border border-amber-200
                          rounded-lg text-sm text-amber-800 flex items-start gap-2">
                <lucide-icon name="alert-circle" [size]="18"
                             class="flex-shrink-0 mt-0.5"></lucide-icon>
                <span>Session expirée. Veuillez vous reconnecter.</span>
              </div>
            }

            <!-- Error alert -->
            @if (errorMessage()) {
              <div class="mb-5 p-3 bg-red-50 border border-red-200
                          rounded-lg text-sm text-red-700 flex items-start gap-2">
                <lucide-icon name="alert-circle" [size]="18"
                             class="flex-shrink-0 mt-0.5"></lucide-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <!-- Form -->
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

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

              <!-- Password -->
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label for="password"
                         class="text-sm font-semibold text-ink-900">
                    Mot de passe
                  </label>
                  <a class="text-xs font-medium text-primary-600
                            hover:text-primary-700 cursor-pointer">
                    Oublié ?
                  </a>
                </div>
                <div class="relative">
                  <lucide-icon name="lock" [size]="18"
                               class="absolute left-4 top-1/2 -translate-y-1/2
                                      text-ink-400 pointer-events-none z-10">
                  </lucide-icon>
                  <input id="password"
                         [type]="showPassword() ? 'text' : 'password'"
                         formControlName="password"
                         placeholder="••••••••"
                         autocomplete="current-password"
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
                @if (isInvalid('password')) {
                  <p class="mt-1 text-xs text-red-600">Mot de passe requis</p>
                }
              </div>

              <!-- Remember me -->
              <div class="flex items-center">
                <input id="remember" type="checkbox"
                       formControlName="rememberMe"
                       class="w-4 h-4 rounded border-gray-300
                              text-primary-500 focus:ring-primary-500" />
                <label for="remember"
                       class="ml-2 text-sm text-ink-700 cursor-pointer">
                  Se souvenir de moi
                </label>
              </div>

              <!-- Submit -->
              <button type="submit" [disabled]="loading()"
                      class="w-full bg-primary-500 hover:bg-primary-600
                             active:bg-primary-700 disabled:bg-primary-300
                             disabled:cursor-not-allowed
                             text-white font-semibold py-3 rounded-lg
                             transition-all flex items-center
                             justify-center gap-2 group">
                @if (loading()) {
                  <lucide-icon name="loader-2" [size]="18"
                               class="animate-spin"></lucide-icon>
                  Connexion...
                } @else {
                  Se connecter
                  <lucide-icon name="arrow-right" [size]="18"
                               class="group-hover:translate-x-0.5
                                      transition-transform"></lucide-icon>
                }
              </button>
            </form>

            <!-- Divider -->
            <div class="my-6 flex items-center gap-3">
              <div class="flex-1 h-px bg-gray-200"></div>
              <span class="text-xs text-ink-500 uppercase tracking-wider">Nouveau ?</span>
              <div class="flex-1 h-px bg-gray-200"></div>
            </div>

            <!-- Register link -->
            <a routerLink="/register"
               class="w-full block text-center bg-white border border-gray-300
                      hover:border-primary-500 hover:bg-primary-50 text-ink-900
                      font-semibold py-3 rounded-lg transition-all">
              Créer un compte
            </a>

            <!-- Footer note -->
            <p class="mt-8 text-center text-xs text-ink-500">
              En vous connectant, vous acceptez nos
              <a class="text-primary-600 hover:underline cursor-pointer">Conditions</a>
              et notre
              <a class="text-primary-600 hover:underline cursor-pointer">
                Politique de confidentialité
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  sessionExpired = signal(false);

  benefits = [
    'Tarifs transparents — pas de surprise',
    'Assurance incluse dans tous les tarifs',
    'Service client disponible 24/7',
    'Réservation en quelques clics',
  ];

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['sessionExpired'] === 'true') {
        this.sessionExpired.set(true);
      }
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && (control.touched || control.dirty));
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
    this.sessionExpired.set(false);

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email, password }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Erreur de connexion');
        this.loading.set(false);
      },
    });
  }
}
