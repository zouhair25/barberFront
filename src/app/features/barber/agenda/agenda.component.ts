import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { Appointment } from '../../../core/models/appointment.model';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, RouterLink],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Agenda</h1>
        <a routerLink="/barber/checkout" class="btn-primary">+ Encaisser un RDV</a>
      </div>

      <div class="card">
        <full-calendar [options]="calendarOptions" />
      </div>

      <!-- Appointment detail modal -->
      @if (selectedApt()) {
        <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-lg font-bold">Détail du RDV</h3>
              <button (click)="selectedApt.set(null)" class="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-500">Client</dt>
                <dd class="font-medium">{{ selectedApt()!.client.firstName }} {{ selectedApt()!.client.lastName }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Service</dt>
                <dd class="font-medium">{{ selectedApt()!.service.name }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Prix</dt>
                <dd class="font-medium text-indigo-600">{{ selectedApt()!.service.price }} MAD</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Heure</dt>
                <dd class="font-medium">{{ selectedApt()!.startTime | date:'HH:mm' }} - {{ selectedApt()!.endTime | date:'HH:mm' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Statut</dt>
                <dd><span [class]="statusClass(selectedApt()!.status)" class="text-xs px-2 py-1 rounded-full">{{ statusLabel(selectedApt()!.status) }}</span></dd>
              </div>
            </dl>
            <div class="mt-5 flex gap-3">
              @if (selectedApt()!.status === 'PENDING') {
                <button (click)="changeStatus('CONFIRMED')" class="flex-1 btn-primary text-sm">Confirmer</button>
                <button (click)="changeStatus('NO_SHOW')" class="flex-1 btn-danger text-sm">Absent</button>
              }
              @if (selectedApt()!.status === 'CONFIRMED') {
                <button (click)="changeStatus('IN_PROGRESS')" class="flex-1 btn-primary text-sm">Commencer</button>
              }
              @if (selectedApt()!.status === 'IN_PROGRESS') {
                <a [routerLink]="['/barber/checkout']" [queryParams]="{appointmentId: selectedApt()!.id}"
                   class="flex-1 btn-primary text-sm text-center">Encaisser</a>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AgendaComponent implements OnInit {
  selectedApt = signal<Appointment | null>(null);
  appointments: Appointment[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: frLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotMinTime: '07:00:00',
    slotMaxTime: '22:00:00',
    allDaySlot: false,
    events: [],
    eventClick: (arg: EventClickArg) => this.onEventClick(arg),
    height: 'auto'
  };

  constructor(private appointmentApi: AppointmentApiService) {}

  ngOnInit() {
    this.appointmentApi.getBarberAppointments().subscribe(apts => {
      this.appointments = apts;
      this.calendarOptions = {
        ...this.calendarOptions,
        events: apts.map(a => ({
          id: String(a.id),
          title: `${a.client.firstName} - ${a.service.name}`,
          start: a.startTime,
          end: a.endTime,
          color: this.statusColor(a.status),
          extendedProps: { appointment: a }
        }))
      };
    });
  }

  onEventClick(arg: EventClickArg) {
    this.selectedApt.set(arg.event.extendedProps['appointment']);
  }

  changeStatus(status: string) {
    const apt = this.selectedApt();
    if (!apt) return;
    this.appointmentApi.updateStatus(apt.id, status).subscribe(updated => {
      this.selectedApt.set(updated);
      this.ngOnInit(); // refresh
    });
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      PENDING: '#f59e0b', CONFIRMED: '#3b82f6',
      IN_PROGRESS: '#8b5cf6', COMPLETED: '#10b981',
      CANCELLED: '#ef4444', NO_SHOW: '#6b7280'
    };
    return map[status] ?? '#6366f1';
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
    const m: Record<string, string> = { PENDING: 'En attente', CONFIRMED: 'Confirmé', IN_PROGRESS: 'En cours', COMPLETED: 'Terminé', CANCELLED: 'Annulé', NO_SHOW: 'Absent' };
    return m[status] ?? status;
  }
}
