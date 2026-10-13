import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MessagesService } from '../../services/messages.service';
import { AuthService } from '../../services/auth.service';
import { CommandCenterService } from '../../services/command-center.service';
import { RotbotMode } from '../../services/robot-chat.service';

// Dashboard Components
import { DashAiSearchComponent } from '../../components/dashboard/dash-ai-search/dash-ai-search.component';
import { DashHomeComponent } from '../../components/dashboard/dash-home/dash-home.component';
import { DashMessagesComponent } from '../../components/dashboard/dash-messages/dash-messages.component';
import { DashUsersComponent } from '../../components/dashboard/dash-users/dash-users.component';
import { DashConfigComponent } from '../../components/dashboard/dash-config/dash-config.component';
import { DashFinancesComponent } from '../../components/dashboard/dash-finances/dash-finances.component';
import { DashItineraryComponent } from '../../components/dashboard/dash-itinerary/dash-itinerary.component';
import { DashLibraryComponent } from '../../components/dashboard/dash-library/dash-library.component';
import { DashRotbotComponent } from '../../components/dashboard/dash-rotbot/dash-rotbot.component';
import { DashDbViewerComponent } from '../../components/dashboard/dash-db-viewer/dash-db-viewer.component';
import { DashStreakModalComponent } from '../../components/dashboard/dash-streak-modal/dash-streak-modal.component';
import { StreakService } from '../../services/streak.service';
import { SessionTimerService } from '../../services/session-timer.service';
import { Subscription } from 'rxjs';

interface Tab {
  id: string;
  name: string;
  icon: string;
  section?: string;
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
    DashMessagesComponent,
    DashUsersComponent,
    DashConfigComponent,
    DashFinancesComponent,
    DashItineraryComponent,
    DashLibraryComponent,
    DashDbViewerComponent,
    DashStreakModalComponent,
  ],
  template: `
    <div class="dash-shell h-[100dvh] h-screen max-h-[100dvh] max-h-screen w-full flex relative overflow-hidden" [class.sidebar-collapsed]="isSidebarCollapsed">

      <!-- ══════════════════════════════════════
           DESKTOP SIDEBAR (HIGH CONTRAST SLATE & RED)
      ══════════════════════════════════════ -->
      <aside class="dash-sidebar fixed top-0 left-0 h-screen z-[200] flex flex-col">

        <!-- Brand -->
        <div class="sidebar-brand" (click)="reloadDashboard()" title="Recargar Dashboard">
          <div class="sidebar-logo">
            <span class="material-symbols-rounded">dashboard</span>
          </div>
          <span class="sidebar-brand-text">PortaLink</span>
        </div>

        <!-- Botón Toggle en el borde -->
        <button class="sidebar-toggle" (click)="handleToggleSidebar()" [title]="isSidebarCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'">
          <span class="material-symbols-rounded" style="font-size: 18px;">
            {{ isSidebarCollapsed ? 'chevron_right' : 'chevron_left' }}
          </span>
        </button>

        <!-- Items de Navegación -->
        <nav class="sidebar-nav">
          <ng-container *ngFor="let tab of tabs; let i = index">
            <!-- Section Header: Principal -->
            <p *ngIf="i === 0 && !isSidebarCollapsed" class="sidebar-nav-label">
              Navegación
            </p>

            <!-- Section Divider: Herramientas -->
            <p *ngIf="tab.section === 'herramientas' && (i === 0 || tabs[i-1].section !== 'herramientas') && !isSidebarCollapsed"
               class="sidebar-nav-label" style="margin-top: 10px;">
              Herramientas
            </p>

            <button (click)="setTab(tab.id)"
                    class="sidebar-nav-item"
                    [class.sidebar-nav-item--active]="activeTab === tab.id"
                    [title]="tab.name">
              <span class="material-symbols-rounded sidebar-nav-icon">{{ tab.icon }}</span>
              <span class="sidebar-nav-label-text">{{ tab.name }}</span>
              <span *ngIf="activeTab === tab.id" class="sidebar-nav-active-dot"></span>
              
              <!-- Badges -->
              <span *ngIf="tab.id === 'messages' && unreadMessages > 0 && activeTab !== 'messages' && !isSidebarCollapsed"
                    class="badge-new-pill" style="margin-left: auto;">
                {{ unreadMessages }}
              </span>
            </button>
          </ng-container>
        </nav>

        <!-- Perfil de Usuario en el pie del sidebar -->
        <div class="sidebar-user-card" *ngIf="!isSidebarCollapsed">
          <div class="sidebar-avatar">{{ getUserInitials() }}</div>
          <div class="sidebar-user-info">
            <span class="sidebar-username">{{ getUserName() }}</span>
            <span class="sidebar-role">Administrador</span>
          </div>
        </div>

        <!-- Logout Button -->
        <div class="p-2 border-t border-[#18181b] shrink-0">
          <button (click)="logout()" class="sidebar-nav-item text-red-400 hover:text-red-300 hover:bg-red-500/10" [title]="'Cerrar Sesión'">
            <span class="material-symbols-rounded sidebar-nav-icon text-red-400">logout</span>
            <span class="sidebar-nav-label-text" *ngIf="!isSidebarCollapsed">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- ══════════════════════════════════════
           MAIN AREA (DASH CONTENT)
      ══════════════════════════════════════ -->
      <div class="dash-content flex-1 flex flex-col h-full max-h-full min-h-0 min-w-0 overflow-hidden"
           [style.margin-left]="isMobileScreen ? '0px' : (isSidebarCollapsed ? '68px' : '240px')">

        <!-- Top Bar (AI Search & Rotbot Dynamic Header) -->
        <app-dash-ai-search
          [theme]="currentTheme"
          [activeTab]="activeTab"
          [isNotesView]="isNotesView"
          [(rotbotMode)]="rotbotMode"
          [(rotbotMuted)]="rotbotMuted"
          (tabChange)="setTab($event)"
          (themeChange)="toggleTheme()"
          (toggleSidebar)="handleToggleSidebar()">
        </app-dash-ai-search>

        <!-- Content -->
        <main class="flex-1 min-h-0 relative z-10 transition-all duration-300 no-scrollbar touch-pan-y"
              style="-webkit-overflow-scrolling: touch;"
              [ngClass]="[
                isDark ? 'bg-[#020204]' : 'bg-white',
                activeTab === 'rotbot'
                  ? 'overflow-hidden flex flex-col justify-between items-center h-full p-2 sm:p-3 md:p-5 lg:p-6 pb-[76px] md:pb-6' 
                  : (activeTab === 'library' && isNotesView
                      ? 'overflow-y-auto overflow-x-hidden px-2 py-2 sm:p-4 md:p-6 pb-32 md:pb-8'
                      : 'overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 pb-32 md:pb-8')
              ]">
          <div class="transition-all duration-300"
               [ngClass]="activeTab === 'rotbot' ? 'w-full h-full flex flex-col justify-between items-center min-h-0' : 'w-full'">

            @defer (when activeTab === 'dashboard'; prefetch on idle) {
              <app-dash-home
                *ngIf="activeTab === 'dashboard'"
                [theme]="currentTheme"
                (tabChange)="setTab($event)">
              </app-dash-home>
            }

            @defer (when activeTab === 'rotbot'; prefetch on idle) {
              <app-dash-rotbot
                *ngIf="activeTab === 'rotbot'"
                class="w-full h-full flex flex-col justify-between min-h-0"
                [theme]="currentTheme"
                [(isMuted)]="rotbotMuted">
              </app-dash-rotbot>
            }

            @defer (when activeTab === 'itinerary'; prefetch on idle) {
              <app-dash-itinerary
                *ngIf="activeTab === 'itinerary'"
                [theme]="currentTheme">
              </app-dash-itinerary>
            }


            @defer (when activeTab === 'messages'; prefetch on idle) {
              <app-dash-messages
                *ngIf="activeTab === 'messages'"
                [theme]="currentTheme"
                (dataChange)="refreshBadges()">
              </app-dash-messages>
            }

            @defer (when activeTab === 'users'; prefetch on idle) {
              <app-dash-users
                *ngIf="activeTab === 'users'"
                [theme]="currentTheme">
              </app-dash-users>
            }

            @defer (when activeTab === 'config'; prefetch on idle) {
              <app-dash-config
                *ngIf="activeTab === 'config'"
                [theme]="currentTheme">
              </app-dash-config>
            }

            @defer (when activeTab === 'finances'; prefetch on idle) {
              <app-dash-finances
                *ngIf="activeTab === 'finances'"
                [theme]="currentTheme">
              </app-dash-finances>
            }

            @defer (when activeTab === 'library'; prefetch on idle) {
              <app-dash-library
                *ngIf="activeTab === 'library'"
                [theme]="currentTheme"
                (inNotesViewChange)="onNotesViewChange($event)">
              </app-dash-library>
            }

            @defer (when activeTab === 'db-viewer'; prefetch on idle) {
              <app-dash-db-viewer
                *ngIf="activeTab === 'db-viewer'"
                [theme]="currentTheme">
              </app-dash-db-viewer>
            }

          </div>
        </main>

      </div>

      <!-- ══════════════════════════════════════
           PREMIUM MOBILE BOTTOM SHEET MENU (ROJO, BLANCO, GRIS, NEGRO)
      ══════════════════════════════════════ -->
      <div *ngIf="isMobileDrawerOpen"
           (click)="isMobileDrawerOpen = false"
           class="fixed inset-0 bg-black/85 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300">
      </div>

      <div *ngIf="isMobileDrawerOpen"
           class="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-[32px] max-h-[88vh] overflow-y-auto border-t border-[#27272a] bg-[#09090b] text-white shadow-[0_-12px_45px_rgba(0,0,0,0.95)] transition-all duration-300 ease-out select-none flex flex-col"
           style="padding-bottom: max(22px, env(safe-area-inset-bottom, 22px));">
        
        <!-- Drag Handle Pill (Gris) -->
        <div class="w-12 h-1.5 rounded-full mx-auto my-3 shrink-0 bg-[#3f3f46]"></div>

        <!-- Sheet Header -->
        <div class="px-5 py-2.5 flex items-center justify-between border-b border-[#1f1f23] pb-3 mb-2 shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#141417] border border-[#27272a] text-red-500">
              <span class="material-symbols-rounded text-xl">dashboard</span>
            </div>
            <div>
              <h2 class="text-sm font-bold tracking-tight text-white">PortaLink Hub</h2>
              <p class="text-[11px] text-[#a1a1aa]">Navegación y herramientas rápidas</p>
            </div>
          </div>
          <button (click)="isMobileDrawerOpen = false"
                  class="w-8 h-8 rounded-full flex items-center justify-center bg-[#141417] hover:bg-[#202024] text-[#a1a1aa] hover:text-white border border-[#27272a] transition-colors active:scale-95"
                  aria-label="Cerrar menú">
            <span class="material-symbols-rounded text-lg">close</span>
          </button>
        </div>

        <!-- All Tabs Grid List -->
        <div class="px-4 py-2 grid grid-cols-2 gap-2.5 overflow-y-auto">
          <ng-container *ngFor="let tab of tabs; let i = index">
            <!-- Herramientas Section Header in Mobile Drawer -->
            <div *ngIf="tab.section === 'herramientas' && (i === 0 || tabs[i-1].section !== 'herramientas')"
                 class="col-span-2 pt-3 pb-1 flex items-center gap-2">
              <span class="text-[10.5px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <span class="material-symbols-rounded text-sm">build</span>
                Herramientas
              </span>
              <span class="flex-grow border-t border-[#27272a]"></span>
            </div>

            <!-- Tab Button -->
            <button (click)="setTab(tab.id); isMobileDrawerOpen = false;"
                    class="group relative flex items-center gap-3 p-3 rounded-2xl text-xs font-semibold transition-all duration-200 active:scale-95 text-left border"
                    [ngClass]="activeTab === tab.id
                      ? 'bg-[#180a0c] border-red-600/80 text-white shadow-[0_0_16px_rgba(239,68,68,0.22)] font-bold'
                      : 'bg-[#121215] hover:bg-[#18181c] border-[#222227] hover:border-[#2e2e36] text-[#e4e4e7]'">
              
              <!-- Tab Icon Badge -->
              <span class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105"
                    [ngClass]="activeTab === tab.id
                      ? 'bg-red-600 text-white border-red-500 shadow-sm'
                      : 'bg-[#1a1a1f] text-[#d4d4d8] border-[#2a2a30]'">
                <span class="material-symbols-rounded text-[20px]">{{ tab.icon }}</span>
              </span>

              <!-- Tab Name + Badges -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-1">
                  <span class="truncate tracking-tight">{{ tab.name }}</span>
                  <span *ngIf="activeTab === tab.id"
                        class="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_6px_#ef4444]"></span>
                </div>
                
                <!-- Extra badge for messages / rotbot -->
                <span *ngIf="tab.id === 'messages' && unreadMessages > 0"
                      class="inline-block mt-0.5 px-1.5 py-0.2 text-[9.5px] font-bold rounded-full bg-red-600 text-white leading-tight">
                  {{ unreadMessages }} nuevo{{ unreadMessages > 1 ? 's' : '' }}
                </span>
                <span *ngIf="tab.id === 'rotbot'"
                      class="inline-block mt-0.5 text-[9.5px] font-medium text-red-400 leading-tight">
                  IA Copilot
                </span>
              </div>
            </button>
          </ng-container>

          <!-- User Card & Logout inside the bottom sheet -->
          <div class="col-span-2 pt-3 mt-2 border-t border-[#1f1f23] flex items-center justify-between gap-2">
            <!-- User Info Pill -->
            <div class="flex items-center gap-2.5 min-w-0 py-1">
              <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm border border-red-400/30">
                {{ getUserInitials() }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold truncate text-white leading-tight">{{ getUserName() }}</p>
                <p class="text-[10px] text-[#a1a1aa] truncate leading-tight">Administrador</p>
              </div>
            </div>

            <!-- Logout Button -->
            <button (click)="logout(); isMobileDrawerOpen = false;"
                    class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-600/10 hover:bg-red-600/20 border border-red-600/25 active:scale-95 transition-all shrink-0">
              <span class="material-symbols-rounded text-base">logout</span>
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════
           BARRA INFERIOR MÓVIL (4 botones limpios: Inicio, Biblioteca, Rotbot IA, Menú)
           Mensajes se retiró de aquí y permanece en el drawer y sidebar.
      ══════════════════════════════════════ -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-2xl select-none transition-all duration-300 shadow-[0_-4px_25px_rgba(0,0,0,0.08)]"
           [class.hidden]="isNotesView || isMobileDrawerOpen"
           [ngClass]="[
             isDark ? 'bg-[#09090d]/95 border-neutral-800/80 text-neutral-400' : 'bg-white/95 border-neutral-200/90 text-neutral-600'
           ]"
           style="padding-top: 6px; padding-bottom: max(10px, env(safe-area-inset-bottom, 10px));">
        <!-- Grid de 4 columnas equilibradas para móvil -->
        <div class="grid grid-cols-4 items-center w-full max-w-md mx-auto">

          <!-- Inicio -->
          <button (click)="setTab('dashboard')"
                  class="flex flex-col items-center justify-center py-1 min-w-0 w-full text-center transition-all duration-200 active:scale-90 cursor-pointer group select-none">
            <div class="w-11 h-[30px] rounded-full flex items-center justify-center transition-all duration-200 relative mx-auto"
                 [ngClass]="activeTab === 'dashboard' ? 'bg-red-500/15 text-red-500' : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
              <svg class="w-5 h-5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <span class="block w-full text-center truncate text-[10.5px] tracking-tight mt-0.5"
                  [ngClass]="activeTab === 'dashboard' ? 'text-red-500 font-bold' : (isDark ? 'text-neutral-400 font-medium' : 'text-neutral-500 font-medium')">Inicio</span>
          </button>

          <!-- Biblioteca -->
          <button (click)="setTab('library')"
                  class="flex flex-col items-center justify-center py-1 min-w-0 w-full text-center transition-all duration-200 active:scale-90 cursor-pointer group select-none">
            <div class="w-11 h-[30px] rounded-full flex items-center justify-center transition-all duration-200 relative mx-auto"
                 [ngClass]="activeTab === 'library' ? 'bg-red-500/15 text-red-500' : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
              <svg class="w-5 h-5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <span class="block w-full text-center truncate text-[10.5px] tracking-tight mt-0.5"
                  [ngClass]="activeTab === 'library' ? 'text-red-500 font-bold' : (isDark ? 'text-neutral-400 font-medium' : 'text-neutral-500 font-medium')">Biblioteca</span>
          </button>

          <!-- Rotbot IA -->
          <button (click)="setTab('rotbot')"
                  class="flex flex-col items-center justify-center py-1 min-w-0 w-full text-center transition-all duration-200 active:scale-90 cursor-pointer group select-none">
            <div class="w-11 h-[30px] rounded-full flex items-center justify-center transition-all duration-200 relative mx-auto"
                 [ngClass]="activeTab === 'rotbot' ? 'bg-red-500/15 text-red-500' : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
              <svg class="w-5 h-5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2zM9 10h.01M15 10h.01" />
              </svg>
            </div>
            <span class="block w-full text-center truncate text-[10.5px] tracking-tight mt-0.5"
                  [ngClass]="activeTab === 'rotbot' ? 'text-red-500 font-bold' : (isDark ? 'text-neutral-400 font-medium' : 'text-neutral-500 font-medium')">Rotbot IA</span>
          </button>

          <!-- Menú -->
          <button (click)="isMobileDrawerOpen = !isMobileDrawerOpen"
                  class="flex flex-col items-center justify-center py-1 min-w-0 w-full text-center transition-all duration-200 active:scale-90 cursor-pointer group select-none">
            <div class="w-11 h-[30px] rounded-full flex items-center justify-center transition-all duration-200 relative mx-auto"
                 [ngClass]="isMobileDrawerOpen ? 'bg-red-500/15 text-red-500' : (isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-neutral-900')">
              <svg class="w-5 h-5 transition-transform duration-200" [class.rotate-90]="isMobileDrawerOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </div>
            <span class="block w-full text-center truncate text-[10.5px] tracking-tight mt-0.5"
                  [ngClass]="isMobileDrawerOpen ? 'text-red-500 font-bold' : (isDark ? 'text-neutral-400 font-medium' : 'text-neutral-500 font-medium')">Menú</span>
          </button>

        </div>
      </nav>

      <!-- Modal de Racha Diaria Flotante -->
      <app-dash-streak-modal [theme]="isDark ? 'dark' : 'light'" (navigateTab)="setTab($event)"></app-dash-streak-modal>

    </div>
  `,
  styles: [`
    @keyframes adminFadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }

    .dash-shell { 
      font-family: var(--font-family, 'Inter Tight', sans-serif); 
      animation: adminFadeIn 0.3s ease-out forwards;
    }

    /* Hide sidebar scrollbar */
    .sidebar-nav { scrollbar-width: none; }
    .sidebar-nav::-webkit-scrollbar { display: none; }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messagesService = inject(MessagesService);
  private authService = inject(AuthService);
  private commandCenterService = inject(CommandCenterService);
  private streakService = inject(StreakService);
  private sessionTimer = inject(SessionTimerService);
  private cdr = inject(ChangeDetectorRef);
  private sessionSub: Subscription | null = null;
  private queryParamSub: Subscription | null = null;

  activeTab = 'dashboard';
  currentTheme = 'dark';
  isSidebarCollapsed = false;
  isMobileDrawerOpen = false;
  unreadMessages = 0;
  pendingLeads = 0;
  isNotesView = false;
  private previousSidebarState: boolean | null = null;

  rotbotMode: RotbotMode = 'charla';
  rotbotMuted = false;

  tabs: Tab[] = [
    { id: 'dashboard',         name: 'Inicio',        icon: 'dashboard' },
    { id: 'finances',          name: 'Finanzas',      icon: 'payments' },
    { id: 'messages',          name: 'Mensajes',      icon: 'mail' },
    { id: 'users',             name: 'Usuarios',      icon: 'group' },
    { id: 'config',            name: 'Configuración', icon: 'settings' },
    { id: 'rotbot',            name: 'Rotbot IA',     icon: 'smart_toy',       section: 'herramientas' },
    { id: 'itinerary',         name: 'Calendario',    icon: 'calendar_today',  section: 'herramientas' },
    { id: 'library',           name: 'Biblioteca',    icon: 'menu_book',       section: 'herramientas' },
    { id: 'db-viewer',         name: 'Visor BD',      icon: 'database',        section: 'herramientas' },
  ];

  getUserName(): string {
    const user = this.authService.currentUser();
    return user?.nombre || 'Santiago';
  }

  getUserInitials(): string {
    const name = this.getUserName().trim();
    if (!name) return 'SA';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  get isDark() { return this.currentTheme === 'dark'; }


  ngOnInit() {
    // Si la sesión ya expiró, expulsar inmediatamente a login sin intentar cargar widgets
    if (!this.authService.hasValidToken()) {
      this.authService.handleSessionExpiration();
      return;
    }

    this.sessionSub = this.sessionTimer.sessionExpired$.subscribe(() => {
      this.authService.handleSessionExpiration();
    });

    this.streakService.initStreak();
    const saved = localStorage.getItem('portalink_admin_theme');
    // Siempre modo oscuro por defecto al ingresar, a menos que el usuario lo haya cambiado a 'light'
    if (saved === 'light') {
      this.currentTheme = 'light';
    } else {
      this.currentTheme = 'dark';
      localStorage.setItem('portalink_admin_theme', 'dark');
    }

    // Restaurar tab activo: prioridad al query param ?tab=..., luego a localStorage, o 'dashboard' por defecto
    const queryTab = this.normalizeTab(this.route.snapshot.queryParamMap.get('tab'));
    const savedTab = this.normalizeTab(typeof localStorage !== 'undefined' ? localStorage.getItem('portalink_admin_tab') : null);
    const initialTab = queryTab || savedTab || 'dashboard';

    this.activeTab = initialTab;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portalink_admin_tab', initialTab);
    }

    if (this.route.snapshot.queryParamMap.get('tab') !== initialTab) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab: initialTab },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }

    // Sincronizar si cambia el parámetro de URL (ej. botones atrás / adelante del navegador)
    this.queryParamSub = this.route.queryParamMap.subscribe(params => {
      const tabFromUrl = this.normalizeTab(params.get('tab'));
      if (tabFromUrl && tabFromUrl !== this.activeTab) {
        this.setTab(tabFromUrl, false);
      }
    });

    this.applyAdminTheme();
    try {
      this.refreshBadges();
    } catch (e) {
      console.warn('[Admin] Error refreshing badges on init:', e);
    }
  }

  normalizeTab(tabId: string | null | undefined): string | null {
    if (!tabId) return null;
    let id = tabId.toLowerCase().trim();
    if (id === 'leads') id = 'messages';
    if (id === 'stats' || id === 'reports' || id === 'analytics' || id === 'financial-control') id = 'finances';
    return this.tabs.some(t => t.id === id) ? id : null;
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
      if (!this.isNotesView) {
        this.previousSidebarState = null;
      }
    }
  }

  get isMobileScreen(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  onNotesViewChange(inNotes: boolean) {
    this.isNotesView = inNotes;
    if (inNotes) {
      if (this.previousSidebarState === null) {
        this.previousSidebarState = this.isSidebarCollapsed;
      }
      this.isSidebarCollapsed = true;
    } else {
      if (this.previousSidebarState !== null) {
        this.isSidebarCollapsed = this.previousSidebarState;
        this.previousSidebarState = null;
      }
    }
    try {
      this.cdr.markForCheck();
    } catch {}
  }

  reloadDashboard() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portalink_admin_tab', 'dashboard');
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/admin?tab=dashboard';
    }
  }

  setTab(id: string, updateUrl: boolean = true) {
    if (id === 'leads') id = 'messages';
    if (id === 'stats' || id === 'reports' || id === 'analytics' || id === 'financial-control') id = 'finances';
    if (this.activeTab === id) return;
    
    if (this.activeTab === 'library' && id !== 'library' && this.previousSidebarState !== null) {
      this.isSidebarCollapsed = this.previousSidebarState;
      this.previousSidebarState = null;
      this.isNotesView = false;
    }

    this.activeTab = id;
    this.isMobileDrawerOpen = false;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('portalink_admin_tab', id);
    }

    if (updateUrl) {
      try {
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { tab: id },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      } catch {}
    }

    try {
      const tabObj = this.tabs.find(t => t.id === id);
      const tabName = tabObj ? tabObj.name : id;
      let prompt = `Ver ${tabName}`;
      if (id === 'finances') prompt = 'Reporte de finanzas y pagos';
      else if (id === 'library') prompt = 'Cuadernos y apuntes de biblioteca';
      else if (id === 'itinerary') prompt = 'Agenda y tareas de hoy';
      else if (id === 'messages') prompt = 'Mensajes de contacto';
      else if (id === 'db-viewer') prompt = 'Visor de base de datos y esquemas ERD';

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
    this.sessionSub?.unsubscribe();
    this.queryParamSub?.unsubscribe();
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
