import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Client {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  tax_id?: string;
  address?: string;
  createdAt?: string; // Maps to created_at
  created_at?: string;
}

export interface Service {
  id?: string;
  name: string;
  description: string;
  price?: number; // Backend uses price, not unitPrice
  unitPrice?: number; // Keep for compatibility with old interface during refactor
  category?: 'desarrollo' | 'diseño' | 'marketing' | 'consultoria' | 'otro';
}

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  service_id?: string;
  serviceName?: string; // UI alias
  description: string;
  quantity: number;
  unit_price: number;
  unitPrice?: number; // UI alias
  total_price?: number;
  subtotal?: number; // UI alias
}

export interface Invoice {
  id?: string;
  client_id?: string;
  clientId?: string; // UI alias
  clientName?: string; // UI alias
  clientEmail?: string;
  clientCompany?: string;
  invoice_number?: string;
  issue_date?: string;
  issuedAt?: string; // UI alias
  due_date?: string;
  dueAt?: string; // UI alias
  paidAt?: string;
  status: 'DRAFT' | 'ENVIADA' | 'PAGADA' | 'VENCIDA' | 'ANULADA' | 'Borrador' | 'Enviada' | 'Pagada' | 'Vencida';
  subtotal: number;
  tax_amount?: number;
  taxRate?: number; // UI alias
  taxAmount?: number; // UI alias
  total_amount?: number;
  total?: number; // UI alias
  notes: string;
  items?: InvoiceItem[];
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/finance`;

  // ─── DASHBOARD ──────────────────────────────────────────────
  getDashboard(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.min_price) params = params.set('min_price', filters.min_price);
      if (filters.max_price) params = params.set('max_price', filters.max_price);
      if (filters.date_from) params = params.set('date_from', filters.date_from);
      if (filters.date_to) params = params.set('date_to', filters.date_to);
    }
    return this.http.get<any>(`${this.apiUrl}/dashboard`, { params });
  }

  // ─── CLIENTS ──────────────────────────────────────────────
  getClients(): Observable<{ ok: boolean, clients: Client[] }> {
    return this.http.get<any>(`${this.apiUrl}/clients`);
  }

  saveClient(client: Client): Observable<any> {
    if (client.id && !client.id.startsWith('c')) {
      // Is an existing ID from DB (usually a number or UUID). Wait, in local it was 'c123'. 
      // Actually DB IDs are numbers (SERIAL).
      return this.http.put<any>(`${this.apiUrl}/clients/${client.id}`, client);
    } else {
      // New client
      return this.http.post<any>(`${this.apiUrl}/clients`, client);
    }
  }

  deleteClient(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/clients/${id}`);
  }

  // ─── SERVICES ─────────────────────────────────────────────
  getServices(): Observable<{ ok: boolean, services: Service[] }> {
    return this.http.get<any>(`${this.apiUrl}/services`);
  }

  saveService(service: Service): Observable<any> {
    // Map unitPrice to price for backend
    if (service.unitPrice !== undefined) {
      service.price = service.unitPrice;
    }
    if (service.id && !String(service.id).startsWith('sv')) {
      return this.http.put<any>(`${this.apiUrl}/services/${service.id}`, service);
    } else {
      return this.http.post<any>(`${this.apiUrl}/services`, service);
    }
  }

  deleteService(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/services/${id}`);
  }

  // ─── INVOICES ─────────────────────────────────────────────
  getInvoices(): Observable<{ ok: boolean, invoices: Invoice[] }> {
    return this.http.get<any>(`${this.apiUrl}/invoices`);
  }

  getInvoiceDetails(id: string): Observable<{ ok: boolean, invoice: Invoice }> {
    return this.http.get<any>(`${this.apiUrl}/invoices/${id}`);
  }

  saveInvoice(invoice: Invoice): Observable<any> {
    // Prepare for backend
    const payload = {
      client_id: invoice.clientId,
      invoice_number: invoice.id || `PL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`, // temporary auto-gen for backend if new
      issue_date: invoice.issuedAt,
      due_date: invoice.dueAt,
      notes: invoice.notes,
      items: (invoice.items || []).map(i => ({
        service_id: i.serviceId || i.service_id,
        description: i.description || i.serviceName,
        quantity: i.quantity,
        unit_price: i.unitPrice || i.unit_price
      }))
    };
    
    // We only create invoices for now, or update status. 
    return this.http.post<any>(`${this.apiUrl}/invoices`, payload);
  }

  deleteInvoice(id: string): Observable<any> {
    // Not implemented in backend yet, but we'll mock it or throw error
    throw new Error('Not implemented in backend');
  }

  updateInvoiceStatus(id: string, status: string): Observable<any> {
    let backendStatus = status.toUpperCase();
    if (backendStatus === 'BORRADOR') backendStatus = 'DRAFT';
    return this.http.put<any>(`${this.apiUrl}/invoices/${id}/status`, { status: backendStatus });
  }

  // ─── HELPERS ──────────────────────────────────────────────
  formatCOP(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  }
}
