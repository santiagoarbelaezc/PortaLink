import { Injectable } from '@angular/core';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  category: 'desarrollo' | 'diseño' | 'marketing' | 'consultoria' | 'otro';
}

export interface InvoiceItem {
  serviceId: string;
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'Borrador' | 'Enviada' | 'Pagada' | 'Vencida';
  notes: string;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
}

const DEFAULT_SERVICES: Service[] = [
  { id: 's1', name: 'Landing Page / Sitio Web Básico', description: 'Sitio web de una página optimizado para conversión, diseño personalizado y responsive.', unitPrice: 800000, category: 'desarrollo' },
  { id: 's2', name: 'Sitio Web Corporativo', description: 'Sitio web multipágina con secciones completas, optimización SEO y panel de administración básico.', unitPrice: 2500000, category: 'desarrollo' },
  { id: 's3', name: 'Aplicación Web (WebApp)', description: 'Desarrollo de aplicación web con funcionalidades avanzadas, autenticación y base de datos.', unitPrice: 5000000, category: 'desarrollo' },
  { id: 's4', name: 'Integración con IA / Automatización', description: 'Integración de modelos de IA, chatbots o flujos automatizados en sistemas existentes.', unitPrice: 1500000, category: 'desarrollo' },
  { id: 's5', name: 'Identidad Visual / Branding', description: 'Diseño de logo, paleta de colores, tipografía y manual de marca completo.', unitPrice: 1200000, category: 'diseño' },
  { id: 's6', name: 'Diseño UI / Prototipo', description: 'Diseño de interfaces de usuario en Figma con prototipos interactivos y entregables para desarrollo.', unitPrice: 900000, category: 'diseño' },
  { id: 's7', name: 'Material Publicitario (pack)', description: 'Pack de piezas gráficas para redes sociales, banners, flyers digitales e impresos.', unitPrice: 600000, category: 'diseño' },
  { id: 's8', name: 'Estrategia de Contenido Digital', description: 'Planificación y creación de contenido para redes sociales, calendario editorial y métricas.', unitPrice: 750000, category: 'marketing' },
  { id: 's9', name: 'Consultoría Digital (por hora)', description: 'Sesión de consultoría para estrategia digital, revisión de proyectos o asesoría técnica.', unitPrice: 150000, category: 'consultoria' },
  { id: 's10', name: 'Mantenimiento Mensual', description: 'Mantenimiento, actualizaciones y soporte técnico mensual para sitios o aplicaciones web.', unitPrice: 350000, category: 'otro' },
];

const DEFAULT_CLIENTS: Client[] = [
  { id: 'c1', name: 'TechCorp Solutions', email: 'contacto@techcorp.com', phone: '+57 300 123 4567', company: 'TechCorp S.A.S.', createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString() },
  { id: 'c2', name: 'María Gómez', email: 'maria.gomez@gmail.com', phone: '+57 311 987 6543', company: 'Diseños MG', createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString() },
  { id: 'c3', name: 'Inversiones Alpha', email: 'admin@inversionesalpha.com', phone: '+57 320 555 1122', company: 'Inversiones Alpha S.A.', createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() },
];

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'PL-2025-001', clientId: 'c1', clientName: 'TechCorp Solutions', clientEmail: 'contacto@techcorp.com', clientCompany: 'TechCorp S.A.S.',
    items: [
      { serviceId: 's2', serviceName: 'Sitio Web Corporativo', description: 'Rediseño completo con Next.js', quantity: 1, unitPrice: 2500000, subtotal: 2500000 },
      { serviceId: 's10', serviceName: 'Mantenimiento Mensual', description: 'Mes de Enero', quantity: 1, unitPrice: 350000, subtotal: 350000 }
    ],
    subtotal: 2850000, taxRate: 19, taxAmount: 541500, total: 3391500, status: 'Pagada', notes: 'Pago recibido vía transferencia.',
    issuedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
    dueAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paidAt: new Date(Date.now() - 50 * 24 * 3600 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'PL-2025-002', clientId: 'c2', clientName: 'María Gómez', clientEmail: 'maria.gomez@gmail.com', clientCompany: 'Diseños MG',
    items: [
      { serviceId: 's5', serviceName: 'Identidad Visual / Branding', description: 'Renovación de marca personal', quantity: 1, unitPrice: 1200000, subtotal: 1200000 }
    ],
    subtotal: 1200000, taxRate: 0, taxAmount: 0, total: 1200000, status: 'Pagada', notes: 'Factura exenta de IVA',
    issuedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    dueAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paidAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'PL-2025-003', clientId: 'c3', clientName: 'Inversiones Alpha', clientEmail: 'admin@inversionesalpha.com', clientCompany: 'Inversiones Alpha S.A.',
    items: [
      { serviceId: 's3', serviceName: 'Aplicación Web (WebApp)', description: 'Dashboard interno de gestión', quantity: 1, unitPrice: 5000000, subtotal: 5000000 },
      { serviceId: 's4', serviceName: 'Integración con IA / Automatización', description: 'Bot de reportes automático', quantity: 1, unitPrice: 1500000, subtotal: 1500000 }
    ],
    subtotal: 6500000, taxRate: 19, taxAmount: 1235000, total: 7735000, status: 'Enviada', notes: 'Anticipo del 50% para iniciar desarrollo',
    issuedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
    dueAt: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
  }
];

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private clientsKey = 'portalink_clients';
  private servicesKey = 'portalink_services';
  private invoicesKey = 'portalink_invoices';
  private counterKey = 'portalink_invoice_counter';

  // ─── CLIENTS ──────────────────────────────────────────────
  getClients(): Client[] {
    const stored = localStorage.getItem(this.clientsKey);
    if (!stored) {
      localStorage.setItem(this.clientsKey, JSON.stringify(DEFAULT_CLIENTS));
      return DEFAULT_CLIENTS;
    }
    try { return JSON.parse(stored); }
    catch { return DEFAULT_CLIENTS; }
  }

  saveClient(client: Client): void {
    const list = this.getClients();
    const idx = list.findIndex(c => c.id === client.id);
    if (idx >= 0) list[idx] = client;
    else list.unshift(client);
    localStorage.setItem(this.clientsKey, JSON.stringify(list));
  }

  deleteClient(id: string): void {
    const list = this.getClients().filter(c => c.id !== id);
    localStorage.setItem(this.clientsKey, JSON.stringify(list));
  }

  newClientId(): string {
    return 'c' + Date.now();
  }

  // ─── SERVICES ─────────────────────────────────────────────
  getServices(): Service[] {
    const stored = localStorage.getItem(this.servicesKey);
    if (!stored) {
      localStorage.setItem(this.servicesKey, JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
    try { return JSON.parse(stored); }
    catch { return DEFAULT_SERVICES; }
  }

  saveService(service: Service): void {
    const list = this.getServices();
    const idx = list.findIndex(s => s.id === service.id);
    if (idx >= 0) list[idx] = service;
    else list.unshift(service);
    localStorage.setItem(this.servicesKey, JSON.stringify(list));
  }

  deleteService(id: string): void {
    const list = this.getServices().filter(s => s.id !== id);
    localStorage.setItem(this.servicesKey, JSON.stringify(list));
  }

  newServiceId(): string {
    return 'sv' + Date.now();
  }

  // ─── INVOICES ─────────────────────────────────────────────
  getInvoices(): Invoice[] {
    const stored = localStorage.getItem(this.invoicesKey);
    if (!stored) {
      localStorage.setItem(this.invoicesKey, JSON.stringify(DEFAULT_INVOICES));
      localStorage.setItem(this.counterKey, '3');
      return DEFAULT_INVOICES;
    }
    try { return JSON.parse(stored); }
    catch { return DEFAULT_INVOICES; }
  }

  saveInvoice(invoice: Invoice): void {
    const list = this.getInvoices();
    const idx = list.findIndex(i => i.id === invoice.id);
    if (idx >= 0) list[idx] = invoice;
    else list.unshift(invoice);
    localStorage.setItem(this.invoicesKey, JSON.stringify(list));
  }

  deleteInvoice(id: string): void {
    const list = this.getInvoices().filter(i => i.id !== id);
    localStorage.setItem(this.invoicesKey, JSON.stringify(list));
  }

  updateInvoiceStatus(id: string, status: Invoice['status']): void {
    const list = this.getInvoices();
    const inv = list.find(i => i.id === id);
    if (inv) {
      inv.status = status;
      if (status === 'Pagada') inv.paidAt = new Date().toISOString().split('T')[0];
      localStorage.setItem(this.invoicesKey, JSON.stringify(list));
    }
  }

  getNextInvoiceId(): string {
    const year = new Date().getFullYear();
    const count = (parseInt(localStorage.getItem(this.counterKey) || '0', 10)) + 1;
    localStorage.setItem(this.counterKey, String(count));
    return `PL-${year}-${String(count).padStart(3, '0')}`;
  }

  // ─── STATS ────────────────────────────────────────────────
  getStats() {
    const invoices = this.getInvoices();
    const clients = this.getClients();
    const paid = invoices.filter(i => i.status === 'Pagada').reduce((a, i) => a + i.total, 0);
    const pending = invoices.filter(i => i.status === 'Enviada').reduce((a, i) => a + i.total, 0);
    const overdue = invoices.filter(i => i.status === 'Vencida').reduce((a, i) => a + i.total, 0);
    const total = paid + pending + overdue;
    return { total, paid, pending, overdue, clientCount: clients.length, invoiceCount: invoices.length };
  }

  formatCOP(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  }
}
