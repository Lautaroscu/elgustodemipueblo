# E-commerce para Emprendimiento de Postres

Quiero que actúes como un **Senior Full Stack Engineer**, **UX/UI Designer** y **Product Designer** especializado en e-commerce moderno.

Tu objetivo es diseñar y desarrollar una aplicación web completa para un emprendimiento de postres artesanales.

No quiero una página web tradicional. Quiero un producto que se sienta moderno, rápido y extremadamente fácil de usar, pensado para maximizar las ventas.

---

# Objetivo del proyecto

El sitio debe permitir que cualquier persona pueda:

- Descubrir los productos.
- Conocer la marca.
- Realizar un pedido en menos de un minuto.
- Pagar mediante Mercado Pago.
- Volver a comprar fácilmente.

La experiencia debe sentirse simple, rápida y agradable.

---

# Filosofía del producto

No quiero simplemente un e-commerce.

Quiero construir una experiencia digital que haga crecer el emprendimiento.

Cada decisión de diseño y desarrollo debe responder a esta pregunta:

> **¿Esto ayuda a vender más y mejora la experiencia del cliente?**

Si existe una alternativa mejor que la que propongo, explícamela y recomiéndala.

No te limites a seguir instrucciones literalmente: actúa como un Product Designer y Software Architect con experiencia.

---

# Diseño

Quiero un diseño profesional.

No quiero un sitio que tenga la estética típica de aplicaciones generadas por IA.

Debe sentirse como un producto diseñado por un diseñador UI profesional.

Utiliza los colores del logo como base para toda la identidad visual.

El diseño debe transmitir:

- Artesanal
- Premium
- Cercano
- Moderno
- Cálido
- Apetitoso

Incorpora:

- Microanimaciones
- Transiciones suaves
- Bordes sutiles
- Buen uso del espacio
- Excelente jerarquía visual
- Tipografía moderna

Inspirarse en productos como:

- Apple
- Stripe
- Linear
- Airbnb
- Vercel

Pero adaptado al rubro gastronómico.

No copiar diseños.

---

# Landing Page

Debe incluir:

## Hero

- Logo
- Nombre del emprendimiento
- Imagen principal de alta calidad
- Frase principal
- Botón "Comprar ahora"
- Botón "Ver catálogo"

La cara del emprendedor debe ser visible.

El cliente debe sentir que compra a una persona real.

---

## Nuestra historia

Una sección contando:

- Quién es.
- Cómo comenzó.
- Por qué hace postres.
- Qué hace especial al emprendimiento.

Con fotografía profesional.

---

## Productos destacados

Cards modernas con:

- Imagen
- Nombre
- Descripción
- Precio
- Botón Agregar

---

## Promociones

Mostrar promociones activas.

---

## Opiniones

Testimonios de clientes.

---

## Preguntas frecuentes

---

## Footer

- Instagram
- WhatsApp
- Dirección
- Horarios
- Redes sociales

---

# Catálogo

Debe ser extremadamente visual.

Cada producto debe tener:

- Varias imágenes
- Descripción
- Ingredientes
- Precio
- Stock
- Etiquetas
- Categoría
- Promociones

Categorías por ejemplo:

- Tortas
- Cheesecakes
- Cookies
- Brownies
- Alfajores
- Box de regalo

Permitir búsqueda y filtros rápidos.

---

# Experiencia de compra

No quiero un carrito tradicional.

Quiero una experiencia mucho más rápida.

El flujo ideal sería:

El usuario toca **"+"**.

Aparece un pequeño panel flotante mostrando:

- Producto agregado
- Cantidad
- Total acumulado

Sin abandonar el catálogo.

Siempre habrá un botón flotante fijo mostrando:

> **Finalizar pedido ($TOTAL)**

Al presionarlo aparece un Bottom Sheet con:

- Productos
- Cantidades
- Dirección
- Método de entrega
- Observaciones
- Cupón
- Total

Y un gran botón:

> **Pagar con Mercado Pago**

La compra debe requerir la menor cantidad posible de clics.

---

# Mercado Pago

Integración completa.

Debe soportar:

- Checkout Pro
- Preferencias
- Webhooks
- Confirmación automática
- Estados de pago
- Manejo de errores
- Reintentos

---

# Panel de Administración

Ruta protegida.

Ejemplo:

```
/admin
```

Debe incluir login seguro.

---

# Dashboard

Mostrar:

- Ventas del día
- Ventas del mes
- Pedidos
- Productos más vendidos
- Productos sin stock
- Ingresos
- Métricas importantes

---

# Gestión de productos

Permitir:

- Crear
- Editar
- Eliminar
- Duplicar
- Cambiar precio
- Cambiar stock
- Ocultar
- Destacar
- Subir múltiples imágenes
- Reordenar imágenes mediante Drag & Drop

---

# Promociones

Permitir crear:

- 2x1
- 3x2
- % de descuento
- Combo
- Happy Hour

Configurando:

- Fecha inicio
- Fecha fin
- Productos
- Categorías
- Prioridad

---

# Cupones

Permitir crear:

- Descuento fijo
- Descuento porcentual
- Límite de usos
- Vencimiento
- Monto mínimo
- Código personalizado
- Código automático

---

# Pedidos

Lista completa.

Estados:

- Pendiente
- Pagado
- Preparando
- Listo
- Enviado
- Entregado
- Cancelado

Permitir cambiar estados fácilmente.

---

# Clientes

Historial.

Mostrar:

- Pedidos
- Total gastado
- Última compra
- Frecuencia

---

# Configuración

Editar:

- Nombre del negocio
- Redes sociales
- Horarios
- Costos de envío
- Zonas de reparto
- WhatsApp
- Mercado Pago

---

# Responsive

Debe ser Mobile First.

Optimizado para:

- Android
- iPhone
- Tablets
- Notebook
- Desktop

La experiencia móvil es la prioridad.

---

# Performance

Objetivo:

- Lighthouse Performance > 95
- Accessibility > 95
- Best Practices > 95
- SEO > 95

Utilizar:

- Lazy Loading
- Optimización de imágenes
- Code Splitting
- Server Components cuando corresponda
- Caché inteligente
- Compresión
- Optimización de fuentes

---

# SEO

Implementar:

- Sitemap
- Robots
- Canonical
- OpenGraph
- Twitter Cards
- JSON-LD
- Schema.org
- SEO Local
- SEO para productos

---

# Accesibilidad

Cumplir WCAG AA.

- Navegación por teclado
- ARIA
- Buen contraste
- Focus visibles

---

# Tecnologías

Quiero utilizar tecnologías modernas, robustas y ampliamente adoptadas.

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- React Hook Form
- Zod

## Backend

- Next.js Server Actions
- Route Handlers
- Prisma ORM
- PostgreSQL

## Autenticación

- Auth.js

## Storage

- Cloudinary

## Pagos

- Mercado Pago

## Email

- Resend

## Deploy

- Vercel

---

# Calidad del código

El proyecto debe seguir principios profesionales:

- Clean Architecture cuando aporte valor
- Código modular
- Componentes reutilizables
- Tipado estricto
- Buen manejo de errores
- Seguridad
- Escalabilidad
- Fácil mantenimiento

No quiero código improvisado.

Quiero calidad de producción.

---

# UX

La aplicación debe sentirse:

- Premium
- Fluida
- Natural
- Muy rápida

Agregar:

- Skeleton Loaders
- Animaciones suaves
- Estados vacíos
- Estados de error elegantes
- Feedback inmediato
- Confirmaciones visuales

Todo debe minimizar la fricción del usuario.

---

# Entregables

Antes de escribir código:

1. Analiza el proyecto.
2. Propón mejoras.
3. Diseña la arquitectura completa.
4. Diseña la base de datos.
5. Explica la estructura de carpetas.
6. Explica el flujo de navegación.
7. Justifica las decisiones técnicas.
8. Justifica las decisiones de UX.

Luego desarrolla la aplicación de forma incremental, manteniendo siempre un nivel de calidad **production-ready**.

Cada funcionalidad debe estar completamente terminada antes de pasar a la siguiente.

Si identificas una mejor solución de arquitectura, diseño o experiencia de usuario, propónla y explica por qué mejora el producto.