import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Task {
  id: number;
  title: string;
  type: 'work' | 'personal' | 'urgent';
  time?: string;
  completed?: boolean;
}

interface DayPlan {
  day: string;
  date: string;
  tasks: Task[];
}

@Component({
  selector: 'app-dash-itinerary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-3xl font-bold uppercase tracking-tight"
              [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">
            Itinerario Semanal
          </h2>
          <p class="text-sm mt-1" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
            Organiza tu horario y tareas diarias para maximizar tu productividad.
          </p>
        </div>
        <button class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all shadow-sm"
                [ngClass]="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Tarea
        </button>
      </div>

      <!-- Filters & Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 rounded-2xl border"
             [ngClass]="isDark ? 'bg-[#0f0f13] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
          <span class="text-xs font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">Tareas Totales</span>
          <p class="text-2xl font-black mt-1" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">24</p>
        </div>
        <div class="p-4 rounded-2xl border"
             [ngClass]="isDark ? 'bg-[#0f0f13] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
          <span class="text-xs font-bold uppercase tracking-widest text-[#00b4d8]">Desarrollo</span>
          <p class="text-2xl font-black mt-1" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">15</p>
        </div>
        <div class="p-4 rounded-2xl border"
             [ngClass]="isDark ? 'bg-[#0f0f13] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
          <span class="text-xs font-bold uppercase tracking-widest text-[#3B82F6]">Personal / Gym</span>
          <p class="text-2xl font-black mt-1" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">6</p>
        </div>
        <div class="p-4 rounded-2xl border"
             [ngClass]="isDark ? 'bg-[#0f0f13] border-neutral-800' : 'bg-neutral-50 border-neutral-200'">
          <span class="text-xs font-bold uppercase tracking-widest text-[#ef4444]">Urgentes</span>
          <p class="text-2xl font-black mt-1" [ngClass]="isDark ? 'text-white' : 'text-neutral-900'">3</p>
        </div>
      </div>

      <!-- Weekly Kanban Grid -->
      <div class="flex gap-4 overflow-x-auto pb-4 kanban-scroll" style="min-height: 60vh;">
        
        <div *ngFor="let day of weekPlan" 
             class="flex-shrink-0 w-72 flex flex-col rounded-2xl border overflow-hidden"
             [ngClass]="isDark ? 'bg-[#0a0a0d] border-neutral-800/60' : 'bg-neutral-50/50 border-neutral-200'">
          
          <!-- Day Header -->
          <div class="p-4 border-b flex justify-between items-center"
               [ngClass]="isDark ? 'border-neutral-800/60 bg-[#111116]' : 'border-neutral-200 bg-white'">
            <div>
              <h3 class="font-bold uppercase tracking-wider text-sm"
                  [ngClass]="isDark ? 'text-neutral-200' : 'text-neutral-800'">
                {{ day.day }}
              </h3>
              <p class="text-[10px] uppercase font-semibold tracking-widest mt-0.5"
                 [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'">
                {{ day.date }}
              </p>
            </div>
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                 [ngClass]="isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-500'">
              {{ day.tasks.length }}
            </div>
          </div>

          <!-- Tasks List -->
          <div class="p-3 flex-grow overflow-y-auto space-y-3">
            <div *ngFor="let task of day.tasks" 
                 class="group p-4 rounded-xl border relative transition-all duration-200 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md"
                 [ngClass]="[
                   isDark ? 'bg-[#15151a] border-neutral-800/80 hover:border-neutral-700' : 'bg-white border-neutral-200 hover:border-neutral-300',
                   task.completed ? 'opacity-50' : 'opacity-100'
                 ]">
                 
              <!-- Task Type Indicator Bar -->
              <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                   [ngClass]="{
                     'bg-[#00b4d8]': task.type === 'work',
                     'bg-[#3B82F6]': task.type === 'personal',
                     'bg-[#ef4444]': task.type === 'urgent'
                   }">
              </div>

              <!-- Content -->
              <div class="pl-2">
                <div class="flex justify-between items-start mb-1.5">
                  <span class="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        [ngClass]="{
                          'bg-[#00b4d8]/10 text-[#00b4d8]': task.type === 'work',
                          'bg-[#3B82F6]/10 text-[#3B82F6]': task.type === 'personal',
                          'bg-[#ef4444]/10 text-[#ef4444]': task.type === 'urgent'
                        }">
                    {{ task.type === 'work' ? 'Trabajo' : task.type === 'personal' ? 'Personal' : 'Urgente' }}
                  </span>
                  
                  <button class="text-neutral-500 hover:text-neutral-300 transition-colors opacity-0 group-hover:opacity-100">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                  </button>
                </div>
                
                <h4 class="text-sm font-semibold leading-snug"
                    [ngClass]="[
                      isDark ? 'text-neutral-100' : 'text-neutral-800',
                      task.completed ? 'line-through' : ''
                    ]">
                  {{ task.title }}
                </h4>
                
                <div class="flex items-center gap-2 mt-3" *ngIf="task.time">
                  <svg class="w-3.5 h-3.5" [ngClass]="isDark ? 'text-neutral-500' : 'text-neutral-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-[10px] font-bold uppercase tracking-widest" [ngClass]="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                    {{ task.time }}
                  </span>
                </div>
              </div>

            </div>
            
            <!-- Add Task Button for the day -->
            <button class="w-full py-3 mt-2 rounded-xl border border-dashed flex justify-center items-center gap-2 transition-colors text-xs font-bold uppercase tracking-widest"
                    [ngClass]="isDark ? 'border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800/30' : 'border-neutral-300 text-neutral-400 hover:text-neutral-600 hover:border-neutral-400 hover:bg-neutral-100/50'">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Añadir
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kanban-scroll::-webkit-scrollbar {
      height: 8px;
    }
    .kanban-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .kanban-scroll::-webkit-scrollbar-thumb {
      background-color: #333;
      border-radius: 20px;
    }
    .theme-light .kanban-scroll::-webkit-scrollbar-thumb {
      background-color: #ccc;
    }
  `]
})
export class DashItineraryComponent {
  @Input() theme: string = 'dark';
  
  get isDark(): boolean {
    return this.theme === 'dark';
  }

  weekPlan: DayPlan[] = [
    {
      day: 'Lunes',
      date: '29 Jun',
      tasks: [
        { id: 1, title: 'Despliegue de Landing Page "TechNova"', type: 'urgent', time: '09:00 AM' },
        { id: 2, title: 'Reunión de planificación', type: 'work', time: '11:30 AM' },
        { id: 3, title: 'Gym - Pecho y Tríceps', type: 'personal', time: '06:00 PM' }
      ]
    },
    {
      day: 'Martes',
      date: '30 Jun',
      tasks: [
        { id: 4, title: 'Desarrollo de empresa "Soluciones XYZ"', type: 'work', time: '08:30 AM' },
        { id: 5, title: 'Revisión de diseño UI/UX', type: 'work', time: '02:00 PM' },
        { id: 6, title: 'Lectura / Estudio Angular', type: 'personal', time: '08:00 PM' }
      ]
    },
    {
      day: 'Miércoles',
      date: '1 Jul',
      tasks: [
        { id: 7, title: 'Optimización de SEO del portafolio', type: 'work', time: '10:00 AM', completed: true },
        { id: 8, title: 'Gym - Espalda y Bíceps', type: 'personal', time: '06:00 PM' }
      ]
    },
    {
      day: 'Jueves',
      date: '2 Jul',
      tasks: [
        { id: 9, title: 'Llamada con cliente (Propuesta Comercial)', type: 'urgent', time: '09:30 AM' },
        { id: 10, title: 'Desarrollo de API Backend', type: 'work', time: '01:00 PM' },
        { id: 11, title: 'Compras de supermercado', type: 'personal' }
      ]
    },
    {
      day: 'Viernes',
      date: '3 Jul',
      tasks: [
        { id: 12, title: 'Testeo y Fixes de bugs', type: 'work', time: '09:00 AM' },
        { id: 13, title: 'Gym - Pierna', type: 'personal', time: '05:00 PM' },
        { id: 14, title: 'Cena con amigos', type: 'personal', time: '08:30 PM' }
      ]
    },
    {
      day: 'Sábado',
      date: '4 Jul',
      tasks: [
        { id: 15, title: 'Mantenimiento del servidor', type: 'work', time: '10:00 AM' },
        { id: 16, title: 'Descanso / Videojuegos', type: 'personal' }
      ]
    },
    {
      day: 'Domingo',
      date: '5 Jul',
      tasks: [
        { id: 17, title: 'Planificar la próxima semana', type: 'work', time: '07:00 PM' }
      ]
    }
  ];
}
