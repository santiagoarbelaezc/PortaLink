import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MessagesService } from '../../services/messages.service';
import { AuthService } from '../../services/auth.service';
import { CommandCenterService } from '../../services/command-center.service';

// Dashboard Components
import { DashAiSearchComponent } from '../../components/dashboard/dash-ai-search/dash-ai-search.component';
import { DashHomeComponent } from '../../components/dashboard/dash-home/dash-home.component';
import { DashAnalyticsComponent } from '../../components/dashboard/dash-analytics/dash-analytics.component';
import { DashStatsComponent } from '../../components/dashboard/dash-stats/dash-stats.component';
import { DashMessagesComponent } from '../../components/dashboard/dash-messages/dash-messages.component';
import { DashUsersComponent } from '../../components/dashboard/dash-users/dash-users.component';
import { DashConfigComponent } from '../../components/dashboard/dash-config/dash-config.component';
import { DashReportsComponent } from '../../components/dashboard/dash-reports/dash-reports.component';
import { DashFinancesComponent } from '../../components/dashboard/dash-finances/dash-finances.component';
import { DashFinancialControlComponent } from '../../components/dashboard/dash-financial-control/dash-financial-control.component';
import { DashItineraryComponent } from '../../components/dashboard/dash-itinerary/dash-itinerary.component';
import { DashLibraryComponent } from '../../components/dashboard/dash-library/dash-library.component';
import { DashRotbotComponent } from '../../components/dashboard/dash-rotbot/dash-rotbot.component';

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
    DashRotbotComponent,
    DashAnalyticsComponent,
    DashStatsComponent,
    DashMessagesComponent,
    DashUsersComponent,
    DashConfigComponent,
    DashReportsComponent,
    DashFinancesComponent,
    DashFinancialControlComponent,
    DashItineraryComponent,
    DashLibraryComponent,
  ],
  template: `
    <div class="admin-shell fixed inset-0 h-[100dvh] w-full md:relative md:h-screen overflow-hidden flex font-sans"
         [ngClass]="isDark ? 'bg-neutral-950 text-neutral-100' : 'bg-white text-neutral-900'">

      <!-- ══════════════════════════════════════
           MOBILE BACKDROP OVERLAY
      ══════════════════════════════════════ -->
      <div *ngIf="isMobileDrawerOpen"
           (click)="isMobileDrawerOpen = false"
           class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300">
      </div>

      <!-- ══════════════════════════════════════
           LEFT SIDEBAR (DESKTOP ONLY)
      ══════════════════════════════════════ -->
      <aside class="hidden md:flex flex-col h-full border-r overflow-hidden transition-all duration-300 shrink-0"
             [ngClass]="[
               isDark ? 'bg-[#07070a] border-neutral-800' : 'bg-neutral-50 border-neutral-200',
               isSidebarCollapsed ? 'md:w-0 md:border-r-0 md:opacity-0 md:pointer-events-none' : 'md:w-56 md:opacity-100'
             ]">

        <!-- Logo Header -->
        <div class="py-4 md:py-5 border-b flex items-center shrink-0 transition-all duration-300 px-5"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <a routerLink="/" class="flex items-center gap-3 cursor-pointer group no-underline min-w-0" title="Ir al inicio">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                 [ngClass]="isDark ? 'bg-white/5 border border-white/10 shadow-xs' : 'bg-white border border-neutral-200 shadow-xs'">
              <img [src]="isDark ? 'assets/icons/navbar-logodark.png' : 'assets/icons/navbar-logolight.png'" class="w-6 h-6 object-contain" alt="Dashboard">
            </div>
            <div class="min-w-0" *ngIf="!isSidebarCollapsed">
              <h1 class="text-sm font-headline font-bold tracking-tight truncate leading-none"
                  [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
                Dashboard
              </h1>
              <span class="text-[10px] font-sans font-medium text-neutral-400 dark:text-neutral-500 block mt-1 tracking-wide leading-none">
                PortaLink
              </span>
            </div>
          </a>
        </div>

        <!-- Navigation -->
        <nav class="flex-grow p-3 space-y-0.5 overflow-y-auto sidebar-nav overflow-x-hidden no-scrollbar">
          <button *ngFor="let tab of tabs"
                  (click)="setTab(tab.id)"
                  class="flex items-center rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer group relative w-full px-3 py-2.5 gap-3"
                  [ngClass]="getNavClass(tab.id)">

            <!-- Icon -->
            <span class="w-[18px] h-[18px] flex-shrink-0 flex items-center justify-center">
              <svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                <!-- Home / Dashboard -->
                <ng-container *ngIf="tab.id === 'dashboard'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </ng-container>
                <!-- Rotbot IA -->
                <ng-container *ngIf="tab.id === 'rotbot'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2zM9 10h.01M15 10h.01" />
                </ng-container>
                <!-- Control Financiero -->
                <ng-container *ngIf="tab.id === 'financial-control'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-3l3 3 3-3M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" />
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
                <!-- Itinerary -->
                <ng-container *ngIf="tab.id === 'itinerary'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </ng-container>
                <!-- Library -->
                <ng-container *ngIf="tab.id === 'library'">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
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
            <span *ngIf="!isSidebarCollapsed" class="flex-grow text-left text-[13px]">{{ tab.name }}</span>

            <!-- Badges -->
            <ng-container *ngIf="!isSidebarCollapsed">
              <span *ngIf="tab.id === 'messages' && unreadMessages > 0 && activeTab !== 'messages'"
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    [ngClass]="activeTab === tab.id ? (isDark ? 'bg-black/20 text-white' : 'bg-white/20 text-black') : (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white')">
                {{ unreadMessages }}
              </span>
              <span *ngIf="tab.id === 'leads' && pendingLeads > 0 && activeTab !== 'leads'"
                    class="text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    [ngClass]="activeTab === tab.id ? (isDark ? 'bg-black/20 text-white' : 'bg-white/20 text-black') : (isDark ? 'bg-white text-black' : 'bg-neutral-900 text-white')">
                {{ pendingLeads }}
              </span>
            </ng-container>
          </button>
        </nav>

        <!-- Bottom: Logout -->
        <div class="p-3 border-t shrink-0" [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-200'">
          <button (click)="logout()"
                  class="flex items-center rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer"
                  [ngClass]="[isDark ? 'text-neutral-600 hover:text-red-400 hover:bg-red-500/5' : 'text-neutral-400 hover:text-red-500 hover:bg-red-50', isSidebarCollapsed ? 'px-0 py-2.5 justify-center w-14 mx-auto' : 'w-full px-3 py-2.5 gap-3']">
            <svg class="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span *ngIf="!isSidebarCollapsed">Salir</span>
          </button>
        </div>
      </aside>

      <!-- ══════════════════════════════════════
           MAIN AREA
      ══════════════════════════════════════ -->
      <div class="flex-grow flex flex-col h-full overflow-hidden min-w-0 relative">

        <!-- Top Bar (AI Search) -->
        <app-dash-ai-search
          [theme]="currentTheme"
          [activeTab]="activeTab"
          (tabChange)="setTab($event)"
          (themeChange)="toggleTheme()"
          (toggleSidebar)="handleToggleSidebar()">
        </app-dash-ai-search>

        <!-- Content -->
        <main class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain md:overscroll-auto md:scroll-smooth pb-20 md:pb-8 no-scrollbar"
              [ngClass]="isDark ? 'bg-[#020204]' : 'bg-white'">
          <div class="p-4 sm:p-6 md:p-8 w-full transition-all duration-300">

            <app-dash-home
              *ngIf="activeTab === 'dashboard'"
              [theme]="currentTheme"
              (tabChange)="setTab($event)">
            </app-dash-home>

            <app-dash-rotbot
              *ngIf="activeTab === 'rotbot'"
              [theme]="currentTheme">
            </app-dash-rotbot>

            <app-dash-itinerary
              *ngIf="activeTab === 'itinerary'"
              [theme]="currentTheme">
            </app-dash-itinerary>

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

            <app-dash-users
              *ngIf="activeTab === 'users'"
              [theme]="currentTheme">
            </app-dash-users>

            <app-dash-config
              *ngIf="activeTab === 'config'"
              [theme]="currentTheme">
            </app-dash-config>

            <app-dash-reports
              *ngIf="activeTab === 'reports'"
              [theme]="currentTheme">
            </app-dash-reports>

            <app-dash-financial-control
              *ngIf="activeTab === 'financial-control'"
              [theme]="currentTheme">
            </app-dash-financial-control>

            <app-dash-finances
              *ngIf="activeTab === 'finances'"
              [theme]="currentTheme">
            </app-dash-finances>

            <app-dash-library
              *ngIf="activeTab === 'library'"
              [theme]="currentTheme">
            </app-dash-library>

          </div>
        </main>

      </div>

      <!-- ══════════════════════════════════════
           MATERIAL 3 MOBILE BOTTOM SHEET MENU
      ══════════════════════════════════════ -->
      <div *ngIf="isMobileDrawerOpen"
           (click)="isMobileDrawerOpen = false"
           class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300">
      </div>

      <div class="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-[28px] max-h-[85vh] overflow-y-auto border-t shadow-2xl transition-transform duration-300 ease-out select-none"
           [ngClass]="[
             isDark ? 'bg-[#0f0f14] border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-900',
             isMobileDrawerOpen ? 'translate-y-0' : 'translate-y-full'
           ]"
           style="padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));">
        
        <!-- Drag Handle Pill -->
        <div class="w-12 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 mx-auto my-3"></div>

        <!-- Sheet Header -->
        <div class="px-5 py-2 flex items-center justify-between border-b pb-3 mb-3"
             [ngClass]="isDark ? 'border-neutral-800' : 'border-neutral-100'">
          <div class="flex items-center gap-3">
            <img [src]="isDark ? 'assets/icons/navbar-logodark.png' : 'assets/icons/navbar-logolight.png'" class="w-7 h-7 object-contain" alt="Admin Panel">
            <div>
              <h2 class="text-sm font-bold tracking-wide">Menú Dashboard</h2>
              <p class="text-[11px] opacity-60">Acceso rápido a todas las funciones</p>
            </div>
          </div>
          <button (click)="isMobileDrawerOpen = false" class="p-2 rounded-full hover:bg-neutral-500/10 active:scale-95">
            <svg class="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- All Tabs Grid List -->
        <div class="px-4 grid grid-cols-2 gap-2.5">
          <button *ngFor="let tab of tabs"
                  (click)="setTab(tab.id); isMobileDrawerOpen = false;"
                  class="flex items-center gap-3 p-3 rounded-2xl text-xs font-semibold transition-all active:scale-95 text-left border"
                  [ngClass]="activeTab === tab.id ? (isDark ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 font-bold' : 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold') : (isDark ? 'bg-neutral-900/60 border-neutral-800/80 text-neutral-300 hover:bg-neutral-800' : 'bg-neutral-50 border-neutral-200/60 text-neutral-700 hover:bg-neutral-100')">
            <span class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  [ngClass]="activeTab === tab.id ? (isDark ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-500/20 text-emerald-700') : (isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-white text-neutral-600')">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <ng-container *ngIf="tab.id === 'dashboard'"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></ng-container>
                <ng-container *ngIf="tab.id === 'rotbot'"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2zM9 10h.01M15 10h.01" /></ng-container>
                <ng-container *ngIf="tab.id === 'finances'"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></ng-container>
                <ng-container *ngIf="tab.id === 'financial-control'"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-3l3 3 3-3M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" /></ng-container>
                <ng-container *ngIf="tab.id === 'analytics'"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></ng-container>
                <ng-container *ngIf="tab.id === 'stats'"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></ng-container>
                <ng-container *ngIf="tab.id === 'messages'"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></ng-container>
                <ng-container *ngIf="tab.id === 'users'"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></ng-container>
                <ng-container *ngIf="tab.id === 'itinerary'"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></ng-container>
                <ng-container *ngIf="tab.id === 'library'"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></ng-container>
                <ng-container *ngIf="tab.id === 'config'"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></ng-container>
                <ng-container *ngIf="tab.id === 'reports'"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></ng-container>
              </svg>
            </span>
            <span class="truncate">{{ tab.name }}</span>
          </button>

          <!-- Logout Button -->
          <button (click)="logout(); isMobileDrawerOpen = false;"
                  class="col-span-2 flex items-center justify-center gap-2 p-3 mt-2 rounded-2xl text-xs font-bold text-red-500 bg-red-500/10 border border-red-500/20 active:scale-95">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           MATERIAL DESIGN 3 MOBILE BOTTOM NAV BAR
      ══════════════════════════════════════ -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-2xl select-none px-2 pt-1 pb-1 transition-all duration-300 shadow-[0_-4px_25px_rgba(0,0,0,0.08)]"
           [ngClass]="isDark ? 'bg-[#09090d]/95 border-neutral-800/80 text-neutral-400' : 'bg-white/95 border-neutral-200/90 text-neutral-600'"
           style="padding-bottom: env(safe-area-inset-bottom, 0px);">
        <div class="flex items-center justify-around max-w-md mx-auto">
          
          <!-- Inicio -->
          <button (click)="setTab('dashboard')"
                  class="flex flex-col items-center justify-center py-1 px-2 transition-all duration-200 active:scale-90 cursor-pointer group">
            <div class="w-[60px] h-9 rounded-full flex items-center justify-center transition-all duration-300 relative"
                 [ngClass]="activeTab === 'dashboard' ? (isDark ? 'bg-emerald-500/20 text-emerald-400 font-bold scale-105' : 'bg-emerald-500/15 text-emerald-600 font-bold scale-105') : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
              <svg class="w-[22px] h-[22px] transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <span class="text-[10.5px] font-bold tracking-tight transition-colors mt-1"
                  [ngClass]="activeTab === 'dashboard' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-neutral-400' : 'text-neutral-500')">Inicio</span>
          </button>

          <!-- Finanzas -->
          <button (click)="setTab('finances')"
                  class="flex flex-col items-center justify-center py-1 px-2 transition-all duration-200 active:scale-90 cursor-pointer group">
            <div class="w-[60px] h-9 rounded-full flex items-center justify-center transition-all duration-300 relative"
                 [ngClass]="activeTab === 'finances' ? (isDark ? 'bg-emerald-500/20 text-emerald-400 font-bold scale-105' : 'bg-emerald-500/15 text-emerald-600 font-bold scale-105') : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
              <svg class="w-[22px] h-[22px] transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
            <span class="text-[10.5px] font-bold tracking-tight transition-colors mt-1"
                  [ngClass]="activeTab === 'finances' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-neutral-400' : 'text-neutral-500')">Finanzas</span>
          </button>

          <!-- Control -->
          <button (click)="setTab('financial-control')"
                  class="flex flex-col items-center justify-center py-1 px-2 transition-all duration-200 active:scale-90 cursor-pointer group">
            <div class="w-[60px] h-9 rounded-full flex items-center justify-center transition-all duration-300 relative"
                 [ngClass]="activeTab === 'financial-control' ? (isDark ? 'bg-emerald-500/20 text-emerald-400 font-bold scale-105' : 'bg-emerald-500/15 text-emerald-600 font-bold scale-105') : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
              <svg class="w-[22px] h-[22px] transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-3l3 3 3-3M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22" />
              </svg>
            </div>
            <span class="text-[10.5px] font-bold tracking-tight transition-colors mt-1"
                  [ngClass]="activeTab === 'financial-control' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-neutral-400' : 'text-neutral-500')">Control</span>
          </button>

          <!-- Mensajes -->
          <button (click)="setTab('messages')"
                  class="flex flex-col items-center justify-center py-1 px-2 transition-all duration-200 active:scale-90 cursor-pointer group">
            <div class="w-[60px] h-9 rounded-full flex items-center justify-center transition-all duration-300 relative"
                 [ngClass]="activeTab === 'messages' ? (isDark ? 'bg-emerald-500/20 text-emerald-400 font-bold scale-105' : 'bg-emerald-500/15 text-emerald-600 font-bold scale-105') : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
              <span *ngIf="unreadMessages > 0" class="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span *ngIf="unreadMessages > 0" class="absolute top-1 right-3 w-2 h-2 rounded-full bg-emerald-500"></span>
              <svg class="w-[22px] h-[22px] transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <span class="text-[10.5px] font-bold tracking-tight transition-colors mt-1"
                  [ngClass]="activeTab === 'messages' ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-neutral-400' : 'text-neutral-500')">Mensajes</span>
          </button>

          <!-- Menú -->
          <button (click)="isMobileDrawerOpen = !isMobileDrawerOpen"
                  class="flex flex-col items-center justify-center py-1 px-2 transition-all duration-200 active:scale-90 cursor-pointer group">
            <div class="w-[60px] h-9 rounded-full flex items-center justify-center transition-all duration-300 relative"
                 [ngClass]="isMobileDrawerOpen ? (isDark ? 'bg-emerald-500/20 text-emerald-400 font-bold scale-105' : 'bg-emerald-500/15 text-emerald-600 font-bold scale-105') : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
              <svg class="w-[22px] h-[22px] transition-transform duration-200" [class.rotate-90]="isMobileDrawerOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </div>
            <span class="text-[10.5px] font-bold tracking-tight transition-colors mt-1"
                  [ngClass]="isMobileDrawerOpen ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-neutral-400' : 'text-neutral-500')">Menú</span>
          </button>

        </div>
      </nav>

    </div>
  `,
  styles: [`
    @keyframes adminFadeIn {
      0% { opacity: 0; transform: scale(0.97) translateY(10px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }

    .admin-shell { 
      font-family: 'Inter Tight', sans-serif; 
      animation: adminFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

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
export class AdminComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private messagesService = inject(MessagesService);
  private authService = inject(AuthService);
  private commandCenterService = inject(CommandCenterService);
  private cdr = inject(ChangeDetectorRef);

  activeTab = 'dashboard';
  currentTheme = 'light';
  isSidebarCollapsed = false;
  isMobileDrawerOpen = false;
  unreadMessages = 0;
  pendingLeads = 0;

  tabs: Tab[] = [
    { id: 'dashboard', name: 'Inicio' },
    { id: 'rotbot',    name: 'Rotbot IA' },
    { id: 'financial-control', name: 'Control Financiero' },
    { id: 'finances',  name: 'Finanzas' },
    { id: 'itinerary', name: 'Calendario' },
    { id: 'library',   name: 'Biblioteca' },
    { id: 'analytics', name: 'Analíticas' },
    { id: 'stats',     name: 'Estadísticas' },
    { id: 'messages',  name: 'Mensajes' },
    { id: 'users',     name: 'Usuarios' },
    { id: 'reports',   name: 'Reportes' },
    { id: 'config',    name: 'Configuración' },
  ];

  get isDark() { return this.currentTheme === 'dark'; }

  ngOnInit() {
    const saved = localStorage.getItem('portalink_admin_theme');
    if (saved) this.currentTheme = saved;
    const savedTab = localStorage.getItem('portalink_admin_tab');
    if (savedTab && this.tabs.some(t => t.id === savedTab)) {
      this.activeTab = savedTab;
    } else {
      this.activeTab = 'dashboard';
    }
    this.applyAdminTheme();
    try {
      this.refreshBadges();
    } catch (e) {
      console.warn('[Admin] Error refreshing badges on init:', e);
    }
  }

  applyAdminTheme() {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('theme-dark', 'theme-light', 'theme-red');
      root.classList.add(`theme-${this.currentTheme}`);
    }
  }

  handleToggleSidebar() {
    if (window.innerWidth < 768) {
      this.isMobileDrawerOpen = !this.isMobileDrawerOpen;
    } else {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  setTab(id: string) {
    if (id === 'leads') id = 'messages';
    if (this.activeTab === id) return;
    
    this.activeTab = id;
    this.isMobileDrawerOpen = false;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portalink_admin_tab', id);
    }

    try {
      const tabObj = this.tabs.find(t => t.id === id);
      const tabName = tabObj ? tabObj.name : id;
      let prompt = `Ver ${tabName}`;
      if (id === 'finances') prompt = 'Reporte de finanzas y pagos';
      else if (id === 'library') prompt = 'Cuadernos y apuntes de biblioteca';
      else if (id === 'itinerary') prompt = 'Agenda y tareas de hoy';
      else if (id === 'analytics') prompt = 'Rendimiento y visitas';
      else if (id === 'messages') prompt = 'Mensajes de contacto';

      this.commandCenterService.logActivity(id, `Accedió a ${tabName}`, 'tab_view', null, prompt).subscribe({ error: () => {} });
    } catch {}
    
    try {
      this.cdr.markForCheck();
    } catch {}

    setTimeout(() => {
      try {
        this.cdr.detectChanges();
      } catch {}
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTo({ top: 0, behavior: 'auto' });
      }
    }, 0);
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('portalink_admin_theme', this.currentTheme);
    this.applyAdminTheme();
  }

  ngOnDestroy() {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('theme-dark', 'theme-red');
      root.classList.add('theme-light');
    }
  }

  refreshBadges() {
    // Leads is still local for now
    try {
      const leads = JSON.parse(localStorage.getItem('portalink_admin_leads') || '[]');
      this.pendingLeads = leads.filter((l: any) => l.status === 'Pendiente').length;
    } catch { }

    // Fetch real unread messages from backend
    this.messagesService.getMessages().subscribe({
      next: (msgs) => {
        this.unreadMessages = msgs.filter(m => m.status === 'unread').length;
      },
      error: () => {}
    });
  }

  logout() {
    localStorage.removeItem('portalink_admin_tab');
    this.authService.logout();
  }

  getNavClass(tabId: string): string {
    const isActive = this.activeTab === tabId;
    if (this.isDark) {
      return isActive
        ? 'bg-white text-black font-headline font-semibold shadow-sm rounded-xl'
        : 'text-neutral-400 font-headline font-medium hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200';
    } else {
      return isActive
        ? 'bg-[#09090b] text-white font-headline font-semibold shadow-sm rounded-xl'
        : 'text-neutral-600 font-headline font-medium hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-200';
    }
  }
}
