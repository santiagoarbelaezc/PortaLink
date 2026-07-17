import { Routes } from '@angular/router';
import { LinkComponent } from './pages/link/link.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';
import { RotbotComponent } from './pages/rotbot/rotbot.component';
import { PersonalizarComponent } from './pages/personalizar/personalizar.component';
import { PlanesComponent } from './pages/planes/planes.component';
import { PlanesGaleriaComponent } from './pages/planes-galeria/planes-galeria.component';
import { AdminComponent } from './pages/admin/admin.component';
import { LoginComponent } from './pages/login/login.component';
import { ProposalComponent } from './pages/proposal/proposal.component';
import { authGuard } from './core/guards/auth.guard';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { UserSiteComponent } from './pages/user-site/user-site.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: 'proposal',
    component: ProposalComponent,
    data: { animation: 'ProposalPage' }
  },
  { 
    path: '', 
    component: ProyectosComponent, 
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
    component: LinkComponent, 
    data: { animation: 'LinkPage' } 
  },
  {
    path: 'rotbot',
    component: RotbotComponent,
    data: { animation: 'RotbotPage' }
  },
  {
    path: 'planes',
    component: PlanesComponent,
    data: { animation: 'PlanesPage' }
  },
  {
    path: 'planes-galeria',
    component: PlanesGaleriaComponent,
    data: { animation: 'PlanesGaleriaPage' }
  },
  {
    path: 'personalizar',
    component: PersonalizarComponent,
    data: { animation: 'PersonalizarPage' }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { animation: 'LoginPage' }
  },
  {
    path: 'register',
    component: LoginComponent,
    data: { animation: 'LoginPage' }
  },
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard],
    data: { animation: 'PerfilPage' }
  },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
    data: { animation: 'AdminPage' }
  },
  {
    path: 'site/:slug',
    component: UserSiteComponent,
    data: { animation: 'SitePage' }
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent,
    data: { animation: 'VerifyEmailPage' }
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    data: { animation: 'ForgotPasswordPage' }
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    data: { animation: 'ResetPasswordPage' }
  },
  { path: '**', redirectTo: '' }
];

