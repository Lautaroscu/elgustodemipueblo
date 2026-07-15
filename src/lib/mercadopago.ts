import "server-only";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import type { Order, OrderItem } from "@prisma/client";
import { site } from "./site";

const accessToken = process.env.MP_ACCESS_TOKEN ?? "";

/** MP está configurado sólo si hay un token que no es el placeholder. */
export function isMpConfigured(): boolean {
  return (
    accessToken.length > 20 &&
    !accessToken.includes("0000000000000000") &&
    !accessToken.includes("xxxxxxxx")
  );
}

function client() {
  return new MercadoPagoConfig({ accessToken });
}

type OrderForMp = Order & { items: OrderItem[] };

/**
 * Crea una preferencia de Checkout Pro para el pedido.
 * Devuelve null si MP no está configurado (el flujo sigue como "pendiente").
 */
export async function createPreference(
  order: OrderForMp,
): Promise<{ preferenceId: string; initPoint: string } | null> {
  if (!isMpConfigured()) return null;

  const preference = new Preference(client());
  const baseUrl = site.url.replace(/\/$/, "");

  const items = order.items.map((i) => ({
    id: i.productId ?? i.id,
    title: i.nombre,
    quantity: i.cantidad,
    unit_price: i.precio,
    currency_id: "ARS",
  }));

  // Prorrateo simple de descuento/envío como ítems adicionales.
  if (order.descuento > 0) {
    items.push({
      id: "descuento",
      title: "Descuento",
      quantity: 1,
      unit_price: -order.descuento,
      currency_id: "ARS",
    });
  }
  if (order.costoEnvio > 0) {
    items.push({
      id: "envio",
      title: "Envío",
      quantity: 1,
      unit_price: order.costoEnvio,
      currency_id: "ARS",
    });
  }

  const result = await preference.create({
    body: {
      items,
      external_reference: order.codigo,
      statement_descriptor: "EL GUSTO DE MI PUEBLO",
      back_urls: {
        success: `${baseUrl}/pedido/${order.codigo}?pago=exito`,
        pending: `${baseUrl}/pedido/${order.codigo}?pago=pendiente`,
        failure: `${baseUrl}/pedido/${order.codigo}?pago=error`,
      },
      auto_return: "approved",
      notification_url: `${baseUrl}/api/mp/webhook`,
      metadata: { codigo: order.codigo },
    },
  });

  if (!result.id || !result.init_point) return null;
  return { preferenceId: String(result.id), initPoint: result.init_point };
}

/** Consulta un pago por id (usado por el webhook). */
export async function getPayment(paymentId: string) {
  if (!isMpConfigured()) return null;
  const payment = new Payment(client());
  return payment.get({ id: paymentId });
}
