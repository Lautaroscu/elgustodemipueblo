<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# El Gusto de mi Pueblo — notas para agentes

E-commerce de postres. Stack: Next.js 16 (App Router, **Turbopack**), React 19,
TypeScript, Tailwind **v4** (tokens en `src/app/globals.css`, no `tailwind.config`),
Prisma **6** + PostgreSQL, Auth.js v5, Framer Motion, Zustand.

## Correr localmente
- DB: `npm run db:up` (Postgres en Docker, **puerto 5455**). Migrar: `npm run db:migrate`. Seed: `npm run db:seed`.
- Dev: `npm run dev`. Build: `npm run build`. Tipos: `npm run typecheck`.
- Admin seedeado: `admin@elgustodemipueblo.com.ar` / `egmp2026`.

## Convenciones del repo
- **Prisma 6** (no 7): el schema usa `url = env("DATABASE_URL")` clásico.
- **lucide-react 1.x** removió íconos de marca → Instagram/WhatsApp están en `src/components/shared/icons.tsx`.
- Fuentes: Geist (sans) + **Fraunces** (display, variable — sin `weight`/`axes` en el loader).
- Protección de `/admin`: `src/proxy.ts` (convención `proxy`, no `middleware`).
- Totales/promos/cupones se recalculan **siempre en el servidor** (`src/domain/pricing.ts`, `src/data/orders.ts`). Nunca confiar en el total del cliente.
- Carrito: Zustand con persistencia (`src/components/shop/cart/cart-store.ts`), guest checkout (sin cuenta de cliente).
- Server actions admin: empezar con `requireAdmin()` (`src/lib/admin-guard.ts`).
- Integraciones degradan con elegancia si no hay credenciales (MP/Cloudinary/Resend).
