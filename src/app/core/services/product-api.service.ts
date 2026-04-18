import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly API = '/api/v1/barber/products';

  constructor(private http: HttpClient) {}

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API);
  }

  create(data: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.API, data);
  }

  update(id: number, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.API}/${id}`, data);
  }

  toggleVisibility(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.API}/${id}/visibility`, {});
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
