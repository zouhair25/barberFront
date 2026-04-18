import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-indigo-700 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <a routerLink="/" class="text-xl font-bold flex items-center gap-2">
            ✂️ BarberQ
          </a>

          <div class="flex items-center gap-4">
            @if (!auth.isLoggedIn()) {
              <a routerLink="/auth/login" class="hover:text-indigo-200 transition-colors">Connexion</a>
              <a routerLink="/auth/register"
                 class="bg-white text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
                Inscription
              </a>
            } @else {
              @if (auth.isBarber()) {
                <a routerLink="/barber/dashboard"
                   routerLinkActive="text-indigo-200"
                   class="hover:text-indigo-200 transition-colors font-medium">
                  Mon Espace
                </a>
              } @else {
                <a routerLink="/me/appointments"
                   routerLinkActive="text-indigo-200"
                   class="hover:text-indigo-200 transition-colors">
                  Mes RDV
                </a>
              }
              <button (click)="auth.logout()"
                      class="bg-indigo-800 hover:bg-indigo-900 px-4 py-2 rounded-lg transition-colors">
                Déconnexion
              </button>
            }
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
}
