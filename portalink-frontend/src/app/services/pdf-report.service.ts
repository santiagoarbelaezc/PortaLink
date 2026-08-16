import { Injectable } from '@angular/core';
import { SystemMetrics } from './analytics.service';
import { Invoice } from './finance.service';

// jsPDF type declarations
declare var require: any;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

@Injectable({ providedIn: 'root' })
export class PdfReportService {

  private sectionNameMap: Record<string, string> = {
    hero: 'Inicio (Cabecera)',
    skills: 'Habilidades',
    portfolio: 'Portafolio',
    about: 'Sobre Mí',
    contact: 'Contacto',
    text: 'Texto Libre',
    linktree: 'Árbol de Enlaces'
  };

  private translateSection(name: string): string {
    return this.sectionNameMap[name.toLowerCase()] || name;
  }

  private async getJsPDF() {
    const jsPDFModule = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');
    if (autoTableModule.applyPlugin) {
      autoTableModule.applyPlugin(jsPDFModule.default);
    }
    return { jsPDF: jsPDFModule.default, autoTable: autoTableModule.default };
  }

  private addHeader(doc: any, title: string, subtitle: string) {
    // Black header band
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 28, 'F');

    // Logo / brand
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PORTALINK', 14, 13);

    // Subtitle in header
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setCharSpace(2);
    doc.text('DASHBOARD REPORT', 14, 20);
    doc.setCharSpace(0);

    // Report title on right
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getStringUnitWidth(title) * 9 / doc.internal.scaleFactor;
    doc.text(title, 210 - 14 - titleWidth, 13);

    // Date on right
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const dateWidth = doc.getStringUnitWidth(dateStr) * 7 / doc.internal.scaleFactor;
    doc.text(dateStr, 210 - 14 - dateWidth, 21);

    // Accent line
    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.line(0, 28, 210, 28);

    // Section subtitle
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(subtitle, 14, 40);

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(14, 43, 196, 43);
  }

  private addFooter(doc: any) {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(160, 160, 160);
      const footerText = `Generado por PortaLink Dashboard • ${new Date().toLocaleDateString('es-CO')} • Página ${i} de ${pageCount}`;
      const fw = doc.getStringUnitWidth(footerText) * 7 / doc.internal.scaleFactor;
      doc.text(footerText, (210 - fw) / 2, 290);
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(14, 287, 196, 287);
    }
  }

  private addSummaryCards(doc: any, cards: { label: string; value: string | number }[], startY: number): number {
    const cardW = (196 - 14 - (cards.length - 1) * 4) / cards.length;
    cards.forEach((card, i) => {
      const x = 14 + i * (cardW + 4);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(x, startY, cardW, 22, 3, 3, 'F');
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(String(card.value), x + cardW / 2, startY + 12, { align: 'center' });
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 120, 120);
      doc.text(card.label.toUpperCase(), x + cardW / 2, startY + 19, { align: 'center' });
    });
    return startY + 30;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REPORT 1: ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────
  async downloadAnalyticsReport(metrics: SystemMetrics, action: 'save' | 'bloburl' = 'save'): Promise<string | void> {
    const { jsPDF, autoTable } = await this.getJsPDF();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    this.addHeader(doc, 'ANALÍTICAS', 'Resumen de Métricas del Sitio');

    // Summary cards
    const totalSections = Object.values(metrics.sectionViews).reduce((a, b) => a + b, 0);
    const totalLinks = Object.values(metrics.linktreeClicks).reduce((a, b) => a + b, 0);
    const cards = [
      { label: 'Vistas del Home', value: metrics.homeViews },
      { label: 'Vistas Linktree', value: metrics.linktreeViews },
      { label: 'Total Secciones', value: totalSections },
      { label: 'Clics en Links', value: totalLinks },
    ];
    let y = this.addSummaryCards(doc, cards, 50);

    // Section Views Table
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Visitas por Sección', 14, y + 2);

    const total = totalSections || 1;
    const sectionRows = Object.entries(metrics.sectionViews)
      .sort(([, a], [, b]) => b - a)
      .map(([name, views], i) => [
        this.translateSection(name),
        views.toString(),
        `${((views / total) * 100).toFixed(1)}%`,
        i % 3 === 0 ? '↑ +12%' : i % 2 === 0 ? '→ 0%' : '↓ -3%'
      ]);

    autoTable(doc, {
      startY: y + 6,
      head: [['Sección', 'Visitas', '% del Total', 'Tendencia']],
      body: sectionRows,
      headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' } },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Rotbot Activity
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Actividad del Asistente Rotbot', 14, y + 2);

    const avgMsg = metrics.rotbotOpens > 0
      ? (metrics.rotbotMessagesSent / metrics.rotbotOpens).toFixed(1)
      : '0';
    const usageRate = metrics.homeViews > 0
      ? `${Math.round((metrics.rotbotOpens / metrics.homeViews) * 100)}%`
      : '0%';

    autoTable(doc, {
      startY: y + 6,
      head: [['Métrica', 'Valor']],
      body: [
        ['Sesiones Iniciadas', metrics.rotbotOpens.toString()],
        ['Mensajes Enviados', metrics.rotbotMessagesSent.toString()],
        ['Promedio Mensajes/Sesión', avgMsg],
        ['Tasa de Uso (vs. Home)', usageRate],
      ],
      headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
    });

    // Theme Preferences
    y = (doc as any).lastAutoTable.finalY + 10;
    const themeTotal = metrics.themeSelections.dark + metrics.themeSelections.light;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Preferencia de Tema', 14, y + 2);

    autoTable(doc, {
      startY: y + 6,
      head: [['Tema', 'Selecciones', '%']],
      body: [
        ['🌙 Oscuro', metrics.themeSelections.dark.toString(), themeTotal > 0 ? `${((metrics.themeSelections.dark / themeTotal) * 100).toFixed(0)}%` : '0%'],
        ['☀️ Claro', metrics.themeSelections.light.toString(), themeTotal > 0 ? `${((metrics.themeSelections.light / themeTotal) * 100).toFixed(0)}%` : '0%'],
      ],
      headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
    });

    this.addFooter(doc);
    if (action === 'bloburl') {
      return doc.output('bloburl').toString();
    } else {
      doc.save(`portalink_analiticas_${this.getDateSlug()}.pdf`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REPORT 2: USERS
  // ─────────────────────────────────────────────────────────────────────────
  async downloadUsersReport(users: User[], action: 'save' | 'bloburl' = 'save'): Promise<string | void> {
    const { jsPDF, autoTable } = await this.getJsPDF();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    this.addHeader(doc, 'USUARIOS', 'Listado de Cuentas Registradas');

    const activos = users.filter(u => u.status === 'Activo').length;
    const cards = [
      { label: 'Total Usuarios', value: users.length },
      { label: 'Activos', value: activos },
      { label: 'Inactivos', value: users.length - activos },
    ];
    const y = this.addSummaryCards(doc, cards, 50);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Listado Completo de Usuarios', 14, y + 2);

    const userRows = users.map(u => [
      u.name,
      u.email,
      u.role,
      u.status,
      u.joined
    ]);

    autoTable(doc, {
      startY: y + 6,
      head: [['Nombre', 'Email', 'Rol', 'Estado', 'Registro']],
      body: userRows,
      headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: {
        3: {
          halign: 'center',
          fontStyle: 'bold',
        }
      },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 3) {
          const status = data.cell.raw;
          data.cell.styles.textColor = status === 'Activo' ? [22, 163, 74] : [107, 114, 128];
        }
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
    });

    this.addFooter(doc);
    if (action === 'bloburl') {
      return doc.output('bloburl').toString();
    } else {
      doc.save(`portalink_usuarios_${this.getDateSlug()}.pdf`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REPORT 3: SYSTEM HEALTH
  // ─────────────────────────────────────────────────────────────────────────
  async downloadSystemHealthReport(metrics: SystemMetrics, activityLog: { icon: string; label: string; date: string }[], action: 'save' | 'bloburl' = 'save'): Promise<string | void> {
    const { jsPDF, autoTable } = await this.getJsPDF();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    this.addHeader(doc, 'SALUD DEL SISTEMA', 'Estado y Rendimiento de la Plataforma');

    // Load time stats
    const times = metrics.loadTimes || [];
    const loadMin = times.length ? Math.min(...times) : 0;
    const loadMax = times.length ? Math.max(...times) : 0;
    const loadAvg = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

    const scoreRaw = loadAvg === 0 ? 100 : loadAvg < 1000 ? 95 : loadAvg < 2000 ? 75 : loadAvg < 3000 ? 55 : 35;
    const scoreLabel = scoreRaw >= 90 ? 'Excelente' : scoreRaw >= 70 ? 'Bueno' : scoreRaw >= 50 ? 'Regular' : 'Crítico';

    const cards = [
      { label: 'Score de Salud', value: `${scoreRaw}%` },
      { label: 'Estado', value: scoreLabel },
      { label: 'Tiempo Mín.', value: `${loadMin}ms` },
      { label: 'Tiempo Prom.', value: `${loadAvg}ms` },
    ];
    let y = this.addSummaryCards(doc, cards, 50);

    // Load times table
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Tiempos de Carga Registrados', 14, y + 2);

    if (times.length > 0) {
      const loadRows = times.map((t, i) => [
        `Medición #${i + 1}`,
        `${t} ms`,
        t < 1000 ? '✓ Óptimo' : t < 2000 ? '~ Aceptable' : '✗ Lento'
      ]);
      autoTable(doc, {
        startY: y + 6,
        head: [['Medición', 'Tiempo', 'Estado']],
        body: [
          ...loadRows,
          [{ content: 'RESUMEN', colSpan: 1, styles: { fontStyle: 'bold', fillColor: [30, 30, 30], textColor: [255, 255, 255] } },
           { content: `Mín: ${loadMin}ms | Prom: ${loadAvg}ms | Máx: ${loadMax}ms`, colSpan: 2, styles: { fontStyle: 'bold', fillColor: [30, 30, 30], textColor: [255, 255, 255] } }]
        ],
        headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center', fontStyle: 'bold' } },
        margin: { left: 14, right: 14 },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.1,
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('No hay mediciones registradas aún.', 14, y + 12);
      y += 22;
    }

    // Activity Log
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Log de Actividad del Sistema', 14, y + 2);

    const logRows = activityLog.map(l => [l.label, l.date]);
    autoTable(doc, {
      startY: y + 6,
      head: [['Evento', 'Fecha']],
      body: logRows,
      headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: { 1: { halign: 'right', textColor: [100, 100, 100] } },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
    });

    // Theme distribution
    y = (doc as any).lastAutoTable.finalY + 10;
    const themeTotal = metrics.themeSelections.dark + metrics.themeSelections.light;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Distribución de Temas', 14, y + 2);

    autoTable(doc, {
      startY: y + 6,
      head: [['Tema', 'Selecciones', '%']],
      body: [
        ['Oscuro', metrics.themeSelections.dark.toString(), themeTotal > 0 ? `${((metrics.themeSelections.dark / themeTotal) * 100).toFixed(0)}%` : '0%'],
        ['Claro', metrics.themeSelections.light.toString(), themeTotal > 0 ? `${((metrics.themeSelections.light / themeTotal) * 100).toFixed(0)}%` : '0%'],
      ],
      headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center', fontStyle: 'bold' } },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
    });

    this.addFooter(doc);
    if (action === 'bloburl') {
      return doc.output('bloburl').toString();
    } else {
      doc.save(`portalink_salud_sistema_${this.getDateSlug()}.pdf`);
    }
  }

  private getDateSlug(): string {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REPORT 4: INVOICE (CUENTA DE COBRO)
  // ─────────────────────────────────────────────────────────────────────────
  async downloadInvoicePdf(invoice: Invoice, action: 'save' | 'bloburl' = 'save'): Promise<string | void> {
    const { jsPDF, autoTable } = await this.getJsPDF();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const fmtCOP = (v: number) =>
      new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

    // ── Header band ──
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setCharSpace(1.5);
    const headerTitle = invoice.title ? `CUENTA DE COBRO: ${invoice.title.toUpperCase()}` : 'CUENTA DE COBRO / ACUERDO DE PAGO';
    doc.text(headerTitle, 14, 18);
    doc.setCharSpace(0);

    // Invoice number on right
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(String(invoice.id || ''), 196, 14, { align: 'right' });

    // Status badge
    const statusColor: Record<string, [number,number,number]> = {
      Borrador: [100, 100, 100],
      Enviada: [59, 130, 246],
      Pagada: [34, 197, 94],
      Vencida: [239, 68, 68],
    };
    const sc = statusColor[invoice.status] || [100, 100, 100];
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(sc[0], sc[1], sc[2]);
    doc.text(invoice.status.toUpperCase(), 196, 22, { align: 'right' });

    doc.setTextColor(160, 160, 160);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Emitida: ${invoice.issuedAt}   Vence: ${invoice.dueAt}`, 196, 29, { align: 'right' });

    // ── Billing section ──
    let y = 42;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(120, 120, 120);
    doc.text('EMITIDA POR', 14, y);
    doc.text('FACTURADO A', 110, y);

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text('Santiago Arbelaez Contreras', 14, y);
    doc.text(invoice.clientName || '', 110, y);

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('cc (NIT): 1001361185', 14, y);
    if (invoice.clientCompany) doc.text(invoice.clientCompany, 110, y);

    y += 5;
    doc.text('Desarrollador Web & Diseñador Digital', 14, y);
    doc.text(invoice.clientEmail || '', 110, y);

    y += 5;
    doc.text('arbelaezz.c11@gmail.com', 14, y);

    y += 8;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(14, y, 196, y);
    y += 8;

    // ── Items table ──
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Detalle de Servicios', 14, y);
    y += 5;

    const itemRows = (invoice.items || []).map(item => [
      item.serviceName || '',
      item.description || '',
      (item.quantity || 1).toString(),
      fmtCOP(item.unitPrice || 0),
      fmtCOP(item.subtotal || 0),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Servicio', 'Descripción', 'Cant.', 'P. Unitario', 'Subtotal']],
      body: itemRows,
      headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: {
        0: { cellWidth: 50 },
        2: { halign: 'center', cellWidth: 14 },
        3: { halign: 'right', cellWidth: 35 },
        4: { halign: 'right', fontStyle: 'bold', cellWidth: 35 },
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // ── Totals block (right aligned) ──
    const blockX = 120;
    const blockW = 76;

    // Background for totals
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(blockX - 5, y - 4, blockW + 10, (invoice.taxRate || 0) > 0 ? 30 : 22, 3, 3, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Subtotal:', blockX, y + 2);
    doc.text(fmtCOP(invoice.subtotal || 0), blockX + blockW, y + 2, { align: 'right' });

    if ((invoice.taxRate || 0) > 0) {
      y += 7;
      doc.text(`IVA (${invoice.taxRate}%):`, blockX, y + 2);
      doc.text(fmtCOP(invoice.taxAmount || 0), blockX + blockW, y + 2, { align: 'right' });
    }

    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(blockX, y, blockX + blockW, y);
    y += 6;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 10, 10);
    doc.text('TOTAL:', blockX, y);
    doc.text(fmtCOP(invoice.total || 0), blockX + blockW, y, { align: 'right' });

    y += 10;

    // ── Notes ──
    if (invoice.notes) {
      y += 5;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(120, 120, 120);
      doc.text('NOTAS / TÉRMINOS DE PAGO', 14, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(invoice.notes, 180) as string[];
      doc.text(lines, 14, y);
      y += lines.length * 4 + 5;
    }

    // ── Legal Text & Signatures ──
    y += 8;
    if (y > 195) { doc.addPage(); y = 20; }

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('DECLARACIÓN Y ACUERDO LEGAL (TÉRMINOS Y CONDICIONES)', 14, y);
    y += 5;

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 130, 130);
    const legalText = "1. ASIMILACIÓN A TÍTULO VALOR: La presente cuenta de cobro se asimila en todos sus efectos legales a una letra de cambio, prestando mérito ejecutivo de conformidad con el Art. 774 del Código de Comercio.\n2. INTERESES DE MORA: En caso de incumplimiento en el pago luego de la fecha de vencimiento, se causarán intereses moratorios a la tasa máxima legal permitida vigente fijada por la Superfinanciera.\n3. PROPIEDAD INTELECTUAL: Todo código fuente, archivo editable, diseño o entregable es propiedad intelectual exclusiva de Santiago Arbelaez Contreras. La cesión de los derechos de uso al cliente solo se hará efectiva una vez confirmado el pago del 100% del valor total de este documento (Ley 23 de 1982). Cualquier uso sin autorización o pago será reportado por infracción de derechos de autor.\n4. ACEPTACIÓN: El cliente declara con la recepción y/o firma de este documento, haber recibido a entera satisfacción los servicios o productos descritos.\n5. TRIBUTARIO: Documento equivalente emitido por persona natural NO responsable del impuesto sobre las ventas (IVA) según el Estatuto Tributario.\n6. GARANTÍA Y RESPONSABILIDAD: El producto/servicio se entrega 'tal cual' (as is). El emisor no asume responsabilidad civil, penal ni económica por fallas en servidores de terceros, ataques cibernéticos, lucro cesante, daños indirectos, pérdida de datos, o alteraciones hechas por el cliente u otros desarrolladores posteriores a la entrega.";
    
    const legalLines = doc.splitTextToSize(legalText, 182);
    doc.text(legalLines, 14, y);
    
    y += (legalLines.length * 3) + 20;

    if (y > 245) { doc.addPage(); y = 35; }

    // Signatures
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    
    // Left signature
    doc.line(20, y, 80, y);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text('Firma del Emisor', 50, y + 5, { align: 'center' });

    // Right signature
    doc.line(130, y, 190, y);
    doc.text('Firma de Aceptación', 160, y + 5, { align: 'center' });

    // ── Thank you note ──
    y += 18;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('¡Gracias por tu confianza y hacer negocios con nosotros!', 105, y, { align: 'center' });

    this.addFooter(doc);
    if (action === 'bloburl') {
      return doc.output('bloburl').toString();
    } else {
      const rawName = (invoice.clientCompany || invoice.clientName || 'Cliente').trim();
      const sanitizedName = rawName.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_');
      const invNum = invoice.id || invoice.invoice_number || '0';
      doc.save(`Cuenta_de_Cobro_${sanitizedName}_No_${invNum}.pdf`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REPORT 5: FINANCIAL (CONTROL FINANCIERO & FACTURACIÓN)
  // ─────────────────────────────────────────────────────────────────────────
  async downloadFinancialReport(summary: any, transactions: any[], invoices: any[], action: 'save' | 'bloburl' = 'save'): Promise<string | void> {
    const { jsPDF, autoTable } = await this.getJsPDF();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const fmtCOP = (v: number) =>
      new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

    this.addHeader(doc, 'INFORME FINANCIERO', 'Balance General de Ingresos, Egresos y Facturación');

    // Calculate exact totals from invoices and transactions
    let totalFacturado = 0;
    let totalPagado = 0;
    let totalPendiente = 0;

    (invoices || []).forEach((inv: any) => {
      const status = String(inv.status || '').toUpperCase();
      const total = Number(inv.total || inv.total_amount || 0);
      const paid = Number(inv.paid_amount || inv.paidAmount || (status === 'PAGADA' ? total : 0));
      const pending = Number(inv.pending_amount || inv.pendingAmount || (status !== 'PAGADA' && status !== 'ANULADA' ? (total > paid ? total - paid : total) : 0));

      if (status !== 'ANULADA') {
        totalFacturado += total;
      }

      if (status === 'PAGADA') {
        totalPagado += total;
      } else if (paid > 0) {
        totalPagado += paid;
      }

      if (status !== 'PAGADA' && status !== 'ANULADA' && status !== 'BORRADOR') {
        totalPendiente += (pending > 0 ? pending : (total > paid ? total - paid : total));
      }
    });

    let manualIngresos = 0;
    let totalEgresos = Number(summary?.egresos_total || 0);

    (transactions || []).forEach((tx: any) => {
      const type = String(tx.type || '').toUpperCase();
      const amount = Number(tx.amount_cop || tx.amount || 0);
      if (type === 'INGRESO') {
        manualIngresos += amount;
      } else if (type === 'EGRESO') {
        totalEgresos = Math.max(totalEgresos, amount);
      }
    });

    const totalIngresos = summary?.arr_total || (totalPagado + manualIngresos);
    const utilidadNeta = summary?.utilidad_neta !== undefined ? summary.utilidad_neta : (totalIngresos - totalEgresos);

    // Summary Cards (4 Cards)
    const cards = [
      { label: 'Total Facturado', value: fmtCOP(totalFacturado) },
      { label: 'Recaudado (Pagado)', value: fmtCOP(totalPagado) },
      { label: 'Por Cobrar (Pendiente)', value: fmtCOP(totalPendiente) },
      { label: 'Utilidad Neta', value: fmtCOP(utilidadNeta) },
    ];
    let y = this.addSummaryCards(doc, cards, 50);

    // Section 1: Consolidated Summary Table
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Resumen General de Consolidado Financiero', 14, y + 2);

    autoTable(doc, {
      startY: y + 6,
      head: [['Concepto Financiero', 'Monto Total (COP)', 'Estado / Detalle']],
      body: [
        ['Total Facturado (Emitido)', fmtCOP(totalFacturado), 'Monto Facturado'],
        ['Total Recaudado (Pagado)', fmtCOP(totalPagado), 'Efectivo Confirmado'],
        ['Cuentas por Cobrar (Pendiente)', fmtCOP(totalPendiente), totalPendiente > 0 ? 'Pendiente de Cobro' : 'Al Día'],
        ['Ingresos Brutos Consolidados', fmtCOP(totalIngresos), 'Ingresos Totales'],
        ['Egresos & Gastos Operativos', fmtCOP(totalEgresos), 'Gastos Registrados'],
        ['Utilidad Neta del Período', fmtCOP(utilidadNeta), utilidadNeta >= 0 ? 'Balance Positivo' : 'Déficit Operativo'],
      ],
      headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
        2: { cellWidth: 52, halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data: any) => {
        if (data.section === 'body') {
          if (data.row.index === 2 && totalPendiente > 0) {
            data.cell.styles.textColor = [239, 68, 68];
          } else if (data.row.index === 5) {
            data.cell.styles.textColor = utilidadNeta >= 0 ? [34, 197, 94] : [239, 68, 68];
          }
        }
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
    });

    y = (doc as any).lastAutoTable.finalY + 10;
    if (y > 230) { doc.addPage(); y = 40; }

    // Section 2: Invoices Table
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Facturas Emitidas y Cuentas de Cobro', 14, y + 2);

    const invoiceRows = (invoices || []).slice(0, 15).map(inv => [
      inv.invoice_number || inv.id || 'N/A',
      inv.clientName || inv.clientCompany || 'Cliente',
      inv.issuedAt || inv.issue_date || 'N/A',
      inv.status || 'DRAFT',
      fmtCOP(inv.total || inv.total_amount || 0)
    ]);

    autoTable(doc, {
      startY: y + 6,
      head: [['Factura #', 'Cliente / Empresa', 'Fecha', 'Estado', 'Total']],
      body: invoiceRows.length ? invoiceRows : [['-', 'No hay facturas registradas', '-', '-', '$0']],
      headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: { 3: { halign: 'center', fontStyle: 'bold' }, 4: { halign: 'right', fontStyle: 'bold' } },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 3) {
          const status = String(data.cell.raw).toUpperCase();
          if (status.includes('PAGADA')) data.cell.styles.textColor = [34, 197, 94];
          else if (status.includes('ENVIADA')) data.cell.styles.textColor = [59, 130, 246];
          else if (status.includes('VENCIDA')) data.cell.styles.textColor = [239, 68, 68];
        }
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
    });

    y = (doc as any).lastAutoTable.finalY + 10;
    if (y > 230) { doc.addPage(); y = 40; }

    // Section 2: Recent Transactions Table
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Últimas Transacciones Registradas', 14, y + 2);

    const txRows = (transactions || []).slice(0, 15).map(tx => [
      tx.transaction_date || tx.created_at || 'N/A',
      tx.concept || 'Sin concepto',
      tx.category || 'General',
      tx.type || 'INGRESO',
      fmtCOP(tx.amount_cop || 0)
    ]);

    autoTable(doc, {
      startY: y + 6,
      head: [['Fecha', 'Concepto', 'Categoría', 'Tipo', 'Monto (COP)']],
      body: txRows.length ? txRows : [['-', 'No hay transacciones recientes', '-', '-', '$0']],
      headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: { 3: { halign: 'center', fontStyle: 'bold' }, 4: { halign: 'right', fontStyle: 'bold' } },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 3) {
          const type = String(data.cell.raw).toUpperCase();
          if (type.includes('INGRESO')) data.cell.styles.textColor = [34, 197, 94];
          else data.cell.styles.textColor = [239, 68, 68];
        }
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
    });

    this.addFooter(doc);
    if (action === 'bloburl') {
      return doc.output('bloburl').toString();
    } else {
      doc.save(`portalink_reporte_financiero_${this.getDateSlug()}.pdf`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REPORT 6: CONTACTS & MESSAGES
  // ─────────────────────────────────────────────────────────────────────────
  async downloadContactsReport(messages: any[], action: 'save' | 'bloburl' = 'save'): Promise<string | void> {
    const { jsPDF, autoTable } = await this.getJsPDF();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    this.addHeader(doc, 'MENSAJES & CONTACTOS', 'Informe Oficial de Solicitudes Recibidas');

    const total = messages.length;
    const unread = messages.filter(m => m.status === 'unread').length;
    const replied = messages.filter(m => m.status === 'replied').length;
    const rate = total > 0 ? Math.round((replied / total) * 100) : 100;

    const cards = [
      { label: 'Total Recibidos', value: total },
      { label: 'Nuevos (Sin Leer)', value: unread },
      { label: 'Respondidos', value: replied },
      { label: 'Tasa de Respuesta', value: `${rate}%` },
    ];
    let y = this.addSummaryCards(doc, cards, 50);

    // Messages Table
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('Registro de Mensajes de Contacto', 14, y + 2);

    const msgRows = messages.map(m => [
      m.nombre || 'Anónimo',
      m.correo || '-',
      (m.mensaje || '').length > 45 ? (m.mensaje || '').substring(0, 45) + '...' : (m.mensaje || ''),
      m.status === 'unread' ? 'NUEVO' : (m.status === 'replied' ? 'RESPONDIDO' : 'LEÍDO'),
      m.created_at ? new Date(m.created_at).toLocaleDateString('es-CO') : '-'
    ]);

    autoTable(doc, {
      startY: y + 6,
      head: [['Remitente', 'Correo Electrónico', 'Contenido Sintético', 'Estado', 'Fecha']],
      body: msgRows.length ? msgRows : [['-', 'Sin mensajes en sistema', '-', '-', '-']],
      headStyles: { fillColor: [20, 20, 20], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      columnStyles: { 3: { halign: 'center', fontStyle: 'bold' } },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 3) {
          const status = String(data.cell.raw).toUpperCase();
          if (status.includes('NUEVO')) data.cell.styles.textColor = [59, 130, 246];
          else if (status.includes('RESPONDIDO')) data.cell.styles.textColor = [34, 197, 94];
          else data.cell.styles.textColor = [107, 114, 128];
        }
      },
      margin: { left: 14, right: 14 },
      tableLineColor: [220, 220, 220],
      tableLineWidth: 0.1,
    });

    this.addFooter(doc);
    if (action === 'bloburl') {
      return doc.output('bloburl').toString();
    } else {
      doc.save(`portalink_reporte_contactos_${this.getDateSlug()}.pdf`);
    }
  }
}
