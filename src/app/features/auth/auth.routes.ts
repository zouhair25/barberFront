import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
  },
    {
    path: 'register-complete',
    loadComponent: () => import('./register-complete/register-complete.component').then(m => m.RegisterCompleteComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
