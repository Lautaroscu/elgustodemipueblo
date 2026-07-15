"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Percent, Loader2 } from "lucide-react";
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
import {
  savePromotion,
  deletePromotion,
  togglePromotion,
} from "@/app/actions/admin-marketing";
import { cn } from "@/lib/utils";

type PromoType =
  | "DOS_POR_UNO"
  | "TRES_POR_DOS"
  | "PORCENTAJE"
  | "COMBO"
  | "HAPPY_HOUR";

const TYPE_LABEL: Record<PromoType, string> = {
  DOS_POR_UNO: "2x1",
  TRES_POR_DOS: "3x2",
  PORCENTAJE: "% descuento",
  COMBO: "Combo",
  HAPPY_HOUR: "Happy Hour",
};

const usesValor = (t: PromoType) =>
  t === "PORCENTAJE" || t === "COMBO" || t === "HAPPY_HOUR";

type Promo = {
  id: string;
  nombre: string;
  tipo: PromoType;
  valor: number;
  activo: boolean;
  horaInicio: number | null;
  horaFin: number | null;
};

type Category = { id: string; nombre: string };

export function PromotionsManager({
  promotions,
  categories,
}: {
  promotions: Promo[];
  categories: Category[];
}) {
  const router = useRouter();
  const [nombre, setNombre] = React.useState("");
  const [tipo, setTipo] = React.useState<PromoType>("PORCENTAJE");
  const [valor, setValor] = React.useState(20);
  const [prioridad, setPrioridad] = React.useState(0);
  const [horaInicio, setHoraInicio] = React.useState(16);
  const [horaFin, setHoraFin] = React.useState(19);
  const [cats, setCats] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);

  function toggleCat(id: string) {
    setCats((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (nombre.trim().length < 2) return toast.error("Ingresá un nombre.");
    setSaving(true);
    try {
      await savePromotion({
        nombre,
        tipo,
        valor: usesValor(tipo) ? valor : 0,
        prioridad,
        horaInicio: tipo === "HAPPY_HOUR" ? horaInicio : null,
        horaFin: tipo === "HAPPY_HOUR" ? horaFin : null,
        activo: true,
        categorias: cats,
        productos: [],
      });
      toast.success("Promoción creada");
      setNombre("");
      setCats([]);
      router.refresh();
    } catch {
      toast.error("No se pudo crear la promoción.");
    }
    setSaving(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <form
        onSubmit={create}
        className="h-fit space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]"
      >
        <h2 className="font-display text-lg font-semibold text-cocoa">
          Nueva promoción
        </h2>
        <div className="space-y-1.5">
          <Label>Nombre</Label>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Happy Hour de tardecita"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as PromoType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(TYPE_LABEL) as PromoType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {usesValor(tipo) && (
            <div className="space-y-1.5">
              <Label>% descuento</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
              />
            </div>
          )}
        </div>

        {tipo === "HAPPY_HOUR" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Desde (hora)</Label>
              <Input
                type="number"
                min={0}
                max={23}
                value={horaInicio}
                onChange={(e) => setHoraInicio(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Hasta (hora)</Label>
              <Input
                type="number"
                min={0}
                max={23}
                value={horaFin}
                onChange={(e) => setHoraFin(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Prioridad</Label>
          <Input
            type="number"
            value={prioridad}
            onChange={(e) => setPrioridad(Number(e.target.value))}
          />
        </div>

        <div>
          <Label>Aplica a categorías (vacío = todo)</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCat(c.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  cats.includes(c.id)
                    ? "border-caramel bg-caramel/12 text-caramel-deep"
                    : "border-border text-cocoa-soft hover:bg-cream-2",
                )}
              >
                {c.nombre}
              </button>
            ))}
          </div>
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
          Crear promoción
        </button>
      </form>

      <div>
        {promotions.length === 0 ? (
          <EmptyState
            icon={<Percent className="h-6 w-6" />}
            title="Sin promociones"
            description="Creá 2x1, 3x2, descuentos o happy hours."
          />
        ) : (
          <ul className="space-y-2">
            {promotions.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-soft)]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-caramel/12 text-caramel-deep">
                  <Percent className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium text-cocoa">
                      {p.nombre}
                    </span>
                    <Badge variant="default">{TYPE_LABEL[p.tipo]}</Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {usesValor(p.tipo) ? `${p.valor}% · ` : ""}
                    {p.tipo === "HAPPY_HOUR" && p.horaInicio != null
                      ? `de ${p.horaInicio} a ${p.horaFin} hs`
                      : "vigente"}
                  </p>
                </div>
                <Switch
                  checked={p.activo}
                  onCheckedChange={async (v) => {
                    await togglePromotion(p.id, v);
                    router.refresh();
                  }}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm("¿Eliminar promoción?")) {
                      await deletePromotion(p.id);
                      toast.success("Promoción eliminada");
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
