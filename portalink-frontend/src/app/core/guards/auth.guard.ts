import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasToken()) {
    return router.parseUrl('/login');
  }

  // Si el destino es el panel de administración (/admin), exigir rol de 'admin'
  if (state.url.includes('/admin')) {
    const user = authService.currentUser();
    if (!user || user.rol?.toLowerCase() !== 'admin') {
      // Redirigir a personalizar si no tiene privilegios de administrador
      return router.parseUrl('/personalizar');
    }
  }

  return true;
};
