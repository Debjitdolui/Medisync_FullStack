import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'] as string;
  const currentRole = authService.getRole();

  if (currentRole === expectedRole) {
    return true;
  }

  // If no role at all, go to login
  if (!currentRole) {
    router.navigate(['/login']);
    return false;
  }

  // Determine the correct dashboard for the current role
  let targetUrl = '/login';
  switch (currentRole) {
    case 'customer':
      targetUrl = '/user/dashboard';
      break;
    case 'pharmacy':
      targetUrl = '/pharmacy/dashboard';
      break;
    case 'nurse':
      targetUrl = '/nurse/dashboard';
      break;
    case 'admin':
      targetUrl = '/admin/dashboard';
      break;
  }

  // Prevent infinite loop: don't redirect if we're already trying to go there
  if (state.url === targetUrl) {
    // Something is wrong - clear auth and go to login
    authService.logout();
    router.navigate(['/login']);
    return false;
  }

  router.navigate([targetUrl]);
  return false;
};
