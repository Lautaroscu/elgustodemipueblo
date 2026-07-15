"use client";

import { WhatsappIcon } from "@/components/shared/icons";
import { waLink, orderWhatsappMessage } from "@/lib/whatsapp";

type Props = {
  whatsapp: string;
  order: {
    codigo: string;
    total: number;
    metodoEntrega: "ENVIO" | "RETIRO";
    observaciones?: string | null;
    items: { nombre: string; cantidad: number; precio: number }[];
    cliente: { nombre: string; telefono: string; direccion?: string | null };
  };
};

export function ConfirmWhatsappButton({ whatsapp, order }: Props) {
  const href = waLink(whatsapp, orderWhatsappMessage(order));
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-semibold text-white shadow-[0_10px_28px_-8px_rgba(37,211,102,0.7)] transition-all hover:brightness-105 active:scale-[0.98]"
    >
      <WhatsappIcon className="h-5 w-5" /> Confirmar por WhatsApp
    </a>
  );
}
