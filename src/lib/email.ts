import "server-only";
import { Resend } from "resend";
import type { Order, OrderItem, Customer } from "@prisma/client";
import { site } from "./site";
import { formatPrice } from "./utils";

const apiKey = process.env.RESEND_API_KEY ?? "";
const from = process.env.EMAIL_FROM ?? `${site.name} <onboarding@resend.dev>`;

function isConfigured() {
  return apiKey.length > 10;
}

type OrderForEmail = Order & { items: OrderItem[]; customer: Customer };

/** Envía confirmación de pedido al cliente si hay email y Resend configurado. */
export async function sendOrderConfirmation(order: OrderForEmail) {
  if (!isConfigured() || !order.customer.email) return;

  const resend = new Resend(apiKey);
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${i.cantidad}× ${i.nombre}</td><td style="text-align:right">${formatPrice(i.precio * i.cantidad)}</td></tr>`,
    )
    .join("");

  await resend.emails.send({
    from,
    to: order.customer.email,
    subject: `Tu pedido ${order.codigo} · ${site.name}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;color:#3b291b">
        <h1 style="font-size:20px">¡Gracias por tu pedido, ${order.customer.nombre}! 🍰</h1>
        <p>Tu código de pedido es <strong>${order.codigo}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">${itemsHtml}
          <tr><td style="padding-top:10px;border-top:1px solid #eee"><strong>Total</strong></td>
          <td style="padding-top:10px;border-top:1px solid #eee;text-align:right"><strong>${formatPrice(order.total)}</strong></td></tr>
        </table>
        <p style="color:#8a7358;font-size:13px">Seguí el estado en ${site.url}/pedido/${order.codigo}</p>
      </div>`,
  });
}
