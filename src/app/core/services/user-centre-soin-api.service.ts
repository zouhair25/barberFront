import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterCompleteRequest } from '@core/models/user.model';
import { UserCentreSoin } from '@core/models/user-centre-soin.model';


export interface AddUserToCentreSoinRequest {
  userEmail: string;
  address?: string;
}

export interface CreateClientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  villeId?: number;
}

@Injectable({ providedIn: 'root' })
export class UserCentreSoinApiService {
  private readonly API = '/api/v1/us';
  private readonly MANAGE_API = '/api/v1/barber/user-centre-soin';

  constructor(private http: HttpClient) {}

  registerComplete(data: RegisterCompleteRequest): Observable<UserCentreSoin> {
    return this.http.post<UserCentreSoin>(`${this.API}/register-complete`, data);
  }

  list(): Observable<UserCentreSoin[]> {
    return this.http.get<UserCentreSoin[]>(this.MANAGE_API);
  }

  add(data: AddUserToCentreSoinRequest): Observable<UserCentreSoin> {
    return this.http.post<UserCentreSoin>(this.MANAGE_API, data);
  }

  createClient(data: CreateClientRequest): Observable<UserCentreSoin> {
    return this.http.post<UserCentreSoin>(`${this.MANAGE_API}/create-client`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.MANAGE_API}/${id}`);
  }
}