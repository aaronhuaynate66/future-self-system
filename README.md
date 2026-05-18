# Aaron OS — Mission Control v2

> **Misión:** Conseguir paz.  
> **Ventana:** 2026-06-01 → 2026-08-31 · Mundial de bomberos noviembre 2026

Sistema operativo personal. Una herramienta diaria para reducir caos mental, sostener estructura y mantener hábitos durante 90 días.

---

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** — paleta oscura premium, sin SaaS
- **Framer Motion** — microanimaciones ejecutivas
- **Lucide React** — íconos
- **localStorage** — persistencia local (listo para Supabase)

---

## Pantallas

| Ruta | Descripción |
|------|-------------|
| `/hoy` | Mission Control del día. Estado operativo, checklist, Top 3, timeline |
| `/horario` | **Pantalla principal.** Tabla semanal ejecutiva con bloques por hora |
| `/registro` | Formulario diario: 5 checks + paz + sueño + nota |
| `/score` | Score semanal, gauge animado, Recovery Mode, tiers S→D |
| `/finanzas` | Contexto: ingresos, meta, pipeline |
| `/mundial` | Contexto: logística del mundial, ahorro, baseline corporal |
| `/proyectos` | Contexto: proyectos activos |
| `/reglas` | Las 6 reglas del Yo Futuro |

---

## Correr localmente

```bash
npm install
npm run dev
# → http://localhost:3000 (redirige a /hoy)
```

Otros comandos:

```bash
npm run build        # Build de producción
npm start            # Servir el build
npm run type-check   # Validar TypeScript
```

---

## Deploy en Vercel + aaron.marlabinc.com

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "feat: aaron-os v2"
git branch -M main
git remote add origin git@github.com:<tu-usuario>/aaron-os.git
git push -u origin main
```

### 2. Conectar con Vercel

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Import → seleccionar repo → Framework: **Next.js** (auto-detectado)
3. Deploy (sin variables de entorno por ahora)

### 3. Dominio en Vercel

1. Project → Settings → Domains → Add `aaron.marlabinc.com`
2. Vercel muestra el CNAME target: `cname.vercel-dns.com`

### 4. DNS en Cloudflare

Agregar record:

| Tipo | Nombre | Target | Proxy |
|------|--------|--------|-------|
| CNAME | aaron | cname.vercel-dns.com | DNS only (gris) |

> ⚠️ Dejar en DNS only durante la primera verificación. Vercel emite TLS automáticamente.

### 5. Redeploy automático

Cada `git push` a `main` dispara un deploy automático en Vercel.

---

## Arquitectura

```
app/
  hoy/          → Mission Control del día
  horario/      → Pantalla principal - tabla semanal
  registro/     → Input diario
  score/        → Lectura semanal + Recovery Mode
  finanzas/     → Contexto: capital
  mundial/      → Contexto: misión física
  proyectos/    → Contexto: ejecución
  reglas/       → Identidad operativa
  layout.tsx    → Shell con Sidebar + Header
  globals.css

components/
  ui/
    Card.tsx    → Glass card base
    Button.tsx  → Botones con variantes
    Badge.tsx   → Status badges
    ProgressBar.tsx
  Header.tsx    → Status en tiempo real
  Sidebar.tsx   → Navegación con jerarquía OS/Contexto
  MobileNav.tsx

lib/
  state.tsx     → Context + Reducer global
  storage.ts    → StorageDriver (localStorage → Supabase ready)
  score.ts      → scoreDay, summarizeWeek, Recovery Mode
  operational.ts → Estados operativos
  schedule.ts   → currentAndNext, timeline
  dates.ts
  utils.ts

data/
  schedule.ts   → Horario oficial + paleta de colores
  rules.ts      → Reglas + misión + fechas clave
  initial-data.ts

types/
  index.ts      → Tipos completos
```

---

## Estados operativos

| Estado | Condición | Color |
|--------|-----------|-------|
| LOCKED IN | Score ≥ 90 | Cyan |
| FOCUSED | Score 80–89 | Verde |
| OPERATIONAL | Score 60–79 | Cyan soft |
| UNSTABLE | Score < 60 o con migraña/discusión | Amber |
| REACTIVE | Score < 40 o sueño mal + paz roja | Rojo |

## Recovery Mode

Se activa automáticamente cuando el score semanal baja de 45.  
La UI simplifica, muestra pasos de recuperación, y reduce el ruido visual.

---

## Roadmap

- [ ] Migrar storage → Supabase driver (interfaz ya lista)
- [ ] Auth (solo Aaron) con Supabase Auth
- [ ] Notificación nocturna para el check-in
- [ ] Export CSV de bitácora
- [ ] Sync multi-dispositivo

---

## Filosofía

> La paz mental es infraestructura de rendimiento.  
> Menos abrir cosas nuevas. Más hacer funcionar lo que ya existe.  
> Lo importante debe volverse visible.
