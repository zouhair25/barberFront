import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventSourceFuncArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { AppointmentApiService } from '../../../core/services/appointment-api.service';
import { BarberApiService } from '../../../core/services/barber-api.service';
import { UserCentreSoinApiService } from '../../../core/services/user-centre-soin-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Appointment, BarberBookRequest } from '../../../core/models/appointment.model';
import { BarberServicePublic } from '../../../core/models/barber.model';
import { UserCentreSoin } from '../../../core/models/user-centre-soin.model';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule, RouterLink],
  templateUrl: "./agenda.component.html"
})
export class AgendaComponent implements OnInit {
  @ViewChild('calendar') calendarRef!: FullCalendarComponent;

  selectedApt = signal<Appointment | null>(null);
  showNewAptModal = signal(false);

  services: BarberServicePublic[] = [];
  clients: UserCentreSoin[] = [];
  clientFilter = '';
  submitting = false;

  newApt: { clientId: number | null; serviceId: number | null; date: string; time: string; notes: string } = {
    clientId: null, serviceId: null, date: '', time: '', notes: ''
  };

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
    events: (info: EventSourceFuncArg, successCallback, failureCallback) => {
      console.log('ddd', info, info.start.toDateString());
      this.appointmentApi.getBarberAppointments(
        info.start.toISOString(),
        info.end.toISOString()
      ).subscribe({
        next: apts => successCallback(apts.map(a => ({
          id: String(a.id),
          title: `${a.client.firstName} - ${a.service.name}`,
          start: a.startTime,
          end: a.endTime,
          color: this.statusColor(a.status),
          extendedProps: { appointment: a }
        }))),
        error: err => failureCallback(err)
      });
    },
    dateClick: (arg) => this.openNewAptModal(arg.date),
    eventClick: (arg: EventClickArg) => this.onEventClick(arg),
    height: 'auto'
  };

  constructor(
    private appointmentApi: AppointmentApiService,
    private barberApi: BarberApiService,
    private userCentreSoinApi: UserCentreSoinApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const ucsId = this.authService.currentUser()?.userCentreSoinId;
    if (ucsId) {
      this.barberApi.getBarber(ucsId).subscribe(p => this.services = p.services ?? []);
    }
    this.userCentreSoinApi.list().subscribe(list => this.clients = list);
  }

  get filteredClients(): UserCentreSoin[] {
    const f = this.clientFilter.toLowerCase().trim();
    if (!f) return this.clients;
    return this.clients.filter(c => {
      const name = `${c.user?.firstName ?? ''} ${c.user?.lastName ?? ''}`.toLowerCase();
      return name.includes(f) || (c.user?.email ?? '').toLowerCase().includes(f);
    });
  }

  openNewAptModal(date?: Date) {
    const d = date ?? new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    this.newApt = {
      clientId: null,
      serviceId: null,
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      notes: ''
    };
    this.clientFilter = '';
    this.showNewAptModal.set(true);
  }

  submitNewApt() {
    if (!this.newApt.clientId || !this.newApt.serviceId || !this.newApt.date || !this.newApt.time) return;
    this.submitting = true;
    const req: BarberBookRequest = {
      clientId: this.newApt.clientId,
      serviceId: this.newApt.serviceId,
      startTime: `${this.newApt.date}T${this.newApt.time}:00`,
      notes: this.newApt.notes || undefined
    };
    this.appointmentApi.barberBook(req).subscribe({
      next: () => {
        this.submitting = false;
        this.showNewAptModal.set(false);
        this.calendarRef.getApi().refetchEvents();
      },
      error: () => { this.submitting = false; }
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
      this.calendarRef.getApi().refetchEvents();
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
    const m: Record<string, string> = {
      PENDING: 'En attente', CONFIRMED: 'Confirmé', IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminé', CANCELLED: 'Annulé', NO_SHOW: 'Absent'
    };
    return m[status] ?? status;
  }
}
