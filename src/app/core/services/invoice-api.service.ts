import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice, CheckoutRequest } from '../models/invoice.model';

interface Page<T> { content: T[]; totalElements: number; totalPages: number; }

@Injectable({ providedIn: 'root' })
export class InvoiceApiService {
  private readonly API = '/api/v1/barber';

  constructor(private http: HttpClient) {}

  checkout(req: CheckoutRequest): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.API}/checkout`, req);
  }

  listInvoices(page = 0, size = 20): Observable<Page<Invoice>> {
    return this.http.get<Page<Invoice>>(`${this.API}/invoices`, { params: { page, size } });
  }

  getInvoice(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.API}/invoices/${id}`);
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.API}/invoices/${id}/pdf`, { responseType: 'blob' });
  }
}
