import { Routes } from '@angular/router';

export const barberRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/barber-layout.component').then(m => m.BarberLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'profile', loadComponent: () => import('./profile/barber-profile.component').then(m => m.BarberProfileComponent) },
      { path: 'schedule', loadComponent: () => import('./schedule/schedule.component').then(m => m.ScheduleComponent) },
      { path: 'services', loadComponent: () => import('./services-catalog/services-catalog.component').then(m => m.ServicesCatalogComponent) },
      { path: 'products', loadComponent: () => import('./products-catalog/products-catalog.component').then(m => m.ProductsCatalogComponent) },
      { path: 'agenda', loadComponent: () => import('./agenda/agenda.component').then(m => m.AgendaComponent) },
      { path: 'checkout', loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent) },
      { path: 'stock', loadComponent: () => import('./stock/stock.component').then(m => m.StockComponent) },
      { path: 'orders', loadComponent: () => import('./orders/orders.component').then(m => m.OrdersComponent) },
      { path: 'reviews', loadComponent: () => import('./reviews/reviews.component').then(m => m.ReviewsComponent) },
      { path: 'statistics', loadComponent: () => import('./statistics/statistics.component').then(m => m.StatisticsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
