import { Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { PortfolioComponent } from '../../components/portfolio/portfolio.component';
import { AboutComponent } from '../../components/about/about.component';
import { SkillsComponent } from '../../components/skills/skills.component';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollColorService } from '../../services/scroll-color.service';
import { PortfolioConfigService } from '../../services/portfolio-config.service';
import { AiChatFloatingComponent } from '../../components/ai-chat-floating/ai-chat-floating.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-proyectos',
    standalone: true,
    imports: [
        CommonModule,
        HeroComponent,
        PortfolioComponent,
        AboutComponent,
        SkillsComponent,
        ContactComponent,
        FooterComponent,
    ],
    template: `
    <div class="dynamic-bg"></div>
    <main class="relative text-white" *ngIf="portfolioData()">
      <app-hero [data]="portfolioData().hero"></app-hero>
      
      <section class="rotbot-banner relative">
        <video autoplay [muted]="true" onvolumechange="this.muted=true; this.volume=0;" volume="0" loop playsinline class="video-bg">
          <source src="assets/videos/video-robot.mp4" type="video/mp4">
        </video>
        <div class="overlay"></div>
        
        <div class="container mx-auto px-6 relative z-10 w-full h-full flex items-center py-16 md:py-24">
          <div class="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12 lg:gap-20 w-full items-center">
            
            <!-- Left Side: Header -->
            <div class="text-left max-w-xl">
              <span class="text-[10px] uppercase tracking-[0.4em] font-bold block mb-4" style="color: var(--text-secondary);">
                INTELLIGENT AGENT
              </span>
              <h2 class="text-4xl sm:text-5xl md:text-6xl font-headline uppercase leading-[1.05] tracking-tighter mb-4 text-white">
                Habla con <span style="color: var(--accent-color);">Rotbot</span>, tu asistente, para lo que necesites
              </h2>
            </div>
            
            <!-- Right Side: Interaction Grid -->
            <div class="flex flex-col gap-6 lg:items-end">
              <div class="w-full lg:max-w-xl flex flex-col gap-4 text-left">
                
                <!-- Option Card 1 -->
                <div (click)="openChatWithMessage('Necesito asesoría')" 
                     class="glass-option-card border p-6 rounded-[24px] transition-all duration-300 hover:translate-x-2 flex items-center justify-between group cursor-pointer"
                     style="border-color: var(--card-border); background: rgba(0,0,0,0.45);">
                  <div class="flex items-center gap-4">
                    <div class="w-2.5 h-2.5 rounded-full transition-all duration-300 group-hover:scale-150 shadow-[0_0_8px_var(--accent-color)]" style="background-color: var(--accent-color);"></div>
                    <span class="text-sm sm:text-base font-bold tracking-wide uppercase text-white opacity-85 group-hover:opacity-100 transition-opacity">
                      ¿Necesitas asesoría?
                    </span>
                  </div>
                  <svg class="w-5 h-5 text-white/50 group-hover:text-white transition-all transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                
                <!-- Option Card 2 -->
                <div (click)="openChatWithMessage('Necesito agendar una cita')" 
                     class="glass-option-card border p-6 rounded-[24px] transition-all duration-300 hover:translate-x-2 flex items-center justify-between group cursor-pointer"
                     style="border-color: var(--card-border); background: rgba(0,0,0,0.45);">
                  <div class="flex items-center gap-4">
                    <div class="w-2.5 h-2.5 rounded-full transition-all duration-300 group-hover:scale-150 shadow-[0_0_8px_var(--accent-color)]" style="background-color: var(--accent-color);"></div>
                    <span class="text-sm sm:text-base font-bold tracking-wide uppercase text-white opacity-85 group-hover:opacity-100 transition-opacity">
                      ¿Necesitas agendar una cita?
                    </span>
                  </div>
                  <svg class="w-5 h-5 text-white/50 group-hover:text-white transition-all transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                
                <!-- Option Card 3 -->
                <div (click)="openChatWithMessage('Quiero crear un diseño para mi negocio')" 
                     class="glass-option-card border p-6 rounded-[24px] transition-all duration-300 hover:translate-x-2 flex items-center justify-between group cursor-pointer"
                     style="border-color: var(--card-border); background: rgba(0,0,0,0.45);">
                  <div class="flex items-center gap-4">
                    <div class="w-2.5 h-2.5 rounded-full transition-all duration-300 group-hover:scale-150 shadow-[0_0_8px_var(--accent-color)]" style="background-color: var(--accent-color);"></div>
                    <span class="text-sm sm:text-base font-bold tracking-wide uppercase text-white opacity-85 group-hover:opacity-100 transition-opacity">
                      ¿Quieres crear un diseño para tu negocio?
                    </span>
                  </div>
                  <svg class="w-5 h-5 text-white/50 group-hover:text-white transition-all transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                
              </div>
            </div>
            
          </div>
        </div>
      </section>

      <app-portfolio [projects]="portfolioData().portfolio"></app-portfolio>
      <app-about [data]="portfolioData().about"></app-about>
      <app-skills [skills]="portfolioData().skills"></app-skills>
      <app-contact [data]="portfolioData().contact"></app-contact>
      <app-footer></app-footer>
    </main>
  `,
    styleUrls: ['./proyectos.component.css']
})
export class ProyectosComponent implements OnInit, OnDestroy {
  private scrollColorService = inject(ScrollColorService);
  private configService = inject(PortfolioConfigService);
  
  currentBackground = '#000000';
  portfolioData = signal<any>(null);
  private sub?: Subscription;

  constructor() {
    // Initial sync with service
    effect(() => {
      const data = this.configService.data();
      if (data) {
        this.portfolioData.set(data);
        // Force recalculation after DOM renders
        setTimeout(() => this.scrollColorService.recalculate(), 100);
      }
    });
  }

  ngOnInit() {
    this.sub = this.scrollColorService.currentColor$.subscribe(c => this.currentBackground = c);
    
    // Listen for live preview updates from parent dashboard
    window.addEventListener('message', this.handleMessage);
  }

  handleMessage = (event: MessageEvent) => {
    if (event.data.type === 'PORTFOLIO_PREVIEW_UPDATE') {
      this.portfolioData.set(event.data.payload);
      // Force recalculation after preview update
      setTimeout(() => this.scrollColorService.recalculate(), 100);
    }
  }

  openChatWithMessage(message: string) {
    window.dispatchEvent(new CustomEvent('open-ai-chat', { detail: { message } }));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    window.removeEventListener('message', this.handleMessage);
  }
}
