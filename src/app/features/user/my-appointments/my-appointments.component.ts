import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { Appointment, QueuePosition } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Mes Rendez-vous</h1>

      @if (appointments().length === 0 && !loading()) {
        <div class="card text-center py-12 text-gray-500">
          <p class="text-5xl mb-4">📅</p>
          <p>Vous n'avez pas encore de rendez-vous.</p>
        </div>
      }

      <div class="space-y-4">
        @for (apt of appointments(); track apt.id) {
          <div class="card">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-bold text-lg">{{ apt.barber.shopName }}</div>
                <div class="text-gray-600">{{ apt.service.name }} — {{ apt.service.price | currency:'MAD ':'symbol' }}</div>
                <div class="text-gray-500 text-sm mt-1">
                  📅 {{ apt.startTime | date:'EEEE dd MMM yyyy à HH:mm':'':'fr' }}
                </div>
              </div>
              <span [class]="statusClass(apt.status)" class="text-xs px-3 py-1 rounded-full font-medium">
                {{ statusLabel(apt.status) }}
              </span>
            </div>

            @if (apt.status === 'PENDING' || apt.status === 'CONFIRMED') {
              <div class="mt-3 flex gap-3">
                <button (click)="loadQueue(apt)" class="text-indigo-600 text-sm hover:underline">
                  Voir ma position
                </button>
                <button (click)="cancel(apt.id)" class="text-red-500 text-sm hover:underline">
                  Annuler
                </button>
              </div>
            }

            @if (queueInfo().get(apt.id); as q) {
              <div class="mt-3 bg-blue-50 text-blue-700 rounded-lg p-3 text-sm">
                Position <strong>{{ q.queuePosition }}</strong> — <strong>{{ q.peopleAhead }}</strong> personne(s) avant vous
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class MyAppointmentsComponent implements OnInit {
  appointments = signal<Appointment[]>([]);
  queueInfo = signal<Map<number, QueuePosition>>(new Map());
  loading = signal(true);

  constructor(private api: AppointmentApiService) {}

  ngOnInit() {
    this.api.myAppointments(0, 20).subscribe({
      next: res => { this.appointments.set(res.content); this.loading.set(false); },
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
