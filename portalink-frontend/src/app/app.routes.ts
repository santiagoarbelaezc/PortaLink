import { Routes } from '@angular/router';
import { LinkComponent } from './pages/link/link.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';
import { RotbotComponent } from './pages/rotbot/rotbot.component';
import { PersonalizarComponent } from './pages/personalizar/personalizar.component';
import { AdminComponent } from './pages/admin/admin.component';

export const routes: Routes = [
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
    path: 'personalizar',
    component: PersonalizarComponent,
    data: { animation: 'PersonalizarPage' }
  },
  {
    path: 'admin',
    component: AdminComponent,
    data: { animation: 'AdminPage' }
  },
  { path: '**', redirectTo: '' }
];

