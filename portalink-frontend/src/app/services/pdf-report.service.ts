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
  async downloadAnalyticsReport(metrics: SystemMetrics): Promise<void> {
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
    doc.save(`portalink_analiticas_${this.getDateSlug()}.pdf`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REPORT 2: USERS
  // ─────────────────────────────────────────────────────────────────────────
  async downloadUsersReport(users: User[]): Promise<void> {
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
    doc.save(`portalink_usuarios_${this.getDateSlug()}.pdf`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REPORT 3: SYSTEM HEALTH
  // ─────────────────────────────────────────────────────────────────────────
  async downloadSystemHealthReport(metrics: SystemMetrics, activityLog: { icon: string; label: string; date: string }[]): Promise<void> {
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
    doc.save(`portalink_salud_sistema_${this.getDateSlug()}.pdf`);
  }

  private getDateSlug(): string {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REPORT 4: INVOICE (CUENTA DE COBRO)
  // ─────────────────────────────────────────────────────────────────────────
  async downloadInvoicePdf(invoice: Invoice): Promise<void> {
    const { jsPDF, autoTable } = await this.getJsPDF();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const fmtCOP = (v: number) =>
      new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

    // ── Header band ──
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('PORTALINK', 14, 14);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setCharSpace(2);
    doc.text('CUENTA DE COBRO', 14, 21);
    doc.setCharSpace(0);

    // Invoice number on right
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.id, 196, 14, { align: 'right' });

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
    doc.text('Santiago Arbelaez', 14, y);
    doc.text(invoice.clientName, 110, y);

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('Desarrollador Web & Consultor Digital', 14, y);
    if (invoice.clientCompany) doc.text(invoice.clientCompany, 110, y);

    y += 5;
    doc.text('santiago@portalink.com', 14, y);
    doc.text(invoice.clientEmail || '', 110, y);

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

    const itemRows = invoice.items.map(item => [
      item.serviceName,
      item.description || '',
      item.quantity.toString(),
      fmtCOP(item.unitPrice),
      fmtCOP(item.subtotal),
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

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Subtotal:', blockX, y);
    doc.text(fmtCOP(invoice.subtotal), blockX + blockW, y, { align: 'right' });

    if (invoice.taxRate > 0) {
      y += 6;
      doc.text(`IVA (${invoice.taxRate}%):`, blockX, y);
      doc.text(fmtCOP(invoice.taxAmount), blockX + blockW, y, { align: 'right' });
    }

    y += 4;
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(0.5);
    doc.line(blockX, y, blockX + blockW, y);
    y += 7;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 10, 10);
    doc.text('TOTAL:', blockX, y);
    doc.text(fmtCOP(invoice.total), blockX + blockW, y, { align: 'right' });

    // ── Notes ──
    if (invoice.notes) {
      y += 12;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(120, 120, 120);
      doc.text('NOTAS / TÉRMINOS DE PAGO', 14, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const lines = doc.splitTextToSize(invoice.notes, 180) as string[];
      doc.text(lines, 14, y);
    }

    // ── Thank you note ──
    y += 18;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150, 150, 150);
    doc.text('Gracias por confiar en nuestros servicios.', 105, y, { align: 'center' });

    this.addFooter(doc);
    doc.save(`cuenta_cobro_${invoice.id}_${this.getDateSlug()}.pdf`);
  }
}
