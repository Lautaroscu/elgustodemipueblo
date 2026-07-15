import "server-only";
import { prisma } from "@/lib/db";

// Estados que cuentan como venta concretada (no cancelada).
const VENTA_OK = {
  estado: { not: "CANCELADO" as const },
};

export async function getDashboardMetrics() {
  const now = new Date();
  const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    ventasDia,
    ventasMes,
    pedidosPendientes,
    pedidosMes,
    sinStock,
    topProductos,
    recientes,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { ...VENTA_OK, createdAt: { gte: startDay } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { ...VENTA_OK, createdAt: { gte: startMonth } },
    }),
    prisma.order.count({
      where: { estado: { in: ["PENDIENTE", "CONFIRMADO", "EN_PREPARACION", "LISTO", "EN_REPARTO"] } },
    }),
    prisma.order.count({ where: { createdAt: { gte: startMonth } } }),
    prisma.product.count({ where: { stock: { lte: 0 }, visible: true } }),
    prisma.orderItem.groupBy({
      by: ["nombre"],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { customer: true, items: true },
    }),
  ]);

  return {
    ventasDia: ventasDia._sum.total ?? 0,
    pedidosDia: ventasDia._count,
    ventasMes: ventasMes._sum.total ?? 0,
    pedidosMes,
    pedidosPendientes,
    sinStock,
    topProductos: topProductos.map((t) => ({
      nombre: t.nombre,
      cantidad: t._sum.cantidad ?? 0,
    })),
    recientes,
  };
}
