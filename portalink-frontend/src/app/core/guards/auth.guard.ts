import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.hasToken()) {
    return router.parseUrl('/login');
  }

  // Si el destino es el panel de administración (/admin) y hay token válido, permitir acceso
  if (state.url.includes('/admin')) {
    const user = authService.currentUser();
    if (user && user.rol && user.rol.toLowerCase() !== 'admin' && user.rol.toLowerCase() !== 'administrador') {
      // Solo redirigir si el rol es explícitamente cliente normal sin permisos
      return router.parseUrl('/perfil');
    }
  }

  return true;
};
