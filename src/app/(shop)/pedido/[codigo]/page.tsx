import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Clock, CircleAlert, Copy, PartyPopper } from "lucide-react";
import { getOrderByCode } from "@/data/orders";
import { getSettings } from "@/data/settings";
import { ConfirmWhatsappButton } from "@/components/shop/order/confirm-whatsapp-button";
import { ProductImage } from "@/components/shared/product-image";
import { formatPrice } from "@/lib/utils";
import { fullAddressLine } from "@/domain/address";
import {
  ORDER_FLOW,
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  statusStepIndex,
} from "@/lib/order-status";

export const metadata: Metadata = { title: "Tu pedido", robots: { index: false } };

type Params = {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ pago?: string }>;
};

export default async function PedidoPage({ params, searchParams }: Params) {
  const { codigo } = await params;
  const { pago } = await searchParams;
  const order = await getOrderByCode(codigo);
  if (!order) notFound();

  const settings = await getSettings();
  const cancelado = order.estado === "CANCELADO";
  const stepIdx = statusStepIndex(order.estado);

  const showTransfer =
    order.metodoPago === "TRANSFERENCIA" && order.estadoPago === "PENDIENTE";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Encabezado / éxito */}
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
          {pago === "error" ? (
            <CircleAlert className="h-8 w-8 text-danger" />
          ) : (
            <PartyPopper className="h-8 w-8" />
          )}
        </span>
        <h1 className="mt-4 font-display text-3xl font-semibold text-cocoa">
          {pago === "error" ? "Hubo un problema con el pago" : "¡Pedido recibido!"}
        </h1>
        <p className="mt-2 text-cocoa-soft">
          Tu código es{" "}
          <span className="font-mono font-semibold text-cocoa">{order.codigo}</span>
          . Guardalo para seguir tu pedido.
        </p>
      </div>

      {/* Aviso según pago */}
      {pago === "pendiente" && order.metodoPago === "MERCADO_PAGO" && (
        <p className="mt-6 rounded-[var(--radius-md)] bg-cream-2 px-4 py-3 text-sm text-cocoa-soft">
          Tu pago con Mercado Pago quedó pendiente de confirmación. Te avisamos
          apenas se acredite.
        </p>
      )}

      {/* Timeline de estado */}
      {!cancelado ? (
        <div className="mt-8 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold text-cocoa">
            Estado del pedido
          </h2>
          <ol className="space-y-0">
            {ORDER_FLOW.map((s, i) => {
              const done = i <= stepIdx;
              const current = i === stepIdx;
              return (
                <li key={s} className="flex items-center gap-3 py-1.5">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs transition-colors ${
                      done
                        ? "bg-caramel text-primary-foreground"
                        : "bg-cream-2 text-muted"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span
                    className={`text-sm ${
                      current
                        ? "font-semibold text-cocoa"
                        : done
                          ? "text-cocoa-soft"
                          : "text-muted"
                    }`}
                  >
                    {ORDER_STATUS_LABEL[s]}
                  </span>
                  {current && (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-caramel-deep">
                      <Clock className="h-3.5 w-3.5" /> Ahora
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <p className="mt-8 rounded-[var(--radius-md)] bg-danger/10 px-4 py-3 text-center text-sm font-medium text-danger">
          Este pedido fue cancelado.
        </p>
      )}

      {/* Datos de transferencia */}
      {showTransfer && (
        <div className="mt-6 rounded-[var(--radius-lg)] border border-caramel/30 bg-caramel/[0.06] p-5">
          <h2 className="text-sm font-semibold text-cocoa">
            Datos para transferir
          </h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Alias</dt>
              <dd className="inline-flex items-center gap-1.5 font-medium text-cocoa">
                {settings.aliasTransferencia}
                <Copy className="h-3.5 w-3.5 text-muted" />
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Titular</dt>
              <dd className="font-medium text-cocoa">{settings.titularCuenta}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Monto</dt>
              <dd className="font-semibold text-cocoa">{formatPrice(order.total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-cocoa-soft">
            Enviá el comprobante por WhatsApp para confirmar tu pedido 👇
          </p>
        </div>
      )}

      {/* Resumen */}
      <div className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
        <h2 className="mb-3 text-sm font-semibold text-cocoa">Tu pedido</h2>
        <ul className="divide-y divide-border">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-2.5">
              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-cream-2">
                <ProductImage src={null} alt={item.nombre} emoji="🍰" fill sizes="44px" />
              </span>
              <span className="flex-1 text-sm text-cocoa">
                {item.cantidad}× {item.nombre}
              </span>
              <span className="text-sm font-medium text-cocoa">
                {formatPrice(item.precio * item.cantidad)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="text-cocoa">{formatPrice(order.subtotal)}</dd>
          </div>
          {order.descuento > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted">Descuento</dt>
              <dd className="text-success">- {formatPrice(order.descuento)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">Envío</dt>
            <dd className="text-cocoa">
              {order.metodoEntrega === "RETIRO"
                ? "Retiro"
                : order.costoEnvio === 0
                  ? "Gratis"
                  : formatPrice(order.costoEnvio)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2">
            <dt className="font-semibold text-cocoa">Total</dt>
            <dd className="font-display text-lg font-bold text-cocoa">
              {formatPrice(order.total)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">
          Pago: {PAYMENT_METHOD_LABEL[order.metodoPago]} ·{" "}
          {order.metodoEntrega === "ENVIO" ? "Envío a domicilio" : "Retiro"}
        </p>
      </div>

      {/* WhatsApp */}
      {!cancelado && (
        <div className="mt-6">
          <ConfirmWhatsappButton
            whatsapp={settings.whatsapp}
            order={{
              codigo: order.codigo,
              total: order.total,
              metodoEntrega: order.metodoEntrega,
              observaciones: order.observaciones,
              items: order.items.map((i) => ({
                nombre: i.nombre,
                cantidad: i.cantidad,
                precio: i.precio,
              })),
              cliente: {
                nombre: order.customer.nombre,
                telefono: order.customer.telefono ?? "",
                direccion: order.metodoEntrega === "ENVIO" && order.address
                  ? fullAddressLine(order.address.datos as any)
                  : null,
              },
            }}
          />
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/catalogo"
          className="text-sm font-medium text-caramel-deep hover:underline"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
