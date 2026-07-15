import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { LogisticaBoard } from "@/components/admin/logistica-board";

export const dynamic = "force-dynamic";

export default async function LogisticaPage() {
  // Obtenemos los pedidos activos en estados de logística
  const orders = await prisma.order.findMany({
    where: {
      estado: {
        in: ["PENDIENTE", "CONFIRMADO", "EN_PREPARACION", "LISTO", "EN_REPARTO"],
      },
    },
    orderBy: [
      { prioridad: "desc" },
      { prepInicioEstimado: "asc" },
      { createdAt: "asc" },
    ],
    include: {
      customer: true,
      address: true,
      items: true,
    },
  });

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Logística"
        description="Tablero Kanban operativo. Controlá la preparación y reparto en tiempo real."
      />
      <LogisticaBoard initialOrders={orders} />
    </div>
  );
}
