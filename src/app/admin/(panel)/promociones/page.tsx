import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { PromotionsManager } from "@/components/admin/promotions-manager";

export const dynamic = "force-dynamic";

export default async function PromocionesPage() {
  const [promotions, categories] = await Promise.all([
    prisma.promotion.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({
      orderBy: { orden: "asc" },
      select: { id: true, nombre: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Promociones"
        description="2x1, 3x2, descuentos, combos y happy hours."
      />
      <PromotionsManager
        promotions={promotions.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          tipo: p.tipo,
          valor: p.valor,
          activo: p.activo,
          horaInicio: p.horaInicio,
          horaFin: p.horaFin,
        }))}
        categories={categories}
      />
    </div>
  );
}
