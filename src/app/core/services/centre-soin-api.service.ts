import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CentreSoin } from '@core/models/centre-soin.model';

@Injectable({ providedIn: 'root' })
export class CentreSoinApiService {
  private readonly API = '/api/v1/barber/centre-soin';

  constructor(private http: HttpClient) {}

  get(): Observable<CentreSoin> {
    return this.http.get<CentreSoin>(this.API);
  }

  update(data: Partial<CentreSoin>): Observable<CentreSoin> {
    return this.http.put<CentreSoin>(this.API, data);
  }
}
