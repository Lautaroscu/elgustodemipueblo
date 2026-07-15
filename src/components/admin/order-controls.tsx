"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { updateOrderStatus, updatePaymentStatus } from "@/app/actions/admin-orders";
import { ORDER_FLOW, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export function OrderStatusControls({
  codigo,
  estado,
  estadoPago,
}: {
  codigo: string;
  estado: OrderStatus;
  estadoPago: PaymentStatus;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);

  async function setStatus(s: OrderStatus) {
    setPending("estado-" + s);
    const res = await updateOrderStatus(codigo, s);
    if (res.ok) {
      toast.success(`Estado: ${ORDER_STATUS_LABEL[s]}`);
      router.refresh();
    }
    setPending(null);
  }

  async function setPago(p: PaymentStatus) {
    setPending("pago-" + p);
    const res = await updatePaymentStatus(codigo, p);
    if (res.ok) {
      toast.success("Pago actualizado");
      router.refresh();
    }
    setPending(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-cocoa">Estado del pedido</h3>
        <div className="flex flex-wrap gap-2">
          {ORDER_FLOW.map((s) => {
            const active = estado === s;
            return (
              <button
                key={s}
                type="button"
                disabled={!!pending}
                onClick={() => setStatus(s)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
                  active
                    ? "border-caramel bg-caramel text-primary-foreground"
                    : "border-border bg-surface text-cocoa-soft hover:bg-cream-2",
                )}
              >
                {pending === "estado-" + s ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : active ? (
                  <Check className="h-3.5 w-3.5" />
                ) : null}
                {ORDER_STATUS_LABEL[s]}
              </button>
            );
          })}
          <button
            type="button"
            disabled={!!pending}
            onClick={() => setStatus("CANCELADO")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
              estado === "CANCELADO"
                ? "border-danger bg-danger text-white"
                : "border-border bg-surface text-danger hover:bg-danger/10",
            )}
          >
            Cancelado
          </button>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-cocoa">Estado del pago</h3>
        <div className="flex flex-wrap gap-2">
          {(["PENDIENTE", "APROBADO", "RECHAZADO", "REEMBOLSADO"] as PaymentStatus[]).map(
            (p) => {
              const active = estadoPago === p;
              return (
                <button
                  key={p}
                  type="button"
                  disabled={!!pending}
                  onClick={() => setPago(p)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors disabled:opacity-50",
                    active
                      ? "border-cocoa bg-cocoa text-cream"
                      : "border-border bg-surface text-cocoa-soft hover:bg-cream-2",
                  )}
                >
                  {p.toLowerCase()}
                </button>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
