import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { computeCart, type CartLine, type PricingResult } from "@/domain/pricing";
import { getActivePromotions } from "./promotions";
import { getSettings } from "./settings";
import type { CreateOrderInput } from "@/lib/validations";

export type PricedOrder = {
  lines: (CartLine & { stock: number; slug: string; prepMinutos: number })[];
  pricing: PricingResult;
  costoEnvioBruto: number;
  cuponAplicado: string | null;
  cuponError: string | null;
};

/**
 * Recalcula el pedido en el servidor con datos frescos: precios reales,
 * promociones vigentes, cupón validado y costo de envío por zona.
 * Nunca confía en totales enviados por el cliente.
 */
export async function priceOrder(input: {
  items: { productId: string; cantidad: number }[];
  metodoEntrega: "ENVIO" | "RETIRO";
  zona?: string;
  cupon?: string;
}): Promise<PricedOrder> {
  const ids = input.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, visible: true },
    include: { imagenes: { orderBy: { orden: "asc" }, take: 1 } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: PricedOrder["lines"] = [];
  for (const item of input.items) {
    const p = byId.get(item.productId);
    if (!p) continue;
    const cantidad = Math.min(item.cantidad, p.stock);
    if (cantidad <= 0) continue;
    lines.push({
      productId: p.id,
      slug: p.slug,
      nombre: p.nombre,
      precio: p.precio,
      categoryId: p.categoryId,
      stock: p.stock,
      prepMinutos: p.prepMinutos,
      cantidad,
    });
  }

  const promotions = await getActivePromotions();
  const settings = await getSettings();

  // Costo de envío según zona.
  let costoEnvioBruto = 0;
  if (input.metodoEntrega === "ENVIO") {
    const zona = settings.zonas.find((z) => z.nombre === input.zona);
    costoEnvioBruto = zona?.costo ?? settings.costoEnvioBase;
  }

  // Validación de cupón.
  let cuponAplicado: string | null = null;
  let cuponError: string | null = null;
  let coupon = null;
  if (input.cupon) {
    const codigo = input.cupon.trim().toUpperCase();
    const c = await prisma.coupon.findUnique({ where: { codigo } });
    const now = new Date();
    if (!c || !c.activo) {
      cuponError = "El cupón no existe o no está activo.";
    } else if (c.vence && c.vence < now) {
      cuponError = "El cupón está vencido.";
    } else if (c.usosMax != null && c.usos >= c.usosMax) {
      cuponError = "El cupón alcanzó su límite de usos.";
    } else {
      coupon = {
        codigo: c.codigo,
        tipo: c.tipo,
        valor: c.valor,
        montoMinimo: c.montoMinimo,
      };
      cuponAplicado = c.codigo;
    }
  }

  const pricing = computeCart({
    lines,
    promotions,
    coupon,
    costoEnvio: costoEnvioBruto,
    envioGratisDesde: settings.envioGratisDesde,
  });

  // Si el cupón no llegó al mínimo, avisar.
  if (coupon && !pricing.descuentos.some((d) => d.etiqueta.includes(coupon!.codigo))) {
    cuponError = `El cupón requiere un mínimo de $${coupon.montoMinimo.toLocaleString("es-AR")}.`;
    cuponAplicado = null;
  }

  return { lines, pricing, costoEnvioBruto, cuponAplicado, cuponError };
}

export async function createOrder(
  input: CreateOrderInput,
  sessionCustomerId?: string | null,
) {
  const priced = await priceOrder({
    items: input.items,
    metodoEntrega: input.metodoEntrega,
    zona: input.zona,
    cupon: input.cupon,
  });

  if (priced.lines.length === 0) {
    throw new Error("No hay productos disponibles en el pedido.");
  }

  const { generateOrderCode } = await import("@/lib/utils");
  const { totalPrepMinutos, prepStartTime } = await import("@/domain/scheduling");
  const { buildResumen } = await import("@/domain/address");

  const telefono = input.cliente.telefono.trim();
  const nombre = input.cliente.nombre.trim();
  const email = input.cliente.email || null;

  // Resolución del cliente:
  //  - Logueado (Google): usamos su Customer y le vinculamos el teléfono.
  //  - Guest: upsert por teléfono (cero fricción, se reconoce en la próxima).
  let customer;
  if (sessionCustomerId) {
    customer = await prisma.customer.findUnique({
      where: { id: sessionCustomerId },
    });
  }
  if (customer) {
    const telefonoLibre = await prisma.customer.findFirst({
      where: { telefono, NOT: { id: customer.id } },
    });
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        nombre,
        ...(email ? { email } : {}),
        ...(telefonoLibre ? {} : { telefono }),
      },
    });
  } else {
    customer = await prisma.customer.upsert({
      where: { telefono },
      create: { telefono, nombre, email },
      update: { nombre, ...(email ? { email } : {}) },
    });
  }

  // Dirección de entrega (dinámica). Se guarda para reutilizar y se snapshotea.
  const entregaDatos =
    input.metodoEntrega === "ENVIO" ? input.entregaDatos ?? {} : null;
  let addressId: string | null = null;

  if (input.metodoEntrega === "ENVIO") {
    if (input.addressId) {
      const existing = await prisma.address.findFirst({
        where: { id: input.addressId, customerId: customer.id },
      });
      if (existing) addressId = existing.id;
    }
    if (!addressId && entregaDatos && Object.keys(entregaDatos).length > 0) {
      const count = await prisma.address.count({
        where: { customerId: customer.id },
      });
      const nueva = await prisma.address.create({
        data: {
          customerId: customer.id,
          etiqueta: input.etiquetaDireccion || "Casa",
          datos: entregaDatos,
          resumen: buildResumen(entregaDatos),
          esPredeterminada: count === 0,
        },
      });
      addressId = nueva.id;
    }
  }

  // Scheduling de preparación.
  const prepMinutos = totalPrepMinutos(priced.lines);
  const fechaEntrega =
    input.cuando === "PROGRAMADO" && input.fechaEntrega
      ? new Date(input.fechaEntrega)
      : null;
  const prepInicioEstimado = prepStartTime(fechaEntrega, prepMinutos);

  // Código único (reintenta ante colisión improbable).
  let codigo = generateOrderCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.order.findUnique({ where: { codigo } });
    if (!exists) break;
    codigo = generateOrderCode();
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        codigo,
        estado: "PENDIENTE",
        subtotal: priced.pricing.subtotal,
        descuento: priced.pricing.descuentoTotal,
        costoEnvio: priced.pricing.costoEnvio,
        total: priced.pricing.total,
        cuponCodigo: priced.cuponAplicado,
        metodoPago: input.metodoPago,
        metodoEntrega: input.metodoEntrega,
        estadoPago: "PENDIENTE",
        observaciones: input.observaciones || null,
        customerId: customer.id,
        addressId,
        entregaDatos: entregaDatos ?? undefined,
        cuando: input.cuando,
        fechaEntrega,
        prepMinutos,
        prepInicioEstimado,
        items: {
          create: priced.lines.map((l) => ({
            productId: l.productId,
            nombre: l.nombre,
            precio: l.precio,
            cantidad: l.cantidad,
          })),
        },
        eventos: {
          create: {
            estado: "PENDIENTE",
            actor: "sistema",
            nota: "Pedido creado",
          },
        },
      },
      include: { items: true, customer: true },
    });

    for (const l of priced.lines) {
      await tx.product.update({
        where: { id: l.productId },
        data: { stock: { decrement: l.cantidad } },
      });
    }

    if (priced.cuponAplicado) {
      await tx.coupon.update({
        where: { codigo: priced.cuponAplicado },
        data: { usos: { increment: 1 } },
      });
    }

    return created;
  });

  return { order, priced };
}

export type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: true;
    customer: true;
    address: true;
    eventos: true;
  };
}>;

export async function getOrderByCode(codigo: string): Promise<OrderWithRelations | null> {
  return prisma.order.findUnique({
    where: { codigo: codigo.toUpperCase() },
    include: {
      items: true,
      customer: true,
      address: true,
      eventos: { orderBy: { createdAt: "desc" } },
    },
  }) as Promise<OrderWithRelations | null>;
}
