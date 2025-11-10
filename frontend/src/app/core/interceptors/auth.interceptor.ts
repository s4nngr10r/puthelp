import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const authService = inject(AuthService);
    const accessToken = authService.getAccessToken();

    if (accessToken) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
      });
      return next(authReq);
    }

    return next(req);
  } catch (error) {
    // If there's an error getting the auth service (circular dependency), 
    // just proceed without the token
    return next(req);
  }
};
