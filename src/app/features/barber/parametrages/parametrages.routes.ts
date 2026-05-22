import { Routes } from '@angular/router';

export const parametragesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/parametrages-layout.component').then(m => m.ParametragesLayoutComponent),
    children: [
      { path: 'produits', loadComponent: () => import('./produits/produits.component').then(m => m.ProduitsComponent) },
      { path: 'centre-soin', loadComponent: () => import('./centre-soin/centre-soin-settings.component').then(m => m.CentreSoinSettingsComponent) },
      { path: 'utilisateurs', loadComponent: () => import('./utilisateurs/utilisateurs.component').then(m => m.UtilisateursComponent) },
      { path: '', redirectTo: 'produits', pathMatch: 'full' }
    ]
  }
];
