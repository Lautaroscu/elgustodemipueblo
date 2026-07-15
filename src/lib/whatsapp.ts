/** Construye un deep link de WhatsApp con mensaje prellenado. */
export function waLink(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

type OrderLike = {
  codigo: string;
  items: { nombre: string; cantidad: number; precio: number }[];
  total: number;
  metodoEntrega: "ENVIO" | "RETIRO";
  cliente: { nombre: string; telefono: string; direccion?: string | null };
  observaciones?: string | null;
};

/** Mensaje de WhatsApp con el detalle del pedido, listo para cerrar la venta. */
export function orderWhatsappMessage(order: OrderLike): string {
  const lines = [
    `¡Hola! Soy ${order.cliente.nombre} 👋`,
    `Quiero confirmar mi pedido *${order.codigo}*:`,
    "",
    ...order.items.map(
      (i) => `• ${i.cantidad}x ${i.nombre}`,
    ),
    "",
    `Entrega: ${order.metodoEntrega === "ENVIO" ? "Envío a domicilio" : "Retiro"}`,
    order.cliente.direccion ? `Dirección: ${order.cliente.direccion}` : "",
    order.observaciones ? `Notas: ${order.observaciones}` : "",
    `Total: $${order.total.toLocaleString("es-AR")}`,
  ].filter(Boolean);
  return lines.join("\n");
}
