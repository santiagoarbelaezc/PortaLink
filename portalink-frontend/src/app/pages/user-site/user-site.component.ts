import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SiteService, UserSite } from '../../services/site.service';
import { UserLandingComponent } from '../../components/user-landing/user-landing.component';

@Component({
  selector: 'app-user-site',
  standalone: true,
  imports: [CommonModule, RouterModule, UserLandingComponent],
  template: `
    <div class="fixed inset-0 w-full h-full overflow-hidden">
      <!-- Loader -->
      <div *ngIf="loading()" class="w-full h-full bg-black text-white flex flex-col items-center justify-center">
        <div class="w-12 h-12 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-sm tracking-widest uppercase opacity-70">Cargando Landing Page...</p>
      </div>

      <!-- Error / 404 -->
      <div *ngIf="!loading() && error()" class="w-full h-full bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-cyan-400">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 class="text-3xl font-black mb-2">Sitio Web No Encontrado</h1>
        <p class="text-neutral-400 max-w-md text-sm leading-relaxed mb-8">
          No pudimos encontrar una landing page pública con esa dirección o el creador aún no la ha publicado.
        </p>
        <a routerLink="/" class="px-6 py-3 rounded-xl bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-all hover:bg-cyan-300">
          Volver al Inicio
        </a>
      </div>

      <!-- Landing Content -->
      <app-user-landing *ngIf="!loading() && site()"
                        [siteData]="site()?.site_data"
                        class="block w-full h-full overflow-hidden">
      </app-user-landing>
    </div>
  `
})
export class UserSiteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private siteService = inject(SiteService);

  loading = signal<boolean>(true);
  error = signal<boolean>(false);
  site = signal<UserSite | null>(null);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loading.set(false);
      this.error.set(true);
      return;
    }

    this.siteService.getSiteBySlug(slug).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res && res.site) {
          this.site.set(res.site);
        } else {
          this.error.set(true);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      }
    });
  }
}
