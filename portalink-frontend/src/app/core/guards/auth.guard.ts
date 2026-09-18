import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasValidToken()) {
    authService.clearSession(true);
    return router.createUrlTree(['/login'], {
      queryParams: { expired: '1', returnUrl: state.url }
    });
  }

  // Si el destino es el panel de administración (/admin), verificar rol de administrador
  if (state.url.includes('/admin')) {
    const user = authService.currentUser();
    if (user && user.rol && user.rol.toLowerCase() !== 'admin' && user.rol.toLowerCase() !== 'administrador') {
      // Solo redirigir si el rol es explícitamente cliente normal sin permisos de admin
      return router.createUrlTree(['/perfil']);
    }
  }

  return true;
};
