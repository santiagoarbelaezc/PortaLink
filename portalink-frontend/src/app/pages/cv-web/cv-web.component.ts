import { Component, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import * as AOS from 'aos';
import { ContactComponent } from '../../components/contact/contact.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { PortfolioConfigService } from '../../services/portfolio-config.service';
import { ImageOptimizerService } from '../../services/image-optimizer.service';

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  detailUrl?: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
  current?: boolean;
}

export interface CertificationItem {
  title: string;
  issuer: string;
  completedDate: string;
  credentialId: string;
  verificationUrl: string;
}

@Component({
  selector: 'app-cv-web',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ContactComponent,
    FooterComponent
  ],
  templateUrl: './cv-web.component.html',
  styleUrls: ['./cv-web.component.css']
})
export class CvWebComponent implements OnInit, AfterViewInit, OnDestroy {
  portfolioConfigService = inject(PortfolioConfigService);
  private imageOptimizer = inject(ImageOptimizerService);

  // Profile
  fullName = 'Santiago Arbelaez Contreras';
  rawProfileImage = 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1789425677/IMG_9187_1_vu1dnh.jpg';
  imageError = false;

  getProfileImage(): string {
    return this.imageOptimizer.getCachedOrOriginal(this.rawProfileImage, 950, 0.72);
  }

  get profileImage(): string {
    return this.getProfileImage();
  }

  // Credential copied toast
  copiedId: string | null = null;
  copiedToast = false;

  // ══════════════════ CARRUSEL DE PROYECTOS (SCROLL MOUSE & DRAG) ══════════════════
  activeProjectIndex = 0;
  private isWheeling = false;
  isDragging = false;
  private dragStartX = 0;
  private dragDeltaX = 0;

  projects: ProjectItem[] = [
    {
      id: 'camascotas',
      title: 'CamasCotas',
      description: 'E-commerce completo de muebles y accesorios para mascotas con catálogo interactivo, carrito, panel de administración y diseño responsive.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786973369/proyecto-camascotas_qcmstp.png',
      liveUrl: 'https://camascotas.com/',
      detailUrl: '/proyecto/camascotas'
    },
    {
      id: 'catalogodigital',
      title: 'Catálogo Digital Plaxtilíneas',
      description: 'Plataforma de catálogo digital con IA integrada. Gestión de productos, inventario multi-línea y reportes analíticos automáticos.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786974186/proyecto-catalogodigital_obh8fu.png',
      liveUrl: 'https://catalogoplaxtilineas.com/catalogo',
      detailUrl: '/proyecto/catalogodigital'
    },
    {
      id: 'districol',
      title: 'Colchones Districol',
      description: 'E-commerce de colchones y descanso con catálogo completo, ficha técnica de producto, consulta directa por WhatsApp e integración con inventario en vivo.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786973662/proyecto-colchonesdistricol_wlk93j.png',
      liveUrl: 'https://colchonesdistricol.com/',
      detailUrl: '/proyecto/districol'
    },
    {
      id: 'sysmicon',
      title: 'Sysmicon',
      description: 'Plataforma directiva con dashboard de cotizaciones, diseños CAD, galería visual inmersiva y comunidad de profesionales.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786973770/proyecto-sysmiconarquitectura_jxfoju.png',
      liveUrl: 'https://sysmicon.com/',
      detailUrl: '/proyecto/sysmicon'
    },
    {
      id: 'espumasyplasticos',
      title: 'Espumas y Plásticos',
      description: 'Plataforma de comercio electrónico e industrial para soluciones integrales en espumas, plásticos y materiales sintéticos.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786974630/espumas-principal_dzeur0.jpg',
      liveUrl: 'https://espumasyplasticos.com/',
      detailUrl: '/proyecto/espumasyplasticos'
    },
    {
      id: 'plaxtilineas',
      title: 'Plaxtilíneas',
      description: 'Portal institucional e industrial para la exhibición y cotización de líneas de bolsas, empaques y plásticos biodegradables.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786974786/plaxtilineas_lh6eaz.png',
      liveUrl: 'https://plaxtilineas.com/',
      detailUrl: '/proyecto/plaxtilineas'
    },
    {
      id: 'tiendaintima',
      title: 'Tienda Íntima',
      description: 'Comercio electrónico para moda íntima con asistente IA para gestión de productos, análisis de ventas e inventario en tiempo real.',
      image: 'https://res.cloudinary.com/doxdjiyvi/image/upload/v1786973903/proyecto-tiendaintima_oahugr.png',
      liveUrl: 'https://tiendaintima.com/',
      detailUrl: '/proyecto/tiendaintima'
    }
  ];

  // ══════════════════ EXPERIENCIA PROFESIONAL ══════════════════
  experiences: ExperienceItem[] = [
    {
      role: 'Desarrollador de Software',
      company: 'Grupo Empresarial E&P',
      period: '2025 – Presente',
      location: 'Armenia, Quindío',
      description: 'Desarrollo e implementación de plataformas de software para operaciones corporativas. Creación de interfaces de alto desempeño en Angular y microservicios backend, garantizando integridad en bases de datos relacionales y buenas prácticas de ingeniería.',
      current: true
    },
    {
      role: 'Desarrollador de Software',
      company: 'Sysmicon Arquitectos',
      period: '2026 – Presente',
      location: 'Medellín, Antioquia',
      description: 'Desarrollo de módulos digitales para gestión de proyectos de ingeniería y diseño arquitectónico. Integración de paneles de control, optimización de flujos de cotizaciones y soporte de infraestructura tecnológica.',
      current: true
    },
    {
      role: 'Desarrollador de Software e Infraestructura Digital',
      company: 'Empresas de Colombia (Freelance)',
      period: '8 Meses de Experiencia',
      location: 'Colombia (Remoto)',
      description: 'Acompañamiento tecnológico a múltiples marcas y empresas colombianas. Conceptualización, construcción de plataformas e-commerce, sitios interactivos y despliegue de infraestructura en la nube.',
      current: false
    }
  ];

  // ══════════════════ CERTIFICACIONES FREEDCODECAMP ══════════════════
  certifications: CertificationItem[] = [
    {
      title: 'Back End Development and APIs',
      issuer: 'freeCodeCamp',
      completedDate: 'Junio 2025',
      credentialId: 'santiagoarbelaezc-bedaa',
      verificationUrl: 'https://www.freecodecamp.org/certification/santiagoarbelaezc/back-end-development-and-apis'
    },
    {
      title: 'JavaScript Algorithms and Data Structures',
      issuer: 'freeCodeCamp',
      completedDate: 'Junio 2025',
      credentialId: 'santiagoarbelaezc-jaads',
      verificationUrl: 'https://www.freecodecamp.org/certification/santiagoarbelaezc/javascript-algorithms-and-data-structures-v8'
    },
    {
      title: 'Scientific Computing with Python',
      issuer: 'freeCodeCamp',
      completedDate: 'Junio 2025',
      credentialId: 'santiagoarbelaezc-scwp',
      verificationUrl: 'https://www.freecodecamp.org/certification/santiagoarbelaezc/scientific-computing-with-python-v7'
    }
  ];

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: false,
        offset: 50
      });
      setTimeout(() => AOS.refresh(), 300);
    }
  }

  ngOnDestroy(): void {}

  // ══════════════════ CONTROLES DEL CARRUSEL ══════════════════
  get cardCount(): number {
    return this.projects.length;
  }

  nextProject(): void {
    if (this.activeProjectIndex < this.projects.length - 1) {
      this.activeProjectIndex++;
    } else {
      this.activeProjectIndex = 0;
    }
  }

  prevProject(): void {
    if (this.activeProjectIndex > 0) {
      this.activeProjectIndex--;
    } else {
      this.activeProjectIndex = this.projects.length - 1;
    }
  }

  selectProject(index: number): void {
    this.activeProjectIndex = index;
  }

  // Scroll con la rueda del mouse exclusivamente a los lados (horizontal)
  onWheel(event: WheelEvent): void {
    // Si el usuario hace scroll vertical (arriba o abajo), permitir scroll nativo de la página y NO mover el carrusel
    if (Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
      return;
    }

    // Scroll lateral con rueda o touchpad (deltaX)
    if (Math.abs(event.deltaX) < 15) return;

    if (this.isWheeling) return;

    if (event.deltaX > 20) {
      if (this.activeProjectIndex < this.projects.length - 1) {
        event.preventDefault();
        this.isWheeling = true;
        this.nextProject();
        setTimeout(() => { this.isWheeling = false; }, 320);
      }
    } else if (event.deltaX < -20) {
      if (this.activeProjectIndex > 0) {
        event.preventDefault();
        this.isWheeling = true;
        this.prevProject();
        setTimeout(() => { this.isWheeling = false; }, 320);
      }
    }
  }

  // Arrastre con el mouse (Mouse Drag)
  onMouseDown(e: MouseEvent): void {
    if ((e.target as HTMLElement)?.closest('a, button')) return;
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragDeltaX = 0;
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    this.dragDeltaX = e.clientX - this.dragStartX;
  }

  onMouseUp(): void {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.dragDeltaX < -45) {
      this.nextProject();
    } else if (this.dragDeltaX > 45) {
      this.prevProject();
    }
    this.dragDeltaX = 0;
  }

  // Touch Swipe para dispositivos táctiles
  private touchStartX = 0;
  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
  }

  onTouchEnd(e: TouchEvent): void {
    const diff = e.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        this.nextProject();
      } else {
        this.prevProject();
      }
    }
  }

  // ══════════════════ CLIPBOARD DE CERTIFICACIONES ══════════════════
  copyCredentialId(id: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id).then(() => {
        this.copiedId = id;
        this.copiedToast = true;
        setTimeout(() => {
          this.copiedToast = false;
          this.copiedId = null;
        }, 3000);
      });
    }
  }

  onImageError(): void {
    this.imageError = true;
  }

  scrollTo(id: string): void {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
