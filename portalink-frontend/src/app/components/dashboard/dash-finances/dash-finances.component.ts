import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FinanceService, Client, Service, Invoice, InvoiceItem } from '../../../services/finance.service';
import { PdfReportService, SoftwareProposal, SoftwareProposalItem } from '../../../services/pdf-report.service';
import { TeleportToBodyDirective } from '../../../shared/directives/teleport-to-body.directive';
import { firstValueFrom } from 'rxjs';

type SubTab = 'resumen' | 'clientes' | 'servicios' | 'facturas';

@Component({
  selector: 'app-dash-finances',
  standalone: true,
  imports: [CommonModule, FormsModule, TeleportToBodyDirective],
  templateUrl: './dash-finances.component.html',
  styleUrl: './dash-finances.component.css'
})

export class DashFinancesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() theme = 'dark';

  private financeService = inject(FinanceService);
  private pdfService = inject(PdfReportService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  private isDestroyed = false;

  get isDark() { return this.theme === 'dark'; }
  Math = Math;

  ngOnDestroy() {
    this.isDestroyed = true;
    if (this.gadgetToast) {
      this.gadgetToast = null;
    }
  }

  safeDetectChanges() {
    if (!this.isDestroyed && this.cdr) {
      try {
        this.cdr.detectChanges();
      } catch (e) {
        // Ignore change detection on destroyed views safely
      }
    }
  }

  getPendingAmount(inv: any): number {
    if (!inv) return 0;
    if (inv.pending_amount !== undefined && inv.pending_amount !== null) return Number(inv.pending_amount);
    const total = Number(inv.total || inv.total_amount || 0);
    const paid = Number(inv.paid_amount || 0);
    return Math.max(0, total - paid);
  }

  formatStatus(rawStatus: string, dueAt?: string, paidAmount?: number, totalAmount?: number): Invoice['status'] {
    if (!rawStatus) return 'Enviada';
    const s = String(rawStatus).toUpperCase();
    if (s === 'PAGADA' || s === 'PAGADO') return 'Pagada';
    if (s === 'PARCIAL' || (paidAmount && paidAmount > 0 && totalAmount && paidAmount < totalAmount)) return 'Parcial';
    if (s === 'DRAFT' || s === 'BORRADOR') return 'Borrador';
    
    if (dueAt) {
      const today = new Date().toISOString().split('T')[0];
      if (dueAt < today) {
        return 'Vencida';
      }
    }

    if (s === 'VENCIDA' || s === 'VENCIDO') return 'Vencida';
    if (s === 'ENVIADA' || s === 'ENVIADO') return 'Enviada';
    return 'Enviada';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['theme']) {
      this.safeDetectChanges();
    }
  }

  subTab: SubTab = 'resumen';
  showPdfPreview = false;
  previewPdfUrl: SafeResourceUrl | null = null;
  previewInvoiceTarget: Invoice | null = null;
  subTabs = [
    { id: 'resumen' as SubTab, label: 'Resumen' },
    { id: 'clientes' as SubTab, label: 'Clientes' },
    { id: 'servicios' as SubTab, label: 'Servicios' },
    { id: 'facturas' as SubTab, label: 'Cuentas de Cobro' },
  ];

  clients: Client[] = [];
  allServices: Service[] = [];
  invoices: Invoice[] = [];
  kpis: { label: string; value: string; color?: string }[] = [];
  recentInvoices: Invoice[] = [];
  pdfLoading = false;
  batchLoading = false;
  batchLoadingStatus = '';
  batchProgressText = '';
  expandedInvoiceId: string | null = null;
  kpiPeriod: 'all' | 'this_month' | 'last_month' = 'all';

  // Payment Modal & Abonos State
  showPaymentModal = false;
  paymentInvoiceTarget: Invoice | null = null;
  paymentForm = {
    amount: 0,
    paidAt: new Date().toISOString().split('T')[0],
    paymentMethod: 'Transferencia Bancaria',
    paymentNotes: ''
  };
  paymentMethodsList = [
    'Transferencia Bancaria',
    'Nequi',
    'Daviplata',
    'Tarjeta de Crédito/Débito',
    'Efectivo',
    'Otro'
  ];
  paymentSuccessToast = '';
  gadgetToast: {
    show: boolean;
    message: string;
    type: 'create' | 'edit' | 'delete' | 'success';
  } | null = null;

  // ─── SOFTWARE ACQUISITION PROPOSAL ──────────────────────────────
  showProposalModal = false;
  proposalSubmitting = false;
  proposalItemNewTitle = '';
  proposalItemNewDesc = '';

  defaultProposalItems: SoftwareProposalItem[] = [
    {
      title: 'Dominio y administración por 2 años',
      description: 'Registro de dominio oficial (.com / .co / .net), administración técnica de DNS, certificados SSL y soporte de administración cloud por 24 meses.',
      included: true
    },
    {
      title: 'Landing Page para clientes',
      description: 'Página web moderna de alto impacto y conversión, diseño responsivo ultra rápido, llamados a la acción (CTA) y formulario de captura.',
      included: true
    },
    {
      title: 'Diseño móvil e instalación para usuarios',
      description: 'Adaptabilidad táctil para smartphones/tablets, arquitectura PWA instalable sin tiendas con acceso directo en pantalla de inicio.',
      included: true
    },
    {
      title: 'Bases de datos, una para uso, otra de respaldo',
      description: 'Base de datos principal de alto rendimiento en producción + réplica y sistema automatizado de backups periódicos para máxima seguridad.',
      included: true
    },
    {
      title: 'Panel Administrativo Directivo (Dashboard)',
      description: 'Módulo privado de gestión con control de datos, reportes financieros y monitoreo en tiempo real.',
      included: true
    },
    {
      title: 'Infraestructura Cloud, Hosting & Certificado SSL',
      description: 'Alojamiento en la nube de alta disponibilidad, encriptación HTTPS de extremo a extremo y optimización de velocidad.',
      included: true
    }
  ];

  editingProposalServiceId: string | number | null = null;
  editingProposalId: string | number | null = null;

  proposalData: SoftwareProposal = {
    projectTitle: 'Ecosistema Digital & Plataforma de Software a Medida',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    issuedAt: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    deliveryTime: '3 a 4 semanas',
    warranty: '12 meses de soporte técnico y corrección de incidencias',
    paymentTerms: '',
    notes: 'Incluye despliegue en servidores de producción, capacitación administrativa y código fuente.',
    totalAmount: 0,
    items: []
  };

  openSoftwareProposalModal() {
    this.editingProposalServiceId = null;
    this.editingProposalId = null;
    this.proposalData = {
      projectTitle: 'Ecosistema Digital & Plataforma de Software a Medida',
      clientName: '',
      clientCompany: '',
      clientEmail: '',
      clientPhone: '',
      issuedAt: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      deliveryTime: '3 a 4 semanas',
      warranty: '12 meses de soporte técnico y corrección de incidencias',
      paymentTerms: '',
      notes: 'Incluye despliegue en servidores de producción, capacitación administrativa y código fuente.',
      totalAmount: 0,
      items: JSON.parse(JSON.stringify(this.defaultProposalItems))
    };
    this.showProposalModal = true;
    this.safeDetectChanges();
  }

  closeSoftwareProposalModal() {
    this.showProposalModal = false;
    this.editingProposalServiceId = null;
    this.editingProposalId = null;
    this.safeDetectChanges();
  }

  onProposalClientSelect(clientId: string) {
    if (!clientId) return;
    const client = this.clients.find(c => String(c.id) === String(clientId));
    if (client) {
      this.proposalData.clientName = client.name || '';
      this.proposalData.clientCompany = client.company || '';
      this.proposalData.clientEmail = client.email || '';
      this.proposalData.clientPhone = client.phone || '';
      this.safeDetectChanges();
    }
  }

  getActiveProposalItemsCount(): number {
    return (this.proposalData.items || []).filter(it => it.included !== false).length;
  }

  addProposalItem() {
    const title = this.proposalItemNewTitle.trim();
    if (!title) {
      alert('Por favor escribe el nombre del entregable.');
      return;
    }
    const alreadyExists = (this.proposalData.items || []).some(
      it => (it.title || '').trim().toLowerCase() === title.toLowerCase()
    );
    if (alreadyExists) {
      alert('Ya existe un entregable con ese nombre en la lista.');
      return;
    }
    this.proposalData.items.push({
      title: title,
      description: this.proposalItemNewDesc.trim() || 'Especificaciones técnicas acordadas.',
      included: true
    });
    this.proposalItemNewTitle = '';
    this.proposalItemNewDesc = '';
    this.safeDetectChanges();
  }

  removeProposalItem(index: number) {
    this.proposalData.items.splice(index, 1);
    this.safeDetectChanges();
  }

  resetProposalItemsToDefault() {
    this.proposalData.items = JSON.parse(JSON.stringify(this.defaultProposalItems));
    this.safeDetectChanges();
  }

  clearProposalItems() {
    this.proposalData.items = [];
    this.safeDetectChanges();
  }

  async generateProposalPreview() {
    if (!this.proposalData.clientName?.trim()) {
      alert('Por favor ingresa el nombre del cliente destinatario.');
      return;
    }
    this.proposalSubmitting = true;
    this.safeDetectChanges();
    try {
      const url = await this.pdfService.downloadSoftwareProposalPdf(this.proposalData, 'bloburl');
      this.previewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url as string);
      this.showPdfPreview = true;
    } catch (e) {
      console.error(e);
      alert('Error generando vista previa del PDF');
    } finally {
      this.proposalSubmitting = false;
      this.safeDetectChanges();
    }
  }

  isAcquisition(s?: Service | null): boolean {
    if (!s) return false;
    const name = (s.name || '').toLowerCase();
    const desc = (s.description || '').toLowerCase();
    const cat = (s.category || '').toLowerCase();
    return cat === 'adquisicion' || 
           name.startsWith('[adquisición]') || 
           name.startsWith('[adquisicion]') || 
           name.includes('adquisición') ||
           name.includes('adquisicion') ||
           desc.includes('[adquisición') || 
           desc.includes('[adquisicion');
  }

  onServiceCategoryChange(category: string) {
    if (category === 'adquisicion') {
      const currentName = this.editingService?.name || '';
      const currentPrice = this.editingService?.unitPrice || 0;
      const currentId = this.editingService?.id || null;
      this.showServiceForm = false;
      this.openSoftwareProposalModal();
      if (currentName) {
        this.proposalData.projectTitle = currentName.replace(/^\[(Adquisición|Adquisicion)\]\s*/i, '').trim();
      }
      if (currentPrice) {
        this.proposalData.totalAmount = currentPrice;
      }
      if (currentId) {
        this.editingProposalServiceId = currentId;
      }
      this.safeDetectChanges();
    }
  }

  buildProposalFromService(s: any): SoftwareProposal {
    // 1. Título del Proyecto
    let title = s.project_title || s.name || '';
    title = title.replace(/^\[(Adquisición|Adquisicion)\]\s*/i, '').trim();

    // 2. Cliente, Empresa, Tiempos
    let clientName = s.client_name || '';
    let clientCompany = s.client_company || '';
    let clientEmail = s.client_email || '';
    let clientPhone = s.client_phone || '';
    let time = s.delivery_time || '';
    let warranty = s.warranty || '12 meses de soporte técnico y corrección de incidencias';
    let payment = s.payment_terms || '';

    // Extracción de respaldo desde la descripción si no vienen los campos unidos
    const desc = s.description || '';
    if (!clientName) {
      const matchClient = desc.match(/Propuesta para\s+([^•(]+)/i);
      if (matchClient) clientName = matchClient[1].trim();
    }
    if (!clientCompany) {
      const matchComp = desc.match(/\(([^)]+)\)/);
      if (matchComp) clientCompany = matchComp[1].trim();
    }
    if (!time) {
      const matchTime = desc.match(/• Tiempo:\s*([^•]+)/i);
      if (matchTime) time = matchTime[1].trim();
    }
    if (!payment) {
      const matchPay = desc.match(/• Pago:\s*([^•]+)/i);
      if (matchPay) payment = matchPay[1].trim();
    }

    // 3. Entregables / Módulos (soporta array directo o parseo de JSON string desde la BD)
    let items: any[] = [];
    let rawItems = s.proposal_items;
    if (typeof rawItems === 'string' && rawItems.trim()) {
      try {
        rawItems = JSON.parse(rawItems);
      } catch (e) {
        rawItems = null;
      }
    }

    if (Array.isArray(rawItems) && rawItems.length > 0) {
      // La base de datos es la fuente de verdad. Sanitizamos y desduplicamos por título.
      const seenTitles = new Set<string>();
      for (const it of rawItems) {
        if (!it || !it.title) continue;
        const norm = it.title.trim().toLowerCase();
        if (!norm) continue;
        if (!seenTitles.has(norm)) {
          seenTitles.add(norm);
          items.push({
            title: it.title.trim(),
            description: (it.description || '').trim() || 'Especificaciones técnicas acordadas.',
            included: it.included !== false
          });
        }
      }
    }

    // EXTRAER DESDE LA DESCRIPCIÓN ÚNICAMENTE COMO RESPALDO SI LA BD NO TIENE ENTREGABLES
    if (items.length === 0) {
      const matchItems = desc.match(/• Entregables:\s*([^•$]+)/i);
      if (matchItems) {
        const descItemsText = matchItems[1].trim();
        let itemNames: string[] = [];

        if (descItemsText.includes(' | ')) {
          itemNames = descItemsText.split(' | ').map((x: string) => x.trim()).filter(Boolean);
        } else if (descItemsText.includes(' ; ')) {
          itemNames = descItemsText.split(' ; ').map((x: string) => x.trim()).filter(Boolean);
        } else {
          // Respaldo para servicios antiguos guardados con comas
          const parts = descItemsText.split(',').map((x: string) => x.trim()).filter(Boolean);
          const recombined: string[] = [];
          for (let i = 0; i < parts.length; i++) {
            const cur = parts[i];
            const next = parts[i + 1] || '';
            const curLower = cur.toLowerCase();
            const nextLower = next.toLowerCase();
            if (curLower.includes('bases de datos') && nextLower.includes('una para uso')) {
              const nextNext = parts[i + 2] || '';
              recombined.push(`${cur}, ${next}, ${nextNext}`);
              i += 2;
            } else if (curLower.includes('infraestructura cloud') && nextLower.includes('hosting')) {
              recombined.push(`${cur}, ${next}`);
              i++;
            } else if (curLower === 'caja' && nextLower.startsWith('gastos')) {
              recombined.push(`${cur}, ${next}`);
              i++;
            } else if (curLower.includes('pedidos entrantes') && nextLower.includes('notificacion')) {
              recombined.push(`${cur}, ${next}`);
              i++;
            } else {
              recombined.push(cur);
            }
          }
          itemNames = recombined;
        }

        const seenFallback = new Set<string>();
        for (const name of itemNames) {
          const norm = name.trim().toLowerCase();
          if (!norm || seenFallback.has(norm)) continue;
          seenFallback.add(norm);

          const matchDefault = this.defaultProposalItems.find(d => d.title.toLowerCase() === norm);
          items.push({
            title: name.trim(),
            description: matchDefault ? matchDefault.description : 'Especificaciones técnicas acordadas.',
            included: true
          });
        }
      }
    }

    if (!items || items.length === 0) {
      items = JSON.parse(JSON.stringify(this.defaultProposalItems));
    }

    const finalAmount = Number(s.unitPrice ?? s.price ?? s.proposal_total_amount ?? 0);

    return {
      id: s.proposal_id || undefined,
      serviceId: s.id || undefined,
      projectTitle: title || 'Ecosistema Digital & Plataforma de Software a Medida',
      clientName: clientName || '',
      clientCompany: clientCompany || '',
      clientEmail: clientEmail,
      clientPhone: clientPhone,
      issuedAt: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      deliveryTime: time || '3 a 4 semanas',
      warranty: warranty || '12 meses de soporte técnico y corrección de incidencias',
      paymentTerms: payment || '',
      notes: 'Incluye despliegue en servidores de producción, capacitación administrativa y código fuente.',
      totalAmount: finalAmount,
      items: items
    };
  }

  editAcquisitionProposal(s: any) {
    this.editingProposalServiceId = s.id || null;
    this.editingProposalId = s.proposal_id || null;
    this.proposalData = this.buildProposalFromService(s);
    this.showProposalModal = true;
    this.safeDetectChanges();
  }

  async downloadProposalPdfFromService(s: any) {
    const proposal = this.buildProposalFromService(s);
    try {
      this.pdfLoading = true;
      this.safeDetectChanges();
      await this.pdfService.downloadSoftwareProposalPdf(proposal, 'save');
      this.showGadget('¡PDF de la propuesta comercial descargado con éxito!', 'success');
    } catch (e) {
      console.error(e);
      alert('Error al descargar el PDF de la propuesta comercial');
    } finally {
      this.pdfLoading = false;
      this.safeDetectChanges();
    }
  }

  async saveAcquisitionAsService(): Promise<any> {
    try {
      // 1. Limpiar y desduplicar entregables estrictamente antes de persistir
      const cleanItems: SoftwareProposalItem[] = [];
      const seenTitles = new Set<string>();
      for (const it of (this.proposalData.items || [])) {
        if (!it || !it.title) continue;
        const norm = it.title.trim().toLowerCase();
        if (!norm) continue;
        if (!seenTitles.has(norm)) {
          seenTitles.add(norm);
          cleanItems.push({
            title: it.title.trim(),
            description: (it.description || '').trim() || 'Especificaciones técnicas acordadas.',
            included: it.included !== false
          });
        }
      }
      this.proposalData.items = cleanItems;

      let res: any;
      if (this.editingProposalId || this.editingProposalServiceId) {
        const targetId = this.editingProposalId || this.editingProposalServiceId;
        res = await firstValueFrom(this.financeService.updateSoftwareProposal(targetId!, this.proposalData));
      } else {
        res = await firstValueFrom(this.financeService.saveSoftwareProposal(this.proposalData));
      }
      if (res && res.proposalId) {
        this.editingProposalId = res.proposalId;
        this.proposalData.id = res.proposalId;
      }
      if (res && res.serviceId) {
        this.editingProposalServiceId = res.serviceId;
        this.proposalData.serviceId = res.serviceId;
      }
      await this.refresh();
      return res;
    } catch (err) {
      console.warn('Error en saveSoftwareProposal, intentando fallback saveService:', err);
      const title = this.proposalData.projectTitle?.trim() || 'Desarrollo de Solución de Software a Medida';
      const client = this.proposalData.clientName?.trim() || 'Cliente';
      const company = this.proposalData.clientCompany?.trim() ? ` (${this.proposalData.clientCompany.trim()})` : '';
      
      const activeItems = (this.proposalData.items || [])
        .filter(it => it.included !== false)
        .map(it => it.title.trim())
        .filter(Boolean);
      
      const itemsSummary = activeItems.length > 0 
        ? ` • Entregables: ${activeItems.join(' | ')}`
        : '';
      
      const paymentInfo = this.proposalData.paymentTerms ? ` • Pago: ${this.proposalData.paymentTerms}` : '';
      const timeInfo = this.proposalData.deliveryTime ? ` • Tiempo: ${this.proposalData.deliveryTime}` : '';

      const description = `[Adquisición de Software] Propuesta para ${client}${company}${paymentInfo}${timeInfo}${itemsSummary}`;

      const newService: Service = {
        id: this.editingProposalServiceId ? String(this.editingProposalServiceId) : undefined,
        name: `[Adquisición] ${title}`,
        description: description,
        price: Number(this.proposalData.totalAmount || 0),
        unitPrice: Number(this.proposalData.totalAmount || 0),
        category: 'adquisicion'
      };

      const res = await firstValueFrom(this.financeService.saveService(newService));
      await this.refresh();
      return res;
    }
  }

  async saveOnlyAcquisition() {
    if (!this.proposalData.clientName?.trim()) {
      alert('Por favor ingresa el nombre del cliente destinatario.');
      return;
    }
    this.proposalSubmitting = true;
    this.safeDetectChanges();
    try {
      const isEdit = !!(this.editingProposalId || this.editingProposalServiceId);
      await this.saveAcquisitionAsService();
      this.showGadget(isEdit ? '¡Propuesta comercial actualizada con éxito!' : '¡Adquisición guardada con éxito en el catálogo de servicios!', isEdit ? 'edit' : 'success');
      this.closeSoftwareProposalModal();
    } catch (e) {
      console.error(e);
      alert('Error al guardar la adquisición en la base de datos');
    } finally {
      this.proposalSubmitting = false;
      this.safeDetectChanges();
    }
  }

  async downloadSoftwareProposal() {
    if (!this.proposalData.clientName?.trim()) {
      alert('Por favor ingresa el nombre del cliente destinatario.');
      return;
    }
    this.proposalSubmitting = true;
    this.safeDetectChanges();
    try {
      const isEdit = !!(this.editingProposalId || this.editingProposalServiceId);
      // 1. Guardar automáticamente en la base de datos
      await this.saveAcquisitionAsService();
      
      // 2. Generar y descargar el documento PDF con los datos exactos
      await this.pdfService.downloadSoftwareProposalPdf(this.proposalData, 'save');
      this.showGadget(isEdit ? '¡Propuesta comercial actualizada y PDF descargado!' : '¡Propuesta comercial guardada en catálogo y PDF descargado!', 'success');
      this.closeSoftwareProposalModal();
    } catch (e) {
      console.error(e);
      alert('Error al procesar y guardar la propuesta comercial');
    } finally {
      this.proposalSubmitting = false;
      this.safeDetectChanges();
    }
  }

  openPaymentModal(inv: Invoice) {
    this.paymentInvoiceTarget = { ...inv };
    const total = inv.total_amount || inv.total || 0;
    const paid = inv.paid_amount || (inv.status === 'Pagada' || inv.status === 'PAGADA' ? total : 0);
    const pending = inv.pending_amount !== undefined ? inv.pending_amount : Math.max(0, total - paid);
    
    this.paymentForm = {
      amount: pending > 0 ? pending : total,
      paidAt: new Date().toISOString().split('T')[0],
      paymentMethod: inv.paymentMethod || inv.payment_method || 'Transferencia Bancaria',
      paymentNotes: ''
    };
    this.showPaymentModal = true;
    this.safeDetectChanges();
  }

  setPaymentPreset(ratio: number) {
    if (!this.paymentInvoiceTarget) return;
    const total = this.paymentInvoiceTarget.total_amount || this.paymentInvoiceTarget.total || 0;
    const paid = this.paymentInvoiceTarget.paid_amount || 0;
    const pending = this.paymentInvoiceTarget.pending_amount !== undefined ? this.paymentInvoiceTarget.pending_amount : Math.max(0, total - paid);
    const base = pending > 0 ? pending : total;
    this.paymentForm.amount = Math.round(base * ratio);
  }

  getInvoicePaidPct(inv: any): number {
    if (!inv) return 0;
    const total = Number(inv.total_amount || inv.total || 0);
    if (!total) return 0;
    if (inv.status === 'PAGADA' || inv.status === 'Pagada') return 100;
    const paid = Number(inv.paid_amount || 0);
    return Math.min(100, Math.round((paid / total) * 100));
  }

  toggleInvoiceExpand(id: string) {
    this.expandedInvoiceId = this.expandedInvoiceId === id ? null : id;
    this.safeDetectChanges();
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.paymentInvoiceTarget = null;
    this.safeDetectChanges();
  }

  async confirmPayment() {
    if (!this.paymentInvoiceTarget?.id) return;
    const targetId = this.paymentInvoiceTarget.id;
    const amount = Number(this.paymentForm.amount);
    
    if (!amount || amount <= 0) {
      alert('Por favor ingrese un monto de abono mayor a $0 COP.');
      return;
    }

    this.isLoading = true;
    this.safeDetectChanges();
    try {
      const res = await firstValueFrom(this.financeService.addInvoicePayment(
        targetId,
        {
          amount: amount,
          payment_date: this.paymentForm.paidAt,
          payment_method: this.paymentForm.paymentMethod,
          notes: this.paymentForm.paymentNotes
        }
      ));
      
      this.showPaymentModal = false;
      this.paymentInvoiceTarget = null;
      await this.refresh();
      this.showSuccessToast(res.message || `¡Abono de ${this.formatCOP(amount)} registrado con éxito!`);
    } catch (e: any) {
      console.error(e);
      alert(e?.error?.message || 'Error al registrar el abono.');
    } finally {
      this.isLoading = false;
      this.safeDetectChanges();
    }
  }

  async deletePayment(paymentId: number) {
    if (!confirm('¿Estás seguro de anular/eliminar este abono registrado?')) return;
    this.isLoading = true;
    this.safeDetectChanges();
    try {
      const res = await firstValueFrom(this.financeService.deleteInvoicePayment(paymentId));
      await this.refresh();
      this.showSuccessToast(res.message || 'Abono eliminado y saldo actualizado.');
    } catch (e: any) {
      console.error(e);
      alert(e?.error?.message || 'Error al eliminar el abono.');
    } finally {
      this.isLoading = false;
      this.safeDetectChanges();
    }
  }

  showGadget(message: string, type: 'create' | 'edit' | 'delete' | 'success' = 'success') {
    this.gadgetToast = { show: true, message, type };
    this.safeDetectChanges();
    setTimeout(() => {
      if (this.gadgetToast && this.gadgetToast.message === message) {
        this.gadgetToast = null;
        this.safeDetectChanges();
      }
    }, 4200);
  }

  showSuccessToast(msg: string) {
    this.showGadget(msg, 'success');
  }

  // Recent invoices pagination (Últimos Movimientos)
  recentPage = 1;
  recentPageSize = 5;

  get totalRecentPages(): number {
    return Math.ceil(this.recentInvoices.length / this.recentPageSize) || 1;
  }

  get paginatedRecentInvoices(): Invoice[] {
    const start = (this.recentPage - 1) * this.recentPageSize;
    return this.recentInvoices.slice(start, start + this.recentPageSize);
  }

  // Client filters & pagination
  clientFilterText = '';
  clientPage = 1;
  clientPageSize = 5;

  get displayedClients() {
    if (!this.clientFilterText) return this.clients;
    const term = this.clientFilterText.toLowerCase();
    return this.clients.filter(c => 
      c.name.toLowerCase().includes(term) ||
      (c.company && c.company.toLowerCase().includes(term)) ||
      c.email.toLowerCase().includes(term)
    );
  }

  get totalClientPages(): number {
    return Math.ceil(this.displayedClients.length / this.clientPageSize) || 1;
  }

  get paginatedClients(): Client[] {
    const start = (this.clientPage - 1) * this.clientPageSize;
    return this.displayedClients.slice(start, start + this.clientPageSize);
  }

  // Invoice filters & pagination
  invFilterCompany = '';
  invFilterMinPrice: number | null = null;
  invFilterMaxPrice: number | null = null;
  invFilterStartDate = '';
  invFilterEndDate = '';
  invPage = 1;
  invPageSize = 5;

  get displayedInvoices() {
    return this.invoices.filter(i => {
      let match = true;
      if (this.invFilterCompany) {
         const term = this.invFilterCompany.toLowerCase();
         if (!i.clientCompany?.toLowerCase().includes(term) && !(i.clientName || '').toLowerCase().includes(term) && !(i.title || '').toLowerCase().includes(term)) {
           match = false;
         }
      }
      if (this.invFilterMinPrice !== null && (i.total || 0) < this.invFilterMinPrice) match = false;
      if (this.invFilterMaxPrice !== null && (i.total || 0) > this.invFilterMaxPrice) match = false;
      if (this.invFilterStartDate && (i.issuedAt || '') < this.invFilterStartDate) match = false;
      if (this.invFilterEndDate && (i.issuedAt || '') > this.invFilterEndDate) match = false;
      return match;
    });
  }

  get totalInvPages(): number {
    return Math.ceil(this.displayedInvoices.length / this.invPageSize) || 1;
  }

  get paginatedInvoices(): Invoice[] {
    const start = (this.invPage - 1) * this.invPageSize;
    return this.displayedInvoices.slice(start, start + this.invPageSize);
  }

  // Service filters & pagination
  filterCategory = 'all';
  servicePage = 1;
  servicePageSize = 5;

  get filteredServices(): Service[] {
    if (this.filterCategory === 'all') return this.allServices;
    if (this.filterCategory === 'adquisicion') {
      return this.allServices.filter(s => this.isAcquisition(s));
    }
    return this.allServices.filter(s => !this.isAcquisition(s) && s.category === this.filterCategory);
  }

  get totalServicePages(): number {
    return Math.ceil(this.filteredServices.length / this.servicePageSize) || 1;
  }

  get paginatedServices(): Service[] {
    const start = (this.servicePage - 1) * this.servicePageSize;
    return this.filteredServices.slice(start, start + this.servicePageSize);
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  get paidPercentage(): number {
    const total = (this.invoices || []).reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);
    if (!total) return 0;
    const paid = (this.invoices || []).reduce((sum, inv) => {
      if (inv.status === 'Pagada' || inv.status === 'PAGADA') return sum + (inv.total || inv.total_amount || 0);
      return sum + (inv.paid_amount || 0);
    }, 0);
    return Math.min(100, Math.round((paid / total) * 100));
  }

  get pendingPercentage(): number {
    const paidPct = this.paidPercentage;
    const overduePct = this.overduePercentage;
    return Math.max(0, 100 - paidPct - overduePct);
  }

  get overduePercentage(): number {
    const total = (this.invoices || []).reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);
    if (!total) return 0;
    const overdue = (this.invoices || []).reduce((sum, inv) => {
      if (inv.status === 'Vencida' || inv.status === 'VENCIDA') {
        const pending = inv.pending_amount !== undefined ? inv.pending_amount : Math.max(0, (inv.total || 0) - (inv.paid_amount || 0));
        return sum + pending;
      }
      return sum;
    }, 0);
    return Math.round((overdue / total) * 100);
  }

  effectiveRecaudoRate = 0;
  monthlyIncome: { monthKey: string; month: string; year: string; amount: number; billed: number; collected: number; height: number; billedHeight: number; pctCollected: number }[] = [];
  serviceIncome: { name: string; amount: number; percent: number }[] = [];
  statusIncome: { status: string; count: number; amount: number; colorClass: string; width: number }[] = [];
  keyMetrics = {
    collectionRate: 0,
    overdueCount: 0,
    overdueAmount: 0,
    avgInvoiceValue: 0,
  };

  // Client form
  showClientForm = false;
  editingClient: Partial<Client> | null = null;
  clientFields = [
    { key: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Juan Pérez', required: true },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'juan@empresa.com', required: true },
    { key: 'phone', label: 'Teléfono', type: 'text', placeholder: '+57 300 000 0000', required: false },
    { key: 'company', label: 'Empresa', type: 'text', placeholder: 'Empresa S.A.S.', required: false },
  ] as any[];

  // Service form
  showServiceForm = false;
  editingService: Partial<Service> | null = null;
  serviceCategories = [
    { id: 'all', label: 'Todos' },
    { id: 'adquisicion', label: 'Propuestas' },
    { id: 'desarrollo', label: 'Desarrollo' },
    { id: 'diseño', label: 'Diseño' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'consultoria', label: 'Consultoría' },
    { id: 'otro', label: 'Otro' },
  ];

  // Invoice form
  showInvoiceForm = false;
  editingInvoice: Partial<Invoice> | null = null;
  selectedClientId = '';
  serviceToAdd = '';

  isLoading = false;

  ngOnInit() { this.refresh(); }

  async refresh() {
    if (this.isDestroyed) return;
    this.isLoading = true;
    this.safeDetectChanges();
    try {
      const [clientsRes, servicesRes, invoicesRes] = await Promise.all([
        firstValueFrom(this.financeService.getClients()),
        firstValueFrom(this.financeService.getServices()),
        firstValueFrom(this.financeService.getInvoices())
      ]);

      if (this.isDestroyed) return;

      this.clients = clientsRes.clients.map((c: any) => ({ ...c, createdAt: c.created_at })) || [];
      this.allServices = servicesRes.services.map((s: any) => ({ ...s, unitPrice: Number(s.price) })) || [];
      this.invoices = invoicesRes.invoices.map((i: any) => {
        const total = Number(i.total_amount || i.total || 0);
        const paid = Number(i.paid_amount || 0);
        const dueAt = i.due_date ? i.due_date.split('T')[0] : '';
        return {
          id: i.id,
          invoice_number: i.invoice_number || i.id,
          title: i.title || '',
          clientId: i.client_id,
          clientName: i.client_name,
          clientCompany: i.company || '',
          total: total,
          total_amount: total,
          subtotal: Number(i.subtotal),
          paid_amount: paid,
          pending_amount: Number(i.pending_amount !== undefined ? i.pending_amount : Math.max(0, total - paid)),
          status: this.formatStatus(i.status, dueAt, paid, total),
          issuedAt: i.issue_date ? i.issue_date.split('T')[0] : '',
          dueAt: dueAt,
          paidAt: i.paid_at ? i.paid_at.split('T')[0] : (i.updated_at ? i.updated_at.split('T')[0] : ''),
          paymentMethod: i.payment_method || '',
          paymentNotes: i.payment_notes || '',
          payments: i.payments || [],
          items: []
        };
      }) || [];

      if (this.isDestroyed) return;
      await this.buildKpis();
      if (this.isDestroyed) return;
      this.buildReports();
    } catch (e) {
      console.error('Error fetching finance data:', e);
    } finally {
      this.isLoading = false;
      this.safeDetectChanges();
    }
  }

  async toggleInvoice(id?: string) {
    if (!id || this.isDestroyed) return;
    if (this.expandedInvoiceId === id) {
      this.expandedInvoiceId = null;
      this.safeDetectChanges();
    } else {
      this.expandedInvoiceId = id;
      this.safeDetectChanges();
      try {
        const res = await firstValueFrom(this.financeService.getInvoiceDetails(id));
        if (this.isDestroyed) return;
        const invIndex = this.invoices.findIndex(i => i.id === id);
        if (invIndex >= 0 && res?.invoice) {
           this.invoices[invIndex].items = res.invoice.items?.map((it: any) => {
             const qty = Number(it.quantity || 1);
             const uPrice = Number(it.unit_price || it.unitPrice || 0);
             return {
               ...it,
               serviceName: it.service_name || it.description || it.serviceName || 'Servicio',
               description: it.description !== it.service_name ? (it.description || '') : '',
               quantity: qty,
               unitPrice: uPrice,
               subtotal: Number(it.total_price || it.subtotal || (qty * uPrice))
             };
           }) || [];
        }
      } catch (e) {
        console.error('Error fetching invoice details:', e);
      } finally {
        this.safeDetectChanges();
      }
    }
  }

  getClient(id?: string) {
    if (!id) return undefined;
    return this.clients.find(c => c.id === id);
  }
  setKpiPeriod(period: 'all' | 'this_month' | 'last_month') {
    this.kpiPeriod = period;
    const now = new Date();
    if (period === 'all') {
      this.invFilterStartDate = '';
      this.invFilterEndDate = '';
    } else if (period === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      this.invFilterStartDate = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2, '0')}-01`;
      this.invFilterEndDate = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    } else if (period === 'last_month') {
      let y = now.getFullYear();
      let m = now.getMonth() - 1;
      if (m < 0) { m = 11; y--; }
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      this.invFilterStartDate = `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2, '0')}-01`;
      this.invFilterEndDate = `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    }
    this.buildKpis();
    this.safeDetectChanges();
  }

  async buildKpis() {
    if (this.isDestroyed) return;
    try {
      const filters = {
        search: this.invFilterCompany,
        min_price: this.invFilterMinPrice,
        max_price: this.invFilterMaxPrice,
        date_from: this.invFilterStartDate,
        date_to: this.invFilterEndDate
      };
      const dashboardRes = await firstValueFrom(this.financeService.getDashboard(filters));
      if (this.isDestroyed) return;
      const kpi = dashboardRes?.kpis || {};
      
      this.kpis = [
        { label: 'Total Facturado', value: this.formatCOP(kpi.total_facturado || 0) },
        { label: 'Pagado', value: this.formatCOP(kpi.total_pagado || 0), color: 'text-emerald-400' },
        { label: 'Por Cobrar', value: this.formatCOP(kpi.total_por_cobrar || 0), color: 'text-amber-400' },
        { label: 'Clientes Facturados', value: String(kpi.clientes_facturados || 0), color: 'text-sky-400' },
      ];

      this.recentInvoices = (dashboardRes?.ledger || []).map((i: any) => {
        const total = Number(i.total_amount || i.total || 0);
        const paid = Number(i.paid_amount || 0);
        const dueAt = i.due_date ? i.due_date.split('T')[0] : '';
        return {
          id: i.id,
          invoice_number: i.invoice_number || i.id,
          title: i.title || '',
          clientId: i.client_id,
          clientName: i.client_name,
          clientCompany: i.company || '',
          total: total,
          total_amount: total,
          paid_amount: paid,
          pending_amount: Math.max(0, total - paid),
          status: this.formatStatus(i.status, dueAt, paid, total),
          paidAt: i.paid_at ? i.paid_at.split('T')[0] : (i.updated_at ? i.updated_at.split('T')[0] : ''),
          paymentMethod: i.payment_method || '',
          paymentNotes: i.payment_notes || ''
        };
      });
    } catch (e) {
      console.error('Error building KPIs:', e);
    } finally {
      this.safeDetectChanges();
    }
  }

  buildReports() {
    const paidInvoices = this.invoices.filter(i => (i.status === 'Pagada' || i.status === 'PAGADA') && i.paidAt);
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthsData: Record<string, { billed: number; collected: number }> = {};

    // 1. Baseline 6-month window (5 months prior up to current month)
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const past = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const mKey = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, '0')}`;
      monthsData[mKey] = { billed: 0, collected: 0 };
    }

    // 2. Group strictly by INVOICE DUE DATE (dueAt / due_date)
    this.invoices.forEach(inv => {
      const rawDueDate = inv.dueAt || inv.due_date || inv.issuedAt || inv.issue_date;
      if (rawDueDate) {
        const mKey = rawDueDate.substring(0, 7); // "YYYY-MM"
        if (!monthsData[mKey]) {
          monthsData[mKey] = { billed: 0, collected: 0 };
        }
        const total = Number(inv.total || inv.total_amount || 0);
        const paid = Number(inv.paid_amount || 0);
        monthsData[mKey].billed += total;
        monthsData[mKey].collected += paid;
      }
    });

    const sortedKeys = Object.keys(monthsData).sort();
    const maxVal = Math.max(
      ...sortedKeys.map(k => Math.max(monthsData[k].billed, monthsData[k].collected)),
      1
    );

    this.monthlyIncome = sortedKeys.map(k => {
      const [y, m] = k.split('-');
      const billed = monthsData[k].billed;
      const collected = monthsData[k].collected;
      const pct = billed > 0 ? Math.round((collected / billed) * 100) : (collected > 0 ? 100 : 0);

      return {
        monthKey: k,
        month: monthNames[parseInt(m, 10) - 1],
        year: y,
        amount: collected,
        billed: billed,
        collected: collected,
        height: Math.min(100, Math.max(0, (collected / maxVal) * 100)),
        billedHeight: Math.min(100, Math.max(0, (billed / maxVal) * 100)),
        pctCollected: pct
      };
    });

    const totalBilledPeriod = Object.values(monthsData).reduce((sum, item) => sum + item.billed, 0);
    const totalCollectedPeriod = Object.values(monthsData).reduce((sum, item) => sum + item.collected, 0);
    this.effectiveRecaudoRate = totalBilledPeriod > 0 ? Math.round((totalCollectedPeriod / totalBilledPeriod) * 100) : 0;

    // Service Income
    const srvMap: Record<string, number> = {};
    let totalPaid = 0;
    paidInvoices.forEach(inv => {
      totalPaid += inv.subtotal;
      (inv.items || []).forEach(item => {
        srvMap[item.serviceName || ''] = (srvMap[item.serviceName || ''] || 0) + (item.subtotal || 0);
      });
    });

    this.serviceIncome = Object.keys(srvMap)
      .map(k => ({ name: k, amount: srvMap[k], percent: totalPaid ? (srvMap[k] / totalPaid) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5

    // Status Income
    let totalAll = 0;
    const statusMap: Record<string, { count: number; amount: number }> = {
      'Pagada': { count: 0, amount: 0 },
      'Parcial': { count: 0, amount: 0 },
      'Enviada': { count: 0, amount: 0 },
      'Vencida': { count: 0, amount: 0 },
      'Borrador': { count: 0, amount: 0 },
    };
    
    this.invoices.forEach(inv => {
      const stKey = statusMap[inv.status] ? inv.status : (inv.status === 'PARCIAL' ? 'Parcial' : (inv.status === 'PAGADA' ? 'Pagada' : (inv.status === 'ENVIADA' ? 'Enviada' : 'Borrador')));
      if (statusMap[stKey]) {
        statusMap[stKey].count++;
        statusMap[stKey].amount += (inv.total || 0);
        totalAll += (inv.total || 0);
      }
    });

    const colors: Record<string, string> = {
      'Pagada': 'bg-green-500',
      'Parcial': 'bg-emerald-400',
      'Enviada': 'bg-blue-500',
      'Vencida': 'bg-red-500',
      'Borrador': 'bg-neutral-500'
    };

    this.statusIncome = Object.keys(statusMap).map(k => ({
      status: k,
      count: statusMap[k].count,
      amount: statusMap[k].amount,
      colorClass: colors[k],
      width: totalAll ? (statusMap[k].amount / totalAll) * 100 : 0
    })).filter(s => s.count > 0);

    // Key Metrics (Recaudo Real con Abonos Incluidos)
    const totalBilled = (this.invoices || []).reduce((sum, inv) => sum + (inv.total || inv.total_amount || 0), 0);
    const totalRecaudado = (this.invoices || []).reduce((sum, inv) => {
      if (inv.status === 'Pagada' || inv.status === 'PAGADA') return sum + (inv.total || inv.total_amount || 0);
      return sum + (inv.paid_amount || 0);
    }, 0);

    this.keyMetrics = {
      collectionRate: totalBilled ? Math.min(100, Math.round((totalRecaudado / totalBilled) * 100)) : 0,
      overdueCount: statusMap['Vencida'] ? statusMap['Vencida'].count : 0,
      overdueAmount: statusMap['Vencida'] ? statusMap['Vencida'].amount : 0,
      avgInvoiceValue: this.invoices.length ? Math.round(totalBilled / this.invoices.length) : 0
    };
  }

  // ─── CLIENTS ───────────────────────────────
  openNewClient() { this.editingClient = { id: '', name: '', email: '', phone: '', company: '', notes: '', createdAt: new Date().toISOString().split('T')[0] }; this.showClientForm = true; this.safeDetectChanges(); }
  editClient(c: Client) { this.editingClient = { ...c }; this.showClientForm = true; this.safeDetectChanges(); }
  async saveClient() {
    if (!this.editingClient?.name || !this.editingClient?.email) {
      alert('Por favor completa los campos obligatorios (Nombre, Email).');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editingClient.email)) {
      alert('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    // Phone validation and extension addition
    if (this.editingClient.phone) {
      let phone = this.editingClient.phone.trim();
      if (/^\d{10}$/.test(phone)) {
        phone = '+57 ' + phone;
      } else if (/^\d+$/.test(phone)) {
        phone = '+57 ' + phone;
      }
      
      const phoneRegex = /^\+?[0-9\s\-]+$/;
      if (!phoneRegex.test(phone)) {
        alert('Por favor, ingresa un número de celular válido.');
        return;
      }
      this.editingClient.phone = phone;
    }

    try {
      const isEdit = !!(this.editingClient?.id && this.editingClient.id !== '');
      await firstValueFrom(this.financeService.saveClient(this.editingClient as Client));
      this.showClientForm = false;
      this.refresh();
      this.showGadget(isEdit ? '¡Cliente actualizado con éxito!' : '¡Cliente creado con éxito!', isEdit ? 'edit' : 'create');
    } catch (e) {
      console.error(e);
      alert('Error al guardar cliente');
    } finally {
      this.safeDetectChanges();
    }
  }
  async deleteClient(id: string) {
    if (confirm('¿Eliminar este cliente?')) {
      try {
        await firstValueFrom(this.financeService.deleteClient(id));
        this.refresh();
        this.showGadget('¡Cliente eliminado con éxito!', 'delete');
      } catch (e) {
        alert('Error al eliminar cliente. Puede tener facturas asociadas.');
      } finally {
        this.safeDetectChanges();
      }
    }
  }
  getClientInvoiceCount(id?: string) {
    if (!id) return 0;
    return this.invoices.filter(i => i.clientId === id).length;
  }

  // ─── SERVICES ──────────────────────────────
  openNewService() { this.editingService = { id: '', name: '', description: '', unitPrice: 0, category: 'desarrollo' }; this.showServiceForm = true; this.safeDetectChanges(); }
  editService(s: Service) {
    if (this.isAcquisition(s)) {
      this.editAcquisitionProposal(s);
      return;
    }
    this.editingService = { ...s };
    this.showServiceForm = true;
    this.safeDetectChanges();
  }
  async saveService() {
    if (!this.editingService?.name) {
      alert('El nombre del servicio es obligatorio.');
      return;
    }
    
    const price = this.editingService.unitPrice;
    if (price !== undefined && price !== null) {
      if (price < 0) {
        alert('El precio no puede ser negativo.');
        return;
      }
      if (!Number.isInteger(price)) {
        alert('El precio no puede contener decimales.');
        return;
      }
    }
    try {
      const isEdit = !!(this.editingService?.id && this.editingService.id !== '');
      await firstValueFrom(this.financeService.saveService(this.editingService as Service));
      this.showServiceForm = false;
      this.refresh();
      this.showGadget(isEdit ? '¡Servicio actualizado con éxito!' : '¡Servicio creado con éxito!', isEdit ? 'edit' : 'create');
    } catch (e) {
      console.error(e);
      alert('Error al guardar servicio');
    } finally {
      this.safeDetectChanges();
    }
  }
  async deleteService(id: string) {
    if (confirm('¿Eliminar este servicio?')) {
      try {
        await firstValueFrom(this.financeService.deleteService(id));
        this.refresh();
        this.showGadget('¡Servicio eliminado con éxito!', 'delete');
      } catch (e) {
        alert('Error al eliminar servicio');
      } finally {
        this.safeDetectChanges();
      }
    }
  }

  // ─── INVOICES ──────────────────────────────
  openNewInvoice() {
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0];
    this.editingInvoice = { id: '', title: '', clientId: '', clientName: '', clientEmail: '', items: [], subtotal: 0, taxRate: 0, taxAmount: 0, total: 0, status: 'Borrador', notes: '', issuedAt: today, dueAt: due };
    this.selectedClientId = '';
    this.serviceToAdd = '';
    this.showInvoiceForm = true;
    this.subTab = 'facturas';
    this.safeDetectChanges();
  }
  async editInvoice(inv: Invoice) {
    this.subTab = 'facturas';
    this.editingInvoice = {
      ...inv,
      id: String(inv.id),
      title: inv.title || '',
      clientId: inv.clientId || inv.client_id || '',
      items: (inv.items || []).map(i => ({ ...i }))
    };
    this.selectedClientId = String(this.editingInvoice.clientId || '');
    this.showInvoiceForm = true;
    this.isLoading = true;
    this.safeDetectChanges();
    try {
      const res = await firstValueFrom(this.financeService.getInvoiceDetails(inv.id!));
      if (res && res.invoice) {
        const rawInv: any = res.invoice;
        const subtotal = Number(rawInv.subtotal || 0);
        const taxAmount = Number(rawInv.tax_amount || rawInv.taxAmount || 0);
        const taxRate = subtotal > 0 && taxAmount > 0 ? Math.round((taxAmount / subtotal) * 100) : 0;
        const total = Number(rawInv.total_amount || rawInv.total || 0);
        const paid = Number(rawInv.paid_amount !== undefined ? rawInv.paid_amount : (inv.paid_amount ?? inv.paidAmount ?? 0));
        const pending = Number(rawInv.pending_amount !== undefined ? rawInv.pending_amount : (inv.pending_amount ?? inv.pendingAmount ?? Math.max(0, total - paid)));
        
        this.editingInvoice = {
          ...inv,
          id: String(rawInv.id),
          title: rawInv.title !== null && rawInv.title !== undefined ? rawInv.title : (inv.title || ''),
          clientId: rawInv.client_id || inv.clientId,
          clientName: rawInv.client_name || inv.clientName,
          clientCompany: rawInv.company || inv.clientCompany,
          clientEmail: rawInv.email || inv.clientEmail,
          notes: rawInv.notes !== null && rawInv.notes !== undefined ? rawInv.notes : (inv.notes || ''),
          issuedAt: rawInv.issue_date ? rawInv.issue_date.split('T')[0] : inv.issuedAt,
          dueAt: rawInv.due_date ? rawInv.due_date.split('T')[0] : inv.dueAt,
          subtotal: subtotal,
          taxRate: taxRate,
          taxAmount: taxAmount,
          total: total,
          total_amount: total,
          paidAmount: paid,
          paid_amount: paid,
          pendingAmount: pending,
          pending_amount: pending,
          payments: rawInv.payments || inv.payments || [],
          items: (rawInv.items || []).map((it: any) => {
             const qty = Number(it.quantity || 1);
             const uPrice = Number(it.unit_price || it.unitPrice || 0);
             return {
               ...it,
               service_id: it.service_id ? String(it.service_id) : undefined,
               serviceName: it.service_name || it.description || it.serviceName || 'Servicio',
               description: it.description !== it.service_name ? (it.description || '') : '',
               quantity: qty,
               unitPrice: uPrice,
               unit_price: uPrice,
               subtotal: Number(it.total_price || it.subtotal || (qty * uPrice)),
               total_price: Number(it.total_price || it.subtotal || (qty * uPrice))
             };
          })
        };
        this.selectedClientId = String(this.editingInvoice.clientId || '');
        this.recalcInvoice();
      }
    } catch (e) {
      console.error('Error loading invoice details:', e);
    } finally {
      this.isLoading = false;
      this.serviceToAdd = '';
      this.safeDetectChanges();
    }
  }
  onClientSelect() {
    const c = this.clients.find(cl => String(cl.id) === String(this.selectedClientId));
    if (c && this.editingInvoice) {
      this.editingInvoice.clientId = c.id;
      this.editingInvoice.clientName = c.name;
      this.editingInvoice.clientEmail = c.email;
      this.editingInvoice.clientCompany = c.company;
    }
  }
  addServiceToInvoice() {
    if (!this.serviceToAdd || !this.editingInvoice) return;
    const svc = this.allServices.find(s => String(s.id) === String(this.serviceToAdd));
    if (!svc) return;
    const item: InvoiceItem = { service_id: String(svc.id), serviceName: svc.name, description: svc.description, quantity: 1, unitPrice: svc.unitPrice || 0, unit_price: svc.unitPrice || 0, subtotal: svc.unitPrice || 0, total_price: svc.unitPrice || 0 };
    this.editingInvoice.items = [...(this.editingInvoice.items || []), item];
    this.serviceToAdd = '';
    this.recalcInvoice();
  }
  removeInvoiceItem(i: number) {
    this.editingInvoice!.items!.splice(i, 1);
    this.recalcInvoice();
  }
  recalcInvoice() {
    if (!this.editingInvoice) return;
    const items = this.editingInvoice.items || [];
    items.forEach(it => it.subtotal = (it.quantity || 1) * (it.unitPrice || it.unit_price || 0));
    const subtotal = items.reduce((a, it) => a + (it.subtotal || 0), 0);
    const taxRate = this.editingInvoice.taxRate || 0;
    const taxAmount = Math.round(subtotal * taxRate / 100);
    const total = subtotal + taxAmount;
    const paid = Number(this.editingInvoice.paidAmount ?? this.editingInvoice.paid_amount ?? 0);
    this.editingInvoice.subtotal = subtotal;
    this.editingInvoice.taxAmount = taxAmount;
    this.editingInvoice.total = total;
    this.editingInvoice.total_amount = total;
    this.editingInvoice.paidAmount = paid;
    this.editingInvoice.paid_amount = paid;
    this.editingInvoice.pendingAmount = Math.max(0, total - paid);
    this.editingInvoice.pending_amount = this.editingInvoice.pendingAmount;
  }
  async saveInvoice(status: Invoice['status']) {
    if (!this.editingInvoice?.clientId) { alert('Selecciona un cliente primero.'); return; }
    if (!this.editingInvoice?.items?.length) { alert('Agrega al menos un servicio.'); return; }
    
    for (const item of this.editingInvoice.items) {
      if (item.quantity === undefined || item.quantity < 1 || !Number.isInteger(item.quantity)) {
        alert(`La cantidad para el servicio "${item.serviceName}" debe ser un número entero mayor a 0.`);
        return;
      }
      if (item.unitPrice === undefined || item.unitPrice < 0 || !Number.isInteger(item.unitPrice)) {
        alert(`El precio unitario para el servicio "${item.serviceName}" no puede ser negativo ni contener decimales.`);
        return;
      }
    }

    if (this.editingInvoice.taxRate !== undefined && this.editingInvoice.taxRate !== null) {
        if (this.editingInvoice.taxRate < 0 || this.editingInvoice.taxRate > 100) {
            alert('El IVA debe estar entre 0 y 100.');
            return;
        }
    }

    const isEdit = !!(this.editingInvoice?.id && this.editingInvoice.id !== '');
    if (!isEdit) {
      const initialStatus = status === 'Pagada' ? 'Enviada' : status;
      this.editingInvoice.status = initialStatus;
    }
    try {
      const res = await firstValueFrom(this.financeService.saveInvoice(this.editingInvoice as Invoice));
      this.showInvoiceForm = false;
      this.refresh();
      if (status === 'Pagada' && res?.invoice) {
        this.openPaymentModal(res.invoice);
      } else {
        this.showGadget(isEdit ? '¡Cuenta de cobro actualizada con éxito!' : '¡Cuenta de cobro creada con éxito!', isEdit ? 'edit' : 'create');
      }
    } catch (e) {
      console.error(e);
      alert('Error al crear cuenta de cobro');
    } finally {
      this.safeDetectChanges();
    }
  }
  async deleteInvoice(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta cuenta de cobro?')) {
      try {
        await firstValueFrom(this.financeService.deleteInvoice(id));
        this.refresh();
        this.showGadget('¡Cuenta de cobro eliminada con éxito!', 'delete');
      } catch (e) {
        console.error(e);
        alert('Error al eliminar la cuenta de cobro.');
      } finally {
        this.safeDetectChanges();
      }
    }
  }
  async onStatusChange(inv: Invoice) {
    if (inv.status === 'Pagada') {
      this.openPaymentModal(inv);
      return;
    }
    try {
      await firstValueFrom(this.financeService.updateInvoiceStatus(inv.id!, inv.status));
      await this.refresh();
      this.showGadget('¡Estado de cuenta de cobro actualizado!', 'success');
    } catch (e) {
      alert('Error al actualizar estado');
    } finally {
      this.safeDetectChanges();
    }
  }

  async downloadInvoicePdf(inv: Invoice) {
    this.pdfLoading = true;
    this.safeDetectChanges();
    try {
      const res = await firstValueFrom(this.financeService.getInvoiceDetails(inv.id!));
      let fullInv = inv;
      if (res?.invoice) {
        const rawInv: any = res.invoice;
        const subtotal = Number(rawInv.subtotal || 0);
        const taxAmount = Number(rawInv.tax_amount || rawInv.taxAmount || 0);
        const taxRate = subtotal > 0 && taxAmount > 0 ? Math.round((taxAmount / subtotal) * 100) : 0;
        const total = Number(rawInv.total_amount || rawInv.total || 0);
        const paid = Number(rawInv.paid_amount !== undefined ? rawInv.paid_amount : (inv.paid_amount ?? inv.paidAmount ?? 0));
        const pending = Number(rawInv.pending_amount !== undefined ? rawInv.pending_amount : (inv.pending_amount ?? inv.pendingAmount ?? Math.max(0, total - paid)));

        fullInv = {
          ...inv,
          id: String(rawInv.id),
          clientId: rawInv.client_id || inv.clientId,
          clientName: rawInv.client_name || inv.clientName,
          clientCompany: rawInv.company || inv.clientCompany,
          clientEmail: rawInv.email || inv.clientEmail,
          notes: rawInv.notes !== null && rawInv.notes !== undefined ? rawInv.notes : (inv.notes || ''),
          issuedAt: rawInv.issue_date ? rawInv.issue_date.split('T')[0] : inv.issuedAt,
          dueAt: rawInv.due_date ? rawInv.due_date.split('T')[0] : inv.dueAt,
          subtotal: subtotal,
          taxRate: taxRate,
          taxAmount: taxAmount,
          total: total,
          total_amount: total,
          paidAmount: paid,
          paid_amount: paid,
          pendingAmount: pending,
          pending_amount: pending,
          payments: rawInv.payments || inv.payments || [],
          items: (rawInv.items || []).map((it: any) => {
             const qty = Number(it.quantity || 1);
             const uPrice = Number(it.unit_price || it.unitPrice || 0);
             return {
               ...it,
               serviceName: it.service_name || it.description || it.serviceName || 'Servicio',
               description: it.description !== it.service_name ? (it.description || '') : '',
               quantity: qty,
               unitPrice: uPrice,
               subtotal: Number(it.total_price || it.subtotal || (qty * uPrice))
             };
          })
        };
      }
      await this.pdfService.downloadInvoicePdf(fullInv);
    } catch (e) {
      console.error(e);
      alert('Error descargando PDF');
    } finally { 
      this.pdfLoading = false; 
      this.safeDetectChanges();
    }
  }

  getCountByStatus(statuses: string[]): number {
    return this.displayedInvoices.filter(i => statuses.includes(i.status)).length;
  }

  async downloadCascadeInvoices(statuses: string[]) {
    const toDownload = this.displayedInvoices.filter(i => statuses.includes(i.status));
    if (toDownload.length === 0) {
      alert('No hay cuentas de cobro con el/los estado(s) seleccionado(s) para descargar en la lista actual.');
      return;
    }
    this.batchLoading = true;
    this.batchLoadingStatus = statuses.length > 1 ? 'Ambas' : statuses[0];
    this.safeDetectChanges();

    try {
      for (let i = 0; i < toDownload.length; i++) {
        const inv = toDownload[i];
        this.batchProgressText = `Descargando (${i + 1}/${toDownload.length})...`;
        this.safeDetectChanges();

        try {
          const res = await firstValueFrom(this.financeService.getInvoiceDetails(inv.id!));
          let fullInv = inv;
          if (res?.invoice) {
            const rawInv: any = res.invoice;
            const subtotal = Number(rawInv.subtotal || 0);
            const taxAmount = Number(rawInv.tax_amount || rawInv.taxAmount || 0);
            const taxRate = subtotal > 0 && taxAmount > 0 ? Math.round((taxAmount / subtotal) * 100) : 0;
            const total = Number(rawInv.total_amount || rawInv.total || 0);
            const paid = Number(rawInv.paid_amount !== undefined ? rawInv.paid_amount : (inv.paid_amount ?? inv.paidAmount ?? 0));
            const pending = Number(rawInv.pending_amount !== undefined ? rawInv.pending_amount : (inv.pending_amount ?? inv.pendingAmount ?? Math.max(0, total - paid)));

            fullInv = {
              ...inv,
              id: String(rawInv.id),
              clientId: rawInv.client_id || inv.clientId,
              clientName: rawInv.client_name || inv.clientName,
              clientCompany: rawInv.company || inv.clientCompany,
              clientEmail: rawInv.email || inv.clientEmail,
              notes: rawInv.notes !== null && rawInv.notes !== undefined ? rawInv.notes : (inv.notes || ''),
              issuedAt: rawInv.issue_date ? rawInv.issue_date.split('T')[0] : inv.issuedAt,
              dueAt: rawInv.due_date ? rawInv.due_date.split('T')[0] : inv.dueAt,
              subtotal: subtotal,
              taxRate: taxRate,
              taxAmount: taxAmount,
              total: total,
              total_amount: total,
              paidAmount: paid,
              paid_amount: paid,
              pendingAmount: pending,
              pending_amount: pending,
              payments: rawInv.payments || inv.payments || [],
              items: (rawInv.items || []).map((it: any) => {
                 const qty = Number(it.quantity || 1);
                 const uPrice = Number(it.unit_price || it.unitPrice || 0);
                 return {
                   ...it,
                   serviceName: it.service_name || it.description || it.serviceName || 'Servicio',
                   description: it.description !== it.service_name ? (it.description || '') : '',
                   quantity: qty,
                   unitPrice: uPrice,
                   subtotal: Number(it.total_price || it.subtotal || (qty * uPrice))
                 };
              })
            };
          }
          await this.pdfService.downloadInvoicePdf(fullInv);
          await new Promise(r => setTimeout(r, 600));
        } catch (e) {
          console.error(`Error descargando factura #${inv.id}:`, e);
        }
      }
    } finally {
      this.batchLoading = false;
      this.batchLoadingStatus = '';
      this.batchProgressText = '';
      this.safeDetectChanges();
    }
  }

  async generatePreview() {
    if (!this.editingInvoice) return;
    this.pdfLoading = true;
    this.safeDetectChanges();
    try {
      this.recalcInvoice();
      const total = Number(this.editingInvoice.total || this.editingInvoice.total_amount || 0);
      const paid = Number(this.editingInvoice.paidAmount ?? this.editingInvoice.paid_amount ?? 0);
      const pending = Number(this.editingInvoice.pendingAmount ?? this.editingInvoice.pending_amount ?? Math.max(0, total - paid));
      const fullInv: Invoice = {
        ...(this.editingInvoice as Invoice),
        total: total,
        total_amount: total,
        paidAmount: paid,
        paid_amount: paid,
        pendingAmount: pending,
        pending_amount: pending
      };
      this.previewInvoiceTarget = fullInv;
      const url = await this.pdfService.downloadInvoicePdf(fullInv, 'bloburl');
      this.previewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url as string);
      this.showPdfPreview = true;
    } catch (err) {
      console.error(err);
    } finally {
      this.pdfLoading = false;
      this.safeDetectChanges();
    }
  }

  async downloadPreviewPdf() {
    if (this.showProposalModal || (!this.previewInvoiceTarget && !this.editingInvoice)) {
      await this.downloadSoftwareProposal();
      return;
    }
    if (!this.previewInvoiceTarget && !this.editingInvoice) return;
    const inv = this.previewInvoiceTarget || (this.editingInvoice as Invoice);
    const total = Number(inv.total || inv.total_amount || 0);
    const paid = Number(inv.paidAmount ?? inv.paid_amount ?? 0);
    const pending = Number(inv.pendingAmount ?? inv.pending_amount ?? Math.max(0, total - paid));
    const fullInv: Invoice = {
      ...inv,
      total: total,
      total_amount: total,
      paidAmount: paid,
      paid_amount: paid,
      pendingAmount: pending,
      pending_amount: pending
    };
    this.pdfLoading = true;
    this.safeDetectChanges();
    try {
      await this.pdfService.downloadInvoicePdf(fullInv, 'save');
    } catch (err) {
      console.error(err);
      alert('Error descargando PDF');
    } finally {
      this.pdfLoading = false;
      this.safeDetectChanges();
    }
  }

  printPreviewPdf() {
    const iframe = document.querySelector('iframe[src*="blob:"]') as HTMLIFrameElement;
    try {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        return;
      }
    } catch (e) {
      console.warn('Iframe print blocked, opening new window:', e);
    }
    if (this.previewInvoiceTarget || this.editingInvoice) {
      const inv = this.previewInvoiceTarget || (this.editingInvoice as Invoice);
      const total = Number(inv.total || inv.total_amount || 0);
      const paid = Number(inv.paidAmount ?? inv.paid_amount ?? 0);
      const pending = Number(inv.pendingAmount ?? inv.pending_amount ?? Math.max(0, total - paid));
      const fullInv: Invoice = {
        ...inv,
        total: total,
        total_amount: total,
        paidAmount: paid,
        paid_amount: paid,
        pendingAmount: pending,
        pending_amount: pending
      };
      this.pdfService.downloadInvoicePdf(fullInv, 'bloburl').then(url => {
        if (typeof url === 'string') {
          const win = window.open(url, '_blank');
          if (win) {
            win.addEventListener('load', () => {
              win.focus();
              win.print();
            });
          }
        }
      });
    }
  }

  closePreview() {
    this.showPdfPreview = false;
    this.previewPdfUrl = null;
    this.previewInvoiceTarget = null;
    this.safeDetectChanges();
  }

  // ─── HELPERS ───────────────────────────────
  formatCOP(v: number) { return this.financeService.formatCOP(v || 0); }

  formatCOPDisplay(v: number | null | undefined): string {
    const val = Math.max(0, Math.round(Number(v || 0)));
    const formatted = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(val);
    return `COP ${formatted}`;
  }

  getStatusClass(status: string): string {
    const st = String(status || '').toUpperCase();
    if (st === 'PAGADA' || st === 'PAGADO') {
      return this.isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
    if (st === 'PARCIAL' || st === 'ABONADA') {
      return this.isDark ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-300' : 'border-emerald-300 bg-emerald-100/60 text-emerald-800';
    }
    if (st === 'ENVIADA' || st === 'ENVIADO') {
      return this.isDark ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-700';
    }
    if (st === 'VENCIDA' || st === 'VENCIDO') {
      return this.isDark ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-rose-200 bg-rose-50 text-rose-700';
    }
    return this.isDark ? 'border-neutral-700 bg-neutral-800 text-neutral-300' : 'border-neutral-200 bg-neutral-100 text-neutral-700';
  }

  getCategoryClass(cat?: string) {
    if (!cat) return 'bg-neutral-500/20 text-neutral-400';
    const map: Record<string, string> = {
      desarrollo: 'bg-blue-500/20 text-blue-400',
      diseño: 'bg-purple-500/20 text-purple-400',
      marketing: 'bg-orange-500/20 text-orange-400',
      consultoria: 'bg-teal-500/20 text-teal-400',
      otro: 'bg-neutral-500/20 text-neutral-400',
    };
    return map[cat] || 'bg-neutral-500/20 text-neutral-400';
  }
}

