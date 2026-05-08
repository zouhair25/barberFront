import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyStats, RevenuePoint, ServiceStats, ClientStats } from '../models/stats.model';
import { Ville } from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly API = '/api/v1/public';

  constructor(private http: HttpClient) {}


   searchVilles(keyword: string): Observable<Ville[]> {
    return this.http.get<Ville[]>(
      `${this.API}/villes?q=${keyword}`
    );
  }

}