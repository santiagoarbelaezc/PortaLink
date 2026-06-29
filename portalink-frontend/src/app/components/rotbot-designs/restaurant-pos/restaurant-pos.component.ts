import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface OrderItem {
  product: Product;
  quantity: number;
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
    <div class="w-full h-full bg-[#f8f9fa] text-neutral-900 font-sans flex flex-col relative overflow-hidden" style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      
      <!-- ============================================== -->
      <!-- VISTA 0: LOGIN (PIN)                           -->
      <!-- ============================================== -->
      <div *ngIf="activeView === 'login'" class="absolute inset-0 z-50 bg-white flex flex-col animate-fade-in">
        
        <!-- Header Login -->
        <div class="flex-1 flex flex-col items-center justify-center p-8">
          <div class="w-16 h-16 bg-black rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-black/20 mb-6">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
          </div>
          <h2 class="text-2xl font-bold tracking-tight mb-1">Ingresa tu PIN</h2>
          <p class="text-xs text-neutral-500 font-medium">Sistema de Punto de Venta</p>
          
          <!-- PIN Dots -->
          <div class="flex gap-4 mt-8">
            <div class="w-4 h-4 rounded-full transition-colors duration-200" [ngClass]="pin.length > 0 ? 'bg-black' : 'bg-neutral-200'"></div>
            <div class="w-4 h-4 rounded-full transition-colors duration-200" [ngClass]="pin.length > 1 ? 'bg-black' : 'bg-neutral-200'"></div>
            <div class="w-4 h-4 rounded-full transition-colors duration-200" [ngClass]="pin.length > 2 ? 'bg-black' : 'bg-neutral-200'"></div>
            <div class="w-4 h-4 rounded-full transition-colors duration-200" [ngClass]="pin.length > 3 ? 'bg-black' : 'bg-neutral-200'"></div>
          </div>
        </div>

        <!-- Numpad -->
        <div class="bg-neutral-50/80 backdrop-blur-xl p-8 rounded-t-[3rem] border-t border-neutral-100 pb-16">
          <div class="grid grid-cols-3 gap-y-6 gap-x-4 max-w-[280px] mx-auto">
            <button *ngFor="let n of [1,2,3,4,5,6,7,8,9]" (click)="addPin(n.toString())" class="w-16 h-16 mx-auto rounded-full bg-white text-2xl font-medium shadow-sm border border-neutral-100 hover:bg-neutral-100 active:scale-90 transition-all flex items-center justify-center">
              {{n}}
            </button>
            <div class="w-16 h-16 mx-auto"></div>
            <button (click)="addPin('0')" class="w-16 h-16 mx-auto rounded-full bg-white text-2xl font-medium shadow-sm border border-neutral-100 hover:bg-neutral-100 active:scale-90 transition-all flex items-center justify-center">
              0
            </button>
            <button (click)="deletePin()" class="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-neutral-500 hover:text-black active:scale-90 transition-all">
              <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /></svg>
            </button>
          </div>
        </div>
      </div>


      <!-- ============================================== -->
      <!-- TOP APP BAR (Global si no es Login ni Order)   -->
      <!-- ============================================== -->
      <div *ngIf="activeView !== 'login' && activeView !== 'order'" class="h-20 pt-8 bg-white/80 backdrop-blur-md border-b border-neutral-200/50 flex items-center px-6 justify-between shrink-0 sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div>
          <h1 class="text-lg font-bold text-black tracking-tight">
            {{ activeView === 'home' ? 'Mesas Activas' : activeView === 'history' ? 'Historial de Ventas' : 'Mi Perfil' }}
          </h1>
          <p class="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-0.5">
            {{ activeView === 'home' ? tables.length + ' Mesas Totales' : activeView === 'history' ? closedTickets.length + ' Tickets Hoy' : 'Ajustes del Sistema' }}
          </p>
        </div>
        <div class="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shadow-inner border border-neutral-200 overflow-hidden">
          <img src="https://ui-avatars.com/api/?name=Cajero+1&background=000&color=fff" class="w-full h-full object-cover">
        </div>
      </div>

      <!-- ============================================== -->
      <!-- VISTA 1: HOME (MESAS)                          -->
      <!-- ============================================== -->
      <div *ngIf="activeView === 'home'" class="flex-1 overflow-y-auto p-5 pb-24 custom-scrollbar bg-[#f8f9fa] animate-fade-in">
        <div class="grid grid-cols-2 gap-4">
          <div *ngFor="let table of tables" 
               (click)="openTable(table)"
               class="bg-white rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white transition-all duration-300 active:scale-95 cursor-pointer flex flex-col relative overflow-hidden group hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
               [ngClass]="table.status === 'ocupada' ? 'ring-1 ring-black/5' : ''">
            
            <div class="flex justify-between items-start mb-6">
              <div class="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shadow-sm transition-colors duration-500"
                   [ngClass]="table.status === 'ocupada' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'">
                T{{ table.number }}
              </div>
              <span class="text-[8px] uppercase tracking-[0.2em] font-black px-2.5 py-1.5 rounded-full transition-colors duration-500"
                    [ngClass]="table.status === 'ocupada' ? 'bg-neutral-100 text-black' : 'bg-green-50 text-green-600'">
                {{ table.status }}
              </span>
            </div>
            
            <div class="mt-auto">
              <p class="text-[9px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Consumo</p>
              <p class="text-xl font-black tracking-tight" [ngClass]="table.status === 'ocupada' ? 'text-black' : 'text-neutral-300'">
                \${{ getTableTotal(table).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- VISTA 2: HISTORIAL                             -->
      <!-- ============================================== -->
      <div *ngIf="activeView === 'history'" class="flex-1 overflow-y-auto p-5 pb-24 custom-scrollbar bg-[#f8f9fa] animate-fade-in">
        <!-- Metric Card -->
        <div class="bg-black text-white rounded-[2rem] p-6 mb-6 shadow-2xl shadow-black/20 relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">Ingresos Hoy</p>
          <h2 class="text-4xl font-black tracking-tighter mb-4">\${{ getDailyTotal().toFixed(2) }}</h2>
          <div class="flex gap-4">
            <div class="bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
              <p class="text-[9px] uppercase tracking-wider text-neutral-400">Tickets</p>
              <p class="text-sm font-bold">{{ closedTickets.length }}</p>
            </div>
            <div class="bg-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
              <p class="text-[9px] uppercase tracking-wider text-neutral-400">Promedio</p>
              <p class="text-sm font-bold">\${{ getAverageTicket().toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <h3 class="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 ml-2">Últimos Tickets</h3>
        
        <div class="space-y-3">
          <div *ngIf="closedTickets.length === 0" class="text-center py-10 text-neutral-400 text-sm">
            No hay tickets cerrados aún.
          </div>
          <div *ngFor="let ticket of closedTickets" class="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-neutral-100">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center font-bold text-neutral-700 text-xs">
                T{{ ticket.tableNumber }}
              </div>
              <div>
                <p class="text-sm font-bold text-black">{{ ticket.id }}</p>
                <p class="text-[10px] text-neutral-500 font-medium mt-0.5">{{ ticket.time }} • {{ ticket.method }}</p>
              </div>
            </div>
            <p class="text-sm font-black text-black">\${{ ticket.total.toFixed(2) }}</p>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- VISTA 3: PERFIL / AJUSTES                      -->
      <!-- ============================================== -->
      <div *ngIf="activeView === 'profile'" class="flex-1 overflow-y-auto p-5 pb-24 custom-scrollbar bg-[#f8f9fa] animate-fade-in flex flex-col">
        <div class="flex flex-col items-center justify-center py-10">
          <div class="w-24 h-24 rounded-full bg-neutral-200 border-4 border-white shadow-xl overflow-hidden mb-4">
             <img src="https://ui-avatars.com/api/?name=Cajero+1&background=000&color=fff" class="w-full h-full object-cover">
          </div>
          <h2 class="text-xl font-bold text-black">Alejandro Ruiz</h2>
          <p class="text-xs text-neutral-500 font-medium mt-1">Cajero Senior • Turno Mañana</p>
        </div>

        <div class="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden mb-6">
          <div class="p-4 border-b border-neutral-100 flex items-center justify-between">
             <span class="text-sm font-bold text-neutral-800">Caja Asignada</span>
             <span class="text-xs font-medium text-neutral-500">Terminal 01</span>
          </div>
          <div class="p-4 border-b border-neutral-100 flex items-center justify-between">
             <span class="text-sm font-bold text-neutral-800">Sincronización Cloud</span>
             <div class="w-10 h-6 bg-green-500 rounded-full relative"><div class="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
          </div>
          <div class="p-4 flex items-center justify-between">
             <span class="text-sm font-bold text-neutral-800">Impresora Ticket</span>
             <span class="text-xs font-medium text-green-500 flex items-center gap-1"><div class="w-1.5 h-1.5 rounded-full bg-green-500"></div> Conectada</span>
          </div>
        </div>

        <button (click)="logout()" class="w-full py-4 mt-auto rounded-2xl bg-red-50 text-red-600 font-bold text-sm tracking-wide active:scale-95 transition-transform border border-red-100">
          CERRAR SESIÓN
        </button>
      </div>


      <!-- ============================================== -->
      <!-- VISTA 4: ORDER MENU (Específico de la mesa)    -->
      <!-- ============================================== -->
      <div *ngIf="activeView === 'order'" class="absolute inset-0 z-40 bg-white flex flex-col animate-slide-up">
        
        <!-- Header Order -->
        <div class="h-20 pt-8 bg-white border-b border-neutral-100 flex items-center px-4 justify-between shrink-0 shadow-sm">
          <div class="flex items-center gap-1">
            <button (click)="goBackToHome()" class="p-2 text-neutral-400 hover:text-black transition-colors">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 class="text-base font-bold text-black leading-tight">Mesa {{ activeTable?.number }}</h1>
              <p class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                {{ activeTable?.order?.length || 0 }} Items
              </p>
            </div>
          </div>
          
          <button (click)="showOptions = true" class="w-9 h-9 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-200 text-black hover:bg-neutral-100 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          </button>
        </div>

        <!-- Categories Scroll -->
        <div class="flex items-center gap-2 p-4 overflow-x-auto no-scrollbar border-b border-neutral-100 shrink-0 bg-white">
          <button *ngFor="let cat of categories" 
                  (click)="selectedCategory = cat"
                  class="px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 border"
                  [ngClass]="selectedCategory === cat ? 'bg-black border-black text-white shadow-lg shadow-black/20' : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'">
            {{ cat }}
          </button>
        </div>

        <!-- Product List -->
        <div class="flex-1 overflow-y-auto p-4 bg-[#f8f9fa] space-y-3 pb-40 custom-scrollbar">
          <div *ngFor="let product of filteredProducts()" 
               class="bg-white rounded-2xl p-3 shadow-sm border border-neutral-100/50 flex items-center gap-4 relative overflow-hidden group">
            
            <div class="w-16 h-16 rounded-xl bg-neutral-50 flex items-center justify-center text-3xl border border-neutral-100 shrink-0 shadow-inner group-hover:bg-neutral-100 transition-colors">
              {{ product.image }}
            </div>
            
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-sm text-black line-clamp-1">{{ product.name }}</h3>
              <p class="text-neutral-500 font-bold text-xs mt-1">\${{ product.price.toFixed(2) }}</p>
            </div>
            
            <div class="shrink-0 flex items-center">
              <button *ngIf="!getItemQuantity(product.id)" (click)="addToTableOrder(product)" class="w-9 h-9 rounded-full bg-black text-white hover:bg-neutral-800 flex items-center justify-center transition-transform active:scale-90 shadow-md">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
              </button>
              
              <div *ngIf="getItemQuantity(product.id) > 0" class="flex items-center bg-white rounded-full border border-neutral-200 overflow-hidden shadow-sm h-9">
                <button (click)="decreaseItemQuantity(product.id)" class="w-8 h-full flex items-center justify-center text-black active:bg-neutral-100"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" /></svg></button>
                <span class="text-xs font-bold w-6 text-center text-black">{{ getItemQuantity(product.id) }}</span>
                <button (click)="increaseItemQuantity(product.id)" class="w-8 h-full flex items-center justify-center text-black active:bg-neutral-100"><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Bottom Sticky -->
        <div class="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-neutral-200 shadow-[0_-15px_40px_rgba(0,0,0,0.05)] p-5 pt-4 rounded-t-3xl pb-8 z-20">
          <div class="flex justify-between items-end mb-4 px-2">
            <div>
              <p class="text-[9px] text-neutral-400 uppercase tracking-widest font-black mb-1">Total a Pagar</p>
              <h2 class="text-3xl font-black text-black tracking-tighter">\${{ getTableTotal(activeTable!).toFixed(2) }}</h2>
            </div>
            
            <button class="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center relative shadow-inner border border-neutral-200">
              <svg class="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span *ngIf="activeTable!.order.length > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-black rounded-full text-white text-[9px] font-bold flex items-center justify-center shadow-md">{{ activeTable!.order.length }}</span>
            </button>
          </div>
          
          <button (click)="openPaymentModal()" 
                  class="w-full py-4 rounded-2xl font-black text-sm tracking-[0.15em] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  [ngClass]="activeTable!.order.length > 0 ? 'bg-black text-white hover:bg-neutral-800 shadow-black/30' : 'bg-neutral-200 text-neutral-400 pointer-events-none'">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            PAGAR AHORA
          </button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- BOTTOM NAVIGATION BAR (Home, History, Profile) -->
      <!-- ============================================== -->
      <div *ngIf="activeView !== 'login' && activeView !== 'order'" class="absolute bottom-0 left-0 w-full h-[88px] bg-white border-t border-neutral-100 flex px-6 justify-around items-start pt-3 z-30 pb-6 rounded-b-[2.5rem]">
        
        <button (click)="activeView = 'home'" class="flex flex-col items-center gap-1.5 transition-colors" [ngClass]="activeView === 'home' ? 'text-black' : 'text-neutral-400 hover:text-neutral-600'">
          <svg class="w-6 h-6" [attr.fill]="activeView === 'home' ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          <span class="text-[9px] font-bold tracking-widest uppercase">Mesas</span>
        </button>

        <button (click)="activeView = 'history'" class="flex flex-col items-center gap-1.5 transition-colors" [ngClass]="activeView === 'history' ? 'text-black' : 'text-neutral-400 hover:text-neutral-600'">
          <svg class="w-6 h-6" [attr.fill]="activeView === 'history' ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <span class="text-[9px] font-bold tracking-widest uppercase">Cierre</span>
        </button>

        <button (click)="activeView = 'profile'" class="flex flex-col items-center gap-1.5 transition-colors" [ngClass]="activeView === 'profile' ? 'text-black' : 'text-neutral-400 hover:text-neutral-600'">
          <svg class="w-6 h-6" [attr.fill]="activeView === 'profile' ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span class="text-[9px] font-bold tracking-widest uppercase">Perfil</span>
        </button>

      </div>

      <!-- ============================================== -->
      <!-- PAYMENT MODAL (Bottom Sheet)                   -->
      <!-- ============================================== -->
      <div *ngIf="showPaymentModal" class="absolute inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" (click)="showPaymentModal = false"></div>
        <div class="relative bg-white rounded-t-[2.5rem] shadow-2xl p-6 pb-10 animate-slide-up flex flex-col gap-4">
          <div class="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-2"></div>
          
          <div class="text-center mb-4">
            <p class="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1">Monto a Cobrar</p>
            <h2 class="text-4xl font-black text-black">\${{ getTableTotal(activeTable!).toFixed(2) }}</h2>
          </div>

          <p class="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-1 px-2">Método de Pago</p>
          <div class="grid grid-cols-2 gap-3">
            <button (click)="processPayment('Efectivo')" class="p-6 rounded-3xl border-2 border-neutral-100 bg-white hover:border-black transition-colors flex flex-col items-center justify-center gap-3 active:scale-95 group">
              <div class="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <span class="font-bold text-sm text-black">Efectivo</span>
            </button>
            <button (click)="processPayment('Tarjeta')" class="p-6 rounded-3xl border-2 border-neutral-100 bg-white hover:border-black transition-colors flex flex-col items-center justify-center gap-3 active:scale-95 group">
              <div class="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <span class="font-bold text-sm text-black">Tarjeta</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- OPTIONS MODAL (Advanced Actions)               -->
      <!-- ============================================== -->
      <div *ngIf="showOptions" class="absolute inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" (click)="showOptions = false; actionMenu = 'main'"></div>
        
        <div class="relative bg-white rounded-t-[2.5rem] shadow-2xl p-6 pb-10 animate-slide-up flex flex-col gap-2">
          <div class="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-4"></div>
          
          <ng-container *ngIf="actionMenu === 'main'">
            <h3 class="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2 px-2">Acciones Rápidas</h3>
            
            <button (click)="imprimirCuenta()" class="w-full p-4 flex items-center gap-4 hover:bg-neutral-50 rounded-[1.5rem] transition-colors text-left border border-transparent hover:border-neutral-100 active:scale-[0.98]">
              <div class="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-black shrink-0 shadow-inner"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg></div>
              <div>
                <p class="text-sm font-black text-black">Imprimir Pre-Cuenta</p>
                <p class="text-[10px] font-bold text-neutral-500">Generar ticket físico</p>
              </div>
            </button>
            
            <button (click)="actionMenu = 'transfer'" class="w-full p-4 flex items-center gap-4 hover:bg-neutral-50 rounded-[1.5rem] transition-colors text-left border border-transparent hover:border-neutral-100 active:scale-[0.98]">
              <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 shadow-inner"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg></div>
              <div>
                <p class="text-sm font-black text-black">Mudar de Mesa</p>
                <p class="text-[10px] font-bold text-neutral-500">Transferir todo a libre</p>
              </div>
            </button>
            
            <button (click)="actionMenu = 'merge'" class="w-full p-4 flex items-center gap-4 hover:bg-neutral-50 rounded-[1.5rem] transition-colors text-left border border-transparent hover:border-neutral-100 active:scale-[0.98]">
              <div class="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 shadow-inner"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg></div>
              <div>
                <p class="text-sm font-black text-black">Unir Cuentas</p>
                <p class="text-[10px] font-bold text-neutral-500">Juntar dos mesas ocupadas</p>
              </div>
            </button>
          </ng-container>

          <ng-container *ngIf="actionMenu === 'transfer'">
            <div class="flex items-center mb-4">
              <button (click)="actionMenu = 'main'" class="p-1 -ml-1 text-neutral-400 hover:text-black"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button>
              <h3 class="text-xs font-black uppercase tracking-widest text-black ml-2">Selecciona mesa destino</h3>
            </div>
            <div class="grid grid-cols-4 gap-3">
              <button *ngFor="let t of getLibres()" (click)="transferirMesa(t)" class="p-4 rounded-2xl border-2 border-neutral-100 bg-white hover:border-black text-black font-black transition-colors active:scale-95">
                T{{ t.number }}
              </button>
              <div *ngIf="getLibres().length === 0" class="col-span-4 text-center text-xs text-neutral-400 py-4">No hay mesas libres.</div>
            </div>
          </ng-container>

          <ng-container *ngIf="actionMenu === 'merge'">
            <div class="flex items-center mb-4">
              <button (click)="actionMenu = 'main'" class="p-1 -ml-1 text-neutral-400 hover:text-black"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg></button>
              <h3 class="text-xs font-black uppercase tracking-widest text-black ml-2">Absorber de...</h3>
            </div>
            <div class="grid grid-cols-4 gap-3">
              <button *ngFor="let t of getOcupadas()" (click)="unirMesa(t)" class="p-3 rounded-2xl border-2 border-neutral-100 bg-white hover:border-black text-black transition-colors flex flex-col items-center active:scale-95">
                <span class="font-black text-base">T{{ t.number }}</span>
                <span class="text-[9px] font-bold text-neutral-500">\${{ getTableTotal(t).toFixed(0) }}</span>
              </button>
              <div *ngIf="getOcupadas().length === 0" class="col-span-4 text-center text-xs text-neutral-400 py-4">No hay más mesas ocupadas.</div>
            </div>
          </ng-container>
        </div>
      </div>

      <!-- TICKET PRINTING ANIMATION -->
      <div *ngIf="isPrinting" class="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div class="w-56 bg-white shadow-2xl relative flex flex-col animate-print-ticket overflow-hidden ticket-edges">
          <div class="h-2 w-full bg-[radial-gradient(circle,transparent_40%,white_40%)] bg-[length:8px_8px] -mt-1"></div>
          
          <div class="p-5 pt-8 pb-8 text-center border-b border-dashed border-neutral-300">
            <div class="w-10 h-10 rounded-full bg-black text-white mx-auto mb-3 flex items-center justify-center"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div>
            <h4 class="font-black text-sm text-black uppercase tracking-widest mb-1">RotBot Resto</h4>
            <p class="text-[9px] font-mono text-neutral-500 font-bold">MESA {{ activeTable?.number }} • PRE-CUENTA</p>
            <div class="mt-4 text-left border-t border-neutral-200 pt-3">
               <div *ngFor="let i of activeTable?.order" class="flex justify-between text-[10px] font-mono text-neutral-800 mb-1 font-medium">
                 <span class="truncate pr-2">{{ i.quantity }}x {{ i.product.name }}</span>
                 <span>\${{ (i.product.price * i.quantity).toFixed(2) }}</span>
               </div>
            </div>
            <div class="border-t border-black mt-3 pt-3 flex justify-between text-sm font-mono font-black text-black">
               <span>TOTAL</span>
               <span>\${{ getTableTotal(activeTable!).toFixed(2) }}</span>
            </div>
          </div>
          <div class="h-2 w-full bg-[radial-gradient(circle,white_40%,transparent_40%)] bg-[length:8px_8px] -mb-1 mt-auto"></div>
        </div>
      </div>
      
    </div>
  `,
  styles: [`
    .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    
    .animate-print-ticket {
      animation: printTicket 2.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes printTicket {
      0% { transform: translateY(50px) scale(0.9); opacity: 0; }
      15% { transform: translateY(0) scale(1); opacity: 1; }
      85% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-50px) scale(0.9); opacity: 0; }
    }

    .custom-scrollbar::-webkit-scrollbar { width: 0px; background: transparent; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `]
})
export class RestaurantPosComponent implements OnInit {
  activeView: 'login' | 'home' | 'order' | 'history' | 'profile' = 'login';
  
  // Login State
  pin: string = '';

  // App State
  showOptions = false;
  showPaymentModal = false;
  actionMenu: 'main' | 'transfer' | 'merge' = 'main';
  isPrinting = false;

  tables: Table[] = [
    { id: 1, number: 1, status: 'libre', order: [] },
    { id: 2, number: 2, status: 'ocupada', order: [
      { product: { id: 1, name: 'Burger Clásica', price: 8.50, category: 'Main', image: '🍔' }, quantity: 2 },
      { product: { id: 4, name: 'Refresco', price: 2.50, category: 'Drinks', image: '🥤' }, quantity: 2 }
    ]},
    { id: 3, number: 3, status: 'libre', order: [] },
    { id: 4, number: 4, status: 'libre', order: [] },
    { id: 5, number: 5, status: 'ocupada', order: [
      { product: { id: 9, name: 'Helado', price: 4.00, category: 'Dessert', image: '🍦' }, quantity: 1 }
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

  categories = ['Destacados', 'Bebidas', 'Entradas', 'Postres'];
  selectedCategory = 'Destacados';

  products: Product[] = [
    { id: 1, name: 'Angus Burger', price: 14.50, category: 'Destacados', image: '🍔' },
    { id: 2, name: 'Truffle Fries', price: 8.00, category: 'Entradas', image: '🍟' },
    { id: 3, name: 'Ribeye Steak', price: 32.50, category: 'Destacados', image: '🥩' },
    { id: 4, name: 'Agua San Pellegrino', price: 4.50, category: 'Bebidas', image: '🍾' },
    { id: 5, name: 'Craft IPA', price: 6.00, category: 'Bebidas', image: '🍺' },
    { id: 6, name: 'Vino Tinto Copa', price: 9.50, category: 'Bebidas', image: '🍷' },
    { id: 7, name: 'Burrata Trufada', price: 12.00, category: 'Entradas', image: '🧀' },
    { id: 8, name: 'Carpaccio', price: 15.00, category: 'Entradas', image: '🥩' },
    { id: 9, name: 'Cheesecake Miel', price: 7.50, category: 'Postres', image: '🍰' },
    { id: 10, name: 'Volcán Choco', price: 8.50, category: 'Postres', image: '🍫' }
  ];

  ngOnInit() {}

  // --- LOGIN ---
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
    if (this.pin.length > 0) {
      this.pin = this.pin.slice(0, -1);
    }
  }

  logout() {
    this.activeView = 'login';
    this.pin = '';
  }

  // --- NAVIGATION ---
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

  // --- ORDERS ---
  filteredProducts() {
    return this.products.filter(p => p.category === this.selectedCategory);
  }

  getItemQuantity(productId: number): number {
    if (!this.activeTable) return 0;
    const item = this.activeTable.order.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  }

  addToTableOrder(product: Product) {
    if (!this.activeTable) return;
    this.activeTable.status = 'ocupada';
    this.activeTable.order.push({ product, quantity: 1 });
  }

  increaseItemQuantity(productId: number) {
    if (!this.activeTable) return;
    const item = this.activeTable.order.find(i => i.product.id === productId);
    if (item) item.quantity++;
  }

  decreaseItemQuantity(productId: number) {
    if (!this.activeTable) return;
    const index = this.activeTable.order.findIndex(i => i.product.id === productId);
    if (index > -1) {
      if (this.activeTable.order[index].quantity > 1) {
        this.activeTable.order[index].quantity--;
      } else {
        this.activeTable.order.splice(index, 1);
        if (this.activeTable.order.length === 0) {
          this.activeTable.status = 'libre';
        }
      }
    }
  }

  getTableTotal(table: Table) {
    if(!table || !table.order) return 0;
    return table.order.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }

  // --- PAYMENTS & HISTORY ---
  openPaymentModal() {
    if (!this.activeTable || this.activeTable.order.length === 0) return;
    this.showPaymentModal = true;
  }

  processPayment(method: 'Efectivo' | 'Tarjeta') {
    if (!this.activeTable) return;
    
    // Create Ticket
    const total = this.getTableTotal(this.activeTable);
    const newTicket: ClosedTicket = {
      id: 'TKT-' + Math.floor(Math.random() * 9000 + 1000),
      tableNumber: this.activeTable.number,
      total,
      method,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.closedTickets.unshift(newTicket);

    // Close Table
    this.activeTable.order = [];
    this.activeTable.status = 'libre';
    this.showPaymentModal = false;
    
    // Optionally go to history or home
    this.goBackToHome();
  }

  getDailyTotal() {
    return this.closedTickets.reduce((acc, t) => acc + t.total, 0);
  }

  getAverageTicket() {
    if (this.closedTickets.length === 0) return 0;
    return this.getDailyTotal() / this.closedTickets.length;
  }

  // --- Advanced Functions ---
  getLibres() { return this.tables.filter(t => t.status === 'libre'); }
  getOcupadas() { return this.tables.filter(t => t.status === 'ocupada' && t.id !== this.activeTable?.id); }

  imprimirCuenta() {
    this.showOptions = false;
    this.isPrinting = true;
    setTimeout(() => { this.isPrinting = false; }, 2800);
  }

  transferirMesa(targetTable: Table) {
    if (!this.activeTable || this.activeTable.order.length === 0) return;
    targetTable.order = [...this.activeTable.order];
    targetTable.status = 'ocupada';
    this.activeTable.order = [];
    this.activeTable.status = 'libre';
    this.showOptions = false;
    this.openTable(targetTable);
  }

  unirMesa(targetTable: Table) {
    if (!this.activeTable) return;
    targetTable.order.forEach(itemToMerge => {
      const existingItem = this.activeTable!.order.find(i => i.product.id === itemToMerge.product.id);
      if (existingItem) {
        existingItem.quantity += itemToMerge.quantity;
      } else {
        this.activeTable!.order.push({...itemToMerge});
      }
    });
    targetTable.order = [];
    targetTable.status = 'libre';
    this.showOptions = false;
  }
}
