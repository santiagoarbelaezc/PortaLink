import { Routes } from '@angular/router';
import { LinkComponent } from './pages/link/link.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';

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
  { path: '**', redirectTo: '' }
];

