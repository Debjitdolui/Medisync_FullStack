import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If not logged in, allow access to login/signup pages
  if (!authService.isLoggedIn()) {
    return true;
  }

  // User is logged in - redirect to their dashboard
  const role = authService.getRole();
  switch (role) {
    case 'customer':
      router.navigate(['/user/dashboard']);
      break;
    case 'pharmacy':
      router.navigate(['/pharmacy/dashboard']);
      break;
    case 'nurse':
      router.navigate(['/nurse/dashboard']);
      break;
    case 'admin':
      router.navigate(['/admin/dashboard']);
      break;
    default:
      // Invalid role - clear everything and allow login
      authService.logout();
      return true;
  }

  return false;
};
