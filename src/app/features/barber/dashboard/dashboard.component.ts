import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsApiService } from '../../../core/services/stats-api.service';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div>
      <h1 class="text-2xl font-bold text-gray-800 mb-6">Tableau de bord</h1>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div class="card bg-indigo-600 text-white">
          <div class="text-3xl font-bold">{{ dailyStats()?.revenue | currency:'MAD ':'symbol':'1.2-2' }}</div>
          <div class="text-indigo-200 mt-1">Chiffre d'affaires aujourd'hui</div>
        </div>
        <div class="card bg-emerald-600 text-white">
          <div class="text-3xl font-bold">{{ dailyStats()?.totalAppointments || 0 }}</div>
          <div class="text-emerald-200 mt-1">RDV aujourd'hui</div>
        </div>
        <div class="card bg-amber-500 text-white">
          <div class="text-3xl font-bold">{{ todayQueue().length }}</div>
          <div class="text-amber-100 mt-1">En attente maintenant</div>
        </div>
      </div>

      <!-- Today's queue -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-gray-800">File d'attente d'aujourd'hui</h2>
          <a routerLink="/barber/agenda" class="text-indigo-600 text-sm hover:underline">Voir l'agenda →</a>
        </div>

        @if (todayQueue().length === 0) {
          <p class="text-gray-500 text-center py-8">Aucun rendez-vous aujourd'hui</p>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-gray-500 text-sm border-b">
                  <th class="pb-3">Heure</th>
                  <th class="pb-3">Client</th>
                  <th class="pb-3">Service</th>
                  <th class="pb-3">Statut</th>
                  <th class="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (apt of todayQueue(); track apt.id) {
                  <tr class="border-b border-gray-50 hover:bg-gray-50">
                    <td class="py-3 font-medium">{{ apt.startTime | date:'HH:mm' }}</td>
                    <td class="py-3">{{ apt.client.firstName }} {{ apt.client.lastName }}</td>
                    <td class="py-3 text-gray-600">{{ apt.service.name }}</td>
                    <td class="py-3">
                      <span [class]="statusClass(apt.status)" class="text-xs px-2 py-1 rounded-full">
                        {{ statusLabel(apt.status) }}
                      </span>
                    </td>
                    <td class="py-3">
                      <div class="flex gap-2">
                        @if (apt.status === 'PENDING') {
                          <button (click)="updateStatus(apt.id, 'CONFIRMED')"
                                  class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
                            Confirmer
                          </button>
                        }
                        @if (apt.status === 'CONFIRMED') {
                          <button (click)="updateStatus(apt.id, 'IN_PROGRESS')"
                                  class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200">
                            Commencer
                          </button>
                        }
                        @if (apt.status === 'IN_PROGRESS') {
                          <a [routerLink]="['/barber/checkout']" [queryParams]="{appointmentId: apt.id}"
                             class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                            Encaisser
                          </a>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  dailyStats = signal<any>(null);
  todayQueue = signal<Appointment[]>([]);

  constructor(
    private statsApi: StatsApiService,
    private appointmentApi: AppointmentApiService
  ) {}

  ngOnInit() {
    this.statsApi.getDaily().subscribe(s => this.dailyStats.set(s));
    this.appointmentApi.getTodayQueue().subscribe(q => this.todayQueue.set(q));
  }

  updateStatus(id: number, status: string) {
    this.appointmentApi.updateStatus(id, status).subscribe(updated => {
      this.todayQueue.update(list => list.map(a => a.id === id ? updated : a));
    });
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800', CONFIRMED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-purple-100 text-purple-800', COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return map[status] ?? '';
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'En attente', CONFIRMED: 'Confirmé', IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminé', CANCELLED: 'Annulé', NO_SHOW: 'Absent'
    };
    return map[status] ?? status;
  }
}
