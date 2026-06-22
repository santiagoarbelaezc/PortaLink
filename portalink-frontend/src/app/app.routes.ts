import { Routes } from '@angular/router';
import { LinkComponent } from './pages/link/link.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';

export const routes: Routes = [
  { 
    path: '', 
    component: LinkComponent, 
    data: { animation: 'LinkPage' } 
  },
  { 
    path: 'proyectos', 
    component: ProyectosComponent, 
    data: { animation: 'ProyectosPage' } 
  },
  {
    path: 'portfolio',
    redirectTo: 'proyectos',
    pathMatch: 'full'
  },
  { path: '**', redirectTo: '' }
];

