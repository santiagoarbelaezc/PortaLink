import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-skills',
    standalone: true,
    imports: [CommonModule],
    template: `
    <section id="skills" class="py-20 border-y border-white/5 overflow-hidden">
      <!-- Marquee Wrapper -->
      <div class="relative flex overflow-hidden">
        <div class="flex animate-marquee whitespace-nowrap gap-12 py-10">
          <div *ngFor="let tech of (skills || defaultSkills).concat(skills || defaultSkills)" 
               class="flex items-center gap-4 px-8 py-4 glass-card group cursor-default hover:border-accent-cyan/40">
            <div class="w-10 h-10 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
              <i *ngIf="tech.icon" [class]="tech.icon" class="text-2xl"></i>
              <svg *ngIf="!tech.icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            </div>
            <div class="flex flex-col">
              <span class="font-headline text-3xl uppercase tracking-tighter">{{ tech.name }}</span>
              <span class="text-[10px] text-accent-cyan tracking-widest">{{ tech.percentage }}% Mastery</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Marquee (Reverse) -->
      <div class="relative flex overflow-hidden mt-4">
        <div class="flex animate-marquee-reverse whitespace-nowrap gap-12 py-10">
          <div *ngFor="let skill of softSkills.concat(softSkills)" 
               class="flex items-center gap-4 px-8 py-4 glass rounded-full group cursor-default hover:bg-accent-cyan/10 transition-colors">
            <span class="text-xs uppercase tracking-[0.4em] text-white/40 group-hover:text-accent-cyan transition-colors">{{ skill }}</span>
            <div class="w-1.5 h-1.5 rounded-full bg-accent-cyan"></div>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .animate-marquee { animation: marquee 40s linear infinite; }
    .animate-marquee-reverse { animation: marquee 40s linear infinite reverse; }
    @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    .glass-card { background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.1); border-radius: 1rem; }
  `]
})
export class SkillsComponent {
  @Input() skills: any[] = [];
  
  defaultSkills = [
    { name: 'Angular', icon: 'fab fa-angular', percentage: 95 },
    { name: 'TypeScript', icon: 'fab fa-js', percentage: 90 },
    { name: 'SCSS', icon: 'fab fa-sass', percentage: 85 }
  ];

  softSkills = [
    'Creative Direction', 'Brand Strategy', 'Product Design', 'User Experience', 
    'Agile Leadership', 'System Architecture', 'Visual Design', 'Motion Graphics'
  ];
}
