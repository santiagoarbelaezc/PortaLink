import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'certificados',
    loadComponent: () => import('./pages/certificados/certificados.component').then(m => m.CertificadosComponent),
    data: { animation: 'CertificadosPage' }
  },
  {
    path: 'terminos',
    loadComponent: () => import('./pages/terminos-condiciones/terminos-condiciones.component').then(m => m.TerminosCondicionesComponent),
    data: { animation: 'TerminosPage' }
  },
  {
    path: 'privacidad',
    loadComponent: () => import('./pages/politica-privacidad/politica-privacidad.component').then(m => m.PoliticaPrivacidadComponent),
    data: { animation: 'PrivacidadPage' }
  },
  {
    path: 'tratamiento-datos',
    loadComponent: () => import('./pages/tratamiento-datos/tratamiento-datos.component').then(m => m.TratamientoDatosComponent),
    data: { animation: 'TratamientoDatosPage' }
  },
  {
    path: 'deslinde-ia',
    loadComponent: () => import('./pages/deslinde-ia/deslinde-ia.component').then(m => m.DeslindeIaComponent),
    data: { animation: 'DeslindeIaPage' }
  },
  {
    path: 'prototipos',
    loadComponent: () => import('./pages/disenos/disenos.component').then(m => m.DisenosComponent),
    data: { animation: 'DisenosPage' }
  },
  { 
    path: '', 
    loadComponent: () => import('./pages/proyectos/proyectos.component').then(m => m.ProyectosComponent), 
    data: { animation: 'ProyectosPage' } 
  },
  { 
    path: 'proyectos', 
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'portfolio',
    redirectTo: '',
    pathMatch: 'full'
  },
  { 
    path: 'links', 
    loadComponent: () => import('./pages/link/link.component').then(m => m.LinkComponent), 
    data: { animation: 'LinkPage' } 
  },
  {
    path: 'rotbot',
    loadComponent: () => import('./pages/rotbot/rotbot.component').then(m => m.RotbotComponent),
    data: { animation: 'RotbotPage' }
  },
  {
    path: 'planes',
    loadComponent: () => import('./pages/planes/planes.component').then(m => m.PlanesComponent),
    data: { animation: 'PlanesPage' }
  },
  {
    path: 'planes-galeria',
    loadComponent: () => import('./pages/planes-galeria/planes-galeria.component').then(m => m.PlanesGaleriaComponent),
    data: { animation: 'PlanesGaleriaPage' }
  },
  {
    path: 'proyecto/:id',
    loadComponent: () => import('./pages/descripcion-proyecto/descripcion-proyecto.component').then(m => m.DescripcionProyectoComponent),
    data: { animation: 'ProyectoDetallePage' }
  },
  {
    path: 'descripcion-proyecto/:id',
    loadComponent: () => import('./pages/descripcion-proyecto/descripcion-proyecto.component').then(m => m.DescripcionProyectoComponent),
    data: { animation: 'ProyectoDetallePage' }
  },
  {
    path: 'personalizar',
    loadComponent: () => import('./pages/personalizar/personalizar.component').then(m => m.PersonalizarComponent),
    data: { animation: 'PersonalizarPage' }
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    data: { animation: 'LoginPage' }
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    data: { animation: 'LoginPage' }
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [authGuard],
    data: { animation: 'PerfilPage' }
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard],
    data: { animation: 'AdminPage' }
  },
  {
    path: 'site/:slug',
    loadComponent: () => import('./pages/user-site/user-site.component').then(m => m.UserSiteComponent),
    data: { animation: 'SitePage' }
  },
  {
    path: 'verify-email',
    loadComponent: () => import('./pages/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
    data: { animation: 'VerifyEmailPage' }
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    data: { animation: 'ForgotPasswordPage' }
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    data: { animation: 'ResetPasswordPage' }
  },
  { path: '**', redirectTo: '' }
];


