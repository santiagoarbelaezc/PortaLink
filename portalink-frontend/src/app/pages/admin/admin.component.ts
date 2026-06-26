import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

// Dashboard Components
import { DashAiSearchComponent } from '../../components/dashboard/dash-ai-search/dash-ai-search.component';
import { DashHomeComponent } from '../../components/dashboard/dash-home/dash-home.component';
import { DashAnalyticsComponent } from '../../components/dashboard/dash-analytics/dash-analytics.component';
import { DashStatsComponent } from '../../components/dashboard/dash-stats/dash-stats.component';
import { DashMessagesComponent } from '../../components/dashboard/dash-messages/dash-messages.component';
import { DashLeadsComponent } from '../../components/dashboard/dash-leads/dash-leads.component';
import { DashUsersComponent } from '../../components/dashboard/dash-users/dash-users.component';
import { DashCustomizeComponent } from '../../components/dashboard/dash-customize/dash-customize.component';
import { DashConfigComponent } from '../../components/dashboard/dash-config/dash-config.component';
import { DashReportsComponent } from '../../components/dashboard/dash-reports/dash-reports.component';
import { DashFinancesComponent } from '../../components/dashboard/dash-finances/dash-finances.component';

interface Tab {
  id: string;
  name: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DashAiSearchComponent,
    DashHomeComponent,
    DashAnalyticsComponent,
    DashStatsComponent,
    DashMessagesComponent,
    DashLeadsComponent,
    DashUsersComponent,
    DashCustomizeComponent,
    DashConfigComponent,
    DashReportsComponent,
    DashFinancesComponent,
  ],
  template: `
    <div class="admin-shell h-screen overflow-hidden flex font-sans"
         [ngClass]="isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-white text-neutral-900'">

      <!-- ══════════════════════════════════════
           LEFT SIDEBAR
      ══════════════════════════════════════ -->
      <aside class="w-56 shrink-0 flex flex-col h-full border-r overflow-hidden z-10"
             [ngClass]="isDark ? 'bg-[#07070a] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">

        <!-- Logo Header -->
        <div class="px-5 py-5 border-b flex items-center gap-3 shrink-0"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <img [src]="isDark ? 'assets/icons/mi-logo-dark.png' : 'assets/icons/mi-logo-light.png'" class="w-10 h-10 object-contain flex-shrink-0" alt="PortaLink">
          <div class="min-w-0">
            <h1 class="text-sm font-bold tracking-widest uppercase truncate"
                [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">PortaLink</h1>
            <span class="text-[9px] uppercase tracking-[0.25em] font-bold"
                  [ngClass]="isDark ? 'text-neutral-600' : 'text-neutral-400'">Admin Panel</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex-grow p-3 space-y-0.5 overflow-y-auto sidebar-nav">
          <button *ngFor="let tab of tabs"
                  (click)="setTab(tab.id)"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer group relative"
                  [ngClass]="getNavClass(tab.id)">

            <!-- Icon -->
            <span class="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">
              <svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <!-- Home / Dashboard -->
                <ng-container *ngIf="tab.id === 'dashboard'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </ng-container>
                <!-- Analytics -->
                <ng-container *ngIf="tab.id === 'analytics'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </ng-container>
                <!-- Stats -->
                <ng-container *ngIf="tab.id === 'stats'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </ng-container>
                <!-- Messages -->
                <ng-container *ngIf="tab.id === 'messages'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </ng-container>
                <!-- Leads -->
                <ng-container *ngIf="tab.id === 'leads'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                </ng-container>
                <!-- Users -->
                <ng-container *ngIf="tab.id === 'users'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </ng-container>
                <!-- Customize -->
                <ng-container *ngIf="tab.id === 'home'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </ng-container>
                <!-- Config -->
                <ng-container *ngIf="tab.id === 'config'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </ng-container>
                <!-- Reports -->
                <ng-container *ngIf="tab.id === 'reports'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </ng-container>
                <!-- Finances -->
                <ng-container *ngIf="tab.id === 'finances'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </ng-container>
              </svg>
            </span>

            <!-- Label -->
            <span class="flex-grow text-left text-[13px]">{{ tab.name }}</span>

            <!-- Badges -->
            <span *ngIf="tab.id === 'messages' && unreadMessages > 0"
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  [ngClass]="activeTab === tab.id ? (isDark ? 'bg-black/20 text-white' : 'bg-white/20 text-black') : (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white')">
              {{ unreadMessages }}
            </span>
            <span *ngIf="tab.id === 'leads' && pendingLeads > 0"
                  class="text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                  [ngClass]="activeTab === tab.id ? (isDark ? 'bg-black/20 text-white' : 'bg-white/20 text-black') : (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white')">
              {{ pendingLeads }}
            </span>
          </button>
        </nav>

        <!-- Bottom: Logout -->
        <div class="p-3 border-t shrink-0" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <button (click)="logout()"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer"
                  [ngClass]="isDark ? 'text-neutral-600 hover:text-red-400 hover:bg-red-500/5' : 'text-neutral-400 hover:text-red-500 hover:bg-red-50'">
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- ══════════════════════════════════════
           MAIN AREA
      ══════════════════════════════════════ -->
      <div class="flex-grow flex flex-col h-full overflow-hidden">

        <!-- Top Bar (AI Search) -->
        <app-dash-ai-search
          [theme]="currentTheme"
          [activeTab]="activeTab"
          (tabChange)="setTab($event)"
          (themeChange)="toggleTheme()">
        </app-dash-ai-search>

        <!-- Content -->
        <main class="flex-grow overflow-y-auto overflow-x-hidden"
              [ngClass]="isDark ? 'bg-[#020204]' : 'bg-white'">
          <div class="p-6 md:p-8 max-w-screen-2xl">

            <app-dash-home
              *ngIf="activeTab === 'dashboard'"
              [theme]="currentTheme"
              (tabChange)="setTab($event)">
            </app-dash-home>

            <app-dash-analytics
              *ngIf="activeTab === 'analytics'"
              [theme]="currentTheme">
            </app-dash-analytics>

            <app-dash-stats
              *ngIf="activeTab === 'stats'"
              [theme]="currentTheme">
            </app-dash-stats>

            <app-dash-messages
              *ngIf="activeTab === 'messages'"
              [theme]="currentTheme"
              (dataChange)="refreshBadges()">
            </app-dash-messages>

            <app-dash-leads
              *ngIf="activeTab === 'leads'"
              [theme]="currentTheme"
              (dataChange)="refreshBadges()">
            </app-dash-leads>

            <app-dash-users
              *ngIf="activeTab === 'users'"
              [theme]="currentTheme">
            </app-dash-users>

            <app-dash-customize
              *ngIf="activeTab === 'home'"
              [theme]="currentTheme">
            </app-dash-customize>

            <app-dash-config
              *ngIf="activeTab === 'config'"
              [theme]="currentTheme">
            </app-dash-config>

            <app-dash-reports
              *ngIf="activeTab === 'reports'"
              [theme]="currentTheme">
            </app-dash-reports>

            <app-dash-finances
              *ngIf="activeTab === 'finances'"
              [theme]="currentTheme">
            </app-dash-finances>

          </div>
        </main>

      </div>
    </div>
  `,
  styles: [`
    .admin-shell { font-family: 'Inter Tight', sans-serif; }

    /* Hide sidebar scrollbar */
    .sidebar-nav { scrollbar-width: none; }
    .sidebar-nav::-webkit-scrollbar { display: none; }

    /* Force strict colors in the admin panel to avoid global styles.css overrides */
    ::ng-deep .admin-shell .text-white { color: #ffffff !important; }
    ::ng-deep .admin-shell .text-black { color: #000000 !important; }
    ::ng-deep .admin-shell .bg-white { background-color: #ffffff !important; }
    ::ng-deep .admin-shell .bg-black { background-color: #000000 !important; }
  `]
})
export class AdminComponent implements OnInit {
  private router = inject(Router);

  activeTab = 'dashboard';
  currentTheme = 'dark';
  unreadMessages = 0;
  pendingLeads = 0;

  tabs: Tab[] = [
    { id: 'dashboard', name: 'Inicio' },
    { id: 'analytics', name: 'Analíticas' },
    { id: 'stats',     name: 'Estadísticas' },
    { id: 'messages',  name: 'Mensajes' },
    { id: 'leads',     name: 'Solicitudes' },
    { id: 'users',     name: 'Usuarios' },
    { id: 'home',      name: 'Personalizar' },
    { id: 'reports',   name: 'Reportes' },
    { id: 'finances',  name: 'Finanzas' },
    { id: 'config',    name: 'Configuración' },
  ];

  get isDark() { return this.currentTheme === 'dark'; }

  ngOnInit() {
    const saved = localStorage.getItem('portalink_admin_theme');
    if (saved) this.currentTheme = saved;
    const savedTab = localStorage.getItem('portalink_admin_tab');
    if (savedTab) this.activeTab = savedTab;
    this.refreshBadges();
  }

  setTab(id: string) {
    this.activeTab = id;
    localStorage.setItem('portalink_admin_tab', id);
    this.refreshBadges();
    setTimeout(() => {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 0);
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('portalink_admin_theme', this.currentTheme);
  }

  refreshBadges() {
    try {
      const msgs = JSON.parse(localStorage.getItem('portalink_admin_messages') || '[]');
      const leads = JSON.parse(localStorage.getItem('portalink_admin_leads') || '[]');
      this.unreadMessages = msgs.filter((m: any) => !m.read).length;
      this.pendingLeads = leads.filter((l: any) => l.status === 'Pendiente').length;
    } catch { }
  }

  logout() {
    localStorage.removeItem('portalink_admin_auth');
    this.router.navigate(['/login']);
  }

  getNavClass(tabId: string): string {
    const isActive = this.activeTab === tabId;
    if (this.isDark) {
      return isActive
        ? 'bg-white text-black'
        : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/60';
    } else {
      return isActive
        ? 'bg-neutral-900 text-white'
        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100';
    }
  }
}
