"use server";

import { revalidatePath } from "next/cache";
import { createOrderSchema } from "@/lib/validations";
import { priceOrder, createOrder } from "@/data/orders";
import { getSettings } from "@/data/settings";
import { createPreference } from "@/lib/mercadopago";
import { sendOrderConfirmation } from "@/lib/email";
import { getCustomerSession } from "@/lib/customer-auth";

export type PreviewState = Awaited<ReturnType<typeof priceOrder>>;

/** Previsualiza totales (promos, cupón, envío) en vivo para el checkout. */
export async function previewOrderAction(input: {
  items: { productId: string; cantidad: number }[];
  metodoEntrega: "ENVIO" | "RETIRO";
  zona?: string;
  cupon?: string;
}) {
  if (!input.items?.length) return null;
  return priceOrder(input);
}

/** Devuelve la configuración pública necesaria para el checkout. */
export async function getCheckoutSettingsAction() {
  const s = await getSettings();
  return {
    zonas: s.zonas,
    costoEnvioBase: s.costoEnvioBase,
    envioGratisDesde: s.envioGratisDesde,
    retiroDisponible: s.retiroDisponible,
    direccionRetiro: s.direccionRetiro,
    direccionLocal: s.direccionLocal,
    horariosRetiro: s.horariosRetiro,
    localLat: s.localLat,
    localLng: s.localLng,
    camposEntrega: s.camposEntrega,
    aliasTransferencia: s.aliasTransferencia,
    cbu: s.cbu,
    titularCuenta: s.titularCuenta,
    whatsapp: s.whatsapp,
  };
}

export type CreateOrderResult =
  | { ok: true; codigo: string; redirectUrl: string }
  | { ok: false; error: string };

export async function createOrderAction(
  raw: unknown,
): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  try {
    const session = await getCustomerSession();
    const { order } = await createOrder(parsed.data, session?.customerId);

    // Email de confirmación (no bloquea el flujo si falla).
    void sendOrderConfirmation(order).catch(() => {});

    revalidatePath("/admin/pedidos");
    revalidatePath("/catalogo");

    // Mercado Pago: generamos preferencia y redirigimos al checkout.
    if (order.metodoPago === "MERCADO_PAGO") {
      const pref = await createPreference(order);
      if (pref?.initPoint) {
        return { ok: true, codigo: order.codigo, redirectUrl: pref.initPoint };
      }
      // Si MP no está configurado, caemos al seguimiento con aviso.
      return {
        ok: true,
        codigo: order.codigo,
        redirectUrl: `/pedido/${order.codigo}?pago=pendiente`,
      };
    }

    return { ok: true, codigo: order.codigo, redirectUrl: `/pedido/${order.codigo}` };
  } catch (e) {
    console.error("createOrderAction", e);
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "No pudimos crear el pedido. Probá de nuevo.",
    };
  }
}
