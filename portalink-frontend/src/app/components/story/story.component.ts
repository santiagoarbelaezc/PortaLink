import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageComparisonComponent } from '../shared/image-comparison/image-comparison.component';

@Component({
  selector: 'app-story',
  standalone: true,
  imports: [CommonModule, ImageComparisonComponent],
  template: `
    <section id="story" class="py-24 md:py-32 bg-white overflow-hidden">
      <div class="container mx-auto px-6">
        
        <!-- Section Header -->
        <div class="max-w-3xl mb-16 md:mb-24">
          <h2 class="text-xs uppercase tracking-[0.4em] text-accent-cyan font-bold mb-4" data-aos="fade-up">My Story</h2>
          <h1 class="text-4xl md:text-6xl font-headline text-black leading-none mb-8" data-aos="fade-up" data-aos-delay="100">
            EL PROCESO DETRÁS DE <br/> <span class="text-accent-cyan">CADA PIXEL.</span>
          </h1>
          <p class="text-xl text-black/60 font-light leading-relaxed" data-aos="fade-up" data-aos-delay="200">
            No solo construyo sitios web; diseño narrativas digitales. Mi viaje como desarrollador y arquitecto digital se basa en la evolución constante, refinando cada detalle desde los cimientos hasta la experiencia final.
          </p>
        </div>

        <!-- Comparisons Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          <!-- Story Comparison 1 -->
          <div class="group" data-aos="fade-right">
            <div class="mb-6 flex justify-between items-end">
              <div>
                <h3 class="text-2xl font-bold text-black mb-2">Wirefame to Reality</h3>
                <p class="text-sm text-black/40 uppercase tracking-widest">UX & UI Development</p>
              </div>
              <span class="text-xs font-mono text-accent-cyan">01 / 03</span>
            </div>
            <app-image-comparison 
              beforeImage="project_1_minimal_app_1776822496202.png" 
              afterImage="project_2_ecomm_fashion_1776822513607.png"
              beforeLabel="WIREFRAME"
              afterLabel="FINAL UI">
            </app-image-comparison>
            <p class="mt-6 text-black/50 leading-relaxed italic">
              "La claridad nace en el boceto. Transformo ideas abstractas en interfaces tangibles y estéticas."
            </p>
          </div>

          <!-- Story Comparison 2 -->
          <div class="group lg:mt-32" data-aos="fade-left">
            <div class="mb-6 flex justify-between items-end">
              <div>
                <h3 class="text-2xl font-bold text-black mb-2">Structure & Light</h3>
                <p class="text-sm text-black/40 uppercase tracking-widest">Architectural Approach</p>
              </div>
              <span class="text-xs font-mono text-accent-cyan">02 / 03</span>
            </div>
            <app-image-comparison 
              beforeImage="hero_portrait_abstract_1776822149558.png" 
              afterImage="about_portrait_editorial_1776822710811.png"
              beforeLabel="CONCEPT"
              afterLabel="EXECUTION">
            </app-image-comparison>
            <p class="mt-6 text-black/50 leading-relaxed italic">
              "Abstraigo la complejidad del código para entregar una simplicidad arquitectónica que cautiva."
            </p>
          </div>

        </div>

        <!-- Call to Action -->
        <div class="mt-32 text-center" data-aos="fade-up">
          <div class="inline-flex flex-col items-center">
            <div class="w-px h-16 bg-gradient-to-b from-accent-cyan to-transparent mb-6"></div>
            <p class="text-sm uppercase tracking-[0.3em] text-black/30 font-bold">Continúa explorando</p>
          </div>
        </div>

      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class StoryComponent {}
