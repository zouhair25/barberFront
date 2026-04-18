import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductApiService } from '../../../core/services/product-api.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-products-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Produits</h1>
        <button (click)="showForm.set(!showForm())" class="btn-primary">+ Nouveau produit</button>
      </div>

      @if (showForm()) {
        <div class="card mb-5 border-2 border-indigo-200">
          <h3 class="font-semibold mb-4">{{ editing ? 'Modifier' : 'Nouveau produit' }}</h3>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Nom</label><input type="text" [(ngModel)]="form.name" class="input-field"></div>
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Catégorie</label><input type="text" [(ngModel)]="form.category" class="input-field" placeholder="ex: Shampoing, Cire..."></div>
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Prix vente (MAD)</label><input type="number" [(ngModel)]="form.priceSell" class="input-field"></div>
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Prix coût (MAD)</label><input type="number" [(ngModel)]="form.priceCost" class="input-field"></div>
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Stock initial</label><input type="number" [(ngModel)]="form.stockQuantity" class="input-field"></div>
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Seuil alerte</label><input type="number" [(ngModel)]="form.stockAlertMin" class="input-field"></div>
          </div>
          <div class="flex items-center gap-2 mt-3">
            <input type="checkbox" [(ngModel)]="form.forSale" id="visible" class="w-4 h-4">
            <label for="visible" class="text-sm text-gray-600">Visible par les clients</label>
          </div>
          <div class="flex gap-3 mt-4">
            <button (click)="save()" class="btn-primary">{{ editing ? 'Mettre à jour' : 'Créer' }}</button>
            <button (click)="resetForm()" class="btn-secondary">Annuler</button>
          </div>
        </div>
      }

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (p of products(); track p.id) {
          <div class="card">
            <div class="flex justify-between items-start mb-2">
              <div class="font-bold text-gray-800">{{ p.name }}</div>
              <div class="flex gap-1">
                <button (click)="toggleVisibility(p)" [title]="p.forSale ? 'Masquer aux clients' : 'Rendre visible'"
                        [class]="p.forSale ? 'text-green-500' : 'text-gray-400'"
                        class="hover:opacity-70 text-lg">{{ p.forSale ? '👁️' : '🙈' }}</button>
                <button (click)="edit(p)" class="text-gray-400 hover:text-indigo-600">✏️</button>
                <button (click)="delete(p.id)" class="text-gray-400 hover:text-red-500">🗑️</button>
              </div>
            </div>
            @if (p.category) { <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{{ p.category }}</span> }
            <div class="mt-3 flex justify-between items-center">
              <span class="text-indigo-600 font-bold">{{ p.priceSell }} MAD</span>
              <span [class]="p.stockQuantity <= p.stockAlertMin ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
                    class="text-xs px-2 py-1 rounded-full font-medium">
                Stock: {{ p.stockQuantity }}
              </span>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProductsCatalogComponent implements OnInit {
  products = signal<Product[]>([]);
  showForm = signal(false);
  editing: any = null;
  form: any = { name: '', category: '', priceSell: 0, priceCost: 0, stockQuantity: 0, stockAlertMin: 5, forSale: true };

  constructor(private productApi: ProductApiService) {}
  ngOnInit() { this.load(); }
  load() { this.productApi.list().subscribe(p => this.products.set(p)); }

  save() {
    const req = this.editing
      ? this.productApi.update(this.editing.id, this.form)
      : this.productApi.create(this.form);
    req.subscribe(() => { this.load(); this.resetForm(); });
  }

  edit(p: Product) { this.editing = p; this.form = { ...p }; this.showForm.set(true); }
  toggleVisibility(p: Product) { this.productApi.toggleVisibility(p.id).subscribe(() => this.load()); }
  delete(id: number) {
    if (!confirm('Désactiver ce produit?')) return;
    this.productApi.deactivate(id).subscribe(() => this.load());
  }
  resetForm() { this.editing = null; this.form = { name: '', category: '', priceSell: 0, priceCost: 0, stockQuantity: 0, stockAlertMin: 5, forSale: true }; this.showForm.set(false); }
}
