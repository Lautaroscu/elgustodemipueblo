import { auth } from "@/auth";
import { getCustomerOrdersAction } from "@/app/actions/customer-auth";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShoppingBag, ChevronRight, PackageCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDIENTE: { label: "Pendiente", className: "bg-amber-100 text-amber-800 border-amber-200" },
  CONFIRMADO: { label: "Confirmado", className: "bg-blue-100 text-blue-800 border-blue-200" },
  EN_PREPARACION: { label: "En preparación", className: "bg-amber-100 text-amber-800 border-amber-200" },
  LISTO: { label: "Listo para entrega", className: "bg-teal-100 text-teal-800 border-teal-200" },
  EN_REPARTO: { label: "En camino", className: "bg-purple-100 text-purple-800 border-purple-200" },
  ENTREGADO: { label: "Entregado", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  CANCELADO: { label: "Cancelado", className: "bg-rose-100 text-rose-800 border-rose-200" },
};

export default async function PedidosPage() {
  const session = await auth();

  if (!session || !session.user || session.user.kind !== "customer") {
    redirect("/");
  }

  const orders = await getCustomerOrdersAction();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1.5 text-sm text-cocoa-soft transition-colors hover:text-cocoa mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al catálogo
      </Link>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cocoa">
            Tus compras
          </h1>
          <p className="text-sm text-cocoa-soft mt-1">
            Historial de pedidos realizados con tu cuenta.
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-cream-2 flex items-center justify-center text-caramel">
          <ShoppingBag className="h-5 w-5" />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto h-12 w-12 rounded-full bg-cream-2 flex items-center justify-center text-cocoa-soft">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-cocoa">Todavía no realizaste ningún pedido.</p>
            <p className="text-xs text-cocoa-soft">
              Explorá nuestro catálogo y probá nuestros postres artesanales.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center rounded-full bg-caramel px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-caramel-deep"
          >
            Ver catálogo y comprar
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const statusInfo = STATUS_LABELS[o.estado] ?? {
              label: o.estado,
              className: "bg-cream-2 text-cocoa border-border",
            };

            return (
              <div
                key={o.id}
                className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center shadow-sm hover:border-caramel/40 transition-all duration-200"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-base font-extrabold text-cocoa">
                      #{o.codigo}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <p className="text-xs text-cocoa-soft">
                    {new Date(o.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    hs
                  </p>

                  <p className="text-xs font-medium text-cocoa/80 pt-1 truncate">
                    {o.items
                      ?.map((item: any) => `${item.cantidad}x ${item.nombre}`)
                      .join(", ")}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
                  <span className="text-lg font-bold text-cocoa">
                    {formatPrice(o.total)}
                  </span>
                  <Link
                    href={`/pedido/${o.codigo}`}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-cream/40 px-4 py-2 text-xs font-semibold text-cocoa shadow-sm hover:bg-cream-2 hover:border-caramel/40 transition-all"
                  >
                    <span>Seguir pedido</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
