import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

interface TabItem { label: string; icon: string; path: string; }

@Component({
  selector: 'app-parametrages-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-1">Paramétrage</h1>
        <p class="text-sm text-gray-500 mb-4">Gérez vos produits, votre centre et vos collaborateurs</p>
        <div class="border-b border-gray-200">
          <nav class="flex gap-0">
            @for (tab of tabs; track tab.path) {
              <a [routerLink]="tab.path" routerLinkActive="border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50"
                 [routerLinkActiveOptions]="{ exact: false }"
                 class="flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-colors rounded-t">
                <span>{{ tab.icon }}</span>
                <span>{{ tab.label }}</span>
              </a>
            }
          </nav>
        </div>
      </div>
      <router-outlet />
    </div>
  `
})
export class ParametragesLayoutComponent {
  tabs: TabItem[] = [
    { label: 'Produits',        icon: '🛒', path: 'produits' },
    { label: 'Centre de Soin',  icon: '🏪', path: 'centre-soin' },
    { label: 'Utilisateurs',    icon: '👥', path: 'utilisateurs' },
  ];
}
