import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, StickyNote } from "lucide-react";
import { getOrderByCode } from "@/data/orders";
import { OrderStatusControls } from "@/components/admin/order-controls";
import { PaymentBadge } from "@/components/admin/ui";
import { PAYMENT_METHOD_LABEL } from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = await params;
  const order = await getOrderByCode(codigo);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/pedidos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-cocoa"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a pedidos
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-cocoa">
            Pedido <span className="font-mono">{order.codigo}</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            {order.createdAt.toLocaleString("es-AR")}
          </p>
        </div>
        <PaymentBadge status={order.estadoPago} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
            <h2 className="mb-3 font-display text-lg font-semibold text-cocoa">
              Productos
            </h2>
            <ul className="divide-y divide-border">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-cocoa">
                    {i.cantidad}× {i.nombre}
                  </span>
                  <span className="font-medium text-cocoa">
                    {formatPrice(i.precio * i.cantidad)}
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
                  <dt className="text-muted">
                    Descuento {order.cuponCodigo ? `(${order.cuponCodigo})` : ""}
                  </dt>
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
              Pago: {PAYMENT_METHOD_LABEL[order.metodoPago]}
              {order.mpPaymentId ? ` · MP #${order.mpPaymentId}` : ""}
            </p>
          </section>

          {/* Controles */}
          <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
            <OrderStatusControls
              codigo={order.codigo}
              estado={order.estado}
              estadoPago={order.estadoPago}
            />
          </section>
        </div>

        {/* Cliente */}
        <aside className="space-y-4">
          <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
            <h2 className="mb-3 font-display text-lg font-semibold text-cocoa">
              Cliente
            </h2>
            <p className="font-medium text-cocoa">{order.customer.nombre}</p>
            <ul className="mt-3 space-y-2 text-sm text-cocoa-soft">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted" /> {order.customer.telefono}
              </li>
              {order.customer.email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted" /> {order.customer.email}
                </li>
              )}
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <span>
                  {order.metodoEntrega === "ENVIO"
                    ? order.customer.direccion ?? "Sin dirección"
                    : "Retiro en el local"}
                </span>
              </li>
            </ul>
          </section>

          {order.observaciones && (
            <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-cocoa">
                <StickyNote className="h-4 w-4 text-caramel-deep" /> Observaciones
              </h2>
              <p className="text-sm text-cocoa-soft">{order.observaciones}</p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
