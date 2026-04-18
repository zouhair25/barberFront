import { Routes } from '@angular/router';

export const userRoutes: Routes = [
  {
    path: 'appointments',
    loadComponent: () => import('./my-appointments/my-appointments.component').then(m => m.MyAppointmentsComponent)
  },
  { path: '', redirectTo: 'appointments', pathMatch: 'full' }
];
