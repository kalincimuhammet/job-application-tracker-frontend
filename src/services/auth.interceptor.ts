// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.services';
import { RUNTIME_CONFIG } from '../app/runtime-config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const apiUrl = new URL(inject(RUNTIME_CONFIG).apiUrl, window.location.origin);
  const requestUrl = new URL(req.url, window.location.origin);

  // Nur an eigene API anhängen, nicht an fremde Domains
  if (requestUrl.origin !== apiUrl.origin || requestUrl.pathname !== apiUrl.pathname) {
    return next(req);
  }

  const token = authService.getAccessToken();
  if (!token) {
    return next(req);
  }
  
  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(authReq);
};