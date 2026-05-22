import { Component, LOCALE_ID, OnInit, signal } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { Appointment, QueuePosition } from '../../../core/models/appointment.model';
import localeFr from '@angular/common/locales/fr';
registerLocaleData(localeFr);
@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-appointments.component.html',
  providers:[
    {provide: LOCALE_ID, useValue: 'fr'}
  ]
})
export class MyAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  queueInfo = signal<Map<number, QueuePosition>>(new Map());
  loading = signal(true);

  constructor(private api: AppointmentApiService) {}

  ngOnInit() {
    this.api.myAppointments(0, 20).subscribe({
      next: res => { 
        this.appointments.set(res.content); 
        this.loading.set(false); 
        console.log('appointment',res)
      },
      error: () => this.loading.set(false)
    });
  }

  loadQueue(apt: Appointment) {
    this.api.getQueuePosition(apt.id).subscribe(q => {
      const m = new Map(this.queueInfo());
      m.set(apt.id, q);
      this.queueInfo.set(m);
    });
  }

  cancel(id: number) {
    if (!confirm('Annuler ce rendez-vous?')) return;
    this.api.cancelAppointment(id).subscribe(() => {
      this.appointments.update(list => list.map(a => a.id === id ? { ...a, status: 'CANCELLED' as any } : a));
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      NO_SHOW: 'bg-gray-100 text-gray-600',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'En attente', CONFIRMED: 'Confirmé', IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminé', CANCELLED: 'Annulé', NO_SHOW: 'Absent'
    };
    return map[status] ?? status;
  }
}
