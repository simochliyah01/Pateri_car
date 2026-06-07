import { Component, EventEmitter, Input, OnChanges, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LucideAngularModule } from 'lucide-angular';
import { VehicleService } from '../../../core/services/vehicle.service';
import { Vehicle } from '../../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicle-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center
                bg-ink-900/50 backdrop-blur-sm p-4"
         (click)="cancel()">
      <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full
                  max-h-[90vh] overflow-hidden flex flex-col"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <p class="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em]">
              {{ isEdit() ? 'Modification' : 'Nouveau véhicule' }}
            </p>
            <h2 class="text-lg font-bold text-ink-900">
              {{ isEdit() ? 'Modifier le véhicule' : 'Ajouter une voiture' }}
            </h2>
          </div>
          <button (click)="cancel()"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <lucide-icon name="x" [size]="18"></lucide-icon>
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <form [formGroup]="form" class="space-y-5">

            <!-- Identification -->
            <div>
              <h3 class="form-section-title">Identification</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="form-label">Marque *</label>
                  <input type="text" formControlName="brand"
                         placeholder="Renault, Peugeot..." class="form-input" />
                  @if (showError('brand')) {
                    <p class="form-error">Marque requise</p>
                  }
                </div>
                <div>
                  <label class="form-label">Modèle *</label>
                  <input type="text" formControlName="model"
                         placeholder="Clio 5, 208..." class="form-input" />
                  @if (showError('model')) {
                    <p class="form-error">Modèle requis</p>
                  }
                </div>
              </div>
              <div class="grid grid-cols-3 gap-3 mt-3">
                <div>
                  <label class="form-label">Année *</label>
                  <input type="number" formControlName="year"
                         placeholder="2024" min="2000" [max]="currentYear + 1"
                         class="form-input" />
                  @if (showError('year')) {
                    <p class="form-error">Année invalide</p>
                  }
                </div>
                <div>
                  <label class="form-label">Couleur</label>
                  <input type="text" formControlName="color"
                         placeholder="Blanc, Noir..." class="form-input" />
                </div>
                <div>
                  <label class="form-label">Plaque *</label>
                  <input type="text" formControlName="licensePlate"
                         placeholder="12345-A-B"
                         class="form-input font-mono uppercase" />
                  @if (showError('licensePlate')) {
                    <p class="form-error">Plaque requise</p>
                  }
                </div>
              </div>
            </div>

            <!-- Specifications -->
            <div class="pt-3 border-t border-gray-100">
              <h3 class="form-section-title">Spécifications</h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label class="form-label">Catégorie *</label>
                  <select formControlName="category" class="form-input">
                    <option value="ECONOMIQUE">Économique</option>
                    <option value="COMPACTE">Compacte</option>
                    <option value="BERLINE">Berline</option>
                    <option value="SUV">SUV</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="UTILITAIRE">Utilitaire</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Carburant *</label>
                  <select formControlName="fuelType" class="form-input">
                    <option value="ESSENCE">Essence</option>
                    <option value="DIESEL">Diesel</option>
                    <option value="HYBRIDE">Hybride</option>
                    <option value="ELECTRIQUE">Électrique</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Transmission *</label>
                  <select formControlName="transmission" class="form-input">
                    <option value="MANUAL">Manuelle</option>
                    <option value="AUTO">Automatique</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-3 mt-3">
                <div>
                  <label class="form-label">Places</label>
                  <input type="number" formControlName="seats"
                         min="2" max="9" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Portes</label>
                  <input type="number" formControlName="doors"
                         min="2" max="5" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Kilométrage</label>
                  <input type="number" formControlName="currentMileage"
                         min="0" placeholder="25000" class="form-input" />
                </div>
              </div>
            </div>

            <!-- Pricing + Status -->
            <div class="pt-3 border-t border-gray-100">
              <h3 class="form-section-title">Prix et disponibilité</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="form-label">Prix par jour (DH) *</label>
                  <input type="number" formControlName="pricePerDay"
                         min="0" placeholder="250" class="form-input" />
                  @if (showError('pricePerDay')) {
                    <p class="form-error">Prix requis et > 0</p>
                  }
                </div>
                <div>
                  <label class="form-label">Caution (DH) *</label>
                  <input type="number" formControlName="deposit"
                         min="0" placeholder="2000" class="form-input" />
                  @if (showError('deposit')) {
                    <p class="form-error">Caution requise (0 si aucune)</p>
                  }
                </div>
                <div>
                  <label class="form-label">Statut *</label>
                  <select formControlName="status" class="form-input">
                    <option value="AVAILABLE">Disponible</option>
                    <option value="RENTED">Louée</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Image upload -->
            <div class="pt-3 border-t border-gray-100">
              <h3 class="form-section-title">Image du véhicule (optionnel)</h3>

              @if (imagePreviewUrl() || existingImageUrl()) {
                <!-- Preview -->
                <div class="relative w-full max-w-xs h-40 rounded-xl overflow-hidden
                            bg-surface-50 border border-gray-200">
                  <img [src]="imagePreviewUrl() || existingImageUrl()!"
                       alt="Aperçu"
                       class="w-full h-full object-contain" />
                  <button type="button"
                          (click)="imagePreviewUrl() ? removeSelectedFile() : markDeleteCurrentImage()"
                          class="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600
                                 text-white rounded-full flex items-center justify-center
                                 transition-colors">
                    <lucide-icon name="x" [size]="14"></lucide-icon>
                  </button>
                </div>
                @if (imagePreviewUrl()) {
                  <p class="text-xs text-primary-600 mt-2 font-semibold">
                    Nouvelle image — sera enregistrée après la sauvegarde.
                  </p>
                }
              } @else {
                <!-- Upload zone -->
                <label class="block cursor-pointer">
                  <input #fileInput type="file" accept="image/*"
                         (change)="onFileSelected($event)" class="hidden" />
                  <div class="border-2 border-dashed border-gray-300
                              hover:border-primary-400 rounded-xl p-6 text-center
                              transition-colors">
                    <div class="w-12 h-12 bg-primary-50 rounded-full mx-auto mb-3
                                flex items-center justify-center">
                      <lucide-icon name="upload" [size]="20"
                                   class="text-primary-600"></lucide-icon>
                    </div>
                    <p class="text-sm font-semibold text-ink-900 mb-1">
                      Cliquez pour télécharger une image
                    </p>
                    <p class="text-xs text-ink-500">PNG, JPG · max 2 MB</p>
                  </div>
                </label>
              }
            </div>

            <!-- Description -->
            <div class="pt-3 border-t border-gray-100">
              <h3 class="form-section-title">Description (optionnel)</h3>
              <textarea formControlName="description" rows="3"
                        placeholder="Notes ou détails additionnels..."
                        class="form-input resize-none"></textarea>
            </div>

            @if (errorMessage()) {
              <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm
                          text-red-700 flex items-start gap-2">
                <lucide-icon name="alert-circle" [size]="16"
                             class="flex-shrink-0 mt-0.5"></lucide-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }
          </form>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-200 flex items-center
                    justify-between gap-3 bg-surface-50">
          @if (isEdit()) {
            <span class="text-xs text-ink-500">
              ID: {{ vehicle?.id }} · {{ vehicle?.licensePlate }}
            </span>
          } @else {
            <span class="text-xs text-ink-500">Tous les champs * sont requis</span>
          }
          <div class="flex gap-2">
            <button type="button" (click)="cancel()" [disabled]="saving()"
                    class="px-4 py-2 border border-gray-300 text-ink-700 hover:bg-white
                           font-semibold text-sm rounded-lg transition-colors
                           disabled:opacity-50">
              Annuler
            </button>
            <button type="button" (click)="save()"
                    [disabled]="saving() || form.invalid"
                    class="px-5 py-2 bg-primary-500 hover:bg-primary-600
                           disabled:bg-gray-300 text-white font-semibold text-sm
                           rounded-lg transition-colors flex items-center gap-2">
              @if (saving()) {
                <lucide-icon name="loader-2" [size]="14"
                             class="animate-spin"></lucide-icon>
                Enregistrement...
              } @else {
                <lucide-icon name="check" [size]="14"></lucide-icon>
                {{ isEdit() ? 'Mettre à jour' : 'Créer' }}
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .form-section-title {
      font-size: 10px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-bottom: 12px;
    }
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
      padding: 8px 12px;
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
    .form-error {
      color: #DC2626;
      font-size: 11px;
      font-weight: 500;
      margin-top: 4px;
    }
  `],
})
export class VehicleFormModalComponent implements OnInit, OnChanges {
  @Input() vehicle: Vehicle | null = null;
  @Output() saved = new EventEmitter<Vehicle>();
  @Output() cancelled = new EventEmitter<void>();

  private fb             = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private sanitizer      = inject(DomSanitizer);

  saving         = signal(false);
  errorMessage   = signal<string | null>(null);
  currentYear    = new Date().getFullYear();
  isEdit         = signal(false);

  selectedFile       = signal<File | null>(null);
  imagePreviewUrl    = signal<SafeUrl | null>(null);
  existingImageUrl   = signal<string | null>(null);
  deleteCurrentImage = signal(false);

  form: FormGroup = this.fb.group({
    brand:          ['', [Validators.required, Validators.maxLength(50)]],
    model:          ['', [Validators.required, Validators.maxLength(50)]],
    year:           [this.currentYear, [Validators.required, Validators.min(2000)]],
    color:          [''],
    licensePlate:   ['', [Validators.required, Validators.maxLength(20)]],
    category:       ['COMPACTE', Validators.required],
    fuelType:       ['ESSENCE', Validators.required],
    transmission:   ['MANUAL', Validators.required],
    seats:          [5, [Validators.min(2), Validators.max(9)]],
    doors:          [5, [Validators.min(2), Validators.max(5)]],
    currentMileage: [0, Validators.min(0)],
    pricePerDay:    [200, [Validators.required, Validators.min(1)]],
    deposit:        [0,   [Validators.required, Validators.min(0)]],
    status:         ['AVAILABLE', Validators.required],
    description:    [''],
  });

  ngOnInit()    { this.populateForm(); }
  ngOnChanges() { this.populateForm(); }

  populateForm() {
    this.selectedFile.set(null);
    this.imagePreviewUrl.set(null);
    this.deleteCurrentImage.set(false);

    if (this.vehicle) {
      this.isEdit.set(true);
      this.form.patchValue({
        brand:          this.vehicle.brand,
        model:          this.vehicle.model,
        year:           this.vehicle.year,
        color:          this.vehicle.color || '',
        licensePlate:   this.vehicle.licensePlate,
        category:       this.vehicle.category,
        fuelType:       this.vehicle.fuelType,
        transmission:   this.vehicle.transmission,
        seats:          this.vehicle.seats || 5,
        doors:          this.vehicle.doors || 5,
        currentMileage: this.vehicle.currentMileage || 0,
        pricePerDay:    this.vehicle.pricePerDay,
        deposit:        this.vehicle.deposit ?? 0,
        status:         this.vehicle.status,
        description:    this.vehicle.description || '',
      });
      this.existingImageUrl.set(
        this.vehicle.hasImage
          ? `${this.vehicleService.getVehicleImageUrl(this.vehicle.id)}?t=${Date.now()}`
          : null
      );
    } else {
      this.isEdit.set(false);
      this.existingImageUrl.set(null);
      this.form.reset({
        year:           this.currentYear,
        category:       'COMPACTE',
        fuelType:       'ESSENCE',
        transmission:   'MANUAL',
        seats:          5,
        doors:          5,
        currentMileage: 0,
        pricePerDay:    200,
        deposit:        0,
        status:         'AVAILABLE',
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Le fichier doit être une image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage.set("L'image ne doit pas dépasser 2 MB");
      return;
    }

    this.errorMessage.set(null);
    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreviewUrl.set(
        this.sanitizer.bypassSecurityTrustUrl(e.target?.result as string)
      );
    };
    reader.readAsDataURL(file);
  }

  removeSelectedFile() {
    this.selectedFile.set(null);
    this.imagePreviewUrl.set(null);
  }

  markDeleteCurrentImage() {
    this.deleteCurrentImage.set(true);
    this.existingImageUrl.set(null);
  }

  showError(fieldName: string): boolean {
    const ctrl = this.form.get(fieldName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  save() {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.errorMessage.set(null);

    const data = this.form.value;
    const obs = this.isEdit() && this.vehicle
      ? this.vehicleService.updateVehicle(this.vehicle.id, data)
      : this.vehicleService.createVehicle(data);

    obs.subscribe({
      next: (savedVehicle) => {
        const file = this.selectedFile();
        const doDelete = this.deleteCurrentImage() && !file;

        if (file) {
          this.vehicleService.uploadVehicleImage(savedVehicle.id, file).subscribe({
            next: (withImage) => { this.saving.set(false); this.saved.emit(withImage); },
            error: () => {
              this.errorMessage.set("Véhicule enregistré, mais l'image n'a pas pu être téléversée.");
              this.saving.set(false);
              this.saved.emit(savedVehicle);
            },
          });
        } else if (doDelete) {
          this.vehicleService.deleteVehicleImage(savedVehicle.id).subscribe({
            next: () => { this.saving.set(false); this.saved.emit(savedVehicle); },
            error: () => { this.saving.set(false); this.saved.emit(savedVehicle); },
          });
        } else {
          this.saving.set(false);
          this.saved.emit(savedVehicle);
        }
      },
      error: (err) => {
        const body = err?.error;
        let message = 'Une erreur est survenue';
        if (Array.isArray(body?.fieldErrors) && body.fieldErrors.length > 0) {
          message = body.fieldErrors
            .map((fe: { field: string; message: string }) => `${fe.message} (${fe.field})`)
            .join(' · ');
        } else if (body?.message) {
          message = body.message;
        } else if (err?.status === 409) {
          message = 'Cette plaque existe déjà';
        }
        this.errorMessage.set(message);
        this.saving.set(false);
      },
    });
  }

  cancel() {
    if (this.saving()) return;
    this.cancelled.emit();
  }
}
