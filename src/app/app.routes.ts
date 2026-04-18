import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { barberGuard } from './core/guards/barber.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/public/public.routes').then(m => m.publicRoutes)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: 'me',
    canActivate: [authGuard],
    loadChildren: () => import('./features/user/user.routes').then(m => m.userRoutes)
  },
  {
    path: 'barber',
    canActivate: [barberGuard],
    loadChildren: () => import('./features/barber/barber.routes').then(m => m.barberRoutes)
  },
  { path: '**', redirectTo: '' }
];
