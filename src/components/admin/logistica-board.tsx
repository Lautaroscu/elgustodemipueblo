"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Clock,
  Truck,
  Store,
  Phone,
  ArrowRight,
  AlertTriangle,
  Search,
  Loader2,
} from "lucide-react";
import { updateOrderStatus } from "@/app/actions/admin-orders";
import { formatPrice, cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

// Mapeo de columnas y labels
const COLUMNS: { id: OrderStatus; label: string; bg: string }[] = [
  { id: "PENDIENTE", label: "Pendientes", bg: "bg-amber-50/40 dark:bg-amber-950/5" },
  { id: "CONFIRMADO", label: "Confirmados", bg: "bg-sky-50/40 dark:bg-sky-950/5" },
  { id: "EN_PREPARACION", label: "En preparación", bg: "bg-violet-50/40 dark:bg-violet-950/5" },
  { id: "LISTO", label: "Listos", bg: "bg-teal-50/40 dark:bg-teal-950/5" },
  { id: "EN_REPARTO", label: "En reparto", bg: "bg-blue-50/40 dark:bg-blue-950/5" },
];

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PENDIENTE: "CONFIRMADO",
  CONFIRMADO: "EN_PREPARACION",
  EN_PREPARACION: "LISTO",
  LISTO: "EN_REPARTO",
  EN_REPARTO: "ENTREGADO",
  ENTREGADO: null,
  CANCELADO: null,
};

const ACTION_LABEL: Record<OrderStatus, string> = {
  PENDIENTE: "Confirmar",
  CONFIRMADO: "Preparar",
  EN_PREPARACION: "Terminar",
  LISTO: "Enviar/Entregar",
  EN_REPARTO: "Entregado",
  ENTREGADO: "",
  CANCELADO: "",
};

type OrderWithDetails = {
  id: string;
  codigo: string;
  estado: OrderStatus;
  subtotal: number;
  total: number;
  metodoEntrega: "ENVIO" | "RETIRO";
  cuando: "ASAP" | "PROGRAMADO";
  fechaEntrega: Date | null;
  prepMinutos: number;
  prepInicioEstimado: Date | null;
  observaciones: string | null;
  customer: {
    nombre: string;
    telefono: string | null;
    email: string | null;
  };
  address: {
    resumen: string;
    datos: any;
  } | null;
  items: {
    id: string;
    nombre: string;
    cantidad: number;
  }[];
  createdAt: Date;
};

export function LogisticaBoard({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = React.useState<OrderWithDetails[]>(
    initialOrders.map((o) => ({
      ...o,
      createdAt: new Date(o.createdAt),
      fechaEntrega: o.fechaEntrega ? new Date(o.fechaEntrega) : null,
      prepInicioEstimado: o.prepInicioEstimado ? new Date(o.prepInicioEstimado) : null,
    }))
  );
  const [search, setSearch] = React.useState("");
  const [filterEntrega, setFilterEntrega] = React.useState<"TODOS" | "ENVIO" | "RETIRO">("TODOS");
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Actualizar el reloj cada 30 segundos para actualizar los contadores en tiempo real
  React.useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Función para avanzar el pedido
  async function avanzarPedido(order: OrderWithDetails) {
    const next = NEXT_STATUS[order.estado];
    if (!next) return;

    // Optimistic UI Update
    const prevOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, estado: next } : o))
    );

    try {
      const res = await updateOrderStatus(order.codigo, next);
      if (!res.ok) {
        throw new Error("No se pudo actualizar");
      }
      toast.success(`Pedido ${order.codigo} avanzado a ${next}`);
    } catch {
      toast.error("Error al actualizar el estado del pedido.");
      setOrders(prevOrders); // rollback
    }
  }

  // Cancelar pedido
  async function cancelarPedido(order: OrderWithDetails) {
    if (!confirm(`¿Estás seguro de cancelar el pedido ${order.codigo}?`)) return;

    const prevOrders = [...orders];
    setOrders((prev) => prev.filter((o) => o.id !== order.id));

    try {
      const res = await updateOrderStatus(order.codigo, "CANCELADO");
      if (!res.ok) throw new Error("No se pudo cancelar");
      toast.error(`Pedido ${order.codigo} cancelado`);
    } catch {
      toast.error("Error al cancelar el pedido.");
      setOrders(prevOrders);
    }
  }

  // Filtrado de pedidos
  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.codigo.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesEntrega = filterEntrega === "TODOS" || o.metodoEntrega === filterEntrega;
      return matchesSearch && matchesEntrega;
    });
  }, [orders, search, filterEntrega]);

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] gap-4">
      {/* Controles de filtro */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código o cliente..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["TODOS", "ENVIO", "RETIRO"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterEntrega(mode)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold border transition-all",
                filterEntrega === mode
                  ? "bg-cocoa text-cream border-cocoa"
                  : "bg-surface text-cocoa-soft border-border hover:bg-cream-2"
              )}
            >
              {mode === "TODOS" ? "Todos" : mode === "ENVIO" ? "Envíos" : "Retiros"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid del Tablero Kanban */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full gap-4 min-w-[1200px]">
          {COLUMNS.map((col) => {
            const colOrders = filteredOrders.filter((o) => o.estado === col.id);
            return (
              <div
                key={col.id}
                className={cn(
                  "flex flex-col w-1/5 rounded-[var(--radius-lg)] border border-border p-3 min-w-[240px]",
                  col.bg
                )}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold text-cocoa">{col.label}</h2>
                  <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-bold text-cocoa-soft border border-border">
                    {colOrders.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {colOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      currentTime={currentTime}
                      onAvanzar={() => avanzarPedido(order)}
                      onCancelar={() => cancelarPedido(order)}
                    />
                  ))}
                  {colOrders.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-28 border border-dashed border-border/80 rounded-[var(--radius-md)] text-center text-xs text-muted/80 p-4 bg-surface/50">
                      Sin pedidos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  currentTime,
  onAvanzar,
  onCancelar,
}: {
  order: OrderWithDetails;
  currentTime: Date;
  onAvanzar: () => void;
  onCancelar: () => void;
}) {
  const next = NEXT_STATUS[order.estado];
  const btnLabel = ACTION_LABEL[order.estado];

  // Cálculo de tiempo restante para empezar la preparación
  const minutesLeft = order.prepInicioEstimado
    ? Math.round((order.prepInicioEstimado.getTime() - currentTime.getTime()) / 60_000)
    : null;

  // Determinar color de urgencia
  const isDelayed = minutesLeft !== null && minutesLeft <= 0;
  const isClose = minutesLeft !== null && minutesLeft > 0 && minutesLeft <= 30;

  let timerBadge = null;
  if (order.cuando === "ASAP") {
    timerBadge = (
      <span className="inline-flex items-center gap-1 rounded bg-danger/10 px-1.5 py-0.5 text-[10px] font-bold text-danger uppercase tracking-wider">
        <Clock className="h-3 w-3" /> ASAP
      </span>
    );
  } else if (order.fechaEntrega) {
    const formattedEntrega = order.fechaEntrega.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    timerBadge = (
      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider">
        🕒 {formattedEntrega} hs
      </span>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border bg-surface p-3.5 shadow-sm transition-all hover:shadow-md space-y-3 relative group",
        isDelayed && order.estado !== "LISTO" && order.estado !== "EN_REPARTO"
          ? "border-danger bg-danger/[0.01]"
          : isClose && order.estado !== "LISTO" && order.estado !== "EN_REPARTO"
            ? "border-amber-400 bg-amber-400/[0.01]"
            : "border-border"
      )}
    >
      {/* Encabezado: Código y tiempo */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-cocoa-soft">
          {order.codigo}
        </span>
        <div className="flex gap-1 items-center">
          {timerBadge}
        </div>
      </div>

      {/* Info del Cliente */}
      <div className="space-y-1">
        <p className="text-sm font-semibold text-cocoa leading-tight">{order.customer.nombre}</p>
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            {order.metodoEntrega === "ENVIO" ? (
              <Truck className="h-3.5 w-3.5 text-caramel-deep" />
            ) : (
              <Store className="h-3.5 w-3.5 text-success" />
            )}
            {order.metodoEntrega === "ENVIO" ? "Envío" : "Retiro"}
          </span>
          {order.customer.telefono && (
            <a
              href={`https://wa.me/${order.customer.telefono.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-success hover:underline font-medium"
              title="Chatear por WhatsApp"
            >
              <Phone className="h-3 w-3" />
              WhatsApp
            </a>
          )}
        </div>
        {order.metodoEntrega === "ENVIO" && order.address && (
          <p className="text-[11px] text-cocoa-soft truncate" title={order.address.resumen}>
            📍 {order.address.resumen}
          </p>
        )}
      </div>

      {/* Lista de productos */}
      <div className="border-t border-b border-border/60 py-2">
        <ul className="text-xs space-y-1 text-cocoa-soft">
          {order.items.map((item) => (
            <li key={item.id} className="truncate">
              <strong className="text-cocoa font-semibold">{item.cantidad}x</strong> {item.nombre}
            </li>
          ))}
        </ul>
        {order.observaciones && (
          <p className="mt-1.5 text-[11px] bg-cream-2/50 rounded px-2 py-1 text-amber-800 leading-tight italic">
            Nota: {order.observaciones}
          </p>
        )}
      </div>

      {/* Indicador de cuenta regresiva para preparación */}
      {order.estado === "CONFIRMADO" && minutesLeft !== null && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Inicio de prep:</span>
          {isDelayed ? (
            <span className="font-semibold text-danger flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
              Demorado ({Math.abs(minutesLeft)}m)
            </span>
          ) : (
            <span className={cn("font-medium", isClose ? "text-amber-600" : "text-cocoa-soft")}>
              en {minutesLeft} minutos
            </span>
          )}
        </div>
      )}

      {/* Footer: Acciones */}
      <div className="flex gap-1.5 pt-1.5">
        <button
          onClick={onCancelar}
          className="flex-1 rounded-[var(--radius-md)] border border-border bg-surface py-1.5 text-[11px] font-semibold text-danger hover:bg-danger/10 hover:border-danger/20 transition-all"
        >
          Cancelar
        </button>
        {next && btnLabel && (
          <button
            onClick={onAvanzar}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-[var(--radius-md)] bg-caramel text-primary-foreground py-1.5 text-[11px] font-bold shadow-[0_2px_4px_rgba(197,123,44,0.2)] hover:bg-caramel-deep transition-all"
          >
            {btnLabel} <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// Subcomponente Input interno para evitar dependencias
function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-[var(--radius-md)] border border-input bg-surface px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
