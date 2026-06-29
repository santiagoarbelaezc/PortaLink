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

@Component({
  selector: 'app-restaurant-pos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full w-full bg-[#0a0a0a] flex flex-col font-sans text-white border-l border-[var(--card-border)] shadow-2xl relative overflow-hidden animate-fade-in" style="font-family: 'Inter', sans-serif;">
      
      <!-- Ambient Glow -->
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,rgba(0,180,216,0.08)_0%,transparent_70%)] pointer-events-none"></div>

      <!-- Header -->
      <div class="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-black/40 backdrop-blur-md relative z-10">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00b4d8] to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,180,216,0.3)]">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold tracking-wide uppercase text-white">Rotbot POS</h2>
            <p class="text-[10px] text-[#00b4d8] font-medium tracking-widest uppercase">Sistema de Restaurante</p>
          </div>
        </div>
        <div class="flex gap-4">
          <div class="text-right">
            <p class="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">Caja Activa</p>
            <p class="text-sm font-semibold">Terminal #01</p>
          </div>
        </div>
      </div>

      <!-- Main Content Split -->
      <div class="flex-1 flex overflow-hidden relative z-10">
        
        <!-- Left Side: Menu -->
        <div class="flex-1 flex flex-col bg-[#050505]">
          <!-- Categories -->
          <div class="flex items-center gap-2 p-6 overflow-x-auto no-scrollbar border-b border-white/5">
            <button *ngFor="let cat of categories" 
                    (click)="selectedCategory = cat"
                    class="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 border"
                    [ngClass]="selectedCategory === cat ? 'bg-[#00b4d8]/10 border-[#00b4d8] text-[#00b4d8] shadow-[0_0_10px_rgba(0,180,216,0.2)]' : 'bg-transparent border-white/10 text-neutral-400 hover:text-white hover:border-white/30'">
              {{ cat }}
            </button>
          </div>

          <!-- Products Grid -->
          <div class="flex-1 overflow-y-auto p-6 grid grid-cols-2 xl:grid-cols-3 gap-5 custom-scrollbar">
            <div *ngFor="let product of filteredProducts()" 
                 (click)="addToOrder(product)"
                 class="group relative bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 cursor-pointer hover:border-[#00b4d8]/50 hover:bg-[#141414] transition-all duration-300 overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
              
              <div class="h-28 rounded-xl bg-black/50 mb-4 flex items-center justify-center overflow-hidden border border-white/5 relative">
                <!-- Placeholder Image (Emoji for fast loading) -->
                <span class="text-5xl group-hover:scale-110 transition-transform duration-500">{{ product.image }}</span>
              </div>
              
              <div class="relative z-20">
                <h3 class="font-bold text-sm text-neutral-100 mb-1 line-clamp-1">{{ product.name }}</h3>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-[#00b4d8] font-bold text-base">\${{ product.price.toFixed(2) }}</span>
                  <div class="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#00b4d8] group-hover:text-black transition-colors">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Order Summary -->
        <div class="w-80 xl:w-96 flex flex-col bg-[#0a0a0a] border-l border-white/5 shadow-[-10px_0_20px_rgba(0,0,0,0.5)]">
          <div class="p-6 border-b border-white/5">
            <h3 class="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <svg class="w-4 h-4 text-[#00b4d8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              Orden Actual
            </h3>
          </div>

          <!-- Order Items -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div *ngIf="order.length === 0" class="h-full flex flex-col items-center justify-center text-center opacity-40">
              <svg class="w-12 h-12 mb-3 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <p class="text-xs uppercase tracking-widest font-bold">Orden Vacía</p>
              <p class="text-[10px] mt-1">Añade productos del menú</p>
            </div>

            <div *ngFor="let item of order; let i = index" class="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/10 transition-colors animate-fade-in group">
              <div class="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                {{ item.product.image }}
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-xs font-bold truncate text-neutral-200">{{ item.product.name }}</h4>
                <p class="text-[11px] text-[#00b4d8] font-bold mt-0.5">\${{ (item.product.price * item.quantity).toFixed(2) }}</p>
              </div>
              <div class="flex flex-col items-center gap-1 bg-[#141414] rounded-lg border border-white/5 p-1">
                <button (click)="increaseQuantity(i)" class="w-6 h-5 flex items-center justify-center text-neutral-400 hover:text-white bg-white/5 rounded"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg></button>
                <span class="text-xs font-bold w-6 text-center">{{ item.quantity }}</span>
                <button (click)="decreaseQuantity(i)" class="w-6 h-5 flex items-center justify-center text-neutral-400 hover:text-white bg-white/5 rounded"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"></path></svg></button>
              </div>
            </div>
          </div>

          <!-- Totals & Pay -->
          <div class="p-6 bg-black/60 border-t border-white/10 backdrop-blur-xl">
            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-xs font-medium text-neutral-400 uppercase tracking-wider">
                <span>Subtotal</span>
                <span>\${{ getSubtotal().toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-xs font-medium text-neutral-400 uppercase tracking-wider">
                <span>Impuestos (8%)</span>
                <span>\${{ getTax().toFixed(2) }}</span>
              </div>
              <div class="h-px w-full bg-white/10 my-1"></div>
              <div class="flex justify-between text-lg font-black text-white">
                <span>TOTAL</span>
                <span class="text-[#00b4d8]">\${{ getTotal().toFixed(2) }}</span>
              </div>
            </div>

            <button class="w-full py-4 rounded-xl bg-gradient-to-r from-[#00b4d8] to-blue-600 hover:opacity-90 transition-opacity text-white text-xs font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(0,180,216,0.4)] flex items-center justify-center gap-2 group cursor-pointer" [disabled]="order.length === 0" [class.opacity-50]="order.length === 0">
              <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              Cobrar Orden
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `]
})
export class RestaurantPosComponent implements OnInit {
  categories = ['Hamburguesas', 'Bebidas', 'Acompañantes', 'Postres'];
  selectedCategory = 'Hamburguesas';

  products: Product[] = [
    { id: 1, name: 'RotBurger Clásica', price: 8.50, category: 'Hamburguesas', image: '🍔' },
    { id: 2, name: 'Doble IA Burger', price: 12.00, category: 'Hamburguesas', image: '🍔' },
    { id: 3, name: 'Cyber Bacon', price: 10.50, category: 'Hamburguesas', image: '🥓' },
    { id: 4, name: 'Refresco Cola', price: 2.50, category: 'Bebidas', image: '🥤' },
    { id: 5, name: 'Jugo Natural', price: 3.00, category: 'Bebidas', image: '🧃' },
    { id: 6, name: 'Cerveza Artesanal', price: 5.00, category: 'Bebidas', image: '🍺' },
    { id: 7, name: 'Papas Fritas', price: 3.50, category: 'Acompañantes', image: '🍟' },
    { id: 8, name: 'Aros de Cebolla', price: 4.50, category: 'Acompañantes', image: '🧅' },
    { id: 9, name: 'Helado Vainilla', price: 4.00, category: 'Postres', image: '🍦' },
    { id: 10, name: 'Brownie Especial', price: 5.50, category: 'Postres', image: '🍫' }
  ];

  order: OrderItem[] = [];

  ngOnInit() {}

  filteredProducts() {
    return this.products.filter(p => p.category === this.selectedCategory);
  }

  addToOrder(product: Product) {
    const existing = this.order.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.order.unshift({ product, quantity: 1 });
    }
  }

  increaseQuantity(index: number) {
    this.order[index].quantity++;
  }

  decreaseQuantity(index: number) {
    if (this.order[index].quantity > 1) {
      this.order[index].quantity--;
    } else {
      this.order.splice(index, 1);
    }
  }

  getSubtotal() {
    return this.order.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }

  getTax() {
    return this.getSubtotal() * 0.08;
  }

  getTotal() {
    return this.getSubtotal() + this.getTax();
  }
}
