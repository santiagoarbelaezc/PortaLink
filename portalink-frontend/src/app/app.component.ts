import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AiChatFloatingComponent } from './components/ai-chat-floating/ai-chat-floating.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NavbarComponent, AiChatFloatingComponent],
    template: `
    <!-- Elegant Glowing Top Loading Bar -->
    <div class="top-loader" [class.active]="isLoading" [class.finished]="isFinished">
      <div class="bar"></div>
      <div class="glow"></div>
    </div>

    <!-- Elegant Content Loading Overlay -->
    <div class="loading-overlay" [class.active]="isLoading">
      <div class="pulse-ring"></div>
    </div>

    <!-- Persistent Header & Chatbot (completely unaffected by route transitions) -->
    <app-navbar></app-navbar>
    <app-ai-chat-floating></app-ai-chat-floating>

    <!-- Main Content Area -->
    <div class="content-container">
      <router-outlet></router-outlet>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
    }

    /* Top Progress Bar */
    .top-loader {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      z-index: 10000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .top-loader.active {
      opacity: 1;
    }

    .top-loader.finished {
      opacity: 1;
    }

    .top-loader .bar {
      height: 100%;
      width: 0;
      background: linear-gradient(90deg, var(--accent-color, #3B82F6), #10B981, var(--accent-color, #3B82F6));
      background-size: 200% 100%;
      animation: shimmer 1.5s linear infinite;
      transition: width 0.4s cubic-bezier(0.1, 0.8, 0.1, 1);
    }

    .top-loader.active .bar {
      animation: loading-progress 3s cubic-bezier(0.1, 0.8, 0.1, 1) forwards, shimmer 1.5s linear infinite;
    }

    .top-loader.finished .bar {
      width: 100% !important;
      transition: width 0.25s ease-out;
    }

    .top-loader .glow {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      box-shadow: 0 0 15px var(--accent-color, #3B82F6), 0 0 5px var(--accent-color, #3B82F6);
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .top-loader.active .glow {
      opacity: 0.6;
    }

    @keyframes shimmer {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }

    @keyframes loading-progress {
      0% { width: 0%; }
      30% { width: 40%; }
      70% { width: 75%; }
      100% { width: 85%; }
    }

    /* Content Loading Overlay */
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: var(--bg-primary, #000000);
      z-index: 8000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1);
    }

    .loading-overlay.active {
      opacity: 0.8;
      pointer-events: auto;
    }

    .pulse-ring {
      width: 44px;
      height: 44px;
      border: 2px solid rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      position: relative;
    }

    .pulse-ring::after {
      content: '';
      position: absolute;
      inset: -2px;
      border: 2px solid transparent;
      border-top-color: var(--text-primary, #ffffff);
      border-radius: 50%;
      animation: spin 0.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .content-container {
      position: relative;
      width: 100%;
      min-height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  private router = inject(Router);

  isLoading = false;
  isFinished = false;

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
        this.isFinished = false;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Smoothly finish loading
        this.isFinished = true;
        setTimeout(() => {
          this.isLoading = false;
          // Reset finish state after transition ends
          setTimeout(() => {
            this.isFinished = false;
          }, 400);
        }, 300);
      }
    });
  }
}
