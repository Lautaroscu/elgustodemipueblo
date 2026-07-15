import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/order-status";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-cocoa">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

const orderVariant: Record<OrderStatus, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  CONFIRMADO: "bg-sky-100 text-sky-800",
  EN_PREPARACION: "bg-violet-100 text-violet-800",
  LISTO: "bg-teal-100 text-teal-800",
  EN_REPARTO: "bg-blue-100 text-blue-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        orderVariant[status],
      )}
    >
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const variant =
    status === "APROBADO"
      ? "success"
      : status === "RECHAZADO"
        ? "berry"
        : "outline";
  return <Badge variant={variant}>{PAYMENT_STATUS_LABEL[status]}</Badge>;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-border bg-surface py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-cream-2 text-caramel-deep">
        {icon}
      </span>
      <div>
        <p className="font-display text-lg font-semibold text-cocoa">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="mt-1 rounded-full bg-cocoa px-5 py-2.5 text-sm font-medium text-cream"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
