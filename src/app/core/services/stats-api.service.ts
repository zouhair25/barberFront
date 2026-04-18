import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyStats, RevenuePoint, ServiceStats, ClientStats } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class StatsApiService {
  private readonly API = '/api/v1/barber/stats';

  constructor(private http: HttpClient) {}

  getDaily(): Observable<DailyStats> {
    return this.http.get<DailyStats>(`${this.API}/daily`);
  }

  getRevenue(from: string, to: string, groupBy = 'DAY'): Observable<RevenuePoint[]> {
    return this.http.get<RevenuePoint[]>(`${this.API}/revenue`, { params: { from, to, groupBy } });
  }

  getTopServices(from: string, to: string): Observable<ServiceStats[]> {
    return this.http.get<ServiceStats[]>(`${this.API}/services`, { params: { from, to } });
  }

  getLoyalClients(limit = 10): Observable<ClientStats[]> {
    return this.http.get<ClientStats[]>(`${this.API}/clients`, { params: { limit } });
  }

  getTopProducts(from: string, to: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/products`, { params: { from, to } });
  }
}
