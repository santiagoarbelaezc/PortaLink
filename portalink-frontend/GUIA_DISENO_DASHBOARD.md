# 🎨 Sistema de Diseño y Arquitectura de Dashboard

Esta guía contiene la especificación completa, arquitectura de interfaz, tokens de diseño, componentes HTML/CSS y ejemplos de código necesarios para replicar exactamente el estilo visual y funcional del **Dashboard de Administración** en cualquier proyecto web (Angular, React, Vue, Svelte, Next.js o HTML/CSS/JS nativo).

---

## 📑 Tabla de Contenidos

1. [Filosofía y Lenguaje Visual](#1-filosofía-y-lenguaje-visual)
2. [Dependencias, Fuentes e Iconografía](#2-dependencias-fuentes-e-iconografía)
3. [Design Tokens y Variables CSS](#3-design-tokens-y-variables-css)
4. [Configuración de Tailwind CSS (Opcional)](#4-configuración-de-tailwind-css-opcional)
5. [Estructura del Layout Maestro (Master Shell)](#5-estructura-del-layout-maestro-master-shell)
6. [Sidebar Lateral Colapsable](#6-sidebar-lateral-colapsable)
7. [Header Superior Sticky](#7-header-superior-sticky)
8. [Page Top Bar y Breadcrumbs](#8-page-top-bar-y-breadcrumbs)
9. [Tarjetas de Métricas (Stat Cards) & Bento Grid](#9-tarjetas-de-métricas-stat-cards--bento-grid)
10. [Barra de Controles, Pestañas y Filtros](#10-barra-de-controles-pestañas-y-filtros)
11. [Tabla Moderna por Filas (Card Rows)](#11-tabla-moderna-por-filas-card-rows)
12. [Workspace de Dos Columnas (Dual Panel)](#12-workspace-de-dos-columnas-dual-panel)
13. [Modales, Formularios y Dropzone](#13-modales-formularios-y-dropzone)
14. [Plantilla Completa Copy-Paste (Vanilla HTML + CSS + JS)](#14-plantilla-completa-copy-paste-vanilla-html--css--js)
15. [Guía de Integración con Frameworks (React, Vue, Angular)](#15-guía-de-integración-con-frameworks-react-vue-angular)

---

## 1. Filosofía y Lenguaje Visual

El diseño se basa en un concepto **Ultra Minimalist Monochrome / High-Contrast Dark Accent**:
- **Sidebar:** Negro puro profundo (`#0a0a0a` / `#000000`) con detalles en gris translúcido y microinteracciones suaves.
- **Área de Contenido:** Fondo gris neutro frío (`#f4f5f7`), tarjetas blanco puro (`#ffffff`) elevadas con bordes sutiles de 1px (`#e2e8f0`) y sombras de contacto ultra suaves.
- **Tipografía:** Moderna, geométrica y con tracking ligeramente negativo (`letter-spacing: -0.02em`). Se usa la familia **Inter Tight** o **Inter**.
- **Acentos Funcionales:** Pequeños toques de color según el contexto (verde esmeralda para estado en línea/salud, azul cielo para selección activa, rojo rubí para alertas/eliminar, y ámbar para advertencias).
- **Sensación Premium:** Animaciones tipo spring/cubic-bezier, bordes redondeados (`10px` a `20px`), estados colapsables suaves y botones de acción limpios.

---

## 2. Dependencias, Fuentes e Iconografía

Incluye en el `<head>` de tu archivo `index.html` las siguientes fuentes de Google Fonts:

```html
<!-- Tipografía Principal: Inter Tight -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300..800;1,300..800&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

<!-- Iconos: Material Symbols Rounded -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">
```

En tu CSS global:

```css
/* Configuración de Material Symbols Rounded */
.material-symbols-rounded {
  font-family: 'Material Symbols Rounded', sans-serif;
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  font-variation-settings: 'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24;
}
```

---

## 3. Design Tokens y Variables CSS

Copia y pega estas variables en tu archivo de estilos principal (`styles.css`, `variables.css` o dentro de `:root`):

```css
:root {
  /* Dimensiones del Layout */
  --sidebar-w: 240px;
  --sidebar-w-collapsed: 64px;
  --header-h: 74px;
  --transition-smooth: 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  /* Paleta Base */
  --color-dark-bg: #0a0a0a;
  --color-dark-border: #1a1a1a;
  --color-page-bg: #f4f5f7;
  --color-card-bg: #ffffff;

  /* Texto */
  --color-text-main: #0f172a;
  --color-text-muted: #64748b;
  --color-text-light: #94a3b8;
  --color-text-inverse: #ffffff;

  /* Bordes */
  --border-subtle: #e2e8f0;
  --border-hover: #cbd5e1;

  /* Acentos Semánticos */
  --accent-blue: #0284c7;
  --accent-blue-bg: #e0f2fe;
  --accent-green: #15803d;
  --accent-green-dot: #22c55e;
  --accent-green-bg: #f0fdf4;
  --accent-green-border: #bbf7d0;
  --accent-red: #ef4444;
  --accent-red-hover: #dc2626;
  --accent-red-bg: rgba(239, 68, 68, 0.12);
  --accent-amber: #f59e0b;

  /* Sombras */
  --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.02);
  --shadow-card: 0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02);
  --shadow-card-hover: 0 8px 30px -4px rgba(15, 23, 42, 0.06);
  --shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-pill: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);

  /* Radios de borde */
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-pill: 999px;
}

/* Tipografía base y scrollbar */
body, html {
  margin: 0;
  padding: 0;
  background-color: var(--color-page-bg);
  color: var(--color-text-main);
  font-family: 'Inter Tight', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

* {
  box-sizing: border-box;
}
```

---

## 4. Configuración de Tailwind CSS (Opcional)

Si utilizas **Tailwind CSS**, añade esta extensión en tu `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,jsx,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Tight', 'Inter', 'sans-serif'],
      },
      colors: {
        ink: {
          50:  '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#313131',
          950: '#0a0a0a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## 5. Estructura del Layout Maestro (Master Shell)

El diseño utiliza una envoltura `.dash-shell` que coordina el **Sidebar fijo** y el **Contenedor de Contenido (`.dash-content`)** con desplazamiento independiente.

```html
<div class="dash-shell" id="dashShell">
  
  <!-- 1. SIDEBAR FIJO -->
  <aside class="dash-sidebar">
    <!-- Contenido del sidebar -->
  </aside>

  <!-- 2. CONTENEDOR PRINCIPAL -->
  <div class="dash-content">
    
    <!-- 2.1 Header Sticky -->
    <header class="dash-header">
      <!-- Contenido del header -->
    </header>

    <!-- 2.2 Cuerpo de página -->
    <main class="dash-main animate-fade-in">
      <!-- Vistas: Estadísticas, Tablas, Formularios, etc. -->
    </main>

    <!-- 2.3 Footer -->
    <footer class="dash-footer">
      <div class="dash-footer-left">
        <span class="dash-footer-bar"></span>
        <span>Nombre del Proyecto</span>
      </div>
      <span>v1.0 · 2026</span>
    </footer>

  </div>

</div>
```

### CSS Maestro de Layout

```css
/* ── Shell global ── */
.dash-shell {
  display: flex;
  min-height: 100vh;
  background: var(--color-page-bg);
  position: relative;
}

/* ── Content Area ── */
.dash-content {
  flex: 1;
  margin-left: var(--sidebar-w);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left var(--transition-smooth);
}

.dash-shell.sidebar-collapsed .dash-content {
  margin-left: var(--sidebar-w-collapsed);
}

/* ── Main Body Container ── */
.dash-main {
  flex: 1;
  padding: 24px 32px 40px;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

/* Animación de entrada */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Footer ── */
.dash-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  font-size: 0.75rem;
  color: var(--color-text-light);
  border-top: 1px solid var(--border-subtle);
  background: #ffffff;
}

.dash-footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dash-footer-bar {
  width: 3px;
  height: 12px;
  background: #000000;
  border-radius: 2px;
}
```

---

## 6. Sidebar Lateral Colapsable

El sidebar es el elemento icónico de esta interfaz:
1. **Logo con isotipo blanco en cuadrado redondeado**.
2. **Botón flotante de alternancia (`.sidebar-toggle`)** ubicado exactamente en el borde derecho (`right: -14px`), flotando sobre el contenido.
3. **Secciones con títulos en mayúsculas sutiles**.
4. **Ítems de navegación con estado activo** y un punto indicador blanco a la derecha.
5. **Menús desplegables / Accordion** con badge de conteo y flecha rotativa.
6. **Tarjeta de perfil inferior (`.sidebar-user-card`)** y botón de logout con hover rojo.

### HTML del Sidebar

```html
<aside class="dash-sidebar">
  
  <!-- Logo / Brand -->
  <div class="sidebar-brand">
    <div class="sidebar-logo">
      <span class="material-symbols-rounded">dashboard</span>
    </div>
    <span class="sidebar-brand-text">Mi Empresa</span>
  </div>

  <!-- Botón Toggle Flotante -->
  <button class="sidebar-toggle" id="sidebarToggle" title="Alternar menú lateral" aria-label="Alternar menú lateral">
    <span class="material-symbols-rounded" id="toggleIcon">chevron_left</span>
  </button>

  <!-- Navegación -->
  <nav class="sidebar-nav">
    <p class="sidebar-nav-label">Navegación</p>

    <!-- Ítem Activo -->
    <a href="#" class="sidebar-nav-item sidebar-nav-item--active">
      <span class="material-symbols-rounded sidebar-nav-icon">dashboard</span>
      <span class="sidebar-nav-label-text">Inicio</span>
      <span class="sidebar-nav-active-dot"></span>
    </a>

    <!-- Ítem Estándar -->
    <a href="#" class="sidebar-nav-item">
      <span class="material-symbols-rounded sidebar-nav-icon">inventory_2</span>
      <span class="sidebar-nav-label-text">Inventario</span>
    </a>

    <a href="#" class="sidebar-nav-item">
      <span class="material-symbols-rounded sidebar-nav-icon">analytics</span>
      <span class="sidebar-nav-label-text">Analíticas</span>
    </a>

    <p class="sidebar-nav-label" style="margin-top: 14px;">Gestión</p>

    <!-- Menú Desplegable (Dropdown / Accordion) -->
    <div class="sidebar-dropdown-group is-open" id="sectionsGroup">
      <button type="button" class="sidebar-nav-item sidebar-dropdown-trigger" id="dropdownTrigger">
        <span class="material-symbols-rounded sidebar-nav-icon">folder_open</span>
        <span class="sidebar-nav-label-text">Secciones</span>
        <div class="sidebar-dropdown-controls">
          <span class="dropdown-count-tag">3</span>
          <div class="dropdown-chevron-pill is-rotated">
            <span class="material-symbols-rounded">expand_more</span>
          </div>
        </div>
      </button>

      <!-- Submenú -->
      <div class="sidebar-submenu">
        <a href="#" class="sidebar-submenu-item sidebar-submenu-item--active">
          <span class="submenu-dot"></span>
          <span class="material-symbols-rounded submenu-icon">category</span>
          <span class="sidebar-nav-label-text">Categorías</span>
        </a>
        <a href="#" class="sidebar-submenu-item">
          <span class="submenu-dot"></span>
          <span class="material-symbols-rounded submenu-icon">layers</span>
          <span class="sidebar-nav-label-text">Líneas Secundarias</span>
        </a>
        <a href="#" class="sidebar-submenu-item">
          <span class="submenu-dot"></span>
          <span class="material-symbols-rounded submenu-icon">storefront</span>
          <span class="sidebar-nav-label-text">Proveedores</span>
        </a>
      </div>
    </div>
  </nav>

  <!-- Espaciador flexible -->
  <div class="sidebar-spacer"></div>

  <!-- Tarjeta de Usuario inferior -->
  <div class="sidebar-user-card">
    <div class="sidebar-avatar">MM</div>
    <div class="sidebar-user-info">
      <span class="sidebar-username">Mateo Moreno</span>
      <span class="sidebar-role">Administrador</span>
    </div>
  </div>

  <!-- Botón Salir -->
  <button class="sidebar-logout">
    <span class="material-symbols-rounded">logout</span>
    <span class="sidebar-nav-label-text">Cerrar sesión</span>
  </button>

</aside>
```

### CSS del Sidebar

```css
/* ── Sidebar Shell ── */
.dash-sidebar {
  width: var(--sidebar-w);
  min-height: 100vh;
  background: var(--color-dark-bg);
  display: flex;
  flex-direction: column;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 200;
  transition: width var(--transition-smooth);
  border-right: 1px solid var(--color-dark-border);
  overflow: visible; /* Clave: permite que el toggle sobresalga del borde */
}

/* Estado Colapsado */
.dash-shell.sidebar-collapsed .dash-sidebar {
  width: var(--sidebar-w-collapsed);
}

/* ── Brand ── */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
  min-height: 72px;
}

.sidebar-logo {
  width: 36px;
  height: 36px;
  background: #ffffff;
  color: #0a0a0a;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-brand-text {
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
  white-space: nowrap;
  opacity: 1;
  transition: opacity var(--transition-smooth);
}

.dash-shell.sidebar-collapsed .sidebar-brand-text {
  opacity: 0;
  pointer-events: none;
}

/* ── Botón Toggle Flotante ── */
.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #18181b;
  border: 1.5px solid #2e2e33;
  border-radius: 50%;
  color: #e4e4e7;
  cursor: pointer;
  position: absolute;
  top: 22px;
  right: -14px;
  z-index: 250;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-pill);
}

.sidebar-toggle:hover {
  background: #27272a;
  border-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;
  transform: scale(1.15);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.12);
}

.sidebar-toggle:active {
  transform: scale(0.92);
}

/* ── Navegación ── */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 16px 10px;
  gap: 2px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav-label {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.25);
  padding: 0 8px;
  margin: 0 0 8px;
  white-space: nowrap;
  overflow: hidden;
  transition: opacity var(--transition-smooth);
}

.dash-shell.sidebar-collapsed .sidebar-nav-label {
  opacity: 0;
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  color: rgba(255, 255, 255, 0.55);
  transition: all 0.18s ease;
  position: relative;
  white-space: nowrap;
  width: 100%;
  min-height: 42px;
  text-decoration: none;
}

.sidebar-nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
}

.sidebar-nav-item--active {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.sidebar-nav-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.sidebar-nav-label-text {
  font-size: 0.82rem;
  font-weight: 600;
  flex: 1;
  opacity: 1;
  transition: opacity var(--transition-smooth);
  overflow: hidden;
  text-overflow: ellipsis;
}

.dash-shell.sidebar-collapsed .sidebar-nav-label-text {
  opacity: 0;
  width: 0;
}

.sidebar-nav-active-dot {
  width: 6px;
  height: 6px;
  background: #ffffff;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Menú Desplegable (Dropdown) ── */
.sidebar-dropdown-group {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.sidebar-dropdown-trigger {
  justify-content: space-between;
}

.sidebar-dropdown-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.dash-shell.sidebar-collapsed .sidebar-dropdown-controls {
  display: none;
}

.dropdown-count-tag {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dropdown-chevron-pill {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.45);
  transition: all 0.22s ease;
}

.dropdown-chevron-pill.is-rotated {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  transform: rotate(180deg);
}

.sidebar-submenu {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 4px 0 4px 16px;
  margin: 2px 0 6px 12px;
  border-left: 1.5px solid rgba(255, 255, 255, 0.1);
}

.dash-shell.sidebar-collapsed .sidebar-submenu {
  display: none;
}

.sidebar-submenu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.18s ease;
}

.sidebar-submenu-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}

.sidebar-submenu-item--active {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.submenu-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  transition: all 0.18s ease;
}

.sidebar-submenu-item--active .submenu-dot {
  background: var(--accent-blue) !important;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.8);
  transform: scale(1.4);
}

.sidebar-submenu-item--active .submenu-icon {
  color: var(--accent-blue) !important;
  opacity: 1 !important;
}

/* ── User Card Inferior ── */
.sidebar-spacer {
  flex: 1;
}

.sidebar-user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin: 0 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  transition: all var(--transition-smooth);
}

.dash-shell.sidebar-collapsed .sidebar-user-card {
  padding: 8px;
  justify-content: center;
}

.sidebar-avatar {
  width: 32px;
  height: 32px;
  background: #ffffff;
  color: #0a0a0a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
  flex-shrink: 0;
}

.sidebar-user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dash-shell.sidebar-collapsed .sidebar-user-info {
  display: none;
}

.sidebar-username {
  font-size: 0.78rem;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
}

.sidebar-role {
  font-size: 0.66rem;
  color: rgba(255, 255, 255, 0.4);
}

.sidebar-logout {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  margin: 8px 10px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.18s ease;
  width: calc(100% - 20px);
}

.sidebar-logout:hover {
  background: var(--accent-red-bg);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.dash-shell.sidebar-collapsed .sidebar-logout {
  justify-content: center;
  padding: 10px;
}
```

---

## 7. Header Superior Sticky

El header se mantiene fijo arriba mientras el usuario se desplaza, ofreciendo:
- Alternador de sidebar para pantallas pequeñas o acción rápida.
- Píldora de estado del sistema activo (`.dash-status-pill`) con animación de pulsación verde (`pulse-green`).
- Chip de avatar y botón de salida.

```html
<header class="dash-header">
  
  <div class="dash-header-left">
    <button class="header-toggle-btn" id="headerToggleBtn" title="Alternar menú">
      <span class="material-symbols-rounded">menu</span>
    </button>
    <span class="dash-brand">Panel de Administración</span>
  </div>

  <div class="dash-header-right">
    <!-- Píldora de Estado en Línea -->
    <div class="dash-status-pill">
      <span class="dash-status-dot"></span>
      <span>Sistema Activo</span>
    </div>

    <!-- Chip de Usuario -->
    <div class="dash-user-chip">
      <div class="dash-avatar-mini">MM</div>
      <span>Mateo Moreno</span>
    </div>

    <!-- Botón Salir -->
    <button class="dash-logout-btn">
      <span class="material-symbols-rounded">logout</span>
      <span>Salir</span>
    </button>
  </div>

</header>
```

```css
.dash-header {
  height: var(--header-h);
  background: #ffffff;
  border-bottom: 1px solid #e8eaed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 100;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.dash-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.dash-brand {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.02em;
}

.header-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: #f4f5f7;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.18s ease;
}

.header-toggle-btn:hover {
  background: #0a0a0a;
  border-color: #0a0a0a;
  color: #ffffff;
  transform: translateY(-1px);
}

.dash-header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* ── Píldora de Estado ── */
.dash-status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 16px;
  background: var(--accent-green-bg);
  border: 1px solid var(--accent-green-border);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-green);
}

.dash-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-green-dot);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

.dash-user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px 6px 7px;
  background: #f4f5f7;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1e293b;
}

.dash-avatar-mini {
  width: 32px;
  height: 32px;
  background: #0a0a0a;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 800;
}

.dash-logout-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: #ffffff;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.18s ease;
}

.dash-logout-btn:hover {
  background: #0a0a0a;
  color: #ffffff;
  border-color: #0a0a0a;
  transform: translateY(-1px);
}
```

---

## 8. Page Top Bar y Breadcrumbs

En cada sección del dashboard, se coloca una barra superior con migas de pan y botones de acción primaria:

```html
<section class="page-top-bar">
  
  <div class="page-top-left">
    <!-- Icono distintivo en tarjeta oscura -->
    <div class="page-title-icon">
      <span class="material-symbols-rounded">inventory_2</span>
    </div>
    <div>
      <div class="page-breadcrumb">
        <a href="#" class="breadcrumb-link">Dashboard</a>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">Gestión de Inventario</span>
      </div>
      <h1 class="page-title">Inventario de Productos</h1>
    </div>
  </div>

  <div class="page-top-actions">
    <!-- Botón recargar / sinc con animación spin opcional -->
    <button class="btn-action-icon" title="Sincronizar">
      <span class="material-symbols-rounded">sync</span>
    </button>
    
    <!-- Contador informativo -->
    <div class="header-count-badge">
      <span class="count-num">248</span>
      <span class="count-label">productos registrados</span>
    </div>

    <!-- Botón Primario Negro -->
    <button class="btn-action-primary">
      <span class="material-symbols-rounded">add</span>
      <span>Nuevo Registro</span>
    </button>
  </div>

</section>
```

```css
.page-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.page-top-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-title-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #0f172a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
}

.page-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}

.breadcrumb-link {
  color: var(--color-text-muted);
  text-decoration: none;
}

.breadcrumb-link:hover {
  color: var(--color-text-main);
  text-decoration: underline;
}

.breadcrumb-sep {
  color: #cbd5e1;
}

.breadcrumb-current {
  color: var(--color-text-main);
  font-weight: 700;
}

.page-title {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.025em;
  margin: 0;
  line-height: 1.2;
}

.page-top-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-action-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1.5px solid var(--border-subtle);
  background: #ffffff;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-action-icon:hover {
  color: #0f172a;
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-1px);
}

.header-count-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #ffffff;
  border: 1.5px solid var(--border-subtle);
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.header-count-badge .count-num {
  color: var(--accent-blue);
}

.header-count-badge .count-label {
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 0.78rem;
}

.btn-action-primary {
  height: 42px;
  padding: 0 20px;
  background: #000000;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.btn-action-primary:hover {
  background: #27272a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
```

---

## 9. Tarjetas de Métricas (Stat Cards) & Bento Grid

### Fila de Tarjetas KPI

```html
<section class="dash-stats-grid">
  
  <div class="stat-card">
    <div class="stat-card-top">
      <span class="stat-card-label">Total Productos</span>
      <div class="stat-icon-wrap stat-icon--black">
        <span class="material-symbols-rounded">inventory_2</span>
      </div>
    </div>
    <p class="stat-number">1,248</p>
    <p class="stat-sub">Catálogo completo activo</p>
  </div>

  <div class="stat-card">
    <div class="stat-card-top">
      <span class="stat-card-label">Categorías</span>
      <div class="stat-icon-wrap stat-icon--red">
        <span class="material-symbols-rounded">category</span>
      </div>
    </div>
    <p class="stat-number">38</p>
    <p class="stat-sub">Líneas principales</p>
  </div>

  <div class="stat-card">
    <div class="stat-card-top">
      <span class="stat-card-label">Salud del Catálogo</span>
      <div class="stat-icon-wrap stat-icon--green">
        <span class="material-symbols-rounded">verified</span>
      </div>
    </div>
    <p class="stat-number">94.2%</p>
    <p class="stat-sub">Fichas con fotos y precios</p>
  </div>

  <div class="stat-card">
    <div class="stat-card-top">
      <span class="stat-card-label">Servidor</span>
      <div class="stat-icon-wrap stat-icon--black">
        <span class="material-symbols-rounded">bolt</span>
      </div>
    </div>
    <p class="stat-number" style="color:#15803d;">Online</p>
    <p class="stat-sub">Latencia promedio: 38ms</p>
  </div>

</section>
```

```css
.dash-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

@media (max-width: 1200px) {
  .dash-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .dash-stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  padding: 22px 24px;
  box-shadow: var(--shadow-card);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-card-hover);
}

.stat-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stat-card-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.stat-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon--black {
  background: #0a0a0a;
  color: #ffffff;
}

.stat-icon--red {
  background: #fee2e2;
  color: #dc2626;
}

.stat-icon--green {
  background: #dcfce7;
  color: #16a34a;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text-main);
  margin: 0 0 4px;
  line-height: 1;
}

.stat-sub {
  font-size: 0.76rem;
  color: var(--color-text-muted);
  margin: 0;
  font-weight: 500;
}
```

---

## 10. Barra de Controles, Pestañas y Filtros

Una única tarjeta integrada (`.prod-controls-card`) que reúne:
1. Pestañas tipo pastilla con insignias de cantidad y puntos de color temáticos.
2. Buscador con icono de lupa y botón para borrar texto.
3. Menús select con flecha personalizada (`expand_more`).

```html
<section class="prod-controls-card">
  
  <!-- Tira de pestañas por marca o estado -->
  <div class="brand-tabs-strip">
    <button class="brand-tab-pill is-active">
      <span>Todos los Registros</span>
      <span class="tab-badge">248</span>
    </button>
    
    <button class="brand-tab-pill">
      <span class="brand-dot" style="background:#10b981;"></span>
      <span>Línea A</span>
      <span class="tab-badge">120</span>
    </button>

    <button class="brand-tab-pill">
      <span class="brand-dot" style="background:#3b82f6;"></span>
      <span>Línea B</span>
      <span class="tab-badge">85</span>
    </button>

    <button class="brand-tab-pill">
      <span class="brand-dot" style="background:#f59e0b;"></span>
      <span>Línea C</span>
      <span class="tab-badge">43</span>
    </button>
  </div>

  <!-- Fila de filtros integrados -->
  <div class="filter-inputs-row">
    
    <!-- Input de Búsqueda -->
    <div class="search-input-box">
      <span class="material-symbols-rounded search-icon">search</span>
      <input type="text" placeholder="Buscar por nombre, código o categoría..." class="search-field">
    </div>

    <!-- Selects Desplegables -->
    <div class="filter-dropdown-group">
      <div class="select-wrapper">
        <select class="filter-select">
          <option value="">Todas las categorías</option>
          <option value="1">Categoría 1</option>
          <option value="2">Categoría 2</option>
        </select>
        <span class="material-symbols-rounded select-arrow">expand_more</span>
      </div>

      <div class="select-wrapper">
        <select class="filter-select">
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="az">Alfabético (A-Z)</option>
        </select>
        <span class="material-symbols-rounded select-arrow">expand_more</span>
      </div>
    </div>

  </div>

</section>
```

```css
.prod-controls-card {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  padding: 16px 20px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.brand-tabs-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.brand-tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.brand-tab-pill:hover {
  background: #f1f5f9;
  color: var(--color-text-main);
}

.brand-tab-pill.is-active {
  background: #0a0a0a;
  border-color: #0a0a0a;
  color: #ffffff;
}

.tab-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  color: inherit;
}

.brand-tab-pill.is-active .tab-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.brand-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.filter-inputs-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.search-input-box {
  flex: 1;
  min-width: 260px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  color: var(--color-text-light);
  font-size: 1.2rem;
  pointer-events: none;
}

.search-field {
  width: 100%;
  height: 42px;
  padding: 0 16px 0 42px;
  background: #f8fafc;
  border: 1.5px solid var(--border-subtle);
  border-radius: 12px;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--color-text-main);
  outline: none;
  transition: all 0.18s ease;
}

.search-field:focus {
  background: #ffffff;
  border-color: #0a0a0a;
  box-shadow: 0 0 0 3px rgba(10, 10, 10, 0.06);
}

.filter-dropdown-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.filter-select {
  height: 42px;
  padding: 0 34px 0 14px;
  background: #f8fafc;
  border: 1.5px solid var(--border-subtle);
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  color: var(--color-text-main);
  cursor: pointer;
  appearance: none;
  outline: none;
  transition: all 0.18s ease;
}

.filter-select:focus {
  background: #ffffff;
  border-color: #0a0a0a;
}

.select-arrow {
  position: absolute;
  right: 10px;
  color: var(--color-text-muted);
  pointer-events: none;
  font-size: 1.15rem;
}
```

---

## 11. Tabla Moderna por Filas (Card Rows)

En lugar de una tabla HTML clásica rígida (`<table>`), este diseño utiliza **tarjetas individuales horizontales (`.prod-row-card`)** que se leen impecablemente en cualquier resolución:

```html
<section class="prod-table-section">
  
  <!-- Encabezado de la lista -->
  <div class="prod-table-head">
    <div class="col-media">Imagen</div>
    <div class="col-main">Producto / Descripción</div>
    <div class="col-specs">Especificaciones</div>
    <div class="col-brand">Línea</div>
    <div class="col-actions">Acciones</div>
  </div>

  <!-- Lista de Filas -->
  <div class="prod-rows-list">
    
    <!-- Fila 1 -->
    <div class="prod-row-card">
      
      <!-- Miniatura -->
      <div class="row-media-box">
        <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=120" alt="Producto" class="row-product-img">
      </div>

      <!-- Info Principal -->
      <div class="row-main-col">
        <div class="row-title-wrap">
          <span class="row-product-title">Espuma de Alta Densidad D-30</span>
          <span class="badge-new-pill">Nuevo</span>
        </div>
        <div class="row-meta-wrap">
          <span class="row-category-text">Tapicería & Muebles</span>
          <span class="meta-dot">·</span>
          <span class="stock-badge-pill stock-badge-pill--ok">
            <span class="material-symbols-rounded stock-mini-icon">inventory_2</span>
            45 u. disponibles
          </span>
          <span class="meta-dot">·</span>
          <span class="row-price-text">$48,000 COP</span>
        </div>
      </div>

      <!-- Tags / Especificaciones -->
      <div class="row-specs-col">
        <span class="spec-pill">Poliuretano Flexible</span>
        <span class="spec-pill">Calibre 5cm</span>
      </div>

      <!-- Marca / Categoría -->
      <div class="row-brand-col">
        <span class="brand-tag-pill">Espumas & Plásticos</span>
      </div>

      <!-- Botones de Acción -->
      <div class="row-actions-col">
        <button class="row-action-btn" title="Editar registro">
          <span class="material-symbols-rounded">edit</span>
        </button>
        <button class="row-action-btn row-action-btn--delete" title="Eliminar registro">
          <span class="material-symbols-rounded">delete</span>
        </button>
      </div>

    </div>

  </div>

</section>
```

```css
.prod-table-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prod-table-head {
  display: grid;
  grid-template-columns: 60px 1.8fr 1.2fr 1fr 100px;
  gap: 16px;
  padding: 8px 18px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .prod-table-head {
    display: none;
  }
}

.prod-rows-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prod-row-card {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  padding: 12px 18px;
  display: grid;
  grid-template-columns: 60px 1.8fr 1.2fr 1fr 100px;
  gap: 16px;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: all 0.18s ease;
  cursor: pointer;
}

.prod-row-card:hover {
  border-color: #000000;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.row-media-box {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  background: #f1f5f9;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.row-product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.row-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.row-product-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.badge-new-pill {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 999px;
  background: #000000;
  color: #ffffff;
}

.row-meta-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.meta-dot {
  color: #cbd5e1;
}

.stock-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: #f1f5f9;
  color: #475569;
}

.stock-badge-pill--ok {
  background: #f0fdf4;
  color: #15803d;
}

.stock-mini-icon {
  font-size: 0.9rem;
}

.row-price-text {
  font-weight: 800;
  color: #0f172a;
}

.row-specs-col {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.spec-pill {
  padding: 4px 8px;
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #475569;
}

.brand-tag-pill {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0f172a;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 8px;
  display: inline-block;
}

.row-actions-col {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.row-action-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s ease;
}

.row-action-btn:hover {
  background: #000000;
  border-color: #000000;
  color: #ffffff;
}

.row-action-btn--delete:hover {
  background: var(--accent-red);
  border-color: var(--accent-red);
  color: #ffffff;
}

.row-action-btn .material-symbols-rounded {
  font-size: 1.1rem;
}
```

---

## 12. Workspace de Dos Columnas (Dual Panel)

Utilizado para gestores maestros (como Categorías y Subcategorías, o Departamentos y Roles). Consiste en dos tarjetas fijas (`height: calc(100vh - 210px)`) con listas de desplazamiento interno:

```html
<div class="cat-workspace-grid">
  
  <!-- Columna 1: Maestros / Categorías -->
  <div class="cat-card">
    
    <div class="cat-card-header">
      <div class="cat-card-title-group">
        <div class="cat-card-icon-pill">
          <span class="material-symbols-rounded">layers</span>
        </div>
        <h2 class="cat-card-title">Categorías Principales</h2>
      </div>
      <span class="cat-counter-chip">12 activas</span>
    </div>

    <!-- Barra de Añadido Rápido -->
    <div class="cat-add-bar">
      <div class="cat-input-group">
        <input type="text" placeholder="Nombre de nueva categoría..." class="cat-text-input">
        <button class="cat-btn-primary">
          <span class="material-symbols-rounded">add</span>
          <span>Añadir</span>
        </button>
      </div>
    </div>

    <!-- Buscador -->
    <div class="cat-search-bar">
      <div class="cat-search-wrapper">
        <span class="material-symbols-rounded cat-search-icon">search</span>
        <input type="text" placeholder="Filtrar categorías..." class="cat-search-input">
      </div>
    </div>

    <!-- Lista scrolleable con scroll estilizado -->
    <div class="cat-list-scroll">
      <!-- Elemento de lista interactivo -->
      <div class="cat-item-row is-selected">
        <div class="cat-item-left">
          <span class="cat-item-name">Espumas Industriales</span>
        </div>
        <div class="cat-item-actions">
          <span class="cat-sub-count">8 subcategorías</span>
          <button class="cat-mini-btn"><span class="material-symbols-rounded">edit</span></button>
          <button class="cat-mini-btn cat-mini-btn--del"><span class="material-symbols-rounded">delete</span></button>
        </div>
      </div>
    </div>

  </div>

  <!-- Columna 2: Detalles / Subcategorías -->
  <div class="cat-card">
    <div class="cat-card-header">
      <div class="cat-card-title-group">
        <div class="cat-card-icon-pill">
          <span class="material-symbols-rounded">subdirectory_arrow_right</span>
        </div>
        <h2 class="cat-card-title">Subcategorías de <span class="cat-card-subtitle-chip">Espumas Industriales</span></h2>
      </div>
      <span class="cat-counter-chip">8 ítems</span>
    </div>

    <!-- Contenido de la columna 2 -->
    <div class="cat-list-scroll">
      <!-- Lista de subelementos -->
    </div>
  </div>

</div>
```

```css
.cat-workspace-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .cat-workspace-grid {
    grid-template-columns: 1fr;
  }
}

.cat-card {
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  height: calc(100vh - 210px);
  min-height: 580px;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.cat-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-card-hover);
}

.cat-card-header {
  padding: 18px 22px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.cat-card-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cat-card-icon-pill {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #f1f5f9;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cat-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.cat-counter-chip {
  font-size: 0.72rem;
  font-weight: 700;
  background: #f8fafc;
  color: #475569;
  border: 1px solid var(--border-subtle);
  padding: 3px 10px;
  border-radius: 999px;
}

.cat-add-bar {
  padding: 14px 20px;
  background: #ffffff;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.cat-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cat-text-input {
  flex: 1;
  height: 42px;
  padding: 0 14px;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--color-text-main);
  background: #f8fafc;
  border: 1.5px solid var(--border-subtle);
  border-radius: 11px;
  outline: none;
  transition: all 0.18s ease;
}

.cat-text-input:focus {
  background: #ffffff;
  border-color: #0a0a0a;
  box-shadow: 0 0 0 3px rgba(10, 10, 10, 0.08);
}

.cat-btn-primary {
  height: 42px;
  padding: 0 18px;
  background: #0a0a0a;
  color: #ffffff;
  font-size: 0.83rem;
  font-weight: 700;
  font-family: inherit;
  border: none;
  border-radius: 11px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.18s ease;
}

.cat-btn-primary:hover {
  background: #27272a;
  transform: translateY(-1px);
}

.cat-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cat-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid transparent;
  transition: all 0.18s ease;
  cursor: pointer;
}

.cat-item-row:hover {
  background: #f1f5f9;
  border-color: var(--border-subtle);
}

.cat-item-row.is-selected {
  background: #ffffff;
  border-color: #0a0a0a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.cat-item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.cat-mini-btn {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: #ffffff;
  border: 1px solid var(--border-subtle);
  color: var(--color-text-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 4px;
}

.cat-mini-btn:hover {
  background: #0a0a0a;
  color: #ffffff;
}

.cat-mini-btn--del:hover {
  background: var(--accent-red);
  color: #ffffff;
}
```

---

## 13. Modales, Formularios y Dropzone

### 13.1 Modal de Formulario con Backdrop Blur

```html
<div class="prod-modal-overlay" id="mainModal">
  <div class="prod-modal-container">
    
    <!-- Header del Modal -->
    <div class="prod-modal-header">
      <div>
        <h3 class="modal-title">Editar Producto</h3>
        <p class="modal-subtitle">Modifica las especificaciones comerciales y multimedia</p>
      </div>
      <button class="modal-close-icon-btn">
        <span class="material-symbols-rounded">close</span>
      </button>
    </div>

    <!-- Cuerpo con Scroll y Formulario -->
    <div class="prod-modal-body">
      
      <!-- Fila Input -->
      <div class="form-group-field">
        <label class="modal-field-label">Nombre Comercial <span class="required-star">*</span></label>
        <input type="text" class="modal-input" placeholder="Ej: Rollo de Plástico Burbuja 1m x 50m">
      </div>

      <!-- Dropzone Drag & Drop -->
      <div class="file-dropzone-box">
        <div class="dropzone-content">
          <div class="dropzone-icon-circle">
            <span class="material-symbols-rounded">cloud_upload</span>
          </div>
          <p class="dropzone-main-text">Arrastra o haz clic para subir imágenes</p>
          <p class="dropzone-sub-text">PNG, JPG, WEBP (Máximo 5MB por imagen)</p>
          <span class="dropzone-browse-pill">
            <span class="material-symbols-rounded">folder_open</span>
            Explorar archivos
          </span>
        </div>
      </div>

    </div>

    <!-- Footer Fijo con Acciones -->
    <div class="prod-modal-footer">
      <button class="btn-modal-cancel">Cancelar</button>
      <button class="btn-modal-submit">Guardar Cambios</button>
    </div>

  </div>
</div>
```

```css
.prod-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.prod-modal-container {
  background: #ffffff;
  border-radius: 24px;
  width: 100%;
  max-width: 760px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-modal);
  animation: modalScale 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes modalScale {
  from { opacity: 0; transform: scale(0.96) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.prod-modal-header {
  padding: 24px 28px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text-main);
  margin: 0 0 2px;
}

.modal-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0;
}

.modal-close-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: #f8fafc;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-icon-btn:hover {
  background: #000000;
  color: #ffffff;
}

.prod-modal-body {
  padding: 24px 28px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-field-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
  display: block;
}

.required-star {
  color: var(--accent-red);
}

.modal-input {
  width: 100%;
  height: 44px;
  padding: 0 16px;
  background: #f8fafc;
  border: 1.5px solid var(--border-subtle);
  border-radius: 12px;
  font-size: 0.88rem;
  font-family: inherit;
  color: var(--color-text-main);
  outline: none;
  transition: all 0.18s ease;
}

.modal-input:focus {
  background: #ffffff;
  border-color: #000000;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
}

/* ── Dropzone ── */
.file-dropzone-box {
  border: 2px dashed #cbd5e1;
  background: #f8fafc;
  border-radius: 18px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-dropzone-box:hover {
  border-color: #000000;
  background: #ffffff;
}

.dropzone-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #ffffff;
  border: 1.5px solid var(--border-subtle);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  margin-bottom: 8px;
}

.dropzone-main-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 4px;
}

.dropzone-sub-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin: 0 0 12px;
}

.dropzone-browse-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #000000;
  color: #ffffff;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* ── Footer ── */
.prod-modal-footer {
  padding: 18px 28px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  background: #ffffff;
}

.btn-modal-cancel {
  padding: 10px 20px;
  background: #f8fafc;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.btn-modal-submit {
  padding: 10px 24px;
  background: #000000;
  border: none;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.btn-modal-submit:hover {
  opacity: 0.85;
}
```

---

## 14. Plantilla Completa Copy-Paste (Vanilla HTML + CSS + JS)

Guarda este código como `dashboard-demo.html` en cualquier proyecto para probar inmediatamente todo el ecosistema funcionando:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Profesional</title>

  <!-- Google Fonts: Inter Tight & Material Symbols -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">

  <style>
    :root {
      --sidebar-w: 240px;
      --sidebar-w-collapsed: 64px;
      --header-h: 70px;
      --transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      --bg-page: #f4f5f7;
      --bg-card: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border-subtle: #e2e8f0;
      --primary: #0a0a0a;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter Tight', sans-serif; background: var(--bg-page); color: var(--text-main); }

    .dash-shell { display: flex; min-height: 100vh; }

    /* SIDEBAR */
    .dash-sidebar {
      width: var(--sidebar-w);
      min-height: 100vh;
      background: var(--primary);
      position: fixed;
      top: 0; left: 0; z-index: 200;
      display: flex; flex-direction: column;
      transition: width var(--transition);
      border-right: 1px solid #1a1a1a;
      overflow: visible;
    }
    .dash-shell.sidebar-collapsed .dash-sidebar { width: var(--sidebar-w-collapsed); }

    .sidebar-brand {
      display: flex; align-items: center; gap: 12px;
      padding: 18px 16px; border-bottom: 1px solid rgba(255,255,255,0.08);
      min-height: var(--header-h);
    }
    .sidebar-logo {
      width: 36px; height: 36px; background: #fff; color: #0a0a0a;
      border-radius: 9px; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .sidebar-brand-text {
      color: #fff; font-weight: 800; font-size: 0.95rem; white-space: nowrap;
      transition: opacity var(--transition);
    }
    .dash-shell.sidebar-collapsed .sidebar-brand-text { opacity: 0; pointer-events: none; }

    .sidebar-toggle {
      width: 28px; height: 28px; background: #18181b; border: 1.5px solid #2e2e33;
      border-radius: 50%; color: #fff; position: absolute; top: 21px; right: -14px;
      display: flex; align-items: center; justify-content: center; cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.5); z-index: 250;
    }

    .sidebar-nav { padding: 16px 10px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .sidebar-nav-item {
      display: flex; align-items: center; gap: 12px; padding: 10px 12px;
      color: rgba(255,255,255,0.6); border-radius: 10px; text-decoration: none;
      font-size: 0.82rem; font-weight: 600; white-space: nowrap; transition: 0.18s ease;
    }
    .sidebar-nav-item:hover, .sidebar-nav-item.active { background: rgba(255,255,255,0.12); color: #fff; }
    .dash-shell.sidebar-collapsed .sidebar-nav-item span:not(.material-symbols-rounded) { display: none; }

    /* CONTENT */
    .dash-content { flex: 1; margin-left: var(--sidebar-w); display: flex; flex-direction: column; transition: margin-left var(--transition); }
    .dash-shell.sidebar-collapsed .dash-content { margin-left: var(--sidebar-w-collapsed); }

    /* HEADER */
    .dash-header {
      height: var(--header-h); background: #fff; border-bottom: 1px solid var(--border-subtle);
      display: flex; align-items: center; justify-content: space-between; padding: 0 32px;
      position: sticky; top: 0; z-index: 100;
    }
    .dash-status-pill {
      display: flex; align-items: center; gap: 8px; padding: 6px 14px;
      background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 999px;
      font-size: 0.78rem; font-weight: 600; color: #15803d;
    }
    .dash-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.35;} }

    /* MAIN */
    .dash-main { padding: 28px 32px; max-width: 1600px; width: 100%; margin: 0 auto; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
    .stat-card {
      background: #fff; border: 1px solid var(--border-subtle); border-radius: 16px;
      padding: 20px 24px; box-shadow: 0 4px 20px -2px rgba(15,23,42,0.04);
    }
    .stat-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); }
    .stat-number { font-size: 2rem; font-weight: 800; margin: 8px 0 2px; }
    .stat-sub { font-size: 0.74rem; color: var(--text-muted); }

    .btn-primary {
      background: #000; color: #fff; border: none; padding: 10px 18px; border-radius: 10px;
      font-weight: 700; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
    }
    .btn-primary:hover { opacity: 0.85; }
  </style>
</head>
<body>

<div class="dash-shell" id="appShell">
  
  <aside class="dash-sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-logo">
        <span class="material-symbols-rounded">dashboard</span>
      </div>
      <span class="sidebar-brand-text">AdminPanel</span>
    </div>

    <button class="sidebar-toggle" id="toggleBtn" onclick="toggleSidebar()">
      <span class="material-symbols-rounded" id="toggleIcon">chevron_left</span>
    </button>

    <nav class="sidebar-nav">
      <a href="#" class="sidebar-nav-item active">
        <span class="material-symbols-rounded">dashboard</span>
        <span>Inicio</span>
      </a>
      <a href="#" class="sidebar-nav-item">
        <span class="material-symbols-rounded">inventory_2</span>
        <span>Inventario</span>
      </a>
      <a href="#" class="sidebar-nav-item">
        <span class="material-symbols-rounded">analytics</span>
        <span>Analíticas</span>
      </a>
    </nav>
  </aside>

  <div class="dash-content">
    <header class="dash-header">
      <h2 style="font-size:1.1rem; font-weight:800;">Panel de Control</h2>
      <div class="dash-status-pill">
        <span class="dash-status-dot"></span>
        <span>Sistema Operativo</span>
      </div>
    </header>

    <main class="dash-main">
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Usuarios Activos</span>
          <p class="stat-number">1,482</p>
          <p class="stat-sub">+12% este mes</p>
        </div>
        <div class="stat-card">
          <span class="stat-label">Ventas Hoy</span>
          <p class="stat-number">$14,250</p>
          <p class="stat-sub">34 transacciones</p>
        </div>
        <div class="stat-card">
          <span class="stat-label">Stock Crítico</span>
          <p class="stat-number" style="color:#ef4444;">8</p>
          <p class="stat-sub">Requieren reorden</p>
        </div>
        <div class="stat-card">
          <span class="stat-label">Satisfacción</span>
          <p class="stat-number">98.5%</p>
          <p class="stat-sub">Calificación promedio</p>
        </div>
      </div>

      <button class="btn-primary">
        <span class="material-symbols-rounded">add</span>
        <span>Crear Nuevo Registro</span>
      </button>
    </main>
  </div>

</div>

<script>
  function toggleSidebar() {
    const shell = document.getElementById('appShell');
    const icon = document.getElementById('toggleIcon');
    shell.classList.toggle('sidebar-collapsed');
    icon.textContent = shell.classList.contains('sidebar-collapsed') ? 'chevron_right' : 'chevron_left';
  }
</script>

</body>
</html>
```

---

## 15. Guía de Integración con Frameworks (React, Vue, Angular)

### En React / Next.js

```tsx
import React, { useState } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`dash-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="dash-sidebar">
        <button 
          className="sidebar-toggle" 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          <span className="material-symbols-rounded">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
        {/* Navegación */}
      </aside>
      
      <div className="dash-content">
        <header className="dash-header">
          {/* Header */}
        </header>
        <main className="dash-main animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### En Vue 3 (Composition API)

```vue
<script setup>
import { ref } from 'vue';
const sidebarCollapsed = ref(false);
const toggleSidebar = () => sidebarCollapsed.value = !sidebarCollapsed.value;
</script>

<template>
  <div class="dash-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <aside class="dash-sidebar">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <span class="material-symbols-rounded">
          {{ sidebarCollapsed ? 'chevron_right' : 'chevron_left' }}
        </span>
      </button>
      <!-- Nav items -->
    </aside>
    <div class="dash-content">
      <header class="dash-header"><!-- Top bar --></header>
      <main class="dash-main animate-fade-in">
        <slot />
      </main>
    </div>
  </div>
</template>
```

### En Angular (Standalone Component)

```typescript
@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  template: `
    <div class="dash-shell" [class.sidebar-collapsed]="!sidebarExpanded">
      <aside class="dash-sidebar">
        <button class="sidebar-toggle" (click)="toggleSidebar()">
          <span class="material-symbols-rounded">
            {{ sidebarExpanded ? 'chevron_left' : 'chevron_right' }}
          </span>
        </button>
        <!-- Menús -->
      </aside>
      <div class="dash-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class DashboardShellComponent {
  sidebarExpanded = true;
  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded;
  }
}
```

---

## 💡 Resumen de Claves del Éxito Visual

1. **Mantén el negro `#0a0a0a` para el sidebar y los botones primarios** para preservar el tono editorial sofisticado.
2. **Utiliza `Inter Tight` con `font-weight: 800` para encabezados** y `letter-spacing: -0.025em` para lograr el aspecto moderno de panel SaaS.
3. **Usa `Material Symbols Rounded` con un grosor definido (`'wght' 600`)** para asegurar consistencia geométrica entre todos los iconos.
4. **Respeta los radios de curvatura:** `10px-12px` para botones e inputs, `16px-20px` para tarjetas y contenedores de datos.
