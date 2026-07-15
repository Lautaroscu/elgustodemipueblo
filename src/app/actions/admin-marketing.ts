"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { PromotionType, CouponType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

/* ----------------------------- Cupones ----------------------------- */

const couponSchema = z.object({
  codigo: z.string().trim().min(3).max(40),
  tipo: z.enum(["FIJO", "PORCENTAJE"]),
  valor: z.number().int().min(1),
  montoMinimo: z.number().int().min(0).default(0),
  usosMax: z.number().int().min(1).nullable().optional(),
  vence: z.string().optional().nullable(),
  activo: z.boolean().default(true),
});

export async function saveCoupon(
  raw: z.input<typeof couponSchema>,
  id?: string,
) {
  await requireAdmin();
  const d = couponSchema.parse(raw);
  const data = {
    codigo: d.codigo.toUpperCase(),
    tipo: d.tipo as CouponType,
    valor: d.valor,
    montoMinimo: d.montoMinimo,
    usosMax: d.usosMax ?? null,
    vence: d.vence ? new Date(d.vence) : null,
    activo: d.activo,
  };
  try {
    if (id) {
      await prisma.coupon.update({ where: { id }, data });
    } else {
      await prisma.coupon.create({ data });
    }
  } catch {
    return { ok: false as const, error: "Ese código de cupón ya existe." };
  }
  revalidatePath("/admin/cupones");
  return { ok: true as const };
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/cupones");
  return { ok: true };
}

export async function toggleCoupon(id: string, activo: boolean) {
  await requireAdmin();
  await prisma.coupon.update({ where: { id }, data: { activo } });
  revalidatePath("/admin/cupones");
  return { ok: true };
}

/* --------------------------- Promociones --------------------------- */

const promoSchema = z.object({
  nombre: z.string().trim().min(2).max(80),
  tipo: z.enum([
    "DOS_POR_UNO",
    "TRES_POR_DOS",
    "PORCENTAJE",
    "COMBO",
    "HAPPY_HOUR",
  ]),
  valor: z.number().int().min(0).default(0),
  desde: z.string().optional().nullable(),
  hasta: z.string().optional().nullable(),
  horaInicio: z.number().int().min(0).max(23).nullable().optional(),
  horaFin: z.number().int().min(0).max(23).nullable().optional(),
  prioridad: z.number().int().default(0),
  activo: z.boolean().default(true),
  categorias: z.array(z.string()).default([]),
  productos: z.array(z.string()).default([]),
});

export async function savePromotion(
  raw: z.input<typeof promoSchema>,
  id?: string,
) {
  await requireAdmin();
  const d = promoSchema.parse(raw);
  const base = {
    nombre: d.nombre,
    tipo: d.tipo as PromotionType,
    valor: d.valor,
    desde: d.desde ? new Date(d.desde) : null,
    hasta: d.hasta ? new Date(d.hasta) : null,
    horaInicio: d.horaInicio ?? null,
    horaFin: d.horaFin ?? null,
    prioridad: d.prioridad,
    activo: d.activo,
    categorias: d.categorias,
  };

  if (id) {
    await prisma.$transaction([
      prisma.promotionProduct.deleteMany({ where: { promotionId: id } }),
      prisma.promotion.update({
        where: { id },
        data: {
          ...base,
          productos: { create: d.productos.map((pid) => ({ productId: pid })) },
        },
      }),
    ]);
  } else {
    await prisma.promotion.create({
      data: {
        ...base,
        productos: { create: d.productos.map((pid) => ({ productId: pid })) },
      },
    });
  }
  revalidatePath("/admin/promociones");
  revalidatePath("/catalogo");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deletePromotion(id: string) {
  await requireAdmin();
  await prisma.promotion.delete({ where: { id } });
  revalidatePath("/admin/promociones");
  return { ok: true };
}

export async function togglePromotion(id: string, activo: boolean) {
  await requireAdmin();
  await prisma.promotion.update({ where: { id }, data: { activo } });
  revalidatePath("/admin/promociones");
  revalidatePath("/");
  return { ok: true };
}
