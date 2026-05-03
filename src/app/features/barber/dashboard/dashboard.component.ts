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
  templateUrl:'./dashboard.component.html'
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
