import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth Interceptor
 *
 * Sends JWT token as Authorization: Bearer header on every request.
 * If no token exists (user not logged in), request goes without auth header.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }

  return next(req);
};
