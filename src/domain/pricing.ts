/**
 * Motor de precios — puro y sin dependencias de Prisma para poder testearlo
 * y reutilizarlo. El TOTAL definitivo siempre se calcula en el servidor con
 * datos frescos de la base; el cliente sólo lo usa para previsualizar.
 */

export type PromotionType =
  | "DOS_POR_UNO"
  | "TRES_POR_DOS"
  | "PORCENTAJE"
  | "COMBO"
  | "HAPPY_HOUR";

export type CartLine = {
  productId: string;
  nombre: string;
  precio: number; // unitario, ARS sin decimales
  cantidad: number;
  categoryId: string;
};

export type PricingPromotion = {
  id: string;
  nombre: string;
  tipo: PromotionType;
  valor: number;
  prioridad: number;
  horaInicio?: number | null;
  horaFin?: number | null;
  productIds: string[];
  categoryIds: string[];
};

export type PricingCoupon = {
  codigo: string;
  tipo: "FIJO" | "PORCENTAJE";
  valor: number;
  montoMinimo: number;
};

export type AppliedDiscount = {
  etiqueta: string;
  monto: number;
};

export type PricingResult = {
  subtotal: number;
  descuentos: AppliedDiscount[];
  descuentoTotal: number;
  costoEnvio: number;
  total: number;
};

function promoAlcanza(promo: PricingPromotion, line: CartLine): boolean {
  if (promo.productIds.length === 0 && promo.categoryIds.length === 0) {
    return true; // promo global
  }
  return (
    promo.productIds.includes(line.productId) ||
    promo.categoryIds.includes(line.categoryId)
  );
}

function happyHourActiva(
  promo: PricingPromotion,
  now: Date,
): boolean {
  if (promo.horaInicio == null || promo.horaFin == null) return true;
  const h = now.getHours();
  if (promo.horaInicio <= promo.horaFin) {
    return h >= promo.horaInicio && h < promo.horaFin;
  }
  // franja que cruza medianoche
  return h >= promo.horaInicio || h < promo.horaFin;
}

/** Descuento que una promo aplica sobre una línea concreta. */
function descuentoLinea(
  promo: PricingPromotion,
  line: CartLine,
  now: Date,
): number {
  switch (promo.tipo) {
    case "DOS_POR_UNO":
      return Math.floor(line.cantidad / 2) * line.precio;
    case "TRES_POR_DOS":
      return Math.floor(line.cantidad / 3) * line.precio;
    case "PORCENTAJE":
    case "COMBO":
      return Math.round((line.precio * line.cantidad * promo.valor) / 100);
    case "HAPPY_HOUR":
      return happyHourActiva(promo, now)
        ? Math.round((line.precio * line.cantidad * promo.valor) / 100)
        : 0;
    default:
      return 0;
  }
}

export type ComputeInput = {
  lines: CartLine[];
  promotions?: PricingPromotion[];
  coupon?: PricingCoupon | null;
  costoEnvio?: number;
  envioGratisDesde?: number | null;
  now?: Date;
};

/**
 * Calcula subtotal, descuentos (mejor promo por línea, no acumulables entre sí),
 * cupón y envío.
 */
export function computeCart({
  lines,
  promotions = [],
  coupon = null,
  costoEnvio = 0,
  envioGratisDesde = null,
  now = new Date(),
}: ComputeInput): PricingResult {
  const subtotal = lines.reduce((s, l) => s + l.precio * l.cantidad, 0);
  const descuentos: AppliedDiscount[] = [];

  // Para cada línea, se elige la promo de mayor descuento (desempata prioridad).
  const promoTotals = new Map<string, { nombre: string; monto: number }>();

  for (const line of lines) {
    let mejor: { promo: PricingPromotion; monto: number } | null = null;
    for (const promo of promotions) {
      if (!promoAlcanza(promo, line)) continue;
      const monto = descuentoLinea(promo, line, now);
      if (monto <= 0) continue;
      if (
        !mejor ||
        monto > mejor.monto ||
        (monto === mejor.monto && promo.prioridad > mejor.promo.prioridad)
      ) {
        mejor = { promo, monto };
      }
    }
    if (mejor) {
      const acc = promoTotals.get(mejor.promo.id) ?? {
        nombre: mejor.promo.nombre,
        monto: 0,
      };
      acc.monto += mejor.monto;
      promoTotals.set(mejor.promo.id, acc);
    }
  }

  for (const { nombre, monto } of promoTotals.values()) {
    if (monto > 0) descuentos.push({ etiqueta: nombre, monto });
  }

  let descuentoTotal = descuentos.reduce((s, d) => s + d.monto, 0);
  const subtotalConPromos = Math.max(0, subtotal - descuentoTotal);

  // Cupón sobre el subtotal ya con promos.
  if (coupon && subtotalConPromos >= coupon.montoMinimo) {
    const montoCupon =
      coupon.tipo === "FIJO"
        ? Math.min(coupon.valor, subtotalConPromos)
        : Math.round((subtotalConPromos * coupon.valor) / 100);
    if (montoCupon > 0) {
      descuentos.push({ etiqueta: `Cupón ${coupon.codigo}`, monto: montoCupon });
      descuentoTotal += montoCupon;
    }
  }

  const subtotalFinal = Math.max(0, subtotal - descuentoTotal);

  // Envío gratis por monto.
  const envio =
    envioGratisDesde != null && subtotalFinal >= envioGratisDesde
      ? 0
      : costoEnvio;

  return {
    subtotal,
    descuentos,
    descuentoTotal,
    costoEnvio: envio,
    total: subtotalFinal + envio,
  };
}
