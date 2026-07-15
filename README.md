# El Gusto de mi Pueblo 🍰

E-commerce moderno para un emprendimiento de postres artesanales. Checkout en
menos de un minuto, multi-pago (Mercado Pago, transferencia, efectivo) y cierre
por WhatsApp. Panel de administración completo.

Stack: **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 ·
Prisma · PostgreSQL · Auth.js · Mercado Pago · Cloudinary · Resend**.

> Documento de arquitectura y decisiones: [`ARQUITECTURA.md`](./ARQUITECTURA.md)

---

## Puesta en marcha

Requisitos: Node 20+, Docker (para Postgres local).

```bash
# 1. Variables de entorno
cp .env.example .env        # y completá lo que necesites

# 2. Base de datos (Postgres en Docker, puerto 5455)
npm run db:up

# 3. Migraciones + datos de ejemplo (catálogo, promos, cupón, admin)
npm run db:migrate
npm run db:seed

# 4. Desarrollo
npm run dev                 # http://localhost:3000
```

### Acceso al admin

- URL: `/admin`
- Usuario y clave: los definidos en `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).
  Por defecto en el seed: `admin@elgustodemipueblo.com.ar` / `egmp2026`.

> ⚠️ Cambiá `ADMIN_PASSWORD` y `AUTH_SECRET` antes de producción.

---

## Scripts

| Script               | Descripción                             |
| -------------------- | --------------------------------------- |
| `npm run dev`        | Servidor de desarrollo                  |
| `npm run build`      | Build de producción                     |
| `npm run typecheck`  | Chequeo de tipos                        |
| `npm run db:up`      | Levanta Postgres (docker compose)       |
| `npm run db:migrate` | Aplica migraciones de Prisma            |
| `npm run db:seed`    | Carga catálogo, promos, cupón y admin   |
| `npm run db:studio`  | Prisma Studio (explorar la base)        |
| `npm run db:reset`   | Reinicia la base y re-seedea            |

---

## Integraciones (opcionales en dev)

Todo funciona sin credenciales; estas integraciones se activan al configurarlas:

- **Mercado Pago** (`MP_ACCESS_TOKEN`): habilita Checkout Pro. Sin token, el
  pedido con MP se crea como pendiente y se cierra por WhatsApp. El webhook vive
  en `/api/mp/webhook` (valida firma con `MP_WEBHOOK_SECRET`).
- **Cloudinary** (`CLOUDINARY_*`): habilita la subida de imágenes en el admin.
  Sin credenciales, se pueden cargar imágenes por URL.
- **Resend** (`RESEND_API_KEY`): envía el email de confirmación al cliente.

---

## Estructura

```
src/
├── app/
│   ├── (shop)/          # tienda pública (landing, catálogo, producto, pedido)
│   ├── admin/           # panel (login + grupo (panel) protegido)
│   ├── api/             # webhook MP, auth
│   └── actions/         # server actions (pedidos, admin)
├── components/          # ui (shadcn), shop, admin, shared
├── domain/              # lógica pura (precios, promos, settings)
├── data/                # repositorios Prisma
├── lib/                 # mp, cloudinary, email, auth, utils
└── proxy.ts             # protección de /admin (edge)
prisma/                  # schema + seed
```

---

## Funcionalidades

**Tienda**: landing (hero, historia, destacados, promos, opiniones, FAQ),
catálogo con búsqueda y filtros, ficha de producto, carrito flotante sin salir
del catálogo, checkout en bottom sheet, seguimiento de pedido.

**Admin**: dashboard con métricas, gestión de pedidos con estados, CRUD de
productos con imágenes drag & drop, promociones (2x1, 3x2, %, combo, happy
hour), cupones, clientes y configuración del negocio.

**Extras**: SEO (sitemap, robots, OpenGraph, JSON-LD), PWA (manifest), diseño
mobile-first, accesibilidad (focus visible, ARIA, reduced-motion).
