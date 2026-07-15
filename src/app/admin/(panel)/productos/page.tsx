import Link from "next/link";
import { Plus, Cake, EyeOff } from "lucide-react";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/admin/ui";
import { ProductActions } from "@/components/admin/product-actions";
import { ProductImage } from "@/components/shared/product-image";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductosAdminPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ orden: "asc" }, { createdAt: "desc" }],
    include: {
      category: true,
      imagenes: { orderBy: { orden: "asc" }, take: 1 },
    },
  });

  return (
    <div>
      <PageHeader
        title="Productos"
        description={`${products.length} producto(s) en tu catálogo.`}
        action={
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-caramel px-5 text-sm font-semibold text-primary-foreground shadow-[0_8px_22px_-8px_rgba(197,123,44,0.8)] transition-colors hover:bg-caramel-deep"
          >
            <Plus className="h-4 w-4" /> Nuevo producto
          </Link>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          icon={<Cake className="h-6 w-6" />}
          title="Todavía no hay productos"
          description="Creá tu primer postre para empezar a vender."
          action={{ href: "/admin/productos/nuevo", label: "Crear producto" }}
        />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-soft)]">
          <ul className="divide-y divide-border">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 p-3 transition-colors hover:bg-cream-2 sm:gap-4 sm:p-4"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-2">
                  <ProductImage
                    src={p.imagenes[0]?.url ?? null}
                    alt={p.nombre}
                    emoji={p.category.emoji ?? "🍰"}
                    fill
                    sizes="56px"
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/productos/${p.id}/editar`}
                      className="truncate text-sm font-medium text-cocoa hover:text-caramel-deep"
                    >
                      {p.nombre}
                    </Link>
                    {p.destacado && <Badge variant="caramel">Destacado</Badge>}
                    {!p.visible && (
                      <Badge variant="outline">
                        <EyeOff className="h-3 w-3" /> Oculto
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    {p.category.nombre} · Stock: {p.stock}
                  </p>
                </div>

                <span className="hidden text-sm font-semibold text-cocoa sm:block">
                  {formatPrice(p.precio)}
                </span>
                <ProductActions
                  id={p.id}
                  visible={p.visible}
                  destacado={p.destacado}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
