import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('admin_session');
  
  if (token) {
    return true;
  }
  
  router.navigate(['/admin/login']);
  return false;
};
