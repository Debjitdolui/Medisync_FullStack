import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Error Interceptor
 *
 * Handles HTTP errors globally:
 * - 401 Unauthorized → redirect to login
 * - 403 Forbidden → show access denied
 * - 500+ Server errors → log and show generic error
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
          break;
        case 401:
          // Token expired or invalid — clear auth and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userName');
          router.navigate(['/login']);
          errorMessage = 'Session expired. Please login again.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 400:
          // Bad request — extract backend error message
          errorMessage = error.error?.error || error.error?.message || 'Invalid request.';
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          }
      }

      // Log to console for debugging
      console.error(`[HTTP Error ${error.status}] ${req.method} ${req.url}:`, errorMessage);

      // Re-throw with clean message for components to handle
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error
      }));
    })
  );
};
