import { Users, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const customers = await prisma.customer.findMany({
    include: {
      pedidos: {
        where: { estado: { not: "CANCELADO" } },
        orderBy: { createdAt: "desc" },
        select: { total: true, createdAt: true },
      },
    },
  });

  const rows = customers
    .map((c) => {
      const totalGastado = c.pedidos.reduce((s, p) => s + p.total, 0);
      return {
        id: c.id,
        nombre: c.nombre,
        telefono: c.telefono,
        pedidos: c.pedidos.length,
        totalGastado,
        ultima: c.pedidos[0]?.createdAt ?? null,
      };
    })
    .sort((a, b) => b.totalGastado - a.totalGastado);

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={`${rows.length} cliente(s) · ordenados por total gastado.`}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Todavía no hay clientes"
          description="Cuando alguien haga un pedido va a aparecer acá."
        />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-soft)]">
          <table className="hidden w-full text-sm sm:table">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Teléfono</th>
                <th className="px-5 py-3 text-center font-medium">Pedidos</th>
                <th className="px-5 py-3 font-medium">Última compra</th>
                <th className="px-5 py-3 text-right font-medium">Total gastado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-cream-2">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-cocoa">{r.nombre}</span>
                      {r.pedidos >= 3 && <Badge variant="caramel">Fiel</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted">{r.telefono}</td>
                  <td className="px-5 py-3 text-center text-cocoa">{r.pedidos}</td>
                  <td className="px-5 py-3 text-muted">
                    {r.ultima ? r.ultima.toLocaleDateString("es-AR") : "—"}
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-cocoa">
                    {formatPrice(r.totalGastado)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <ul className="divide-y divide-border sm:hidden">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-cocoa">
                      {r.nombre}
                    </span>
                    {r.pedidos >= 3 && <Badge variant="caramel">Fiel</Badge>}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                    <Phone className="h-3 w-3" /> {r.telefono} · {r.pedidos} pedido(s)
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-cocoa">
                  {formatPrice(r.totalGastado)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
