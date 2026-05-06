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
    ],
    template: `
    <div class="dynamic-bg" [style.background]="currentBackground"></div>
    <main class="relative" *ngIf="portfolioData()">
      <app-navbar></app-navbar>
      <app-hero [data]="portfolioData().hero"></app-hero>
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
      background: #ffffff;
      transition: background 0.7s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    }
  `]
})
export class PortfolioPageComponent implements OnInit, OnDestroy {
  private scrollColorService = inject(ScrollColorService);
  private configService = inject(PortfolioConfigService);
  
  currentBackground = '#FFFFFF';
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
