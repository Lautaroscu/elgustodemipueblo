import Link from "next/link";
import {
  TrendingUp,
  CalendarDays,
  Clock,
  PackageX,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { getDashboardMetrics } from "@/data/admin";
import { PageHeader, OrderStatusBadge } from "@/components/admin/ui";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const m = await getDashboardMetrics();

  const stats = [
    {
      label: "Ventas de hoy",
      value: formatPrice(m.ventasDia),
      sub: `${m.pedidosDia} pedido(s)`,
      icon: TrendingUp,
      tint: "text-green-600 bg-green-100",
    },
    {
      label: "Ventas del mes",
      value: formatPrice(m.ventasMes),
      sub: `${m.pedidosMes} pedido(s)`,
      icon: CalendarDays,
      tint: "text-caramel-deep bg-caramel/15",
    },
    {
      label: "Pedidos a preparar",
      value: String(m.pedidosPendientes),
      sub: "pendientes / en curso",
      icon: Clock,
      tint: "text-sky-600 bg-sky-100",
    },
    {
      label: "Sin stock",
      value: String(m.sinStock),
      sub: "productos agotados",
      icon: PackageX,
      tint: "text-red-600 bg-red-100",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Un vistazo rápido a tu negocio hoy."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{s.label}</span>
              <span className={`grid h-9 w-9 place-items-center rounded-full ${s.tint}`}>
                <s.icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-cocoa">
              {s.value}
            </p>
            <p className="mt-0.5 text-xs text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Pedidos recientes */}
        <div className="lg:col-span-2">
          <div className="rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="font-display text-lg font-semibold text-cocoa">
                Pedidos recientes
              </h2>
              <Link
                href="/admin/pedidos"
                className="inline-flex items-center gap-1 text-sm font-medium text-caramel-deep hover:underline"
              >
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {m.recientes.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted">
                Todavía no hay pedidos.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {m.recientes.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/admin/pedidos/${o.codigo}`}
                      className="flex items-center gap-4 p-4 transition-colors hover:bg-cream-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-cocoa">
                          {o.customer.nombre}
                        </p>
                        <p className="text-xs text-muted">
                          {o.codigo} · {o.items.length} ítem(s)
                        </p>
                      </div>
                      <OrderStatusBadge status={o.estado} />
                      <span className="w-24 text-right text-sm font-semibold text-cocoa">
                        {formatPrice(o.total)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Más vendidos */}
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-cocoa">
            <Trophy className="h-5 w-5 text-caramel-deep" /> Más vendidos
          </h2>
          {m.topProductos.length === 0 ? (
            <p className="text-sm text-muted">Sin datos aún.</p>
          ) : (
            <ol className="space-y-3">
              {m.topProductos.map((p, i) => (
                <li key={p.nombre} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cream-2 text-xs font-bold text-cocoa-soft">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-cocoa">
                    {p.nombre}
                  </span>
                  <span className="text-sm font-semibold text-caramel-deep">
                    {p.cantidad}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
