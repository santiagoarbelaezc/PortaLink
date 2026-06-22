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
        NavbarComponent,
        HeroComponent,
        PortfolioComponent,
        AboutComponent,
        SkillsComponent,
        ContactComponent,
        FooterComponent,
        AiChatFloatingComponent,
    ],
    template: `
    <app-ai-chat-floating></app-ai-chat-floating>
    <div class="dynamic-bg"></div>
    <main class="relative text-white" *ngIf="portfolioData()">
      <app-navbar></app-navbar>
      <app-hero [data]="portfolioData().hero"></app-hero>
      
      <section class="rotbot-banner">
        <video autoplay [muted]="true" onvolumechange="this.muted=true; this.volume=0;" volume="0" loop playsinline class="video-bg">
          <source src="assets/videos/video-robot.mp4" type="video/mp4">
        </video>
        <div class="content">
          <h2 class="banner-title tracking-tight text-white">Habla con <span class="text-white">Rotbot</span></h2>
          <p class="banner-subtitle">EL ASISTENTE VIRTUAL</p>
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

  ngOnDestroy() {
    this.sub?.unsubscribe();
    window.removeEventListener('message', this.handleMessage);
  }
}
