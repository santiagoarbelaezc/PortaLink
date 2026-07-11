import { Routes } from '@angular/router';
import { LinkComponent } from './pages/link/link.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';
import { RotbotComponent } from './pages/rotbot/rotbot.component';
import { PersonalizarComponent } from './pages/personalizar/personalizar.component';
import { PlanesComponent } from './pages/planes/planes.component';
import { AdminComponent } from './pages/admin/admin.component';
import { LoginComponent } from './pages/login/login.component';
import { ProposalComponent } from './pages/proposal/proposal.component';
import { authGuard } from './core/guards/auth.guard';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ConfiguracionComponent } from './pages/configuracion/configuracion.component';

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
    path: 'configuracion',
    component: ConfiguracionComponent,
    canActivate: [authGuard],
    data: { animation: 'ConfiguracionPage' }
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
    data: { animation: 'AdminPage' }
  },
  { path: '**', redirectTo: '' }
];

