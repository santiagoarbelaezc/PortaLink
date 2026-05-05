import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';

@Component({
    selector: 'app-services',
    imports: [CommonModule, RevealDirective, MagneticDirective],
    template: `
    <section id="services" class="py-20 md:py-32 px-6 overflow-hidden">
      <div class="container mx-auto">
        <!-- Section Header -->
        <div class="mb-20" appReveal>
          <div class="flex items-center gap-4 mb-4">
            <div class="h-px w-12 bg-accent-cyan"></div>
            <span class="text-accent-cyan text-xs uppercase tracking-[0.4em]">Expertise</span>
          </div>
          <h2 class="text-5xl md:text-7xl">Capabilities</h2>
        </div>

        <!-- Services Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div *ngFor="let service of services; let i = index" 
               class="glass-card group relative p-12 min-h-[400px] flex flex-col justify-end"
               appReveal [delay]="i * 100">
            <!-- Icon/Number -->
            <div class="absolute top-12 left-12">
              <span class="font-headline text-5xl opacity-10 group-hover:opacity-40 transition-opacity text-accent-gold">0{{ i + 1 }}</span>
            </div>

            <!-- Content -->
            <div class="relative z-10">
              <h3 class="text-3xl mb-4 group-hover:text-accent-cyan transition-colors">{{ service.title }}</h3>
              <p class="text-white/50 text-lg leading-relaxed mb-8 max-w-sm">
                {{ service.description }}
              </p>
              
              <!-- Tag -->
              <div class="flex flex-wrap gap-2">
                <span *ngFor="let tag of service.tags" class="text-[10px] border border-white/10 px-3 py-1 rounded-full uppercase tracking-widest bg-white/5">
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Border Sweep -->
            <div class="absolute inset-0 bg-gradient-to-r from-accent-cyan/0 via-accent-cyan/10 to-accent-cyan/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
            <div class="absolute inset-0 border border-accent-cyan/0 group-hover:border-accent-cyan/20 transition-all duration-500"></div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ServicesComponent {
  services = [
    {
      title: 'Digital Experience',
      description: 'Crafting immersive digital journeys that merge aesthetic excellence with functional precision.',
      tags: ['Strategy', 'Art Direction', 'Prototyping']
    },
    {
      title: 'Technical Mastery',
      description: 'Building robust, scalable applications using cutting-edge frameworks and lean architecture.',
      tags: ['Angular', 'Next.js', 'Clean Code']
    },
    {
      title: 'Visual Identity',
      description: 'Defining the core essence of brands through meticulous design systems and editorial layouts.',
      tags: ['Branding', 'Typography', 'Logo Design']
    },
    {
      title: 'Interaction Design',
      description: 'Breathing life into static interfaces with fluid animations and responsive behaviors.',
      tags: ['GSAP', 'Framer', 'Micro-interactions']
    }
  ];
}
