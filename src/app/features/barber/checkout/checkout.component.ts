import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { InvoiceApiService } from '../../../core/services/invoice-api.service';
import { ProductApiService } from '../../../core/services/product-api.service';
import { Appointment } from '../../../core/models/appointment.model';
import { Product } from '../../../core/models/product.model';
import { Invoice } from '../../../core/models/invoice.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Encaissement</h1>

      @if (!selectedApt()) {
        <!-- Search appointment -->
        <div class="card mb-5">
          <h2 class="font-semibold mb-3">File d'aujourd'hui</h2>
          @if (todayQueue().length === 0) {
            <p class="text-gray-400">Aucun RDV en cours</p>
          }
          <div class="space-y-2">
            @for (apt of todayQueue(); track apt.id) {
              @if (apt.status === 'IN_PROGRESS' || apt.status === 'CONFIRMED') {
                <button (click)="selectApt(apt)"
                        class="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 border border-gray-200">
                  <div class="font-medium">{{ apt.client.firstName }} {{ apt.client.lastName }}</div>
                  <div class="text-sm text-gray-500">{{ apt.service.name }} — {{ apt.startTime | date:'HH:mm' }}</div>
                </button>
              }
            }
          </div>
        </div>
      } @else {
        <!-- Checkout form -->
        <div class="card mb-5">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h2 class="font-bold text-lg">{{ selectedApt()!.client.firstName }} {{ selectedApt()!.client.lastName }}</h2>
              <p class="text-gray-500">{{ selectedApt()!.client.phone }}</p>
            </div>
            <button (click)="selectedApt.set(null)" class="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <!-- Lines -->
          <div class="border rounded-xl overflow-hidden mb-4">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr><th class="text-left p-3">Désignation</th><th class="text-right p-3">Prix</th></tr>
              </thead>
              <tbody>
                <!-- Service line (fixed) -->
                <tr class="border-t">
                  <td class="p-3">{{ selectedApt()!.service.name }} <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full ml-1">Service</span></td>
                  <td class="p-3 text-right font-medium">{{ selectedApt()!.service.price }} MAD</td>
                </tr>
                <!-- Product lines -->
                @for (line of productLines; track $index) {
                  <tr class="border-t">
                    <td class="p-3">{{ line.product.name }} × {{ line.quantity }}</td>
                    <td class="p-3 text-right">{{ line.product.priceSell * line.quantity | number:'1.2-2' }} MAD</td>
                    <td class="p-2"><button (click)="removeLine($index)" class="text-red-400 hover:text-red-600">×</button></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Add product -->
          <div class="flex gap-3 mb-4">
            <select [(ngModel)]="selectedProductId" class="input-field flex-1">
              <option value="">Ajouter un produit...</option>
              @for (p of products(); track p.id) {
                <option [value]="p.id">{{ p.name }} ({{ p.stockQuantity }} en stock) — {{ p.priceSell }} MAD</option>
              }
            </select>
            <input type="number" [(ngModel)]="productQty" min="1" class="input-field w-20">
            <button (click)="addProduct()" class="btn-secondary">Ajouter</button>
          </div>

          <!-- Tax + total -->
          <div class="flex items-center gap-3 mb-4">
            <label class="text-sm text-gray-600">TVA (%)</label>
            <input type="number" [(ngModel)]="taxRate" min="0" max="100" class="input-field w-24">
          </div>

          <div class="bg-gray-50 rounded-xl p-4 space-y-1 text-sm mb-4">
            <div class="flex justify-between"><span class="text-gray-500">Sous-total</span><span>{{ getSubtotal() | number:'1.2-2' }} MAD</span></div>
            @if (taxRate > 0) {
              <div class="flex justify-between"><span class="text-gray-500">TVA {{ taxRate }}%</span><span>{{ getTax() | number:'1.2-2' }} MAD</span></div>
            }
            <div class="flex justify-between text-base font-bold pt-2 border-t"><span>TOTAL</span><span class="text-indigo-600">{{ getTotal() | number:'1.2-2' }} MAD</span></div>
          </div>

          <div class="flex items-center gap-3 mb-4">
            <input type="checkbox" [(ngModel)]="generatePdf" id="pdf" class="w-4 h-4">
            <label for="pdf" class="text-sm text-gray-600">Générer une facture PDF</label>
          </div>

          <button (click)="doCheckout()" [disabled]="processing()"
                  class="btn-primary w-full text-center disabled:opacity-50 text-base py-3">
            {{ processing() ? 'Traitement...' : 'Encaisser — ' + getTotal() + ' MAD' }}
          </button>
        </div>

        @if (invoice()) {
          <div class="card bg-green-50 border-green-200">
            <div class="text-green-700 font-bold mb-2">✅ Paiement enregistré!</div>
            <p class="text-sm">Facture <strong>{{ invoice()!.invoiceNumber }}</strong></p>
            @if (invoice()!.pdfUrl) {
              <a [href]="'/api/v1/barber/invoices/' + invoice()!.id + '/pdf'" target="_blank"
                 class="mt-3 inline-block btn-primary text-sm">Télécharger PDF</a>
            }
          </div>
        }
      }
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  todayQueue = signal<Appointment[]>([]);
  products = signal<Product[]>([]);
  selectedApt = signal<Appointment | null>(null);
  invoice = signal<Invoice | null>(null);
  processing = signal(false);

  productLines: { product: Product; quantity: number }[] = [];
  selectedProductId = '';
  productQty = 1;
  taxRate = 0;
  generatePdf = false;

  constructor(
    private appointmentApi: AppointmentApiService,
    private invoiceApi: InvoiceApiService,
    private productApi: ProductApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.appointmentApi.getTodayQueue().subscribe(q => this.todayQueue.set(q));
    this.productApi.list().subscribe(p => this.products.set(p));

    const aptId = this.route.snapshot.queryParamMap.get('appointmentId');
    if (aptId) {
      this.appointmentApi.getTodayQueue().subscribe(q => {
        const apt = q.find(a => a.id === Number(aptId));
        if (apt) this.selectApt(apt);
      });
    }
  }

  selectApt(apt: Appointment) { this.selectedApt.set(apt); this.productLines = []; this.invoice.set(null); }

  addProduct() {
    if (!this.selectedProductId) return;
    const product = this.products().find(p => p.id === Number(this.selectedProductId));
    if (!product) return;
    const existing = this.productLines.find(l => l.product.id === product.id);
    if (existing) { existing.quantity += this.productQty; }
    else { this.productLines.push({ product, quantity: this.productQty }); }
    this.selectedProductId = '';
    this.productQty = 1;
  }

  removeLine(idx: number) { this.productLines.splice(idx, 1); }

  getSubtotal(): number {
    const svcPrice = this.selectedApt()?.service.price ?? 0;
    return +svcPrice + this.productLines.reduce((s, l) => s + l.product.priceSell * l.quantity, 0);
  }

  getTax(): number { return this.getSubtotal() * this.taxRate / 100; }
  getTotal(): number { return +(this.getSubtotal() + this.getTax()).toFixed(2); }

  doCheckout() {
    const apt = this.selectedApt();
    if (!apt) return;
    this.processing.set(true);
    this.invoiceApi.checkout({
      appointmentId: apt.id,
      products: this.productLines.map(l => ({ productId: l.product.id, quantity: l.quantity })),
      taxRate: this.taxRate,
      generatePdf: this.generatePdf
    }).subscribe({
      next: inv => { this.invoice.set(inv); this.processing.set(false); },
      error: () => this.processing.set(false)
    });
  }
}
