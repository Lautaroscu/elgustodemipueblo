import type { OrderStatus, PaymentStatus } from "@prisma/client";

export const ORDER_FLOW: OrderStatus[] = [
  "PENDIENTE",
  "CONFIRMADO",
  "EN_PREPARACION",
  "LISTO",
  "EN_REPARTO",
  "ENTREGADO",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  LISTO: "Listo",
  EN_REPARTO: "En reparto",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDIENTE: "Pago pendiente",
  APROBADO: "Pago aprobado",
  RECHAZADO: "Pago rechazado",
  REEMBOLSADO: "Reembolsado",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  MERCADO_PAGO: "Mercado Pago",
  TRANSFERENCIA: "Transferencia",
  EFECTIVO: "Efectivo",
};

export function statusStepIndex(status: OrderStatus): number {
  const i = ORDER_FLOW.indexOf(status);
  return i === -1 ? 0 : i;
}
