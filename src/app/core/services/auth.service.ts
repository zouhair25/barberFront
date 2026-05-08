import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterCompleteRequest, RegisterRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = '/api/v1/auth';

  private _currentUser = signal<AuthResponse | null>(this.loadFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly role = computed(() => this._currentUser()?.role ?? null);
  readonly isBarber = computed(() => this.role() === 'BARBER' || this.role() === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {}

  login(formLogin: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, formLogin).pipe(
      tap(res => this.setUser(res))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
      tap(res => this.setUser(res))
    );
  }
  registerComplete(data: RegisterCompleteRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register-complete`, data).pipe(
      tap(res => this.setUser(res))
    );
  }

  logout(): void {
    this.http.post(`${this.API}/logout`, {}).subscribe();
    this.clearUser();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    const token = this._currentUser()?.refreshToken;
    return this.http.post<AuthResponse>(`${this.API}/refresh`, { refreshToken: token }).pipe(
      tap(res => this.setUser(res))
    );
  }

  getAccessToken(): string | null {
    return this._currentUser()?.accessToken ?? null;
  }

  private setUser(res: AuthResponse): void {
    this._currentUser.set(res);
    localStorage.setItem('auth', JSON.stringify(res));
  }

  private clearUser(): void {
    this._currentUser.set(null);
    localStorage.removeItem('auth');
  }

  private loadFromStorage(): AuthResponse | null {
    const stored = localStorage.getItem('auth');
    return stored ? JSON.parse(stored) : null;
  }
}
