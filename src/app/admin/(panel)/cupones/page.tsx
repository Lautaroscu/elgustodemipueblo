import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { CouponsManager } from "@/components/admin/coupons-manager";

export const dynamic = "force-dynamic";

export default async function CuponesPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Cupones"
        description="Descuentos por código para tus clientes."
      />
      <CouponsManager
        coupons={coupons.map((c) => ({
          id: c.id,
          codigo: c.codigo,
          tipo: c.tipo,
          valor: c.valor,
          montoMinimo: c.montoMinimo,
          usosMax: c.usosMax,
          usos: c.usos,
          vence: c.vence ? c.vence.toISOString().slice(0, 10) : null,
          activo: c.activo,
        }))}
      />
    </div>
  );
}
