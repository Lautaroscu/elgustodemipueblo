import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { getPayment, isMpConfigured } from "@/lib/mercadopago";

/**
 * Webhook de Mercado Pago.
 * - Valida la firma (x-signature) con MP_WEBHOOK_SECRET si está configurado.
 * - Es idempotente: sólo actualiza estados, sin duplicar efectos.
 */
function validSignature(req: NextRequest, dataId: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET ?? "";
  if (!secret) return true; // sin secreto configurado, no bloqueamos (dev)

  const xSignature = req.headers.get("x-signature") ?? "";
  const xRequestId = req.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => p.split("=").map((s) => s.trim())),
  ) as { ts?: string; v1?: string };
  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${parts.ts};`;
  const hmac = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(parts.v1),
    );
  } catch {
    return false;
  }
}

async function processPayment(paymentId: string) {
  if (!isMpConfigured()) return;
  const payment = await getPayment(paymentId);
  if (!payment) return;

  const codigo =
    (payment.external_reference as string) ||
    (payment.metadata as { codigo?: string })?.codigo;
  if (!codigo) return;

  const order = await prisma.order.findUnique({ where: { codigo } });
  if (!order) return;

  const status = payment.status; // approved | pending | rejected | ...
  const estadoPago =
    status === "approved"
      ? "APROBADO"
      : status === "rejected" || status === "cancelled"
        ? "RECHAZADO"
        : status === "refunded"
          ? "REEMBOLSADO"
          : "PENDIENTE";

  // Idempotencia: si ya está aprobado, no re-procesar.
  if (order.estadoPago === estadoPago && order.mpPaymentId === String(paymentId)) {
    return;
  }

  await prisma.order.update({
    where: { codigo },
    data: {
      estadoPago,
      mpPaymentId: String(paymentId),
      // Avanza el estado del pedido al aprobarse el pago.
      ...(estadoPago === "APROBADO" && order.estado === "PENDIENTE"
        ? { estado: "CONFIRMADO" }
        : {}),
      ...(estadoPago === "RECHAZADO" && order.estado === "PENDIENTE"
        ? { estado: "CANCELADO" }
        : {}),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    // MP puede notificar por query (?type=payment&data.id=) o por body.
    const type =
      url.searchParams.get("type") ||
      url.searchParams.get("topic") ||
      body?.type;
    const dataId =
      url.searchParams.get("data.id") ||
      body?.data?.id ||
      body?.id;

    if (!dataId) return NextResponse.json({ ok: true });

    if (!validSignature(req, String(dataId))) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    if (type === "payment") {
      await processPayment(String(dataId));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("mp webhook", e);
    // Respondemos 200 para que MP no reintente indefinidamente por errores nuestros.
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "mp-webhook" });
}
