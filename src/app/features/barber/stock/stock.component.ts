import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductApiService } from '../../../core/services/product-api.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Gestion du Stock</h1>

      @if (lowStock().length > 0) {
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h3 class="font-semibold text-amber-800 mb-2">⚠️ Stock bas ({{ lowStock().length }} produits)</h3>
          <div class="flex flex-wrap gap-2">
            @for (p of lowStock(); track p.id) {
              <span class="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full">
                {{ p.name }}: {{ p.stockQuantity }}
              </span>
            }
          </div>
        </div>
      }

      <div class="card">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-gray-500 border-b">
              <th class="pb-3">Produit</th>
              <th class="pb-3 text-center">Stock</th>
              <th class="pb-3 text-center">Seuil alerte</th>
              <th class="pb-3">Ajuster</th>
            </tr>
          </thead>
          <tbody>
            @for (p of products(); track p.id) {
              <tr class="border-b border-gray-50 hover:bg-gray-50">
                <td class="py-3">
                  <div class="font-medium">{{ p.name }}</div>
                  <div class="text-gray-400 text-xs">{{ p.category }}</div>
                </td>
                <td class="py-3 text-center">
                  <span [class]="p.stockQuantity <= p.stockAlertMin ? 'text-red-600 font-bold' : 'text-gray-800'">
                    {{ p.stockQuantity }}
                  </span>
                </td>
                <td class="py-3 text-center text-gray-500">{{ p.stockAlertMin }}</td>
                <td class="py-3">
                  <div class="flex items-center gap-2">
                    <input type="number" [(ngModel)]="adjustments[p.id]" class="input-field w-20 text-center text-sm py-1" placeholder="±">
                    <button (click)="adjust(p)" class="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200">
                      Appliquer
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class StockComponent implements OnInit {
  products = signal<Product[]>([]);
  lowStock = signal<Product[]>([]);
  adjustments: Record<number, number> = {};

  constructor(private productApi: ProductApiService, private http: HttpClient) {}

  ngOnInit() {
    this.loadProducts();
    this.http.get<Product[]>('/api/v1/barber/stock/alerts').subscribe(p => this.lowStock.set(p));
  }

  loadProducts() {
    this.productApi.list().subscribe(p => this.products.set(p));
  }

  adjust(product: Product) {
    const qty = this.adjustments[product.id];
    if (!qty) return;
    this.http.post('/api/v1/barber/stock/adjustment', {
      productId: product.id, quantity: qty
    }).subscribe(() => {
      this.adjustments[product.id] = 0;
      this.loadProducts();
    });
  }
}
