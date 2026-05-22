import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, BarberBookRequest, BookAppointmentRequest, QueuePosition } from '../models/appointment.model';

interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; }

@Injectable({ providedIn: 'root' })
export class AppointmentApiService {
  private readonly API = '/api/v1';

  constructor(private http: HttpClient) {}

  // User
  book(req: BookAppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.API}/user/appointments`, req);
  }

  myAppointments(page = 0, size = 10): Observable<Page<Appointment>> {
    return this.http.get<Page<Appointment>>(`${this.API}/user/appointments`, { params: { page, size } });
  }

  getQueuePosition(id: number): Observable<QueuePosition> {
    return this.http.get<QueuePosition>(`${this.API}/user/appointments/${id}/queue`);
  }

  cancelAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/user/appointments/${id}`);
  }

  // Barber
  getBarberAppointments(from?: string, to?: string): Observable<Appointment[]> {
    const params: any = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;

    console.log('xxxx',params)
    return this.http.get<Appointment[]>(`${this.API}/barber/appointments`, { params });
  }

  getTodayQueue(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API}/barber/appointments/today`);
  }

  barberBook(req: BarberBookRequest): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.API}/barber/appointments`, req);
  }

  updateStatus(id: number, status: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.API}/barber/appointments/${id}/status`, { status });
  }
}
