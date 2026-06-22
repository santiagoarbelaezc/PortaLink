import { Routes } from '@angular/router';
import { LinkComponent } from './pages/link/link.component';
import { ProyectosComponent } from './pages/proyectos/proyectos.component';
import { authGuard } from './guards/auth.guard';

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
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: 'hero', loadComponent: () => import('./pages/admin/editors/hero-editor/hero-editor.component').then(m => m.HeroEditorComponent) },
      { path: 'about', loadComponent: () => import('./pages/admin/editors/about-editor/about-editor.component').then(m => m.AboutEditorComponent) },
      { path: 'skills', loadComponent: () => import('./pages/admin/editors/skills-editor/skills-editor.component').then(m => m.SkillsEditorComponent) },
      { path: 'portfolio', loadComponent: () => import('./pages/admin/editors/portfolio-editor/portfolio-editor.component').then(m => m.PortfolioEditorComponent) },
      { path: 'contact', loadComponent: () => import('./pages/admin/editors/contact-editor/contact-editor.component').then(m => m.ContactEditorComponent) },
      { path: '', redirectTo: 'hero', pathMatch: 'full' }
    ]
  },
  {
    path: 'design-showcase',
    loadComponent: () => import('./pages/design-showcase/design-showcase.component').then(m => m.DesignShowcaseComponent)
  },
  { path: '**', redirectTo: '' }
];
