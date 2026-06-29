import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  modifier?: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
  status: 'pending' | 'sent';
}

interface Table {
  id: number;
  number: number;
  status: 'libre' | 'ocupada';
  order: OrderItem[];
}

interface ClosedTicket {
  id: string;
  tableNumber: number;
  total: number;
  method: 'Efectivo' | 'Tarjeta';
  time: string;
}

@Component({
  selector: 'app-restaurant-pos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full bg-[#f8f9fa] text-neutral-900 font-sans flex flex-col relative overflow-hidden" style="font-family: Roboto, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;">
      
      <!-- ============================================== -->
      <!-- VISTA 0: LOGIN (PIN)                           -->
      <!-- ============================================== -->
      <div *ngIf="activeView === 'login'" class="absolute inset-0 z-50 bg-[#f8f9fa] flex flex-col animate-fade-in">
        
        <!-- Header Login -->
        <div class="flex-1 flex flex-col items-center justify-center p-8">
          <div class="w-16 h-16 shrink-0 aspect-square bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-[0_10px_20px_rgba(0,0,0,0.05)] mb-6 border border-neutral-200">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
          </div>
          <h2 class="text-2xl font-bold tracking-tight mb-1 text-black">Código de Acceso</h2>
          <p class="text-xs text-neutral-500 font-medium">Terminal POS #04</p>
          
          <!-- PIN Dots -->
          <div class="flex gap-4 mt-8">
            <div class="w-3.5 h-3.5 shrink-0 aspect-square rounded-full transition-colors duration-200" [ngClass]="pin.length > 0 ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.2)]' : 'bg-neutral-200'"></div>
            <div class="w-3.5 h-3.5 shrink-0 aspect-square rounded-full transition-colors duration-200" [ngClass]="pin.length > 1 ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.2)]' : 'bg-neutral-200'"></div>
            <div class="w-3.5 h-3.5 shrink-0 aspect-square rounded-full transition-colors duration-200" [ngClass]="pin.length > 2 ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.2)]' : 'bg-neutral-200'"></div>
            <div class="w-3.5 h-3.5 shrink-0 aspect-square rounded-full transition-colors duration-200" [ngClass]="pin.length > 3 ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.2)]' : 'bg-neutral-200'"></div>
          </div>
        </div>

        <!-- Numpad -->
        <div class="bg-white p-8 rounded-t-3xl border-t border-neutral-200 pb-16 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
          <div class="grid grid-cols-3 gap-y-4 gap-x-4 max-w-[280px] mx-auto">
            <button *ngFor="let n of [1,2,3,4,5,6,7,8,9]" (click)="addPin(n.toString())" class="w-16 h-16 shrink-0 aspect-square mx-auto rounded-full bg-neutral-50 text-black text-2xl font-bold hover:bg-neutral-100 active:scale-95 transition-all flex items-center justify-center border border-neutral-200 shadow-sm">
              {{n}}
            </button>
            <div class="w-16 h-16 mx-auto"></div>
            <button (click)="addPin('0')" class="w-16 h-16 shrink-0 aspect-square mx-auto rounded-full bg-neutral-50 text-black text-2xl font-bold hover:bg-neutral-100 active:scale-95 transition-all flex items-center justify-center border border-neutral-200 shadow-sm">
              0
            </button>
            <button (click)="deletePin()" class="w-16 h-16 shrink-0 aspect-square mx-auto rounded-full flex items-center justify-center text-neutral-400 hover:text-black active:scale-95 transition-all bg-transparent">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>
            </button>
          </div>
        </div>
      </div>


      <!-- ============================================== -->
      <!-- TOP APP BAR (Global si no es Login ni Order)   -->
      <!-- ============================================== -->
      <div *ngIf="activeView !== 'login' && activeView !== 'order'" class="h-20 pt-8 bg-white/90 backdrop-blur-md border-b border-neutral-200 flex items-center px-6 justify-between shrink-0 sticky top-0 z-30 shadow-sm">
        <div>
          <h1 class="text-lg font-black text-black tracking-tight">
            {{ activeView === 'home' ? 'Salón Principal' : activeView === 'history' ? 'Cierre de Turno' : 'Ajustes' }}
          </h1>
          <p class="text-[11px] text-neutral-500 font-bold mt-0.5 uppercase tracking-wide">
            {{ activeView === 'home' ? tables.length + ' Mesas Activas' : activeView === 'history' ? closedTickets.length + ' Tickets Hoy' : 'Sistema POS v2.0' }}
          </p>
        </div>
        <div class="w-8 h-8 shrink-0 aspect-square rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200 shadow-sm">
          <img src="https://ui-avatars.com/api/?name=Admin&background=000&color=fff" class="w-full h-full object-cover">
        </div>
      </div>

      <!-- ============================================== -->
      <!-- VISTA 1: HOME (MESAS)                          -->
      <!-- ============================================== -->
      <div *ngIf="activeView === 'home'" class="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar bg-[#f8f9fa] animate-fade-in">
        <div class="grid grid-cols-2 gap-3">
          <div *ngFor="let table of tables" 
               (click)="openTable(table)"
               class="bg-white rounded-2xl p-4 shadow-sm transition-all duration-300 active:bg-neutral-50 cursor-pointer flex flex-col relative overflow-hidden group border border-neutral-100"
               [ngClass]="table.status === 'ocupada' ? 'ring-2 ring-black shadow-md scale-[1.02]' : ''">
            
            <div class="flex justify-between items-start mb-5">
              <div class="w-10 h-10 shrink-0 aspect-square rounded-full flex items-center justify-center text-sm font-black shadow-inner border border-neutral-100"
                   [ngClass]="table.status === 'ocupada' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'">
                T{{ table.number }}
              </div>
              <span class="text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded"
                    [ngClass]="table.status === 'ocupada' ? 'bg-black text-white' : 'bg-emerald-500/10 text-emerald-600'">
                {{ table.status }}
              </span>
            </div>
            
            <div class="mt-auto">
              <p class="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">Consumo</p>
              <p class="text-lg font-black" [ngClass]="table.status === 'ocupada' ? 'text-black' : 'text-neutral-300'">
                \${{ getTableTotal(table).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- VISTA 2: HISTORIAL                             -->
      <!-- ============================================== -->
      <div *ngIf="activeView === 'history'" class="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar bg-[#f8f9fa] animate-fade-in">
        
        <!-- Metric Card -->
        <div class="bg-black rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden text-white">
          <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <p class="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-1">Ventas Brutas</p>
          <h2 class="text-4xl font-black tracking-tight mb-5">\${{ getDailyTotal().toFixed(2) }}</h2>
          <div class="flex gap-3">
            <div class="bg-white/10 backdrop-blur px-3 py-2.5 rounded-xl flex-1 border border-white/5">
              <p class="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Tickets</p>
              <p class="text-base font-black text-white">{{ closedTickets.length }}</p>
            </div>
            <div class="bg-white/10 backdrop-blur px-3 py-2.5 rounded-xl flex-1 border border-white/5">
              <p class="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Promedio</p>
              <p class="text-base font-black text-white">\${{ getAverageTicket().toFixed(2) }}</p>
            </div>
          </div>
        </div>
        
        <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 px-1">Registros del Turno</h3>
        
        <div class="space-y-2">
          <div *ngIf="closedTickets.length === 0" class="text-center py-10 text-neutral-400 text-sm font-medium">
            Sin operaciones hoy.
          </div>
          <div *ngFor="let ticket of closedTickets" class="bg-white p-3.5 rounded-2xl flex items-center justify-between border border-neutral-100 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 shrink-0 aspect-square rounded-xl bg-neutral-100 flex items-center justify-center font-black text-black text-xs border border-neutral-200">
                T{{ ticket.tableNumber }}
              </div>
              <div>
                <p class="text-sm font-bold text-black">{{ ticket.id }}</p>
                <p class="text-[10px] text-neutral-500 font-medium">{{ ticket.time }} • {{ ticket.method }}</p>
              </div>
            </div>
            <p class="text-sm font-black text-black">\${{ ticket.total.toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- VISTA 3: PERFIL / AJUSTES                      -->
      <!-- ============================================== -->
      <div *ngIf="activeView === 'profile'" class="flex-1 overflow-y-auto p-4 pb-24 custom-scrollbar bg-[#f8f9fa] animate-fade-in flex flex-col">
        <div class="flex flex-col items-center justify-center py-8">
          <div class="w-24 h-24 shrink-0 aspect-square rounded-full bg-white shadow-lg overflow-hidden mb-4 border-4 border-white">
             <img src="https://ui-avatars.com/api/?name=Admin&background=000&color=fff" class="w-full h-full object-cover">
          </div>
          <h2 class="text-xl font-black text-black">Administrador</h2>
          <p class="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">Terminal • ID 8904</p>
        </div>

        <div class="bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-6 shadow-sm">
          <div class="p-4 border-b border-neutral-100 flex items-center justify-between active:bg-neutral-50 transition-colors cursor-pointer">
             <span class="text-sm font-bold text-neutral-700">Sincronización de Menú</span>
             <span class="text-xs font-medium text-neutral-400">Hace 5 min</span>
          </div>
          <div class="p-4 border-b border-neutral-100 flex items-center justify-between active:bg-neutral-50 transition-colors cursor-pointer">
             <span class="text-sm font-bold text-neutral-700">Hardware de Impresión</span>
             <span class="text-xs font-bold text-emerald-600 flex items-center gap-1.5"><div class="w-2 h-2 rounded-full bg-emerald-500"></div> EPSON-TM20</span>
          </div>
          <div class="p-4 flex items-center justify-between active:bg-neutral-50 transition-colors cursor-pointer">
             <span class="text-sm font-bold text-neutral-700">Modo de Interfaz</span>
             <span class="text-xs font-medium text-neutral-400">Claro (Premium)</span>
          </div>
        </div>

        <button (click)="logout()" class="w-full py-4 mt-auto rounded-2xl bg-red-50 text-red-600 font-black text-sm hover:bg-red-100 active:scale-95 transition-all border border-red-100">
          CERRAR TURNO (LOG OUT)
        </button>
      </div>


      <!-- ============================================== -->
      <!-- VISTA 4: ORDER MENU (Específico de la mesa)    -->
      <!-- ============================================== -->
      <div *ngIf="activeView === 'order'" class="absolute inset-0 z-40 bg-[#f8f9fa] flex flex-col animate-slide-up">
        
        <!-- Header Order -->
        <div class="h-20 pt-8 bg-white border-b border-neutral-200 flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
          <div class="flex items-center gap-2">
            <button (click)="goBackToHome()" class="p-2 -ml-2 text-black hover:opacity-70 transition-opacity rounded-full active:bg-neutral-100">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 class="text-base font-black text-black leading-tight">Mesa {{ activeTable?.number }}</h1>
              <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                Ticket #{{ activeTable?.number }}099
              </p>
            </div>
          </div>
          
          <button (click)="showOptions = true" class="w-10 h-10 shrink-0 aspect-square rounded-full bg-neutral-100 flex items-center justify-center text-black hover:bg-neutral-200 active:scale-95 transition-all border border-neutral-200">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>

        <!-- Order List (Ticket View) -->
        <div class="bg-white border-b border-neutral-200 max-h-[35%] overflow-y-auto custom-scrollbar flex-shrink-0 shadow-inner">
           <div *ngIf="activeTable?.order?.length === 0" class="p-8 text-center text-xs text-neutral-400 font-bold uppercase tracking-widest">
             El ticket está vacío
           </div>
           <div *ngFor="let item of activeTable?.order" class="flex justify-between items-start p-3.5 border-b border-neutral-100">
             <div class="flex gap-3">
               <span class="w-5 text-sm font-black text-black">{{ item.quantity }}</span>
               <div class="flex flex-col">
                 <span class="text-[13px] font-bold text-neutral-800" [ngClass]="item.status === 'sent' ? 'opacity-50' : ''">{{ item.product.name }}</span>
                 <span *ngIf="item.product.modifier" class="text-[10px] text-neutral-500 font-medium italic">{{ item.product.modifier }}</span>
                 <span *ngIf="item.status === 'sent'" class="text-[9px] text-black uppercase mt-0.5 font-black tracking-widest">En Cocina</span>
               </div>
             </div>
             <div class="text-[13px] font-black text-neutral-900">\${{ (item.product.price * item.quantity).toFixed(2) }}</div>
           </div>
        </div>

        <!-- Categories Nav -->
        <div class="flex items-center gap-2 p-3 overflow-x-auto no-scrollbar border-b border-neutral-200 shrink-0 bg-white">
          <button *ngFor="let cat of categories" 
                  (click)="selectedCategory = cat"
                  class="px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all border"
                  [ngClass]="selectedCategory === cat ? 'bg-black text-white border-black shadow-md' : 'bg-white text-neutral-500 border-neutral-200 hover:text-black'">
            {{ cat }}
          </button>
        </div>

        <!-- Product Grid -->
        <div class="flex-1 overflow-y-auto p-3 bg-[#f8f9fa] pb-28 custom-scrollbar">
          <div class="grid grid-cols-2 gap-3">
            <div *ngFor="let product of filteredProducts()" 
                 (click)="addToTableOrder(product)"
                 class="bg-white rounded-2xl p-3 shadow-sm border border-neutral-200 active:bg-neutral-50 active:scale-[0.98] transition-all cursor-pointer flex flex-col h-[105px]">
              
              <div class="flex justify-between items-start mb-2">
                <span class="text-2xl">{{ product.image }}</span>
                <span class="text-[11px] font-black text-black bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">\${{ product.price.toFixed(2) }}</span>
              </div>
              
              <h3 class="font-bold text-[11px] text-neutral-800 line-clamp-2 mt-auto leading-snug uppercase">{{ product.name }}</h3>
            </div>
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <div class="absolute bottom-0 left-0 w-full bg-white border-t border-neutral-200 p-4 pb-6 z-20 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)] gap-4">
          <div class="flex flex-col flex-1 pl-2">
            <span class="text-[9px] text-neutral-400 uppercase font-black tracking-widest">Total Ticket</span>
            <span class="text-2xl font-black text-black">\${{ getTableTotal(activeTable!).toFixed(2) }}</span>
          </div>
          
          <!-- Botón Condicional -->
          <button *ngIf="hasPendingItems()" (click)="enviarACocina()" 
                  class="px-6 py-3.5 rounded-2xl bg-black text-white font-black text-[11px] uppercase tracking-wider hover:bg-neutral-800 active:scale-95 transition-all shadow-lg shadow-black/20 flex-shrink-0">
            MANDAR A COCINA
          </button>

          <button *ngIf="!hasPendingItems() && activeTable!.order.length > 0" (click)="openPaymentModal()" 
                  class="px-6 py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-[11px] uppercase tracking-wider hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/30 flex-shrink-0">
            PAGAR ORDEN
          </button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- BOTTOM NAVIGATION BAR (Global)                 -->
      <!-- ============================================== -->
      <div *ngIf="activeView !== 'login' && activeView !== 'order'" class="absolute bottom-0 left-0 w-full h-[72px] bg-white border-t border-neutral-200 flex px-2 justify-around items-center pb-4 pt-1 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
        
        <button (click)="activeView = 'home'" class="flex-1 flex flex-col items-center gap-1 transition-colors" [ngClass]="activeView === 'home' ? 'text-black' : 'text-neutral-400 hover:text-black'">
          <div class="w-12 h-7 rounded-full flex items-center justify-center transition-colors" [ngClass]="activeView === 'home' ? 'bg-neutral-100' : 'bg-transparent'">
            <svg class="w-5 h-5" [attr.fill]="activeView === 'home' ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest mt-0.5">Piso</span>
        </button>

        <button (click)="activeView = 'history'" class="flex-1 flex flex-col items-center gap-1 transition-colors" [ngClass]="activeView === 'history' ? 'text-black' : 'text-neutral-400 hover:text-black'">
          <div class="w-12 h-7 rounded-full flex items-center justify-center transition-colors" [ngClass]="activeView === 'history' ? 'bg-neutral-100' : 'bg-transparent'">
            <svg class="w-5 h-5" [attr.fill]="activeView === 'history' ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest mt-0.5">Cierre</span>
        </button>

        <button (click)="activeView = 'profile'" class="flex-1 flex flex-col items-center gap-1 transition-colors" [ngClass]="activeView === 'profile' ? 'text-black' : 'text-neutral-400 hover:text-black'">
          <div class="w-12 h-7 rounded-full flex items-center justify-center transition-colors" [ngClass]="activeView === 'profile' ? 'bg-neutral-100' : 'bg-transparent'">
            <svg class="w-5 h-5" [attr.fill]="activeView === 'profile' ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest mt-0.5">Sistema</span>
        </button>

      </div>

      <!-- ============================================== -->
      <!-- PAYMENT MODAL (Bottom Sheet)                   -->
      <!-- ============================================== -->
      <div *ngIf="showPaymentModal" class="absolute inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" (click)="showPaymentModal = false"></div>
        <div class="relative bg-white rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.2)] p-5 pb-8 animate-slide-up border-t border-neutral-100 flex flex-col gap-5">
          <div class="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto"></div>
          
          <div class="text-center">
            <p class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Monto Total</p>
            <h2 class="text-5xl font-black text-black tracking-tighter">\${{ getTableTotal(activeTable!).toFixed(2) }}</h2>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-4">
            <button (click)="processPayment('Efectivo')" class="p-6 rounded-2xl bg-white border-2 border-neutral-100 hover:border-black transition-colors flex flex-col items-center justify-center gap-4 active:scale-95 group shadow-sm">
              <div class="w-14 h-14 shrink-0 aspect-square rounded-full bg-neutral-100 text-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <span class="font-black text-[11px] uppercase tracking-wider text-black">Efectivo</span>
            </button>
            <button (click)="processPayment('Tarjeta')" class="p-6 rounded-2xl bg-white border-2 border-neutral-100 hover:border-black transition-colors flex flex-col items-center justify-center gap-4 active:scale-95 group shadow-sm">
              <div class="w-14 h-14 shrink-0 aspect-square rounded-full bg-neutral-100 text-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <span class="font-black text-[11px] uppercase tracking-wider text-black">Tarjeta</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- OPTIONS MODAL (Advanced Actions)               -->
      <!-- ============================================== -->
      <div *ngIf="showOptions" class="absolute inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" (click)="showOptions = false; actionMenu = 'main'"></div>
        
        <div class="relative bg-white rounded-t-3xl shadow-[0_-20px_40px_rgba(0,0,0,0.2)] p-5 pb-8 animate-slide-up border-t border-neutral-100 flex flex-col gap-2">
          <div class="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-4"></div>
          
          <ng-container *ngIf="actionMenu === 'main'">
            <h3 class="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 px-2">Acciones de Mesa</h3>
            
            <button (click)="actionMenu = 'transfer'" class="w-full p-4 flex items-center gap-4 hover:bg-neutral-50 rounded-2xl transition-colors text-left active:scale-[0.98] border border-transparent hover:border-neutral-100">
              <div class="w-12 h-12 shrink-0 aspect-square rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg></div>
              <div>
                <p class="text-sm font-black text-black">Transferir Mesa</p>
                <p class="text-[10px] text-neutral-500 font-medium">Mudar comensales a otra zona</p>
              </div>
            </button>
            
            <button (click)="actionMenu = 'split'" class="w-full p-4 flex items-center gap-4 hover:bg-neutral-50 rounded-2xl transition-colors text-left active:scale-[0.98] border border-transparent hover:border-neutral-100">
              <div class="w-12 h-12 shrink-0 aspect-square rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"></path></svg></div>
              <div>
                <p class="text-sm font-black text-black">Dividir Cuenta</p>
                <p class="text-[10px] text-neutral-500 font-medium">Separar items en múltiples tickets</p>
              </div>
            </button>
          </ng-container>

          <ng-container *ngIf="actionMenu === 'transfer'">
            <div class="flex items-center mb-4">
              <button (click)="actionMenu = 'main'" class="p-2 -ml-2 text-black hover:bg-neutral-100 rounded-full"><svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button>
              <h3 class="text-sm font-black text-black ml-1">Seleccionar mesa libre</h3>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button *ngFor="let t of getLibres()" (click)="transferirMesa(t)" class="h-12 rounded-xl bg-white hover:bg-black hover:text-white text-black font-black transition-colors active:scale-95 border-2 border-neutral-200">
                T{{ t.number }}
              </button>
              <div *ngIf="getLibres().length === 0" class="col-span-4 text-center text-xs text-neutral-500 py-4 font-bold">No hay mesas libres.</div>
            </div>
          </ng-container>

          <ng-container *ngIf="actionMenu === 'split'">
             <div class="flex items-center mb-4">
               <button (click)="actionMenu = 'main'" class="p-2 -ml-2 text-black hover:bg-neutral-100 rounded-full"><svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button>
               <h3 class="text-sm font-black text-black ml-1">Dividir Cuenta</h3>
             </div>
             <div class="py-8 text-center">
               <div class="w-16 h-16 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-4"><svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
               <p class="text-sm font-black text-black">Función bloqueada por el administrador.</p>
               <p class="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mt-2">Requiere PIN gerencial.</p>
             </div>
          </ng-container>
        </div>
      </div>
      
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    
    .custom-scrollbar::-webkit-scrollbar { width: 0px; background: transparent; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `]
})
export class RestaurantPosComponent implements OnInit {
  activeView: 'login' | 'home' | 'order' | 'history' | 'profile' = 'login';
  
  pin: string = '';
  showOptions = false;
  showPaymentModal = false;
  actionMenu: 'main' | 'transfer' | 'split' = 'main';

  tables: Table[] = [
    { id: 1, number: 1, status: 'libre', order: [] },
    { id: 2, number: 2, status: 'ocupada', order: [
      { product: { id: 1, name: 'Angus Burger', price: 14.50, category: 'Comida', image: '🍔', modifier: 'Término Medio' }, quantity: 1, status: 'sent' },
      { product: { id: 4, name: 'Craft IPA', price: 6.00, category: 'Bebidas', image: '🍺' }, quantity: 2, status: 'sent' }
    ]},
    { id: 3, number: 3, status: 'libre', order: [] },
    { id: 4, number: 4, status: 'libre', order: [] },
    { id: 5, number: 5, status: 'ocupada', order: [
      { product: { id: 9, name: 'Ribeye Steak', price: 32.50, category: 'Comida', image: '🥩', modifier: 'Bien cocido' }, quantity: 1, status: 'pending' }
    ]},
    { id: 6, number: 6, status: 'libre', order: [] },
    { id: 7, number: 7, status: 'libre', order: [] },
    { id: 8, number: 8, status: 'libre', order: [] }
  ];

  closedTickets: ClosedTicket[] = [
    { id: 'TKT-0012', tableNumber: 4, total: 34.50, method: 'Tarjeta', time: '14:20' },
    { id: 'TKT-0011', tableNumber: 1, total: 18.00, method: 'Efectivo', time: '13:45' }
  ];

  activeTable: Table | null = null;
  categories = ['Comida', 'Bebidas', 'Entradas', 'Postres'];
  selectedCategory = 'Comida';

  products: Product[] = [
    { id: 1, name: 'Angus Burger', price: 14.50, category: 'Comida', image: '🍔' },
    { id: 2, name: 'Ribeye Steak', price: 32.50, category: 'Comida', image: '🥩' },
    { id: 3, name: 'Salmón Grill', price: 24.00, category: 'Comida', image: '🐟' },
    { id: 4, name: 'Craft IPA', price: 6.00, category: 'Bebidas', image: '🍺' },
    { id: 5, name: 'Agua Mineral', price: 3.50, category: 'Bebidas', image: '🧊' },
    { id: 6, name: 'Vino Tinto', price: 9.50, category: 'Bebidas', image: '🍷' },
    { id: 7, name: 'Burrata Trufada', price: 12.00, category: 'Entradas', image: '🧀' },
    { id: 8, name: 'Carpaccio', price: 15.00, category: 'Entradas', image: '🥩' },
    { id: 9, name: 'Cheesecake Miel', price: 7.50, category: 'Postres', image: '🍰' },
    { id: 10, name: 'Volcán Choco', price: 8.50, category: 'Postres', image: '🍫' }
  ];

  ngOnInit() {}

  addPin(digit: string) {
    if (this.pin.length < 4) {
      this.pin += digit;
      if (this.pin.length === 4) {
        setTimeout(() => {
          this.activeView = 'home';
          this.pin = '';
        }, 300);
      }
    }
  }

  deletePin() {
    if (this.pin.length > 0) this.pin = this.pin.slice(0, -1);
  }

  logout() {
    this.activeView = 'login';
    this.pin = '';
  }

  openTable(table: Table) {
    this.activeTable = table;
    this.activeView = 'order';
    this.showOptions = false;
    this.showPaymentModal = false;
    this.actionMenu = 'main';
  }

  goBackToHome() {
    this.activeView = 'home';
    this.activeTable = null;
    this.showOptions = false;
    this.showPaymentModal = false;
  }

  filteredProducts() {
    return this.products.filter(p => p.category === this.selectedCategory);
  }

  addToTableOrder(product: Product) {
    if (!this.activeTable) return;
    this.activeTable.status = 'ocupada';
    
    let modifier = undefined;
    if (product.category === 'Comida') {
       const mods = ['Normal', 'Término Medio', 'Sin Cebolla', 'Extra Salsa'];
       modifier = mods[Math.floor(Math.random() * mods.length)];
       if(modifier === 'Normal') modifier = undefined;
    }

    const existing = this.activeTable.order.find(i => i.product.id === product.id && i.status === 'pending' && i.product.modifier === modifier);
    
    if(existing) {
      existing.quantity++;
    } else {
      this.activeTable.order.unshift({ 
        product: { ...product, modifier }, 
        quantity: 1, 
        status: 'pending' 
      });
    }
  }

  getTableTotal(table: Table) {
    if(!table || !table.order) return 0;
    return table.order.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }

  hasPendingItems(): boolean {
    if(!this.activeTable) return false;
    return this.activeTable.order.some(i => i.status === 'pending');
  }

  enviarACocina() {
    if(!this.activeTable) return;
    this.activeTable.order.forEach(item => {
      if(item.status === 'pending') item.status = 'sent';
    });
  }

  openPaymentModal() {
    if (!this.activeTable || this.activeTable.order.length === 0) return;
    this.showPaymentModal = true;
  }

  processPayment(method: 'Efectivo' | 'Tarjeta') {
    if (!this.activeTable) return;
    const total = this.getTableTotal(this.activeTable);
    const newTicket: ClosedTicket = {
      id: 'TKT-' + Math.floor(Math.random() * 9000 + 1000),
      tableNumber: this.activeTable.number,
      total,
      method,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.closedTickets.unshift(newTicket);
    this.activeTable.order = [];
    this.activeTable.status = 'libre';
    this.showPaymentModal = false;
    this.goBackToHome();
  }

  getDailyTotal() { return this.closedTickets.reduce((acc, t) => acc + t.total, 0); }
  getAverageTicket() { return this.closedTickets.length === 0 ? 0 : this.getDailyTotal() / this.closedTickets.length; }

  getLibres() { return this.tables.filter(t => t.status === 'libre'); }

  transferirMesa(targetTable: Table) {
    if (!this.activeTable || this.activeTable.order.length === 0) return;
    targetTable.order = [...this.activeTable.order];
    targetTable.status = 'ocupada';
    this.activeTable.order = [];
    this.activeTable.status = 'libre';
    this.showOptions = false;
    this.openTable(targetTable);
  }
}
