import { Routes } from '@angular/router';
import { LinktreeComponent } from './pages/linktree/linktree.component';
import { PortfolioPageComponent } from './pages/portfolio-page/portfolio-page.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    component: LinktreeComponent, 
    data: { animation: 'LinktreePage' } 
  },
  { 
    path: 'portfolio', 
    component: PortfolioPageComponent, 
    data: { animation: 'PortfolioPage' } 
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
  { path: '**', redirectTo: '' }
];
