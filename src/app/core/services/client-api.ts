import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientResponse } from '@core/models/client.model';
import { CreateClientRequest } from './user-centre-soin-api.service';




@Injectable({ providedIn: 'root' })
export class ClientApiService {
  private readonly API = '/api/v1/client';

  constructor(private http: HttpClient) {}


  myClient(): Observable<ClientResponse> {
    return this.http.post<ClientResponse>(`${this.API}/me`,null);
  }

  
  createClient(data: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(`${this.API}/create-client`, data);
  }

    remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

}