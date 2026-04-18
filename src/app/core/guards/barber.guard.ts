import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const barberGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const role = auth.role();
  if (role === 'BARBER' || role === 'ADMIN') return true;
  if (!auth.isLoggedIn()) return router.createUrlTree(['/auth/login']);
  return router.createUrlTree(['/']);
};
