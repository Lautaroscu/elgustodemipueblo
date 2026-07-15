import Link from "next/link";
import { ShoppingBag, ChevronRight } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PageHeader, OrderStatusBadge, EmptyState } from "@/components/admin/ui";
import { PAYMENT_METHOD_LABEL, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { formatPrice, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "CONFIRMADO", label: "Confirmados" },
  { value: "EN_PREPARACION", label: "En preparación" },
  { value: "LISTO", label: "Listos" },
  { value: "EN_REPARTO", label: "En reparto" },
  { value: "ENTREGADO", label: "Entregados" },
  { value: "CANCELADO", label: "Cancelados" },
];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const where =
    estado && estado in ORDER_STATUS_LABEL
      ? { estado: estado as OrderStatus }
      : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { customer: true, items: true },
    take: 100,
  });

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description="Gestioná y actualizá el estado de cada pedido."
      />

      {/* Filtros */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = (estado ?? "") === f.value;
          return (
            <Link
              key={f.value}
              href={f.value ? `/admin/pedidos?estado=${f.value}` : "/admin/pedidos"}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-cocoa bg-cocoa text-cream"
                  : "border-border bg-surface text-cocoa-soft hover:bg-cream-2",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="No hay pedidos"
          description="Cuando entren pedidos van a aparecer acá."
        />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-soft)]">
          {/* Desktop table */}
          <table className="hidden w-full text-sm sm:table">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Código</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Pago</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-cream-2">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/pedidos/${o.codigo}`}
                      className="font-mono text-xs font-semibold text-cocoa hover:text-caramel-deep"
                    >
                      {o.codigo}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-cocoa">{o.customer.nombre}</td>
                  <td className="px-5 py-3 text-muted">
                    {o.createdAt.toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {PAYMENT_METHOD_LABEL[o.metodoPago]}
                  </td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={o.estado} />
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-cocoa">
                    {formatPrice(o.total)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/pedidos/${o.codigo}`}
                      className="text-caramel-deep hover:text-caramel"
                      aria-label="Ver pedido"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <ul className="divide-y divide-border sm:hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/pedidos/${o.codigo}`}
                  className="flex items-center gap-3 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-cocoa">
                        {o.codigo}
                      </span>
                      <OrderStatusBadge status={o.estado} />
                    </div>
                    <p className="mt-1 truncate text-sm text-cocoa">
                      {o.customer.nombre}
                    </p>
                    <p className="text-xs text-muted">
                      {PAYMENT_METHOD_LABEL[o.metodoPago]} ·{" "}
                      {o.createdAt.toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <span className="font-semibold text-cocoa">
                    {formatPrice(o.total)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
