import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="max-w-md w-full">
        <div class="card">
          <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">✂️ BarberQ</h1>
          <h2 class="text-xl font-semibold text-gray-700 mb-6 text-center">Connexion</h2>

          <form (ngSubmit)="login()" #form="ngForm" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required
                     class="input-field" placeholder="votre@email.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" [(ngModel)]="password" name="password" required
                     class="input-field" placeholder="••••••••">
            </div>

            @if (error()) {
              <div class="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{{ error() }}</div>
            }

            <button type="submit" [disabled]="loading() || !form.valid"
                    class="btn-primary w-full text-center disabled:opacity-50">
              {{ loading() ? 'Connexion...' : 'Se connecter' }}
            </button>
          </form>

          <p class="text-center text-gray-500 text-sm mt-4">
            Pas encore de compte?
            <a routerLink="/auth/register" class="text-indigo-600 hover:underline font-medium">S'inscrire</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: res => {
        this.loading.set(false);
        if (res.role === 'BARBER') this.router.navigate(['/barber/dashboard']);
        else this.router.navigate(['/']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Email ou mot de passe incorrect');
      }
    });
  }
}
