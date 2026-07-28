import { Injectable } from '@angular/core';

export interface WebTemplate {
  id: string;
  name: string;
  category: string;
  categoryName: string;
  style: string;
  styleName: string;
  description: string;
  icon: string;
  bgGradient: string;
  primaryColor: string;
  accentColor: string;
  tags: string[];
  htmlContent: (businessName: string) => string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  private templates: WebTemplate[] = [
    {
      id: 'gym',
      name: 'Gym & Fitness Power',
      category: 'gym',
      categoryName: 'Gym & Fitness',
      style: 'oscuro',
      styleName: 'Oscuro & Deportivo',
      description: 'Landing page de alto impacto visual para gimnasios, entrenadores personales y centros deportivos.',
      icon: '🏋️',
      bgGradient: 'linear-gradient(135deg, rgba(255,85,0,0.15) 0%, rgba(220,38,38,0.15) 100%)',
      primaryColor: '#ff5500',
      accentColor: '#ff8c00',
      tags: ['Gym', 'Fitness', 'Deporte', 'Entrenamiento'],
      htmlContent: (name: string) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name || 'TITAN FITNESS'}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #0c0d10; color: #fff; }
  header { padding: 24px 48px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .logo { font-size: 24px; font-weight: 900; color: #ff5500; letter-spacing: -0.5px; }
  nav a { color: #ccc; text-decoration: none; margin-left: 28px; font-weight: 600; font-size: 14px; }
  nav a.cta { color: #ff5500; }
  .hero { padding: 110px 48px; text-align: center; background: radial-gradient(circle at center, rgba(255,85,0,0.12) 0%, transparent 70%); }
  .badge { display: inline-block; background: rgba(255,85,0,0.15); color: #ff5500; border: 1px solid rgba(255,85,0,0.3); padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 28px; }
  h1 { font-size: 58px; font-weight: 900; line-height: 1.1; margin-bottom: 20px; }
  h1 span { color: #ff5500; }
  .subtitle { color: #a0a0a0; font-size: 18px; max-width: 600px; margin: 0 auto 40px; line-height: 1.7; }
  .btns { display: flex; gap: 16px; justify-content: center; }
  .btn-primary { background: #ff5500; color: #000; font-weight: 900; padding: 17px 38px; border: none; border-radius: 12px; font-size: 16px; cursor: pointer; }
  .btn-outline { background: transparent; color: #fff; font-weight: 700; padding: 17px 38px; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; font-size: 16px; cursor: pointer; }
  .cards { padding: 60px 48px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1200px; margin: 0 auto; }
  .card { background: #14161d; padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); }
  .card h3 { color: #ff5500; font-size: 20px; margin-bottom: 12px; }
  .card p { color: #777; font-size: 14px; line-height: 1.7; }
  .stats { padding: 60px 48px; display: flex; justify-content: center; gap: 80px; text-align: center; background: #14161d; }
  .stat-num { font-size: 48px; font-weight: 900; color: #ff5500; }
  .stat-label { font-size: 13px; color: #777; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
  footer { padding: 40px 48px; text-align: center; color: #444; font-size: 13px; border-top: 1px solid rgba(255,255,255,0.06); }
</style>
</head>
<body>
<header>
  <div class="logo">${name || 'TITAN FITNESS'}</div>
  <nav>
    <a href="#">Planes</a>
    <a href="#">Clases</a>
    <a href="#">Sedes</a>
    <a href="#" class="cta">Unirme Ahora</a>
  </nav>
</header>
<section class="hero">
  <div class="badge">⚡ TRANSFORMA TU CUERPO</div>
  <h1>LLEVA TU CUERPO AL <span>SIGUIENTE NIVEL</span> EN ${name || 'NUESTRO GYM'}</h1>
  <p class="subtitle">Entrenamiento de alta intensidad, equipos de última generación y asesores certificados listos para guiar tu proceso.</p>
  <div class="btns">
    <button class="btn-primary">PRUEBA GRATIS 3 DÍAS</button>
    <button class="btn-outline">VER SEDES</button>
  </div>
</section>
<div class="cards">
  <div class="card"><h3>🔥 Musculación & Peso Libre</h3><p>Zona equipada con las mejores marcas olímpicas para hipertrofia y fuerza máxima.</p></div>
  <div class="card"><h3>⚡ Functional & Crossfit</h3><p>Circuitos guiados de alta quema calórica y acondicionamiento metabólico integral.</p></div>
  <div class="card"><h3>🥗 Asesoría Nutricional</h3><p>Planes de alimentación personalizados alineados con tu tipo de cuerpo y objetivos.</p></div>
</div>
<div class="stats">
  <div><div class="stat-num">12K+</div><div class="stat-label">Miembros Activos</div></div>
  <div><div class="stat-num">48</div><div class="stat-label">Clases / Semana</div></div>
  <div><div class="stat-num">8</div><div class="stat-label">Sedes en la Ciudad</div></div>
</div>
<footer>${name || 'TITAN FITNESS'} © 2026 — Todos los derechos reservados.</footer>
</body>
</html>`
    },
    {
      id: 'ropa',
      name: 'Moda & Boutique Store',
      category: 'ropa',
      categoryName: 'Tienda de Ropa',
      style: 'minimalista',
      styleName: 'Minimalista & Limpio',
      description: 'Diseño limpio y sofisticado para marcas de ropa, colecciones urbanas y boutiques de moda.',
      icon: '👗',
      bgGradient: 'linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(168,85,247,0.1) 100%)',
      primaryColor: '#111111',
      accentColor: '#ec4899',
      tags: ['Moda', 'Ropa', 'Boutique', 'Minimalista'],
      htmlContent: (name: string) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${name || 'AURA STUDIO'}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #fff; color: #111; }
  .topbar { background: #111; color: #fff; text-align: center; font-size: 12px; padding: 9px; font-weight: 600; letter-spacing: 2px; }
  header { padding: 32px 60px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; }
  .logo { font-family: 'Cormorant Garamond', serif; font-size: 28px; letter-spacing: 5px; text-transform: uppercase; font-style: italic; }
  nav { display: flex; gap: 32px; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; }
  nav a { color: #111; text-decoration: none; }
  nav a.muted { color: #888; }
  .hero { display: flex; min-height: 600px; }
  .hero-text { flex: 1; padding: 80px 60px; display: flex; flex-direction: column; justify-content: center; }
  .hero-img { flex: 1; background: linear-gradient(135deg, #f5f5f5, #e8e8e8); display: flex; align-items: center; justify-content: center; color: #bbb; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }
  .overline { font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #888; margin-bottom: 20px; }
  h1 { font-family: 'Cormorant Garamond', serif; font-size: 56px; font-weight: 300; line-height: 1.1; margin-bottom: 24px; }
  h1 strong { font-weight: 600; }
  .desc { color: #666; font-size: 15px; line-height: 1.9; margin-bottom: 36px; max-width: 440px; }
  .btn-primary { display: inline-block; background: #111; color: #fff; border: none; padding: 18px 44px; font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; cursor: pointer; }
  .categories { padding: 60px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; background: #fafafa; }
  .cat-item { aspect-ratio: 3/4; background: linear-gradient(135deg, #eee, #ddd); border-radius: 4px; display: flex; flex-direction: column; justify-content: flex-end; padding: 20px; }
  .cat-name { font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  .cat-count { font-size: 12px; color: #888; margin-top: 4px; }
  footer { text-align: center; padding: 40px; color: #aaa; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; border-top: 1px solid #f0f0f0; }
</style>
</head>
<body>
<div class="topbar">✦ ENVÍOS GRATIS A TODO EL PAÍS EN COMPRAS MAYORES A $150 ✦</div>
<header>
  <div class="logo">${name || 'AURA STUDIO'}</div>
  <nav>
    <a href="#">Colección</a>
    <a href="#">Novedades</a>
    <a href="#">Edición</a>
    <a href="#" class="muted">Bolsa (0)</a>
  </nav>
</header>
<section class="hero">
  <div class="hero-text">
    <div class="overline">Nueva Temporada 2026</div>
    <h1>Elegancia <em>atemporal</em> por <strong>${name || 'AURA'}</strong></h1>
    <p class="desc">Diseño sustentable elaborado con telas premium. Prendas versátiles pensadas para destacar con sutileza.</p>
    <button class="btn-primary">Explorar Catálogo</button>
  </div>
  <div class="hero-img">LOOKBOOK FOTO</div>
</section>
<div class="categories">
  <div class="cat-item"><div class="cat-name">Vestidos</div><div class="cat-count">42 piezas</div></div>
  <div class="cat-item"><div class="cat-name">Outerwear</div><div class="cat-count">28 piezas</div></div>
  <div class="cat-item"><div class="cat-name">Casualwear</div><div class="cat-count">65 piezas</div></div>
  <div class="cat-item"><div class="cat-name">Accesorios</div><div class="cat-count">33 piezas</div></div>
</div>
<footer>${name || 'AURA STUDIO'} © 2026</footer>
</body>
</html>`
    },
    {
      id: 'restaurante',
      name: 'Gourmet & Bistro',
      category: 'restaurante',
      categoryName: 'Restaurante & Comida',
      style: 'elegante',
      styleName: 'Elegante & Cálido',
      description: 'Experiencia visual apetecible para restaurantes, cafeterías de especialidad y gastronomía.',
      icon: '🍽️',
      bgGradient: 'linear-gradient(135deg, rgba(217,119,6,0.15) 0%, rgba(180,83,9,0.15) 100%)',
      primaryColor: '#d97706',
      accentColor: '#f59e0b',
      tags: ['Comida', 'Restaurante', 'Gourmet', 'Reservas'],
      htmlContent: (name: string) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${name || 'La Maison'}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #120e0b; color: #f5f0eb; }
  header { padding: 30px 52px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(217,119,6,0.2); }
  .logo { font-family: 'Playfair Display', serif; font-size: 26px; font-style: italic; color: #d97706; }
  nav a { color: #f5f0eb; text-decoration: none; margin-left: 28px; font-size: 14px; letter-spacing: 0.5px; }
  .btn-reserve { background: #d97706; color: #fff; padding: 11px 22px; border-radius: 30px; font-weight: 700; text-decoration: none; margin-left: 28px; font-size: 14px; }
  .hero { padding: 120px 52px; text-align: center; background: radial-gradient(circle at center, rgba(217,119,6,0.12) 0%, transparent 65%); }
  .overline { font-size: 12px; letter-spacing: 3px; text-transform: uppercase; color: #d97706; margin-bottom: 24px; }
  h1 { font-family: 'Playfair Display', serif; font-size: 60px; font-weight: 400; margin-bottom: 24px; line-height: 1.1; }
  h1 span { color: #d97706; }
  .subtitle { color: #9e8b7a; max-width: 540px; margin: 0 auto 40px; font-size: 16px; line-height: 1.8; }
  .btn-menu { background: #d97706; color: #fff; border: none; padding: 17px 42px; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 1px; text-transform: uppercase; border-radius: 30px; cursor: pointer; }
  .platos { padding: 80px 52px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
  .plato { background: #1a1410; border: 1px solid rgba(217,119,6,0.15); border-radius: 16px; padding: 32px; }
  .plato-price { color: #d97706; font-size: 22px; font-weight: 700; margin-bottom: 8px; }
  .plato-name { font-family: 'Playfair Display', serif; font-size: 20px; margin-bottom: 8px; }
  .plato-desc { color: #7a6a5e; font-size: 13px; line-height: 1.7; }
  .reserva { padding: 80px 52px; text-align: center; background: #1a1410; }
  .reserva h2 { font-family: 'Playfair Display', serif; font-size: 40px; margin-bottom: 16px; }
  .reserva p { color: #9e8b7a; margin-bottom: 32px; }
  footer { text-align: center; padding: 36px; color: #5a4a3e; font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05); }
</style>
</head>
<body>
<header>
  <div class="logo">${name || 'La Maison Gourmet'}</div>
  <nav>
    <a href="#">Menú</a>
    <a href="#">Historia</a>
    <a href="#">Galería</a>
    <a href="#" class="btn-reserve">Reservar Mesa</a>
  </nav>
</header>
<section class="hero">
  <div class="overline">✦ Sabores que enamoran ✦</div>
  <h1>Una Experiencia Culinaria Única<br>en <span>${name || 'La Maison'}</span></h1>
  <p class="subtitle">Platillos de autor preparados con ingredientes orgánicos de la más alta calidad y maridaje exclusivo.</p>
  <button class="btn-menu">CONOCER EL MENÚ</button>
</section>
<div class="platos">
  <div class="plato"><div class="plato-price">$48.000</div><div class="plato-name">Risotto ai Funghi</div><div class="plato-desc">Arroz arborio con porcini frescos, vino blanco y parmesano reggiano 24 meses.</div></div>
  <div class="plato"><div class="plato-price">$62.000</div><div class="plato-name">Filete Wellington</div><div class="plato-desc">Lomo fino en hojaldre con duxelles de champiñones y salsa de Borgoña.</div></div>
  <div class="plato"><div class="plato-price">$35.000</div><div class="plato-name">Crème Brûlée</div><div class="plato-desc">Crema de vainilla de Madagascar con caramelizado perfecto y frutos rojos.</div></div>
</div>
<div class="reserva">
  <h2>¿Tienes una ocasión especial?</h2>
  <p>Nuestro equipo está listo para crear una experiencia personalizada para ti.</p>
  <button class="btn-menu" style="background: transparent; border: 1px solid #d97706; color: #d97706;">RESERVAR AHORA</button>
</div>
<footer>${name || 'La Maison Gourmet'} © 2026 — Cocina de Autor</footer>
</body>
</html>`
    },
    {
      id: 'tecnologia',
      name: 'Tech & SaaS Platform',
      category: 'tecnologia',
      categoryName: 'Tecnología & Software',
      style: 'futurista',
      styleName: 'Futurista & Neon Cyan',
      description: 'Landing page con estética SaaS moderna para startups, aplicaciones digitales y empresas tech.',
      icon: '💻',
      bgGradient: 'linear-gradient(135deg, rgba(0,245,255,0.1) 0%, rgba(59,130,246,0.1) 100%)',
      primaryColor: '#00f5ff',
      accentColor: '#3b82f6',
      tags: ['Tech', 'SaaS', 'Software', 'AI', 'Startup'],
      htmlContent: (name: string) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${name || 'NEXUS AI'}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #050811; color: #e2e8f0; }
  header { padding: 24px 52px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,245,255,0.12); position: sticky; top: 0; background: rgba(5,8,17,0.95); z-index: 100; backdrop-filter: blur(10px); }
  .logo { font-size: 22px; font-weight: 800; color: #00f5ff; display: flex; align-items: center; gap: 10px; }
  .logo-icon { background: rgba(0,245,255,0.15); padding: 8px 12px; border-radius: 8px; }
  nav a { color: #94a3b8; text-decoration: none; margin-left: 32px; font-size: 14px; font-weight: 500; }
  .btn-trial { background: rgba(0,245,255,0.1); color: #00f5ff; border: 1px solid rgba(0,245,255,0.3); padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-left: 32px; }
  .hero { padding: 120px 52px; text-align: center; max-width: 950px; margin: 0 auto; position: relative; }
  .hero::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 600px; height: 400px; background: radial-gradient(ellipse, rgba(0,245,255,0.07) 0%, transparent 70%); pointer-events: none; }
  .badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(0,245,255,0.08); border: 1px solid rgba(0,245,255,0.2); color: #00f5ff; padding: 7px 18px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 28px; letter-spacing: 1px; }
  h1 { font-size: 60px; font-weight: 900; line-height: 1.12; margin-bottom: 24px; background: linear-gradient(135deg, #fff 30%, #00f5ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .subtitle { color: #94a3b8; font-size: 18px; line-height: 1.7; margin-bottom: 44px; max-width: 640px; margin-left: auto; margin-right: auto; }
  .btns { display: flex; gap: 16px; justify-content: center; }
  .btn-primary { background: #00f5ff; color: #050811; font-weight: 900; border: none; padding: 16px 38px; border-radius: 10px; font-size: 16px; cursor: pointer; box-shadow: 0 0 30px rgba(0,245,255,0.25); }
  .btn-outline { background: transparent; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.15); padding: 16px 38px; border-radius: 10px; font-size: 16px; cursor: pointer; font-weight: 600; }
  .features { padding: 80px 52px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1200px; margin: 0 auto; }
  .feature { background: rgba(255,255,255,0.02); border: 1px solid rgba(0,245,255,0.08); border-radius: 16px; padding: 32px; }
  .feature-icon { font-size: 32px; margin-bottom: 16px; }
  .feature h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
  .feature p { color: #64748b; font-size: 14px; line-height: 1.7; }
  footer { text-align: center; padding: 40px; color: #334155; font-size: 13px; border-top: 1px solid rgba(0,245,255,0.08); }
</style>
</head>
<body>
<header>
  <div class="logo"><span class="logo-icon">⚡</span>${name || 'NEXUS AI'}</div>
  <nav>
    <a href="#">Solución</a>
    <a href="#">Precios</a>
    <a href="#">Docs</a>
    <a href="#" class="btn-trial">Prueba Gratis</a>
  </nav>
</header>
<section class="hero">
  <div class="badge">🚀 PLATAFORMA DE NUEVA GENERACIÓN</div>
  <h1>Potencia tu Flujo Digital con ${name || 'NEXUS TECH'}</h1>
  <p class="subtitle">Automatización inteligente, analítica en tiempo real e integración de APIs para escalar tu negocio en minutos.</p>
  <div class="btns">
    <button class="btn-primary">Comenzar Gratis →</button>
    <button class="btn-outline">Ver Demo en Vivo</button>
  </div>
</section>
<div class="features">
  <div class="feature"><div class="feature-icon">🧠</div><h3>IA Integrada</h3><p>Automatiza decisiones complejas con modelos de lenguaje de última generación entrenados para tu industria.</p></div>
  <div class="feature"><div class="feature-icon">📊</div><h3>Dashboard en Vivo</h3><p>Visualiza métricas críticas en tiempo real con gráficas interactivas y alertas inteligentes.</p></div>
  <div class="feature"><div class="feature-icon">🔌</div><h3>500+ Integraciones</h3><p>Conecta con las herramientas que ya usas: Stripe, Notion, Slack, HubSpot y más con un clic.</p></div>
</div>
<footer>${name || 'NEXUS AI'} © 2026 — Built for builders.</footer>
</body>
</html>`
    },
    {
      id: 'salud',
      name: 'Salud & Vitality Spa',
      category: 'salud',
      categoryName: 'Salud & Bienestar',
      style: 'organico',
      styleName: 'Orgánico & Natural',
      description: 'Diseño relajante para spas, centros de estética, clínicas de salud integral y consultorios.',
      icon: '💆',
      bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.12) 100%)',
      primaryColor: '#10b981',
      accentColor: '#34d399',
      tags: ['Salud', 'Spa', 'Bienestar', 'Estética'],
      htmlContent: (name: string) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${name || 'VITA SPA'}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f0fdf4; color: #064e3b; }
  header { padding: 22px 52px; display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 2px 16px rgba(0,0,0,0.04); }
  .logo { font-size: 22px; font-weight: 700; color: #047857; }
  nav a { color: #374151; text-decoration: none; margin-left: 28px; font-size: 14px; font-weight: 500; }
  .btn-cita { background: #10b981; color: #fff; border: none; padding: 11px 24px; border-radius: 24px; font-weight: 700; cursor: pointer; font-size: 14px; margin-left: 28px; }
  .hero { padding: 100px 52px; text-align: center; background: linear-gradient(180deg, #ecfdf5, #f0fdf4); max-width: 850px; margin: 0 auto; }
  h1 { font-family: 'DM Serif Display', serif; font-size: 52px; color: #064e3b; margin-bottom: 20px; line-height: 1.2; }
  h1 span { color: #10b981; }
  .subtitle { color: #374151; font-size: 18px; line-height: 1.8; margin-bottom: 36px; }
  .btn-ver { background: #047857; color: #fff; padding: 17px 38px; border: none; border-radius: 30px; font-size: 16px; font-weight: 700; cursor: pointer; }
  .servicios { padding: 80px 52px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
  .servicio { background: #fff; border-radius: 20px; padding: 36px; box-shadow: 0 4px 24px rgba(16,185,129,0.08); }
  .servicio-icon { font-size: 40px; margin-bottom: 16px; }
  .servicio h3 { font-family: 'DM Serif Display', serif; font-size: 22px; color: #064e3b; margin-bottom: 10px; }
  .servicio p { color: #6b7280; font-size: 14px; line-height: 1.7; }
  .pricing { padding: 80px 52px; background: #064e3b; color: #fff; text-align: center; }
  .pricing h2 { font-family: 'DM Serif Display', serif; font-size: 40px; margin-bottom: 16px; }
  .pricing p { color: #6ee7b7; margin-bottom: 40px; font-size: 16px; }
  .plans { display: flex; gap: 24px; justify-content: center; }
  .plan { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 36px 32px; flex: 1; max-width: 280px; }
  .plan-price { font-size: 40px; font-weight: 900; color: #34d399; }
  .plan-name { font-size: 16px; font-weight: 700; margin: 8px 0 16px; }
  footer { text-align: center; padding: 36px; color: #9ca3af; font-size: 13px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
<header>
  <div class="logo">🌿 ${name || 'VITA SPA & HEALTH'}</div>
  <nav>
    <a href="#">Servicios</a>
    <a href="#">Tratamientos</a>
    <a href="#">Galería</a>
    <button class="btn-cita">Agendar Cita</button>
  </nav>
</header>
<section class="hero">
  <h1>Tu Espacio de Paz y <span>Renovación</span> en ${name || 'VITA HEALTH'}</h1>
  <p class="subtitle">Tratamientos faciales, corporales y terapias holísticas diseñadas para revitalizar tu mente y cuerpo con técnicas de última generación.</p>
  <button class="btn-ver">Ver Servicios →</button>
</section>
<div class="servicios">
  <div class="servicio"><div class="servicio-icon">💎</div><h3>Facial Diamante</h3><p>Limpieza profunda con microdermoabrasión de diamante y suero de vitamina C para una piel radiante.</p></div>
  <div class="servicio"><div class="servicio-icon">🌊</div><h3>Hidroterapia</h3><p>Circuito termal de hidromasaje, vapor y crioterapia para activar la circulación y eliminar toxinas.</p></div>
  <div class="servicio"><div class="servicio-icon">🧘</div><h3>Masaje Zen</h3><p>Relajación muscular profunda con aceites esenciales orgánicos y técnicas de shiatsu japonés.</p></div>
</div>
<footer>${name || 'VITA SPA & HEALTH'} © 2026 — Bienestar Integral</footer>
</body>
</html>`
    },
    {
      id: 'ecommerce',
      name: 'SuperStore Modern E-commerce',
      category: 'ecommerce',
      categoryName: 'E-commerce General',
      style: 'moderno',
      styleName: 'Moderno & Dinámico',
      description: 'Estructura enfocada en conversión rápida de ventas para cualquier tipo de producto físico o digital.',
      icon: '🛍️',
      bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.15) 100%)',
      primaryColor: '#3b82f6',
      accentColor: '#6366f1',
      tags: ['E-commerce', 'Ventas', 'Productos', 'Tienda Online'],
      htmlContent: (name: string) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${name || 'MARKET HUB'}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; }
  header { padding: 20px 48px; display: flex; justify-content: space-between; align-items: center; background: #1e293b; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .logo { font-size: 24px; font-weight: 900; color: #3b82f6; }
  .search { background: #0f172a; border: 1px solid #334155; padding: 11px 24px; border-radius: 24px; color: #fff; width: 340px; font-size: 14px; }
  .cart-btn { background: #3b82f6; color: #fff; border: none; padding: 11px 22px; border-radius: 8px; font-weight: 700; cursor: pointer; }
  .hero { padding: 90px 48px; display: flex; align-items: center; justify-content: space-between; background: linear-gradient(180deg, #1e293b, #0f172a); }
  .hero-left { max-width: 560px; }
  .badge-sale { display: inline-block; background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; margin-bottom: 24px; }
  h1 { font-size: 50px; font-weight: 900; line-height: 1.1; margin-bottom: 20px; }
  h1 span { color: #3b82f6; }
  .hero-desc { color: #94a3b8; font-size: 16px; line-height: 1.7; margin-bottom: 36px; }
  .btns { display: flex; gap: 16px; }
  .btn-primary { background: #3b82f6; color: #fff; border: none; padding: 16px 36px; border-radius: 12px; font-weight: 800; font-size: 15px; cursor: pointer; }
  .btn-ghost { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.12); padding: 16px 36px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; }
  .hero-right { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 440px; }
  .product-card { background: #1e293b; border-radius: 16px; padding: 24px; border: 1px solid rgba(59,130,246,0.15); }
  .product-img { height: 120px; background: linear-gradient(135deg, #1e3a5f, #1e293b); border-radius: 10px; margin-bottom: 14px; display: flex; align-items: center; justify-content: center; font-size: 36px; }
  .product-name { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
  .product-price { color: #3b82f6; font-weight: 900; font-size: 16px; }
  footer { text-align: center; padding: 36px; color: #475569; font-size: 13px; border-top: 1px solid rgba(255,255,255,0.05); }
</style>
</head>
<body>
<header>
  <div class="logo">🛍️ ${name || 'MARKET HUB'}</div>
  <input class="search" type="text" placeholder="Buscar productos...">
  <button class="cart-btn">Carrito (0)</button>
</header>
<section class="hero">
  <div class="hero-left">
    <div class="badge-sale">🔥 OFERTAS DEL DÍA — HASTA 60% OFF</div>
    <h1>Los mejores productos en <span>${name || 'MARKET HUB'}</span></h1>
    <p class="hero-desc">Envíos inmediatos, pagos seguros y la mejor garantía del mercado. Más de 50.000 productos disponibles.</p>
    <div class="btns">
      <button class="btn-primary">Ver Ofertas del Día</button>
      <button class="btn-ghost">Todas las Categorías</button>
    </div>
  </div>
  <div class="hero-right">
    <div class="product-card"><div class="product-img">📱</div><div class="product-name">Smartphone Pro</div><div class="product-price">$899.000</div></div>
    <div class="product-card"><div class="product-img">🎧</div><div class="product-name">Audifonos BT</div><div class="product-price">$189.000</div></div>
    <div class="product-card"><div class="product-img">⌚</div><div class="product-name">Smartwatch X</div><div class="product-price">$349.000</div></div>
    <div class="product-card"><div class="product-img">💻</div><div class="product-name">Laptop Ultra</div><div class="product-price">$2.499.000</div></div>
  </div>
</section>
<footer>${name || 'MARKET HUB'} © 2026 — Compra inteligente, envío rápido.</footer>
</body>
</html>`
    },
    {
      id: 'consultoria',
      name: 'Corporate & Consulting Prime',
      category: 'consultoria',
      categoryName: 'Consultoría & Servicios',
      style: 'elegante',
      styleName: 'Corporativo & Profesional',
      description: 'Presentación limpia y profesional para firmas legales, consultores financieros y agencias de servicios.',
      icon: '💼',
      bgGradient: 'linear-gradient(135deg, rgba(30,64,175,0.12) 0%, rgba(15,23,42,0.15) 100%)',
      primaryColor: '#1e40af',
      accentColor: '#3b82f6',
      tags: ['Consultoría', 'Corporativo', 'Finanzas', 'Legal'],
      htmlContent: (name: string) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${name || 'VANGUARD CONSULTING'}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #fff; color: #0f172a; }
  header { padding: 24px 64px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; }
  .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  nav a { color: #374151; text-decoration: none; margin-left: 32px; font-size: 14px; font-weight: 500; }
  .btn-agenda { background: #1e40af; color: #fff; border: none; padding: 12px 24px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px; margin-left: 32px; }
  .hero { padding: 110px 64px; max-width: 820px; }
  .overline { color: #2563eb; font-weight: 700; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 20px; }
  h1 { font-size: 54px; font-weight: 900; line-height: 1.1; margin-bottom: 24px; }
  h1 span { color: #2563eb; }
  .subtitle { color: #64748b; font-size: 18px; line-height: 1.8; margin-bottom: 40px; max-width: 600px; }
  .btns { display: flex; gap: 16px; }
  .btn-primary { background: #1e40af; color: #fff; border: none; padding: 17px 38px; border-radius: 8px; font-weight: 700; font-size: 15px; cursor: pointer; }
  .btn-outline { background: transparent; color: #1e40af; border: 2px solid #1e40af; padding: 17px 38px; border-radius: 8px; font-weight: 700; font-size: 15px; cursor: pointer; }
  .metrics { padding: 60px 64px; background: #f8fafc; display: flex; gap: 80px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
  .metric-num { font-size: 44px; font-weight: 900; color: #1e40af; }
  .metric-label { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
  .services { padding: 80px 64px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 1200px; margin: 0 auto; }
  .service { border-top: 3px solid #1e40af; padding-top: 24px; }
  .service h3 { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
  .service p { color: #6b7280; font-size: 14px; line-height: 1.7; }
  footer { text-align: center; padding: 36px; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<header>
  <div class="logo">${name || 'VANGUARD CONSULTING'}</div>
  <nav>
    <a href="#">Servicios</a>
    <a href="#">Casos de Éxito</a>
    <a href="#">Equipo</a>
    <button class="btn-agenda">Agendar Asesoría</button>
  </nav>
</header>
<section class="hero">
  <div class="overline">ESTRATEGIA & CRECIMIENTO EMPRESARIAL</div>
  <h1>Impulsamos la rentabilidad de tu negocio con <span>${name || 'VANGUARD'}</span></h1>
  <p class="subtitle">Asesoría empresarial de alto nivel enfocada en optimización financiera, transformación digital y expansión de mercados nacionales e internacionales.</p>
  <div class="btns">
    <button class="btn-primary">Conocer Casos de Éxito</button>
    <button class="btn-outline">Agendar Diagnóstico</button>
  </div>
</section>
<div class="metrics">
  <div><div class="metric-num">340+</div><div class="metric-label">Empresas Asesoradas</div></div>
  <div><div class="metric-num">15</div><div class="metric-label">Años de Trayectoria</div></div>
  <div><div class="metric-num">92%</div><div class="metric-label">Satisfacción Cliente</div></div>
</div>
<div class="services">
  <div class="service"><h3>📊 Consultoría Financiera</h3><p>Optimización de flujo de caja, estructura de deuda, modelos de valoración y levantamiento de capital de inversión.</p></div>
  <div class="service"><h3>🔄 Transformación Digital</h3><p>Automatización de procesos, implementación de ERP/CRM y estrategia de datos para escalar eficientemente.</p></div>
  <div class="service"><h3>🌍 Expansión de Mercados</h3><p>Entrada a nuevos mercados con estudios de viabilidad, análisis competitivo y plan de penetración comercial.</p></div>
</div>
<footer>${name || 'VANGUARD CONSULTING'} © 2026 — Estrategia, Resultados, Confianza.</footer>
</body>
</html>`
    },
    {
      id: 'fotografia',
      name: 'Studio Gallery Editorial',
      category: 'fotografia',
      categoryName: 'Fotografía & Arte',
      style: 'editorial',
      styleName: 'Editorial & Dark Studio',
      description: 'Estilo cinematográfico para fotógrafos, diseñadores, arquitectos y creativos independientes.',
      icon: '📷',
      bgGradient: 'linear-gradient(135deg, rgba(30,30,30,0.5) 0%, rgba(8,8,8,0.8) 100%)',
      primaryColor: '#ffffff',
      accentColor: '#e0e0e0',
      tags: ['Fotografía', 'Arte', 'Portafolio', 'Editorial', 'Creativo'],
      htmlContent: (name: string) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${name || 'RAW STUDIO'}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,700;1,300&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #080808; color: #f5f5f5; }
  header { padding: 40px 64px; display: flex; justify-content: space-between; align-items: center; }
  .logo { font-family: 'Cormorant Garamond', serif; font-size: 26px; letter-spacing: 5px; text-transform: uppercase; font-weight: 300; }
  nav { display: flex; gap: 36px; font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; }
  nav a { color: #888; text-decoration: none; }
  nav a.active { color: #fff; }
  .hero { padding: 100px 64px; text-align: center; }
  h1 { font-family: 'Cormorant Garamond', serif; font-size: 72px; font-weight: 300; letter-spacing: 6px; text-transform: uppercase; margin-bottom: 28px; line-height: 1.1; }
  .divider { width: 60px; height: 1px; background: #444; margin: 0 auto 28px; }
  .hero-sub { font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: #666; max-width: 500px; margin: 0 auto 44px; line-height: 2; }
  .btn-gallery { background: transparent; color: #fff; border: 1px solid #444; padding: 16px 44px; font-size: 11px; letter-spacing: 3.5px; text-transform: uppercase; cursor: pointer; }
  .gallery { padding: 60px 64px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .gallery-item { aspect-ratio: 1; background: linear-gradient(135deg, #1a1a1a, #111); display: flex; align-items: center; justify-content: center; color: #333; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; font-family: 'Cormorant Garamond', serif; font-size: 18px; }
  .gallery-item:nth-child(1) { aspect-ratio: 2/1; grid-column: span 2; }
  .gallery-item:nth-child(5) { aspect-ratio: 2/1; grid-column: span 2; }
  footer { text-align: center; padding: 48px; color: #333; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; border-top: 1px solid #1a1a1a; }
</style>
</head>
<body>
<header>
  <div class="logo">${name || 'RAW STUDIO'}</div>
  <nav>
    <a href="#" class="active">Portafolio</a>
    <a href="#">Servicios</a>
    <a href="#">Sobre Mí</a>
    <a href="#">Contacto</a>
  </nav>
</header>
<section class="hero">
  <h1>Capturar<br>el Alma</h1>
  <div class="divider"></div>
  <p class="hero-sub">Fotografía editorial, comercial y artística por ${name || 'RAW STUDIO'} — Resultados que trascienden</p>
  <button class="btn-gallery">VER GALERÍA COMPLETA</button>
</section>
<div class="gallery">
  <div class="gallery-item">Retrato</div>
  <div class="gallery-item">Fashion</div>
  <div class="gallery-item">Arte</div>
  <div class="gallery-item">Arquitectura</div>
  <div class="gallery-item">Editorial</div>
  <div class="gallery-item">Naturaleza</div>
</div>
<footer>${name || 'RAW STUDIO'} © 2026 — Todos los derechos reservados</footer>
</body>
</html>`
    },
    {
      id: 'educacion',
      name: 'EduAcademy Online',
      category: 'educacion',
      categoryName: 'Educación & Cursos',
      style: 'moderno',
      styleName: 'Limpio & Educativo',
      description: 'Formato optimizado para academias online, tutores particulares, cursos digitales y mentores.',
      icon: '🎓',
      bgGradient: 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(109,40,217,0.12) 100%)',
      primaryColor: '#7c3aed',
      accentColor: '#a78bfa',
      tags: ['Educación', 'Cursos', 'Academia', 'Mentoría'],
      htmlContent: (name: string) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${name || 'EDU ACADEMY'}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Plus Jakarta Sans', sans-serif; background: #faf5ff; color: #1e1b4b; }
  header { padding: 22px 52px; display: flex; justify-content: space-between; align-items: center; background: #fff; box-shadow: 0 2px 16px rgba(124,58,237,0.06); }
  .logo { font-size: 22px; font-weight: 800; color: #6d28d9; }
  nav a { color: #374151; text-decoration: none; margin-left: 28px; font-size: 14px; font-weight: 600; }
  .btn-inscribir { background: #7c3aed; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 14px; margin-left: 28px; }
  .hero { padding: 90px 52px; text-align: center; max-width: 880px; margin: 0 auto; }
  .badge { display: inline-block; background: #ede9fe; color: #6d28d9; padding: 7px 18px; border-radius: 20px; font-size: 13px; font-weight: 700; margin-bottom: 24px; }
  h1 { font-size: 54px; font-weight: 800; line-height: 1.15; margin-bottom: 24px; }
  h1 span { color: #7c3aed; }
  .subtitle { color: #5b21b6; font-size: 18px; line-height: 1.8; margin-bottom: 36px; max-width: 640px; margin-left: auto; margin-right: auto; }
  .btns { display: flex; gap: 16px; justify-content: center; }
  .btn-primary { background: #6d28d9; color: #fff; padding: 16px 38px; border: none; border-radius: 10px; font-size: 16px; font-weight: 800; cursor: pointer; }
  .btn-outline { background: transparent; color: #6d28d9; border: 2px solid #6d28d9; padding: 16px 38px; border-radius: 10px; font-size: 16px; font-weight: 800; cursor: pointer; }
  .cursos { padding: 80px 52px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
  .curso { background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(109,40,217,0.08); }
  .curso-banner { height: 160px; display: flex; align-items: center; justify-content: center; font-size: 48px; }
  .curso-body { padding: 24px; }
  .curso-tag { display: inline-block; background: #ede9fe; color: #6d28d9; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; margin-bottom: 10px; }
  .curso-name { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
  .curso-desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 16px; }
  .curso-meta { display: flex; justify-content: space-between; font-size: 13px; color: #94a3b8; }
  .curso-price { color: #6d28d9; font-weight: 800; font-size: 16px; }
  footer { text-align: center; padding: 36px; color: #94a3b8; font-size: 13px; background: #f9fafb; border-top: 1px solid #e5e7eb; }
</style>
</head>
<body>
<header>
  <div class="logo">🎓 ${name || 'EDU ACADEMY'}</div>
  <nav>
    <a href="#">Cursos</a>
    <a href="#">Mentores</a>
    <a href="#">Certificados</a>
    <button class="btn-inscribir">Inscribirse</button>
  </nav>
</header>
<section class="hero">
  <div class="badge">🌟 APRENDIZAJE CERTIFICADO EN VIVO</div>
  <h1>Domina nuevas habilidades con <span>${name || 'EDU ACADEMY'}</span></h1>
  <p class="subtitle">Cursos estructurados paso a paso con mentores expertos, certificación oficial y comunidad activa de aprendizaje.</p>
  <div class="btns">
    <button class="btn-primary">Explorar Cursos</button>
    <button class="btn-outline">Ver Demo Gratis</button>
  </div>
</section>
<div class="cursos">
  <div class="curso"><div class="curso-banner" style="background: linear-gradient(135deg, #4f46e5, #7c3aed);">💻</div><div class="curso-body"><div class="curso-tag">DESARROLLO WEB</div><div class="curso-name">Full Stack JavaScript 2026</div><div class="curso-desc">React, Node.js, MongoDB y AWS. Del cero al deploy con proyectos reales.</div><div class="curso-meta"><span>⏱ 64 horas</span><span class="curso-price">$299.000</span></div></div></div>
  <div class="curso"><div class="curso-banner" style="background: linear-gradient(135deg, #7c3aed, #c026d3);">📊</div><div class="curso-body"><div class="curso-tag">MARKETING DIGITAL</div><div class="curso-name">Growth Hacking & Social Ads</div><div class="curso-desc">Facebook Ads, Google Ads, SEO avanzado y análisis de datos para crecer.</div><div class="curso-meta"><span>⏱ 48 horas</span><span class="curso-price">$199.000</span></div></div></div>
  <div class="curso"><div class="curso-banner" style="background: linear-gradient(135deg, #0891b2, #4f46e5);">🤖</div><div class="curso-body"><div class="curso-tag">INTELIGENCIA ARTIFICIAL</div><div class="curso-name">IA para Negocios con Python</div><div class="curso-desc">Machine Learning, procesamiento de lenguaje natural y automatización.</div><div class="curso-meta"><span>⏱ 56 horas</span><span class="curso-price">$349.000</span></div></div></div>
</div>
<footer>${name || 'EDU ACADEMY'} © 2026 — Aprende. Certifícate. Transforma tu futuro.</footer>
</body>
</html>`
    },
    {
      id: 'inmobiliaria',
      name: 'Luxury Estates & Properties',
      category: 'inmobiliaria',
      categoryName: 'Inmobiliaria & Bienes Raíces',
      style: 'elegante',
      styleName: 'Lujoso & Premium',
      description: 'Presentación exclusiva para proyectos inmobiliarios, agentes de bienes raíces y propiedades de lujo.',
      icon: '🏠',
      bgGradient: 'linear-gradient(135deg, rgba(180,83,9,0.15) 0%, rgba(120,53,15,0.15) 100%)',
      primaryColor: '#f59e0b',
      accentColor: '#fbbf24',
      tags: ['Inmobiliaria', 'Propiedades', 'Bienes Raíces', 'Lujo'],
      htmlContent: (name: string) => `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${name || 'LUXURY REALTY'}</title>
<link href="https://fonts.googleapis.com/css2?family=Tenor+Sans&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #0c0a09; color: #f5f5f4; }
  header { padding: 30px 64px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(245,158,11,0.15); }
  .logo { font-family: 'Tenor Sans', serif; font-size: 24px; letter-spacing: 3px; text-transform: uppercase; color: #f59e0b; }
  nav a { color: #a8a29e; text-decoration: none; margin-left: 32px; font-size: 14px; letter-spacing: 0.5px; }
  .btn-contact { background: #f59e0b; color: #0c0a09; border: none; padding: 12px 24px; font-weight: 800; cursor: pointer; font-size: 14px; margin-left: 32px; }
  .hero { padding: 120px 64px; text-align: center; background: radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%); }
  .overline { font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: #f59e0b; margin-bottom: 28px; }
  h1 { font-family: 'Tenor Sans', serif; font-size: 60px; font-weight: 400; margin-bottom: 24px; line-height: 1.1; letter-spacing: 1px; }
  h1 span { color: #f59e0b; }
  .subtitle { color: #a8a29e; font-size: 17px; max-width: 600px; margin: 0 auto 44px; line-height: 1.8; }
  .search-bar { display: flex; background: rgba(255,255,255,0.04); border: 1px solid rgba(245,158,11,0.2); border-radius: 8px; padding: 8px; max-width: 700px; margin: 0 auto 0; }
  .search-bar input { flex: 1; background: transparent; border: none; color: #fff; padding: 12px 20px; font-size: 15px; outline: none; }
  .search-bar button { background: #f59e0b; color: #0c0a09; border: none; padding: 12px 32px; border-radius: 4px; font-weight: 800; cursor: pointer; }
  .propiedades { padding: 80px 64px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1200px; margin: 0 auto; }
  .prop { background: #1a1310; border-radius: 12px; overflow: hidden; border: 1px solid rgba(245,158,11,0.1); }
  .prop-img { height: 180px; background: linear-gradient(135deg, #2d1f0e, #1a1310); display: flex; align-items: center; justify-content: center; font-size: 48px; }
  .prop-body { padding: 24px; }
  .prop-tag { display: inline-block; background: rgba(245,158,11,0.15); color: #f59e0b; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-bottom: 10px; }
  .prop-name { font-family: 'Tenor Sans', serif; font-size: 20px; margin-bottom: 8px; }
  .prop-location { color: #78716c; font-size: 13px; margin-bottom: 12px; }
  .prop-price { font-size: 24px; font-weight: 900; color: #f59e0b; }
  footer { text-align: center; padding: 40px; color: #44403c; font-size: 13px; letter-spacing: 1px; border-top: 1px solid rgba(255,255,255,0.04); }
</style>
</head>
<body>
<header>
  <div class="logo">🏛️ ${name || 'LUXURY REALTY'}</div>
  <nav>
    <a href="#">Comprar</a>
    <a href="#">Arrendar</a>
    <a href="#">Proyectos</a>
    <button class="btn-contact">Contactar Agente</button>
  </nav>
</header>
<section class="hero">
  <div class="overline">✦ RESIDENCIAS EXCLUSIVAS ✦</div>
  <h1>Encuentra tu Residencia<br>Soñada con <span>${name || 'LUXURY'}</span></h1>
  <p class="subtitle">Propiedades exclusivas en las mejores zonas de la ciudad con acabados de máximo lujo y amenidades cinco estrellas.</p>
  <div class="search-bar">
    <input type="text" placeholder="Ciudad, barrio, tipo de propiedad...">
    <button>Buscar Propiedades</button>
  </div>
</section>
<div class="propiedades">
  <div class="prop"><div class="prop-img">🏙️</div><div class="prop-body"><div class="prop-tag">PENTHOUSE</div><div class="prop-name">Residencia El Cielo</div><div class="prop-location">📍 El Poblado, Medellín</div><div class="prop-price">$2.800.000.000</div></div></div>
  <div class="prop"><div class="prop-img">🏡</div><div class="prop-body"><div class="prop-tag">CASA CAMPESTRE</div><div class="prop-name">Finca Villa Aurora</div><div class="prop-location">📍 La Calera, Cundinamarca</div><div class="prop-price">$1.200.000.000</div></div></div>
  <div class="prop"><div class="prop-img">🏢</div><div class="prop-body"><div class="prop-tag">APARTAMENTO</div><div class="prop-name">Torre Skyline 401</div><div class="prop-location">📍 Laureles, Medellín</div><div class="prop-price">$680.000.000</div></div></div>
</div>
<footer>${name || 'LUXURY REALTY'} © 2026 — Propiedades Exclusivas · Confianza & Experiencia</footer>
</body>
</html>`
    }
  ];

  getAllTemplates(): WebTemplate[] {
    return this.templates;
  }

  getTemplateById(id: string): WebTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  findBestTemplate(category: string, style?: string): WebTemplate {
    const byCategory = this.templates.find(t => t.category === category);
    if (byCategory) return byCategory;
    if (style) {
      const byStyle = this.templates.find(t => t.style === style);
      if (byStyle) return byStyle;
    }
    return this.templates[3]; // fallback: tech
  }
}
