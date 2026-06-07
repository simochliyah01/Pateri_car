import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-surface-50 pt-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        <!-- ═══ HERO ═══ -->
        <div class="relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800
                    to-primary-900 rounded-3xl p-6 sm:p-8 mb-6 shadow-xl">
          <div class="absolute top-0 right-0 w-64 h-64 bg-primary-400/20
                      rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-20 -left-10 w-72 h-72 bg-blue-500/15
                      rounded-full blur-3xl pointer-events-none"></div>

          <div class="relative flex flex-wrap items-center gap-5">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400
                        to-primary-600 flex items-center justify-center text-white
                        text-3xl font-bold shadow-xl shadow-primary-500/30 flex-shrink-0">
              {{ userInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[11px] font-bold text-primary-300 uppercase tracking-[0.2em] mb-1">
                Mon profil
              </p>
              <h1 class="text-2xl sm:text-3xl font-bold text-white mb-1">
                {{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}
              </h1>
              <p class="text-sm text-white/70">{{ authService.currentUser()?.email }}</p>
              <div class="flex items-center gap-2 mt-2">
                <span class="inline-flex items-center gap-1 px-2 py-0.5
                             bg-primary-500/20 border border-primary-400/30
                             text-primary-200 rounded-full text-[10px]
                             font-bold uppercase tracking-wider">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
                  {{ authService.currentUser()?.role === 'CLIENT' ? 'Client' : authService.currentUser()?.role }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ GRID ═══ -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div class="px-4 py-3 border-b border-gray-100 bg-surface-50">
                <p class="text-[10px] font-bold text-ink-500 uppercase tracking-[0.2em]">
                  Navigation
                </p>
              </div>
              <nav class="p-2 space-y-1">
                <button (click)="activeTab.set('info')"
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                               text-sm font-semibold transition-colors hover:bg-surface-50 text-left"
                        [class.bg-primary-50]="activeTab() === 'info'"
                        [class.text-primary-700]="activeTab() === 'info'"
                        [class.text-ink-700]="activeTab() !== 'info'">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                       [class.bg-gradient-to-br]="activeTab() === 'info'"
                       [class.from-primary-400]="activeTab() === 'info'"
                       [class.to-primary-600]="activeTab() === 'info'"
                       [class.text-white]="activeTab() === 'info'"
                       [class.bg-gray-100]="activeTab() !== 'info'"
                       [class.text-ink-500]="activeTab() !== 'info'">
                    <lucide-icon name="user" [size]="14"></lucide-icon>
                  </div>
                  Mes informations
                </button>

                <button (click)="activeTab.set('password')"
                        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                               text-sm font-semibold transition-colors hover:bg-surface-50 text-left"
                        [class.bg-blue-50]="activeTab() === 'password'"
                        [class.text-blue-700]="activeTab() === 'password'"
                        [class.text-ink-700]="activeTab() !== 'password'">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                       [class.bg-gradient-to-br]="activeTab() === 'password'"
                       [class.from-blue-400]="activeTab() === 'password'"
                       [class.to-blue-600]="activeTab() === 'password'"
                       [class.text-white]="activeTab() === 'password'"
                       [class.bg-gray-100]="activeTab() !== 'password'"
                       [class.text-ink-500]="activeTab() !== 'password'">
                    <lucide-icon name="lock" [size]="14"></lucide-icon>
                  </div>
                  Mot de passe
                </button>

                <a routerLink="/mes-reservations"
                   class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                          text-sm font-semibold text-ink-700 hover:bg-surface-50
                          transition-colors">
                  <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center
                              justify-center text-ink-500">
                    <lucide-icon name="calendar" [size]="14"></lucide-icon>
                  </div>
                  Mes réservations
                </a>

                <a routerLink="/voitures"
                   class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                          text-sm font-semibold text-ink-700 hover:bg-surface-50
                          transition-colors">
                  <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center
                              justify-center text-ink-500">
                    <lucide-icon name="car" [size]="14"></lucide-icon>
                  </div>
                  Catalogue
                </a>
              </nav>
            </div>
          </div>

          <!-- Content -->
          <div class="lg:col-span-2 space-y-4">

            <!-- INFO TAB -->
            @if (activeTab() === 'info') {
              <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div class="px-6 py-5 border-b border-gray-100
                            bg-gradient-to-br from-primary-50/50 to-white">
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-400
                                to-primary-600 flex items-center justify-center
                                shadow-lg shadow-primary-500/30">
                      <lucide-icon name="user" [size]="20" class="text-white"></lucide-icon>
                    </div>
                    <div>
                      <h2 class="text-lg font-bold text-ink-900">Mes informations</h2>
                      <p class="text-xs text-ink-500">Modifiez vos informations personnelles</p>
                    </div>
                  </div>
                </div>

                <div class="p-6 space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="form-label">Prénom *</label>
                      <input type="text"
                             [ngModel]="form().firstName"
                             (ngModelChange)="updateForm('firstName', $event)"
                             class="form-input" />
                    </div>
                    <div>
                      <label class="form-label">Nom *</label>
                      <input type="text"
                             [ngModel]="form().lastName"
                             (ngModelChange)="updateForm('lastName', $event)"
                             class="form-input" />
                    </div>
                  </div>

                  <div>
                    <label class="form-label">Email *</label>
                    <div class="relative">
                      <lucide-icon name="mail" [size]="14"
                                   class="absolute left-3.5 top-1/2 -translate-y-1/2
                                          text-ink-400 pointer-events-none z-10">
                      </lucide-icon>
                      <input type="email"
                             [ngModel]="form().email"
                             (ngModelChange)="updateForm('email', $event)"
                             class="form-input-icon" />
                    </div>
                  </div>

                  <div>
                    <label class="form-label">Téléphone</label>
                    <div class="relative">
                      <lucide-icon name="phone" [size]="14"
                                   class="absolute left-3.5 top-1/2 -translate-y-1/2
                                          text-ink-400 pointer-events-none z-10">
                      </lucide-icon>
                      <input type="tel"
                             [ngModel]="form().phone"
                             (ngModelChange)="updateForm('phone', $event)"
                             placeholder="+212 6XX XXX XXX"
                             class="form-input-icon" />
                    </div>
                  </div>

                  @if (infoError()) {
                    <div class="p-3 bg-red-50 border border-red-200 rounded-lg
                                text-sm text-red-700 flex items-center gap-2">
                      <lucide-icon name="alert-circle" [size]="16"></lucide-icon>
                      {{ infoError() }}
                    </div>
                  }
                  @if (infoSuccess()) {
                    <div class="p-3 bg-primary-50 border border-primary-200 rounded-lg
                                text-sm text-primary-700 flex items-center gap-2">
                      <lucide-icon name="check-circle" [size]="16"></lucide-icon>
                      <span class="font-medium">Profil mis à jour avec succès</span>
                    </div>
                  }

                  <button (click)="saveInfo()"
                          [disabled]="infoSaving()"
                          class="inline-flex items-center gap-2 bg-primary-500
                                 hover:bg-primary-600 disabled:bg-gray-300
                                 disabled:cursor-not-allowed text-white font-semibold
                                 text-sm px-5 py-2.5 rounded-xl transition-colors">
                    @if (infoSaving()) {
                      <lucide-icon name="loader-2" [size]="14" class="animate-spin"></lucide-icon>
                      Enregistrement...
                    } @else {
                      <lucide-icon name="check" [size]="14"></lucide-icon>
                      Enregistrer les modifications
                    }
                  </button>
                </div>
              </div>
            }

            <!-- PASSWORD TAB -->
            @if (activeTab() === 'password') {
              <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div class="px-6 py-5 border-b border-gray-100
                            bg-gradient-to-br from-blue-50/50 to-white">
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400
                                to-blue-600 flex items-center justify-center
                                shadow-lg shadow-blue-500/30">
                      <lucide-icon name="lock" [size]="20" class="text-white"></lucide-icon>
                    </div>
                    <div>
                      <h2 class="text-lg font-bold text-ink-900">Mot de passe</h2>
                      <p class="text-xs text-ink-500">Modifiez votre mot de passe de connexion</p>
                    </div>
                  </div>
                </div>

                <div class="p-6 space-y-4">
                  <div>
                    <label class="form-label">Mot de passe actuel</label>
                    <div class="relative">
                      <input [type]="showPwdCurrent() ? 'text' : 'password'"
                             [ngModel]="pwdCurrent()"
                             (ngModelChange)="pwdCurrent.set($event)"
                             placeholder="••••••••"
                             class="form-input pr-11" />
                      <button type="button" (click)="showPwdCurrent.set(!showPwdCurrent())"
                              class="absolute right-3 top-1/2 -translate-y-1/2
                                     text-ink-400 hover:text-ink-700 p-0.5">
                        <lucide-icon [name]="showPwdCurrent() ? 'eye-off' : 'eye'"
                                     [size]="16"></lucide-icon>
                      </button>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="form-label">Nouveau mot de passe</label>
                      <div class="relative">
                        <input [type]="showPwdNew() ? 'text' : 'password'"
                               [ngModel]="pwdNew()"
                               (ngModelChange)="pwdNew.set($event)"
                               placeholder="Min. 8 caractères"
                               class="form-input pr-11" />
                        <button type="button" (click)="showPwdNew.set(!showPwdNew())"
                                class="absolute right-3 top-1/2 -translate-y-1/2
                                       text-ink-400 hover:text-ink-700 p-0.5">
                          <lucide-icon [name]="showPwdNew() ? 'eye-off' : 'eye'"
                                       [size]="16"></lucide-icon>
                        </button>
                      </div>
                    </div>
                    <div>
                      <label class="form-label">Confirmer</label>
                      <div class="relative">
                        <input [type]="showPwdConfirm() ? 'text' : 'password'"
                               [ngModel]="pwdConfirm()"
                               (ngModelChange)="pwdConfirm.set($event)"
                               placeholder="Répétez"
                               class="form-input pr-11" />
                        <button type="button" (click)="showPwdConfirm.set(!showPwdConfirm())"
                                class="absolute right-3 top-1/2 -translate-y-1/2
                                       text-ink-400 hover:text-ink-700 p-0.5">
                          <lucide-icon [name]="showPwdConfirm() ? 'eye-off' : 'eye'"
                                       [size]="16"></lucide-icon>
                        </button>
                      </div>
                    </div>
                  </div>

                  @if (pwdError()) {
                    <div class="p-3 bg-red-50 border border-red-200 rounded-lg
                                text-sm text-red-700 flex items-center gap-2">
                      <lucide-icon name="alert-circle" [size]="16"></lucide-icon>
                      {{ pwdError() }}
                    </div>
                  }
                  @if (pwdSuccess()) {
                    <div class="p-3 bg-primary-50 border border-primary-200 rounded-lg
                                text-sm text-primary-700 flex items-center gap-2">
                      <lucide-icon name="check-circle" [size]="16"></lucide-icon>
                      <span class="font-medium">Mot de passe modifié avec succès</span>
                    </div>
                  }

                  <button (click)="savePassword()"
                          [disabled]="pwdSaving() || !pwdCurrent() || !pwdNew() || !pwdConfirm()"
                          class="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600
                                 disabled:bg-gray-300 disabled:cursor-not-allowed text-white
                                 font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                    @if (pwdSaving()) {
                      <lucide-icon name="loader-2" [size]="14" class="animate-spin"></lucide-icon>
                      Modification...
                    } @else {
                      <lucide-icon name="key" [size]="14"></lucide-icon>
                      Changer le mot de passe
                    }
                  </button>
                </div>
              </div>
            }

          </div>
        </div>
      </div>
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
    .form-input-icon {
      width: 100%;
      padding: 10px 14px 10px 42px;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      font-size: 14px;
      color: #0F172A;
      background: white;
      transition: all 0.15s;
    }
    .form-input-icon:focus {
      outline: none;
      border-color: #14B8A6;
      box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
    }
  `],
})
export class ProfileComponent implements OnInit {
  protected authService = inject(AuthService);

  activeTab = signal<'info' | 'password'>('info');

  form = signal({ firstName: '', lastName: '', email: '', phone: '' });

  infoSaving  = signal(false);
  infoError   = signal<string | null>(null);
  infoSuccess = signal(false);

  pwdCurrent    = signal('');
  pwdNew        = signal('');
  pwdConfirm    = signal('');
  pwdSaving     = signal(false);
  pwdError      = signal<string | null>(null);
  pwdSuccess    = signal(false);
  showPwdCurrent = signal(false);
  showPwdNew     = signal(false);
  showPwdConfirm = signal(false);

  userInitials = computed(() => {
    const u = this.authService.currentUser();
    if (!u) return '';
    return ((u.firstName?.[0] ?? '') + (u.lastName?.[0] ?? '')).toUpperCase();
  });

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.form.set({
        firstName: user.firstName ?? '',
        lastName:  user.lastName  ?? '',
        email:     user.email     ?? '',
        phone:     user.phone     ?? '',
      });
    }
  }

  updateForm(field: string, value: string) {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  saveInfo() {
    this.infoError.set(null);
    this.infoSuccess.set(false);
    this.infoSaving.set(true);

    this.authService.updateProfile(this.form()).subscribe({
      next: (updated) => {
        this.infoSaving.set(false);
        this.infoSuccess.set(true);
        this.authService.refreshCurrentUser(updated);
        setTimeout(() => this.infoSuccess.set(false), 3000);
      },
      error: (err) => {
        this.infoSaving.set(false);
        this.infoError.set(err?.message || 'Impossible de mettre à jour le profil');
      },
    });
  }

  savePassword() {
    this.pwdError.set(null);
    this.pwdSuccess.set(false);

    const current = this.pwdCurrent();
    const newPwd  = this.pwdNew();
    const confirm = this.pwdConfirm();

    if (newPwd.length < 8) {
      this.pwdError.set('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (newPwd !== confirm) {
      this.pwdError.set('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPwd === current) {
      this.pwdError.set("Le nouveau mot de passe doit être différent de l'actuel");
      return;
    }

    this.pwdSaving.set(true);
    this.authService.changePassword(current, newPwd).subscribe({
      next: () => {
        this.pwdSaving.set(false);
        this.pwdSuccess.set(true);
        this.pwdCurrent.set('');
        this.pwdNew.set('');
        this.pwdConfirm.set('');
        setTimeout(() => this.pwdSuccess.set(false), 4000);
      },
      error: (err) => {
        this.pwdSaving.set(false);
        this.pwdError.set(err?.message || 'Impossible de modifier le mot de passe');
      },
    });
  }
}
