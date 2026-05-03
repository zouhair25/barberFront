import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BarberPublic, OpeningHours, ClosingDay } from '../models/barber.model';

interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; }

@Injectable({ providedIn: 'root' })
export class BarberApiService {
  private readonly API = '/api/v1';

  constructor(private http: HttpClient) {}

  // Public
  listBarbers(page = 0, size = 20): Observable<Page<BarberPublic>> {
    return this.http.get<Page<BarberPublic>>(`${this.API}/public/barbers`, { params: { page, size } });
  }

  getBarber(id: number): Observable<BarberPublic> {
    return this.http.get<BarberPublic>(`${this.API}/public/barbers/${id}`);
  }

  getAvailableSlots(userCentreSoinId: number, date: string, serviceId?: number): Observable<string[]> {
    const params: any = { date };
    if (serviceId) params['serviceId'] = serviceId;
    return this.http.get<string[]>(`${this.API}/public/barbers/${userCentreSoinId}/slots`, { params });
  }

  // Barber profile management
  getMyProfile(): Observable<any> {
    return this.http.get(`${this.API}/barber/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.API}/barber/profile`, data);
  }

  updateHours(schedule: OpeningHours[]): Observable<OpeningHours[]> {
    return this.http.put<OpeningHours[]>(`${this.API}/barber/profile/hours`, { schedule });
  }

  addClosingDay(date: string, reason?: string): Observable<ClosingDay> {
    return this.http.post<ClosingDay>(`${this.API}/barber/profile/closing-days`, { date, reason });
  }

  removeClosingDay(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/barber/profile/closing-days/${id}`);
  }
}
