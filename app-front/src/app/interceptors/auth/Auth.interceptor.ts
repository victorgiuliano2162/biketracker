import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './../../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Rotas públicas — não anexa token
  const publicRoutes = [
    '/api/auth/login', 
    '/api/auth/refresh',
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ];
  const isAuthPublic = publicRoutes.some(route => req.url.includes(route));
  const isUserRegistration = (req.url.endsWith('/api/user') || req.url.endsWith('/api/user/')) && req.method === 'POST';

  if (isAuthPublic || isUserRegistration) {
    return next(req);
  }

  // Anexa o access token no header Authorization
  const token = authService.getAccessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se receber 401, tenta fazer refresh do token
      if (error.status === 401) {
        const refresh$ = authService.refresh();

        if (refresh$) {
          return refresh$.pipe(
            switchMap(() => {
              // Refaz a requisição original com o novo token
              const newToken = authService.getAccessToken();
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
              return next(retryReq);
            }),
            catchError(() => {
              authService.logout();
              return throwError(() => error);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};