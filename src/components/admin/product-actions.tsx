"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Star,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  toggleProductFlag,
  duplicateProduct,
  deleteProduct,
} from "@/app/actions/admin-products";

export function ProductActions({
  id,
  visible,
  destacado,
}: {
  id: string;
  visible: boolean;
  destacado: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function run(fn: () => Promise<unknown>, ok?: string) {
    setBusy(true);
    try {
      await fn();
      if (ok) toast.success(ok);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
    setBusy(false);
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        disabled={busy}
        className="grid h-9 w-9 place-items-center rounded-full text-cocoa-soft transition-colors hover:bg-cream-2 disabled:opacity-50"
        aria-label="Acciones"
      >
        <MoreVertical className="h-4 w-4" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-48 rounded-[var(--radius-md)] border border-border bg-surface p-1.5 shadow-[var(--shadow-lift)]"
        >
          <Item asChild>
            <Link href={`/admin/productos/${id}/editar`}>
              <Pencil className="h-4 w-4" /> Editar
            </Link>
          </Item>
          <Item
            onSelect={() =>
              run(() => toggleProductFlag(id, "destacado", !destacado))
            }
          >
            <Star className="h-4 w-4" />
            {destacado ? "Quitar destacado" : "Destacar"}
          </Item>
          <Item
            onSelect={() => run(() => toggleProductFlag(id, "visible", !visible))}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {visible ? "Ocultar" : "Mostrar"}
          </Item>
          <Item
            onSelect={() =>
              run(() => duplicateProduct(id), "Producto duplicado")
            }
          >
            <Copy className="h-4 w-4" /> Duplicar
          </Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <Item
            danger
            onSelect={() => {
              if (confirm("¿Eliminar este producto?")) {
                run(async () => {
                  const res = await deleteProduct(id);
                  if (res && "softDeleted" in res && res.softDeleted) {
                    toast.info(res.message);
                  } else {
                    toast.success("Producto eliminado");
                  }
                });
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Eliminar
          </Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Item({
  children,
  onSelect,
  danger,
  asChild,
}: {
  children: React.ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  asChild?: boolean;
}) {
  return (
    <DropdownMenu.Item
      asChild={asChild}
      onSelect={onSelect}
      className={`flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-sm outline-none transition-colors data-[highlighted]:bg-cream-2 ${
        danger ? "text-danger data-[highlighted]:bg-danger/10" : "text-cocoa"
      }`}
    >
      {children}
    </DropdownMenu.Item>
  );
}
