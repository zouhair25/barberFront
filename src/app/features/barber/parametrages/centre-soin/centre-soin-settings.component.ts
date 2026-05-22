import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentreSoinApiService } from '../../../../core/services/centre-soin-api.service';
import { CentreSoin } from '../../../../core/models/centre-soin.model';

@Component({
  selector: 'app-centre-soin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl">
      <div class="mb-5">
        <h2 class="text-lg font-semibold text-gray-700">Informations du centre</h2>
        <p class="text-xs text-gray-400">Modifiez les informations de votre centre de soin</p>
      </div>

      @if (loading()) {
        <div class="text-center py-12 text-gray-400">
          <div class="animate-spin text-3xl mb-2">⏳</div>
          <p class="text-sm">Chargement...</p>
        </div>
      } @else if (centre()) {
        <div class="card">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Prénom <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="form.firstName" class="input-field" placeholder="Prénom">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Nom <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="form.lastName" class="input-field" placeholder="Nom">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Email <span class="text-red-500">*</span></label>
              <input type="email" [(ngModel)]="form.email" class="input-field" placeholder="email@exemple.com">
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Téléphone</label>
              <input type="tel" [(ngModel)]="form.phone" class="input-field" placeholder="+212 6XX XXX XXX">
            </div>
            <div class="md:col-span-2">
              <label class="text-sm font-medium text-gray-700 block mb-1">Photo de profil (URL)</label>
              <input type="url" [(ngModel)]="form.profilePhoto" class="input-field" placeholder="https://...">
            </div>
          </div>

          @if (form.profilePhoto) {
            <div class="mt-4 flex items-center gap-3">
              <img [src]="form.profilePhoto" alt="Aperçu" class="w-16 h-16 rounded-full object-cover border-2 border-gray-200">
              <span class="text-xs text-gray-400">Aperçu de la photo</span>
            </div>
          }

          @if (saved()) {
            <div class="mt-4 flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm">
              <span>✅</span>
              <span>Modifications enregistrées avec succès</span>
            </div>
          }

          <div class="flex gap-3 mt-6 pt-5 border-t border-gray-100">
            <button (click)="save()" class="btn-primary" [disabled]="saving() || !form.firstName || !form.lastName || !form.email">
              {{ saving() ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>
            <button (click)="reset()" class="btn-secondary" [disabled]="saving()">Annuler</button>
          </div>
        </div>
      } @else {
        <div class="text-center py-12 text-gray-400">
          <div class="text-4xl mb-3">🏪</div>
          <p class="text-sm">Impossible de charger les informations du centre.</p>
        </div>
      }
    </div>
  `
})
export class CentreSoinSettingsComponent implements OnInit {
  centre = signal<CentreSoin | null>(null);
  loading = signal(true);
  saving = signal(false);
  saved = signal(false);

  form: Partial<CentreSoin> = {};

  constructor(private centreSoinApi: CentreSoinApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.centreSoinApi.get().subscribe({
      next: c => { this.centre.set(c); this.form = { ...c }; this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  save() {
    this.saving.set(true);
    this.saved.set(false);
    this.centreSoinApi.update(this.form).subscribe({
      next: c => {
        this.centre.set(c);
        this.form = { ...c };
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => this.saving.set(false)
    });
  }

  reset() {
    const c = this.centre();
    if (c) this.form = { ...c };
  }
}
