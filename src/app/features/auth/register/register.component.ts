import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div class="max-w-md w-full">
        <div class="card">
          <h1 class="text-2xl font-bold text-center text-gray-800 mb-2">✂️ BarberQ</h1>
          <h2 class="text-xl font-semibold text-gray-700 mb-6 text-center">Créer un compte</h2>

          <!-- Role selector -->
          <div class="flex gap-3 mb-6">
            <button type="button" (click)="role = 'USER'"
                    [class]="role === 'USER' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'"
                    class="flex-1 py-3 border-2 rounded-xl font-medium transition-colors">
              👤 Client
            </button>
            <button type="button" (click)="role = 'BARBER'"
                    [class]="role === 'BARBER' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'"
                    class="flex-1 py-3 border-2 rounded-xl font-medium transition-colors">
              ✂️ Coiffeur
            </button>
          </div>

          <form (ngSubmit)="register()" class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input type="text" [(ngModel)]="firstName" name="firstName" required class="input-field">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input type="text" [(ngModel)]="lastName" name="lastName" required class="input-field">
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required class="input-field">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input type="tel" [(ngModel)]="phone" name="phone" required class="input-field" placeholder="+212600000000">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" [(ngModel)]="password" name="password" required minlength="8" class="input-field">
            </div>

            @if (error()) {
              <div class="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{{ error() }}</div>
            }

            <button type="submit" [disabled]="loading()"
                    class="btn-primary w-full disabled:opacity-50">
              {{ loading() ? 'Inscription...' : 'Créer mon compte' }}
            </button>
          </form>

          <p class="text-center text-gray-500 text-sm mt-4">
            Déjà un compte?
            <a routerLink="/auth/login" class="text-indigo-600 hover:underline font-medium">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  firstName = ''; lastName = ''; email = ''; phone = ''; password = '';
  role: 'USER' | 'BARBER' = 'USER';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    this.loading.set(true);
    this.error.set('');
    this.auth.register({ firstName: this.firstName, lastName: this.lastName, email: this.email, phone: this.phone, password: this.password, role: this.role }).subscribe({
      next: res => {
        this.loading.set(false);
        if (res.role === 'BARBER') this.router.navigate(['/barber/dashboard']);
        else this.router.navigate(['/']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Erreur lors de l\'inscription');
      }
    });
  }
}
