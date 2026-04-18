import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductApiService } from '../../../core/services/product-api.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Commandes Fournisseurs</h1>
        <button (click)="showForm.set(!showForm())" class="btn-primary">+ Nouvelle commande</button>
      </div>

      @if (showForm()) {
        <div class="card mb-5 border-2 border-indigo-200">
          <h3 class="font-semibold mb-4">Nouvelle commande</h3>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Date prévue réception</label>
              <input type="date" [(ngModel)]="orderForm.expectedDate" class="input-field"></div>
            <div><label class="text-sm font-medium text-gray-700 block mb-1">Notes</label>
              <input type="text" [(ngModel)]="orderForm.notes" class="input-field"></div>
          </div>

          <div class="mb-4">
            <h4 class="font-medium text-gray-700 mb-2">Produits à commander</h4>
            <div class="flex gap-3 mb-2">
              <select [(ngModel)]="selProduct" class="input-field flex-1">
                <option value="">Sélectionner un produit...</option>
                @for (p of products(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
              <input type="number" [(ngModel)]="selQty" min="1" class="input-field w-20" placeholder="Qté">
              <input type="number" [(ngModel)]="selCost" min="0" class="input-field w-28" placeholder="Prix unit.">
              <button (click)="addLine()" class="btn-secondary">Ajouter</button>
            </div>

            @for (line of orderLines; track $index) {
              <div class="flex justify-between items-center py-2 border-b text-sm">
                <span>{{ line.productName }} × {{ line.quantityOrdered }}</span>
                <span>{{ line.unitCost * line.quantityOrdered | number:'1.2-2' }} MAD</span>
                <button (click)="orderLines.splice($index, 1)" class="text-red-400">×</button>
              </div>
            }
          </div>

          <div class="flex gap-3">
            <button (click)="createOrder()" [disabled]="orderLines.length === 0" class="btn-primary disabled:opacity-50">Passer la commande</button>
            <button (click)="showForm.set(false)" class="btn-secondary">Annuler</button>
          </div>
        </div>
      }

      <div class="space-y-3">
        @for (order of orders(); track order.id) {
          <div class="card">
            <div class="flex justify-between items-start">
              <div>
                <div class="flex items-center gap-3">
                  <span class="font-bold">#{{ order.id }}</span>
                  <span [class]="orderStatusClass(order.status)" class="text-xs px-2 py-1 rounded-full">{{ orderStatusLabel(order.status) }}</span>
                </div>
                <div class="text-gray-500 text-sm mt-1">{{ order.orderDate | date:'dd/MM/yyyy' }}</div>
                <div class="text-indigo-600 font-bold mt-1">{{ order.totalAmount | number:'1.2-2' }} MAD</div>
              </div>
              @if (order.status === 'ORDERED') {
                <button (click)="receive(order.id)" class="btn-primary text-sm">Marquer reçu</button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  orders = signal<any[]>([]);
  products = signal<Product[]>([]);
  showForm = signal(false);
  orderForm = { expectedDate: '', notes: '' };
  orderLines: any[] = [];
  selProduct = '';
  selQty = 1;
  selCost = 0;

  constructor(private http: HttpClient, private productApi: ProductApiService) {}

  ngOnInit() {
    this.loadOrders();
    this.productApi.list().subscribe(p => this.products.set(p));
  }

  loadOrders() { this.http.get<any>('/api/v1/barber/orders').subscribe(r => this.orders.set(r.content || [])); }

  addLine() {
    const product = this.products().find(p => p.id === Number(this.selProduct));
    if (!product || !this.selQty) return;
    this.orderLines.push({ productId: product.id, productName: product.name, quantityOrdered: this.selQty, unitCost: this.selCost });
    this.selProduct = '';
  }

  createOrder() {
    const body = { ...this.orderForm, lines: this.orderLines.map(l => ({ productId: l.productId, quantityOrdered: l.quantityOrdered, unitCost: l.unitCost })) };
    this.http.post('/api/v1/barber/orders', body).subscribe(() => { this.loadOrders(); this.showForm.set(false); this.orderLines = []; });
  }

  receive(id: number) {
    this.http.patch(`/api/v1/barber/orders/${id}/receive`, {}).subscribe(() => this.loadOrders());
  }

  orderStatusClass(s: string): string { return s === 'RECEIVED' ? 'bg-green-100 text-green-700' : s === 'ORDERED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'; }
  orderStatusLabel(s: string): string { const m: any = { DRAFT: 'Brouillon', ORDERED: 'Commandé', RECEIVED: 'Reçu', CANCELLED: 'Annulé', PARTIAL: 'Partiel' }; return m[s] ?? s; }
}
