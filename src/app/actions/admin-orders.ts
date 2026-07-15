"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export async function updateOrderStatus(codigo: string, estado: OrderStatus) {
  await requireAdmin();
  await prisma.order.update({ where: { codigo }, data: { estado } });
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${codigo}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function updatePaymentStatus(
  codigo: string,
  estadoPago: PaymentStatus,
) {
  await requireAdmin();
  const data: { estadoPago: PaymentStatus; estado?: OrderStatus } = {
    estadoPago,
  };
  // Si se marca pago aprobado y sigue pendiente, avanza a CONFIRMADO.
  const order = await prisma.order.findUnique({ where: { codigo } });
  if (estadoPago === "APROBADO" && order?.estado === "PENDIENTE") {
    data.estado = "CONFIRMADO";
  }
  await prisma.order.update({ where: { codigo }, data });
  revalidatePath(`/admin/pedidos/${codigo}`);
  revalidatePath("/admin/pedidos");
  return { ok: true };
}
