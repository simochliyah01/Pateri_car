import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (isAuthEndpoint(req.url)) return next(req);

  const token = authService.getAccessToken();
  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(authReq, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/login')
      || url.includes('/auth/register')
      || url.includes('/auth/refresh');
}

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addToken(req, token!)))
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  const refreshToken = authService.getRefreshToken();
  if (!refreshToken) {
    isRefreshing = false;
    authService.logout();
    router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
    return throwError(() => new Error('No refresh token'));
  }

  return authService.refreshToken().pipe(
    switchMap((response: any) => {
      isRefreshing = false;
      const newToken = response.accessToken;
      refreshTokenSubject.next(newToken);
      return next(addToken(req, newToken));
    }),
    catchError(refreshError => {
      isRefreshing = false;
      refreshTokenSubject.next(null);
      authService.logout();
      router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
      return throwError(() => refreshError);
    })
  );
}
