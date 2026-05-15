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
    selector: 'app-portfolio-page',
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
    <div class="dynamic-bg" [style.background]="currentBackground"></div>
    <main class="relative text-white" *ngIf="portfolioData()">
      <app-navbar></app-navbar>
      <app-hero [data]="portfolioData().hero"></app-hero>
      
      <section class="rotbot-banner">
        <video autoplay muted loop playsinline class="video-bg">
          <source src="assets/videos/video-robot.mp4" type="video/mp4">
        </video>
        <div class="content" data-aos="fade-up">
          <h2 class="banner-title tracking-tight text-white">Habla con <span class="text-accent-cyan">Rotbot</span></h2>
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
    styles: [`
    .dynamic-bg {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: -2;
      background: #000000;
      transition: background 1.2s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    }

    .rotbot-banner {
      position: relative;
      height: 130vh; /* Increased height to fit taller video */
      width: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      border-top: 1px solid rgba(0, 245, 255, 0.3);
      border-bottom: 1px solid rgba(0, 245, 255, 0.3);
    }

    .video-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 1; /* Maximum clarity */
    }

    .overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.8) 100%);
    }

    .content {
      position: relative;
      z-index: 10;
      text-align: center;
      text-shadow: 0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.6); /* Add shadow to text since video is now clear */
    }

    .banner-title {
      font-size: clamp(3rem, 10vw, 6rem);
      line-height: 0.9;
      margin-bottom: 1rem;
      color: white;
    }

    .banner-subtitle {
      font-size: clamp(0.6rem, 2vw, 0.8rem);
      letter-spacing: 0.8em;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 300;
    }

    .text-accent-cyan {
      color: #00F5FF;
    }
  `]
})
export class PortfolioPageComponent implements OnInit, OnDestroy {
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
