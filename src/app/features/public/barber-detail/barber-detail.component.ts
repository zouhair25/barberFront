import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BarberApiService } from '../../../core/services/barber-api.service';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { BarberPublic, BarberServicePublic } from '../../../core/models/barber.model';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

@Component({
  selector: 'app-barber-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './barber-detail.component.html'
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
