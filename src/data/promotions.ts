import { cache } from "react";
import { prisma } from "@/lib/db";
import type { PricingPromotion } from "@/domain/pricing";

/** Promociones activas y vigentes por fecha, listas para el motor de precios. */
export const getActivePromotions = cache(
  async (): Promise<PricingPromotion[]> => {
    const now = new Date();
    const promos = await prisma.promotion.findMany({
      where: {
        activo: true,
        AND: [
          { OR: [{ desde: null }, { desde: { lte: now } }] },
          { OR: [{ hasta: null }, { hasta: { gte: now } }] },
        ],
      },
      include: { productos: true },
      orderBy: { prioridad: "desc" },
    });

    return promos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      tipo: p.tipo,
      valor: p.valor,
      prioridad: p.prioridad,
      horaInicio: p.horaInicio,
      horaFin: p.horaFin,
      productIds: p.productos.map((x) => x.productId),
      categoryIds: p.categorias,
    }));
  },
);
