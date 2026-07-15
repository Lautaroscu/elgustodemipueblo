"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Ticket, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "./ui";
import { saveCoupon, deleteCoupon, toggleCoupon } from "@/app/actions/admin-marketing";
import { formatPrice } from "@/lib/utils";

type Coupon = {
  id: string;
  codigo: string;
  tipo: "FIJO" | "PORCENTAJE";
  valor: number;
  montoMinimo: number;
  usosMax: number | null;
  usos: number;
  vence: string | null;
  activo: boolean;
};

export function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [codigo, setCodigo] = React.useState("");
  const [tipo, setTipo] = React.useState<"FIJO" | "PORCENTAJE">("PORCENTAJE");
  const [valor, setValor] = React.useState(10);
  const [montoMinimo, setMontoMinimo] = React.useState(0);
  const [usosMax, setUsosMax] = React.useState("");
  const [vence, setVence] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (codigo.trim().length < 3) return toast.error("Código muy corto.");
    setSaving(true);
    const res = await saveCoupon({
      codigo,
      tipo,
      valor,
      montoMinimo,
      usosMax: usosMax ? Number(usosMax) : null,
      vence: vence || null,
      activo: true,
    });
    if (res.ok) {
      toast.success("Cupón creado");
      setCodigo("");
      setValor(10);
      setMontoMinimo(0);
      setUsosMax("");
      setVence("");
      router.refresh();
    } else {
      toast.error(res.error);
    }
    setSaving(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      {/* Formulario */}
      <form
        onSubmit={create}
        className="h-fit space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]"
      >
        <h2 className="font-display text-lg font-semibold text-cocoa">
          Nuevo cupón
        </h2>
        <div className="space-y-1.5">
          <Label>Código</Label>
          <Input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="VERANO20"
            className="uppercase"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as typeof tipo)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PORCENTAJE">Porcentaje</SelectItem>
                <SelectItem value="FIJO">Monto fijo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{tipo === "PORCENTAJE" ? "% descuento" : "$ descuento"}</Label>
            <Input
              type="number"
              min={1}
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Monto mínimo ($)</Label>
            <Input
              type="number"
              min={0}
              value={montoMinimo}
              onChange={(e) => setMontoMinimo(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Límite de usos</Label>
            <Input
              type="number"
              min={1}
              value={usosMax}
              onChange={(e) => setUsosMax(e.target.value)}
              placeholder="∞"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Vencimiento (opcional)</Label>
          <Input type="date" value={vence} onChange={(e) => setVence(e.target.value)} />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-caramel text-sm font-semibold text-primary-foreground transition-colors hover:bg-caramel-deep disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Crear cupón
        </button>
      </form>

      {/* Lista */}
      <div>
        {coupons.length === 0 ? (
          <EmptyState
            icon={<Ticket className="h-6 w-6" />}
            title="Sin cupones"
            description="Creá tu primer cupón de descuento."
          />
        ) : (
          <ul className="space-y-2">
            {coupons.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-soft)]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-caramel/12 text-caramel-deep">
                  <Ticket className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-semibold text-cocoa">
                      {c.codigo}
                    </span>
                    <Badge variant={c.activo ? "success" : "outline"}>
                      {c.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {c.tipo === "PORCENTAJE"
                      ? `${c.valor}% off`
                      : `${formatPrice(c.valor)} off`}
                    {c.montoMinimo > 0 && ` · mín ${formatPrice(c.montoMinimo)}`}
                    {` · ${c.usos}${c.usosMax ? `/${c.usosMax}` : ""} usos`}
                  </p>
                </div>
                <Switch
                  checked={c.activo}
                  onCheckedChange={async (v) => {
                    await toggleCoupon(c.id, v);
                    router.refresh();
                  }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm("¿Eliminar cupón?")) {
                      await deleteCoupon(c.id);
                      toast.success("Cupón eliminado");
                      router.refresh();
                    }
                  }}
                  aria-label="Eliminar"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
