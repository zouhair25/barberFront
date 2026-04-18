import { Routes } from '@angular/router';

export const publicRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'barber/:id',
    loadComponent: () => import('./barber-detail/barber-detail.component').then(m => m.BarberDetailComponent)
  }
];
