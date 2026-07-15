# El Gusto de mi Pueblo — Arquitectura y Plan Técnico

> Documento previo al código. Cubre los 8 entregables pedidos en `SPECT.MD`:
> análisis, mejoras propuestas, arquitectura, base de datos, estructura de
> carpetas, flujo de navegación, justificación técnica y justificación UX.

---

## 1. Análisis del proyecto

**Qué es:** tienda de postres artesanales (Argentina) que hoy opera por
Instagram/WhatsApp. El objetivo no es "una web más", sino un producto que
**venda más** y reduzca la fricción de compra a menos de un minuto.

**Contexto real detectado en el Instagram (`elgustodemipueblo2023`):**
- Bio: **"Transferencia-efectivo"** → los medios de pago reales incluyen
  transferencia y efectivo, no solo Mercado Pago.
- Todo el flujo de contacto/venta hoy pasa por **WhatsApp** (número visible
  `228140208`) e Instagram.
- Hacen **sorteos y promos** (ej. "Sorteo Día del Padre").
- Producto estrella tipo **postres en vaso / tortas** (fotos del feed).

**Implicancia:** el diseño debe respetar cómo ya venden (WhatsApp + varios
medios de pago), no forzar un único checkout online.

---

## 2. Mejoras propuestas (antes de codear)

1. **Checkout sin cuenta (guest checkout).** El cliente NO se registra. Pide
   con nombre + teléfono + dirección. Menos fricción = más conversión. El
   único login del sistema es el del admin.
2. **Múltiples medios de pago, no solo MP.**
   - Mercado Pago (Checkout Pro) para pago online.
   - Transferencia (mostrar alias/CBU + subir comprobante opcional).
   - Efectivo (pago contra entrega / retiro).
   Esto refleja el negocio real y evita perder ventas.
3. **Cierre por WhatsApp como camino de respaldo.** Botón "Confirmar por
   WhatsApp" que arma el mensaje con el pedido ya cargado (deep link
   `wa.me`). Captura la venta aunque el cliente no quiera pagar online.
4. **Order lookup por teléfono** en vez de cuentas de usuario: el cliente
   consulta el estado de su pedido con teléfono + código, sin password.
5. **Panel admin como PWA** para que la dueña gestione pedidos desde el
   celular (instalable, notificaciones de pedido nuevo).
6. **Snapshot de precios en el pedido.** Cada `OrderItem` guarda el precio al
   momento de la compra; cambiar el precio del producto no altera pedidos
   viejos.
7. **Zonas de envío con costo configurable** (el reparto local lo amerita).

---

## 3. Arquitectura general

**Monolito Next.js (App Router) full-stack sobre Vercel.** Simple de operar,
suficiente para el volumen, y todo el stack pedido encaja sin fricción.

```
Navegador (Mobile-first, PWA)
        │
        ▼
Next.js App Router (Vercel)
 ├── React Server Components  → catálogo/landing (SEO + velocidad)
 ├── Client Components        → carrito flotante, bottom sheet, admin
 ├── Server Actions           → mutaciones (crear pedido, CRUD admin)
 └── Route Handlers (/api)    → webhook Mercado Pago, health, revalidate
        │
        ▼
Prisma ORM → PostgreSQL (Neon/Supabase serverless)
        │
        ├── Cloudinary  (imágenes de producto, optimización)
        ├── Mercado Pago (Checkout Pro + webhooks)
        ├── Resend      (email confirmación pedido)
        └── Auth.js     (solo login admin, credentials + sesión JWT)
```

**Capas (Clean Architecture donde aporta, sin sobre-ingeniería):**
- `domain/` tipos y reglas de negocio (cálculo de totales, promos, cupones).
- `data/` repositorios Prisma.
- `app/` UI + Server Actions (orquestación).
- Los cálculos de precio/promoción viven en `domain` y se ejecutan **en el
  servidor** (nunca confiar en totales calculados en el cliente).

---

## 4. Modelo de datos (Prisma / PostgreSQL)

```
Category      id, nombre, slug, orden, visible
Product       id, nombre, slug, descripcion, ingredientes, precio,
              stock, destacado, visible, categoryId, orden, tags[]
ProductImage  id, productId, url, publicId(Cloudinary), alt, orden
Promotion     id, tipo(2x1|3x2|PORCENTAJE|COMBO|HAPPY_HOUR), valor,
              desde, hasta, prioridad, activo, (productos/categorías M2M)
Coupon        id, codigo, tipo(FIJO|PORCENTAJE), valor, usosMax, usos,
              montoMinimo, vence, activo
Order         id, codigo(público corto), estado, subtotal, descuento,
              costoEnvio, total, metodoPago(MP|TRANSFERENCIA|EFECTIVO),
              metodoEntrega(ENVIO|RETIRO), estadoPago, mpPaymentId,
              observaciones, createdAt
OrderItem     id, orderId, productId, nombre(snapshot), precio(snapshot),
              cantidad
Customer      id, nombre, telefono(unique), direccion, email?
              (derivado del pedido; agrupa historial sin login)
Setting       clave/valor: negocio, redes, horarios, envíos, zonas,
              whatsapp, alias/CBU, credenciales MP (referencia)
AdminUser     id, email, passwordHash, rol
```

Estados de pedido: `PENDIENTE → PAGADO → PREPARANDO → LISTO → ENVIADO →
ENTREGADO` (+ `CANCELADO`). El webhook de MP mueve `estadoPago`.

---

## 5. Estructura de carpetas

```
src/
├── app/
│   ├── (shop)/                 # público
│   │   ├── page.tsx            # landing
│   │   ├── catalogo/
│   │   ├── producto/[slug]/
│   │   └── pedido/[codigo]/    # seguimiento por código
│   ├── (admin)/admin/          # protegido
│   │   ├── page.tsx            # dashboard
│   │   ├── productos/
│   │   ├── pedidos/
│   │   ├── promociones/
│   │   ├── cupones/
│   │   ├── clientes/
│   │   └── configuracion/
│   ├── api/
│   │   ├── mp/webhook/route.ts
│   │   └── revalidate/route.ts
│   └── layout.tsx
├── components/                 # ui (shadcn), shop, admin, shared
├── domain/                     # precios, promos, cupones (puro)
├── data/                       # repos Prisma
├── lib/                        # mp, cloudinary, resend, auth, utils
├── hooks/
└── styles/
prisma/schema.prisma
```

---

## 6. Flujo de navegación (compra en <1 min)

1. Landing → "Ver catálogo" o "Comprar ahora".
2. Catálogo: card con **"+"** → panel flotante (producto, cantidad, total
   acumulado) sin salir de la página. Botón fijo **"Finalizar pedido
   ($TOTAL)"** siempre visible.
3. Tap en el botón fijo → **Bottom Sheet**: items, dirección, método de
   entrega, observaciones, cupón, total.
4. Elección de pago:
   - **Mercado Pago** → Checkout Pro → webhook confirma → pantalla de éxito.
   - **Transferencia/Efectivo** → pedido creado como PENDIENTE + datos de
     pago → opción "Confirmar por WhatsApp".
5. Seguimiento en `/pedido/[codigo]`.

Estado del carrito en cliente con **Zustand + persistencia localStorage**;
el total definitivo **se recalcula en el servidor** al crear el pedido.

---

## 7. Justificación técnica (resumen)

- **App Router + RSC:** catálogo renderizado en servidor → SEO y Lighthouse
  altos, menos JS al cliente.
- **Server Actions:** mutaciones sin construir una API REST completa; menos
  código, tipado end-to-end.
- **Prisma + Postgres serverless (Neon):** encaja con Vercel, migraciones
  versionadas, tipado.
- **Zustand para carrito:** liviano, sin boilerplate, persiste el carrito.
- **Zod en el borde:** valida formularios (RHF) y payloads de Server Actions.
- **Cloudinary:** transformaciones/`f_auto,q_auto` para performance de
  imágenes (crítico en gastronomía).
- **Webhook idempotente + validación de firma** para MP; el estado de pago
  nunca se confía desde el redirect del cliente.

## 8. Justificación UX (resumen)

- **Guest checkout** elimina la barrera #1 de conversión.
- **Carrito flotante + botón fijo:** el usuario nunca pierde contexto del
  catálogo (patrón de apps de delivery que ya conocen).
- **Bottom sheet** en mobile = gesto nativo, rápido, familiar.
- **Multi-pago + WhatsApp:** respeta cómo ya compran hoy.
- Skeletons, estados vacíos/errores elegantes, feedback inmediato al agregar.

---

## Orden de construcción propuesto (incremental, cada etapa terminada)

1. Scaffold: Next.js + TS + Tailwind + shadcn + Prisma + tokens de marca.
2. Modelo de datos + seed con productos reales.
3. Landing (hero, historia, destacados, promos, opiniones, FAQ, footer).
4. Catálogo + carrito flotante + bottom sheet.
5. Creación de pedido (server) + multi-pago + WhatsApp.
6. Integración Mercado Pago + webhook.
7. Admin: auth, dashboard, productos, pedidos.
8. Promos, cupones, clientes, configuración.
9. SEO, performance, accesibilidad, PWA.
```
```
