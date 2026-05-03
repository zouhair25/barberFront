import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BarberApiService } from '../../../core/services/barber-api.service';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { BarberPublic, BarberServicePublic } from '../../../core/models/barber.model';
import { format, addDays } from 'date-fns';
import { fr, th } from 'date-fns/locale';

@Component({
  selector: 'app-barber-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-8" *ngIf="barber()">
      <!-- Header -->
      <div class="card mb-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">{{ barber()!.shopName }}</h1>
            @if (barber()!.city) { <p class="text-gray-500 mt-1">📍 {{ barber()!.address }}, {{ barber()!.city }}</p> }
            @if (barber()!.phone) { <p class="text-gray-500">📞 {{ barber()!.phone }}</p> }
            @if (barber()!.bio) { <p class="text-gray-600 mt-3">{{ barber()!.bio }}</p> }
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold" [class]="barber()!.queueCount === 0 ? 'text-green-600' : 'text-orange-500'">
              {{ barber()!.queueCount }}
            </div>
            <div class="text-gray-500 text-sm">en attente</div>
            @if (barber()!.averageRating) {
              <div class="text-amber-500 mt-2">★ {{ barber()!.averageRating | number:'1.1-1' }}</div>
            }
          </div>
        </div>
      </div>

      <!-- Booking Wizard -->
      <div class="card">
        <h2 class="text-xl font-bold mb-5">Réserver un créneau</h2>

        <!-- Step 1: Select service -->
        @if (step() === 1) {
          <h3 class="font-semibold text-gray-700 mb-3">1. Choisir un service</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            @for (svc of barber()!.services; track svc.id) {
              <button (click)="selectService(svc)"
                      [class]="selectedService()?.id === svc.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'"
                      class="border-2 rounded-xl p-4 text-left hover:border-indigo-300 transition-colors">
                <div class="font-semibold text-gray-800">{{ svc.name }}</div>
                <div class="text-gray-500 text-sm">{{ svc.durationMin }} min</div>
                <div class="text-indigo-600 font-bold mt-1">{{ svc.price | number:'1.2-2' }} MAD</div>
              </button>
            }
          </div>
          @if (selectedService()) {
            <button (click)="step.set(2)" class="btn-primary mt-5 w-full">Continuer →</button>
          }
        }

        <!-- Step 2: Select date & slot -->
        @if (step() === 2) {
          <h3 class="font-semibold text-gray-700 mb-3">2. Choisir un créneau</h3>

          <div class="flex gap-2 mb-4 overflow-x-auto pb-1">
            @for (d of next7Days; track d) {
              <button (click)="selectDate(d)"
                      [class]="selectedDate() === d ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'"
                      class="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                {{ formatDay(d) }}
              </button>
            }
          </div>

          @if (slotsLoading()) {
            <p class="text-gray-400 text-center py-6">Chargement des créneaux...</p>
          } @else if (slots().length === 0) {
            <p class="text-gray-500 text-center py-6">Aucun créneau disponible ce jour</p>
          } @else {
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
              @for (slot of slots(); track slot) {
                <button (click)="selectedSlot.set(slot)"
                        [class]="selectedSlot() === slot ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-indigo-50'"
                        class="py-2 rounded-lg text-sm font-medium border border-gray-200 transition-colors">
                  {{ formatTime(slot) }}
                </button>
              }
            </div>
          }

          <div class="flex gap-3 mt-5">
            <button (click)="step.set(1)" class="btn-secondary flex-1">← Retour</button>
            @if (selectedSlot()) {
              <button (click)="step.set(3)" class="btn-primary flex-1">Confirmer →</button>
            }
          </div>
        }

        <!-- Step 3: Confirm -->
        @if (step() === 3) {
          <h3 class="font-semibold text-gray-700 mb-4">3. Confirmation</h3>
          <div class="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-500">Service</span>
              <span class="font-medium">{{ selectedService()!.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Date & Heure</span>
              <span class="font-medium">{{ formatSlotDisplay(selectedSlot()!) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Durée</span>
              <span class="font-medium">{{ selectedService()!.durationMin }} min</span>
            </div>
            <div class="flex justify-between border-t pt-2">
              <span class="text-gray-700 font-semibold">Prix</span>
              <span class="text-indigo-600 font-bold text-lg">{{ selectedService()!.price | number:'1.2-2' }} MAD</span>
            </div>
          </div>

          <textarea [(ngModel)]="notes" placeholder="Notes (optionnel)..."
                    class="input-field mb-4" rows="2"></textarea>

          @if (!auth.isLoggedIn()) {
            <p class="text-amber-600 bg-amber-50 p-3 rounded-lg mb-4 text-sm">
              ⚠️ Vous devez être connecté pour réserver.
              <a routerLink="/auth/login" class="underline font-medium">Se connecter</a>
            </p>
          }

          <div class="flex gap-3">
            <button (click)="step.set(2)" class="btn-secondary flex-1">← Retour</button>
            <button (click)="confirmBooking()" [disabled]="booking() || !auth.isLoggedIn()"
                    class="btn-primary flex-1 disabled:opacity-50">
              {{ booking() ? 'Réservation...' : 'Confirmer la réservation' }}
            </button>
          </div>

          @if (bookingSuccess()) {
            <div class="mt-4 p-4 bg-green-50 text-green-700 rounded-xl text-center">
              ✅ Réservation confirmée! Vous êtes en position {{ bookingSuccess()!.queuePosition }} dans la file.
            </div>
          }
        }
      </div>
    </div>
  `
})
export class BarberDetailComponent implements OnInit {
  barber = signal<BarberPublic | null>(null);
  step = signal(1);
  selectedService = signal<BarberServicePublic | null>(null);
  selectedDate = signal<string>('');
  selectedSlot = signal<string | null>(null);
  slots = signal<string[]>([]);
  slotsLoading = signal(false);
  notes = '';
  booking = signal(false);
  bookingSuccess = signal<any>(null);

  next7Days: string[] = [];

  constructor(
    private route: ActivatedRoute,
    public auth: AuthService,
    private barberApi: BarberApiService,
    private appointmentApi: AppointmentApiService
  ) {
    for (let i = 0; i < 7; i++) {
      this.next7Days.push(format(addDays(new Date(), i), 'yyyy-MM-dd'));
    }
  }

  ngOnInit() {
    console.log('barber',this.barber)
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.barberApi.getBarber(id).subscribe(b => this.barber.set(b));
    this.selectedDate.set(this.next7Days[0]);
  }

  selectService(svc: BarberServicePublic) {
    this.selectedService.set(svc);
  }

  selectDate(date: string) {
    this.selectedDate.set(date);
    this.selectedSlot.set(null);
    this.loadSlots();
  }

  loadSlots() {
    this.slotsLoading.set(true);
    const userCentreSoinId = this.barber()!.id;
    this.barberApi.getAvailableSlots(userCentreSoinId, this.selectedDate(), this.selectedService()?.id).subscribe({
      next: slots => { this.slots.set(slots); this.slotsLoading.set(false); },
      error: () => { this.slots.set([]); this.slotsLoading.set(false); }
    });
  }

  confirmBooking() {
    if (!this.selectedSlot() || !this.selectedService()) return;
    this.booking.set(true);
    this.appointmentApi.book({
      userCentreSoinId: this.barber()!.id,
      serviceId: this.selectedService()!.id,
      startTime: this.selectedSlot()!,
      notes: this.notes
    }).subscribe({
      next: apt => { this.bookingSuccess.set(apt); this.booking.set(false); },
      error: () => this.booking.set(false)
    });
  }

  formatDay(date: string): string {
    return format(new Date(date), 'EEE dd', { locale: fr });
  }

  formatTime(slot: string): string {
    return format(new Date(slot), 'HH:mm');
  }

  formatSlotDisplay(slot: string): string {
    return format(new Date(slot), 'EEEE dd MMM à HH:mm', { locale: fr });
  }
}
