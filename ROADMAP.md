# Aaron OS v2 — Roadmap

> Sistema operativo personal · Mission Control · aaron.marlabinc.com  
> Última actualización: mayo 2026

---

## Estado actual

| Módulo | Estado | Notas |
|--------|--------|-------|
| /hoy — Mission Control | ✅ Listo | Calendario real, checklist, Top 3, Recovery Mode |
| /horario — Timeline | ✅ Listo | Outlook ICS live, bloques reales, indicador NOW |
| /registro — Input diario | ✅ Listo | Auto-detect gym, migraña tracker, feedback |
| /score — Weekly Score | ✅ Listo | S/A/B/C/D, Recovery Mode automático |
| /finanzas — Financial OS | ✅ Listo | Transacciones, score financiero, alertas, Supabase |
| /cuerpo — Body OS | ✅ Listo | Claude Vision, 11 métricas, curvas, Supabase |
| /mundial — Countdown | ✅ Listo | Countdown en vivo, plan 6 fases, checklist prep |
| /proyectos — Tracker | ✅ Listo | SIR, Aaron OS, MarLab con KPIs y tareas reales |
| /reglas — Identidad | ✅ Listo | Diagnóstico real, visión, metas, no tolerables |
| Calendario Outlook | ✅ Listo | ICS proxy, sync cada 2 min, auto-categorización |
| Supabase persistencia | ✅ Listo | body_scans, daily_logs, transactions |
| Mobile sidebar | ✅ Listo | Drawer + overlay + hamburger |

---

## Fase 1 — Seguridad básica
> Prioridad: CRÍTICA · Estimado: 1–2 semanas

- [ ] **Autenticación con contraseña** — proteger el acceso a todos los datos personales (financieros, salud, emocionales). Opciones: NextAuth + contraseña simple, o PIN de 6 dígitos guardado en Supabase
- [ ] **Headers de seguridad** — agregar CSP, HSTS, X-Frame-Options, X-Content-Type-Options en `next.config.js`
- [ ] **Variables de entorno seguras** — auditar que ninguna key sensible esté expuesta en el cliente
- [ ] **Rate limiting en API routes** — proteger `/api/calendar`, `/api/body-scan` contra abuso
- [ ] **Aviso de privacidad mínimo** — texto simple en `/reglas` indicando que los datos son personales y no se comparten

---

## Fase 2 — Experiencia y calidad
> Prioridad: ALTA · Estimado: 2–3 semanas

- [ ] **PWA — instalar como app** — agregar `manifest.json` + service worker básico para instalar Aaron OS en el teléfono sin App Store
- [ ] **Meta tags dinámicos** — title y description únicos por página, Open Graph para compartir
- [ ] **Estados vacíos útiles** — cuando no hay datos, mostrar mensaje claro de qué hacer (ej: "Sube tu primera captura de báscula")
- [ ] **Error boundaries** — si un componente falla, mostrar mensaje amigable en lugar de pantalla en blanco
- [ ] **Loading skeletons** — mientras cargan datos de Supabase o calendario, mostrar skeleton en lugar de pantalla vacía
- [ ] **Validación de formularios** — limitar longitud de campos, feedback inmediato en registro

---

## Fase 3 — /hoy mejorado
> Prioridad: ALTA · Estimado: 1 semana

- [ ] **Widget Financial Score** — mostrar cashflow y score financiero del mes en /hoy
- [ ] **Widget Body OS** — mostrar peso actual y tendencia en /hoy
- [ ] **Score conectado a datos reales** — el score semanal debe considerar Financial Score y si bajaste de peso
- [ ] **Notificaciones Recovery Mode** — alerta visible cuando score baja de 45
- [ ] **Recordatorio Daily Check** — notificación a las 8:30 a.m. si no se ha hecho el check

---

## Fase 4 — Financial OS completo
> Prioridad: ALTA · Estimado: 1–2 semanas

- [ ] **Presupuesto mensual editable** — configurar metas por categoría desde la UI
- [ ] **Vista de progreso mensual** — gráfico de ingresos vs gastos vs meta mes a mes
- [ ] **Alerta de brecha comercial** — mostrar cuánto falta para llegar a S/ 15,000/mes
- [ ] **Integración con /proyectos** — ingresos de MarLab reflejados en Financial OS automáticamente
- [ ] **Exportar reporte mensual** — PDF o CSV con el resumen financiero del mes

---

## Fase 5 — Performance y SEO técnico
> Prioridad: MEDIA · Estimado: 1 semana

- [ ] **robots.txt** — indicar a buscadores que no indexen (es app personal)
- [ ] **Lazy loading de páginas** — cargar /finanzas, /cuerpo, /mundial solo cuando se navega a ellas
- [ ] **Optimización de bundle** — auditar con `next build --analyze` y reducir JS inicial
- [ ] **Lighthouse audit** — llegar a score >80 en Performance y Accessibility
- [ ] **`sitemap.xml`** — para las páginas que sí deben ser indexables (ninguna en este caso)

---

## Fase 6 — Integraciones externas
> Prioridad: MEDIA · Estimado: 3–4 semanas

- [ ] **WhatsApp bot** — registrar el Daily Check por WhatsApp sin abrir la app
- [ ] **Google Sheets sync** — exportar datos financieros a una hoja de cálculo automáticamente
- [ ] **Strava / Apple Health** — importar datos de entrenamiento automáticamente para el score
- [ ] **Notificaciones push** — alertas en el móvil para Recovery Mode y recordatorios del sistema

---

## Fase 7 — Score inteligente
> Prioridad: MEDIA · Estimado: 2 semanas

- [ ] **Score multi-dimensional** — combinar operacional + financiero + corporal en un score unificado
- [ ] **Tendencias semanales** — detectar automáticamente si vas mejor o peor que la semana anterior
- [ ] **Correlaciones** — detectar si estrés alto coincide con más gasto hormiga o peor sueño
- [ ] **Sugerencias automáticas** — cuando el score baja, el sistema sugiere qué ajustar

---

## Deuda técnica detectada (auditoría externa)

> Problemas reales identificados en auditoría de mayo 2026 que aplican a Aaron OS

| Problema | Severidad | Estado |
|----------|-----------|--------|
| Sin autenticación — datos personales expuestos | 🔴 Crítico | Pendiente |
| Sin headers de seguridad (CSP, HSTS) | 🔴 Crítico | Pendiente |
| Sin PWA / manifest.json | 🟡 Alto | Pendiente |
| Meta tags genéricos — mismo title en todas las páginas | 🟡 Alto | Pendiente |
| Sin error boundaries — pantalla blanca si falla un componente | 🟡 Alto | Pendiente |
| Sin loading skeletons | 🟠 Medio | Pendiente |
| Validación de formularios incompleta | 🟠 Medio | Pendiente |
| Bundle no optimizado — carga todo al inicio | 🟠 Medio | Pendiente |
| Sin robots.txt | 🟢 Bajo | Pendiente |

> Problemas de la auditoría que NO aplican a Aaron OS (sistema personal, no producto público):
> - "Rebrand a SIR Lite" — Aaron OS es intencional, no un error de branding
> - "Landing page pública" — no es una app para terceros
> - "Diseño frío" — Mission Control es el estilo correcto para este sistema
> - "Sin internacionalización" — solo se usa en español

---

## URLs de producción

| Recurso | URL |
|---------|-----|
| App | https://aaron.marlabinc.com |
| GitHub | https://github.com/aaronhuaynate66/future-self-system |
| Supabase | https://nhylwhqtqolixokicphr.supabase.co |
| Vercel | https://vercel.com (proyecto: future-self-system) |

---

## Contribución

Este es un sistema personal. El flujo de desarrollo es:
1. Cambios en `/home/claude/aaron-os-v2/`
2. `npm run build` — verificar 0 errores TypeScript
3. `git push origin main` — Vercel auto-deploya en 1–2 min
