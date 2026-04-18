import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem { label: string; icon: string; path: string; }

@Component({
  selector: 'app-barber-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-gray-900 text-white flex flex-col fixed h-full z-10">
        <div class="p-6 border-b border-gray-700">
          <h2 class="text-lg font-bold text-indigo-400">✂️ Espace Coiffeur</h2>
        </div>

        <nav class="flex-1 py-4 overflow-y-auto">
          @for (item of navItems; track item.path) {
            <a [routerLink]="['/barber', item.path]" routerLinkActive="bg-indigo-700 text-white"
               class="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors">
              <span class="text-lg">{{ item.icon }}</span>
              <span class="text-sm font-medium">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="p-4 border-t border-gray-700">
          <a routerLink="/" class="text-gray-400 text-sm hover:text-white flex items-center gap-2">
            ← Site public
          </a>
        </div>
      </aside>

      <!-- Main content -->
      <main class="ml-64 flex-1 p-8">
        <router-outlet />
      </main>
    </div>
  `
})
export class BarberLayoutComponent {
  navItems: NavItem[] = [
    { label: 'Tableau de bord', icon: '📊', path: 'dashboard' },
    { label: 'Mon Profil',      icon: '👤', path: 'profile' },
    { label: 'Horaires',        icon: '🕐', path: 'schedule' },
    { label: 'Services',        icon: '✂️', path: 'services' },
    { label: 'Produits',        icon: '🛒', path: 'products' },
    { label: 'Agenda',          icon: '📅', path: 'agenda' },
    { label: 'Encaissement',    icon: '💳', path: 'checkout' },
    { label: 'Stock',           icon: '📦', path: 'stock' },
    { label: 'Commandes',       icon: '🚚', path: 'orders' },
    { label: 'Avis',            icon: '⭐', path: 'reviews' },
    { label: 'Statistiques',    icon: '📈', path: 'statistics' },
  ];
}
