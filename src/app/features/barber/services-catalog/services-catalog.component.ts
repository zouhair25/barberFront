import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-services-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Catalogue de Services</h1>
        <button (click)="showForm.set(!showForm())" class="btn-primary">+ Nouveau service</button>
      </div>

      @if (showForm()) {
        <div class="card mb-5 border-indigo-200 border-2">
          <h3 class="font-semibold mb-4">{{ editing ? 'Modifier le service' : 'Nouveau service' }}</h3>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Nom</label>
              <input type="text" [(ngModel)]="form.name" class="input-field"></div>
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Catégorie</label>
              <select [(ngModel)]="form.category" class="input-field">
                <option value="MENS_CUT">Coupe Homme</option>
                <option value="WOMENS_CUT">Coupe Femme</option>
                <option value="BEARD">Barbe</option>
                <option value="TREATMENT">Soin</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Prix (MAD)</label>
              <input type="number" [(ngModel)]="form.price" class="input-field"></div>
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Durée (min)</label>
              <input type="number" [(ngModel)]="form.durationMin" class="input-field"></div>
          </div>
          <textarea [(ngModel)]="form.description" placeholder="Description..." class="input-field mt-3" rows="2"></textarea>
          <div class="flex gap-3 mt-4">
            <button (click)="save()" class="btn-primary">{{ editing ? 'Mettre à jour' : 'Créer' }}</button>
            <button (click)="resetForm()" class="btn-secondary">Annuler</button>
          </div>
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (svc of services(); track svc.id) {
          <div class="card flex justify-between items-start">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-800">{{ svc.name }}</span>
                <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{{ categoryLabel(svc.category) }}</span>
              </div>
              <div class="text-indigo-600 font-bold">{{ svc.price }} MAD</div>
              <div class="text-gray-500 text-sm">⏱ {{ svc.durationMin }} min</div>
            </div>
            <div class="flex gap-2">
              <button (click)="edit(svc)" class="text-gray-400 hover:text-indigo-600">✏️</button>
              <button (click)="delete(svc.id)" class="text-gray-400 hover:text-red-500">🗑️</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ServicesCatalogComponent implements OnInit {
  services = signal<any[]>([]);
  showForm = signal(false);
  editing: any = null;
  form = { name: '', category: 'MENS_CUT', price: 0, durationMin: 30, description: '' };

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }
  load() { this.http.get<any[]>('/api/v1/barber/services').subscribe(s => this.services.set(s)); }

  save() {
    const req = this.editing
      ? this.http.put(`/api/v1/barber/services/${this.editing.id}`, this.form)
      : this.http.post('/api/v1/barber/services', this.form);
    req.subscribe(() => { this.load(); this.resetForm(); });
  }

  edit(svc: any) { this.editing = svc; this.form = { ...svc }; this.showForm.set(true); }

  delete(id: number) {
    if (!confirm('Supprimer ce service?')) return;
    this.http.delete(`/api/v1/barber/services/${id}`).subscribe(() => this.load());
  }

  resetForm() { this.editing = null; this.form = { name: '', category: 'MENS_CUT', price: 0, durationMin: 30, description: '' }; this.showForm.set(false); }

  categoryLabel(cat: string): string {
    const m: Record<string, string> = { MENS_CUT: 'Homme', WOMENS_CUT: 'Femme', BEARD: 'Barbe', TREATMENT: 'Soin', OTHER: 'Autre' };
    return m[cat] ?? cat;
  }
}
