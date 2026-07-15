"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSettings } from "@/app/actions/admin-settings";
import type { BusinessSettings } from "@/domain/settings";

export function SettingsForm({ initial }: { initial: BusinessSettings }) {
  const router = useRouter();
  const [s, setS] = React.useState<BusinessSettings>(initial);
  const [saving, setSaving] = React.useState(false);

  function set<K extends keyof BusinessSettings>(k: K, v: BusinessSettings[K]) {
    setS((prev) => ({ ...prev, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(s);
      toast.success("Configuración guardada");
      router.refresh();
    } catch {
      toast.error("No se pudo guardar.");
    }
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section title="Negocio">
        <Field label="Nombre">
          <Input value={s.nombre} onChange={(e) => set("nombre", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="WhatsApp (con código país)">
            <Input
              value={s.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="5492281401234"
            />
          </Field>
          <Field label="Instagram (URL)">
            <Input
              value={s.instagram}
              onChange={(e) => set("instagram", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <Input value={s.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Dirección">
            <Input
              value={s.direccion}
              onChange={(e) => set("direccion", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Horarios">
          <Input value={s.horarios} onChange={(e) => set("horarios", e.target.value)} />
        </Field>
      </Section>

      <Section title="Datos de pago (transferencia)">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Alias">
            <Input
              value={s.aliasTransferencia}
              onChange={(e) => set("aliasTransferencia", e.target.value)}
            />
          </Field>
          <Field label="CBU/CVU">
            <Input value={s.cbu} onChange={(e) => set("cbu", e.target.value)} />
          </Field>
          <Field label="Titular">
            <Input
              value={s.titularCuenta}
              onChange={(e) => set("titularCuenta", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Envíos">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Costo de envío base ($)">
            <Input
              type="number"
              value={s.costoEnvioBase}
              onChange={(e) => set("costoEnvioBase", Number(e.target.value))}
            />
          </Field>
          <Field label="Envío gratis desde ($, 0 = sin envío gratis)">
            <Input
              type="number"
              value={s.envioGratisDesde ?? 0}
              onChange={(e) =>
                set(
                  "envioGratisDesde",
                  Number(e.target.value) > 0 ? Number(e.target.value) : null,
                )
              }
            />
          </Field>
        </div>

        <div>
          <Label>Zonas de reparto</Label>
          <div className="mt-2 space-y-2">
            {s.zonas.map((z, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={z.nombre}
                  placeholder="Nombre de zona"
                  onChange={(e) => {
                    const zonas = [...s.zonas];
                    zonas[i] = { ...zonas[i], nombre: e.target.value };
                    set("zonas", zonas);
                  }}
                />
                <Input
                  type="number"
                  value={z.costo}
                  placeholder="Costo"
                  className="w-32"
                  onChange={(e) => {
                    const zonas = [...s.zonas];
                    zonas[i] = { ...zonas[i], costo: Number(e.target.value) };
                    set("zonas", zonas);
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "zonas",
                      s.zonas.filter((_, idx) => idx !== i),
                    )
                  }
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius-md)] border border-border text-muted hover:bg-danger/10 hover:text-danger"
                  aria-label="Quitar zona"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                set("zonas", [...s.zonas, { nombre: "", costo: 0 }])
              }
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-border px-4 py-2.5 text-sm font-medium text-cocoa-soft hover:bg-cream-2"
            >
              <Plus className="h-4 w-4" /> Agregar zona
            </button>
          </div>
        </div>

        <label className="flex items-center justify-between gap-4 pt-2">
          <span>
            <span className="block text-sm font-medium text-cocoa">
              Retiro disponible
            </span>
            <span className="block text-xs text-muted">
              Permitir que el cliente retire su pedido
            </span>
          </span>
          <Switch
            checked={s.retiroDisponible}
            onCheckedChange={(v) => set("retiroDisponible", v)}
          />
        </label>
        {s.retiroDisponible && (
          <div className="space-y-4 pt-2 border-t border-border mt-4">
            <h3 className="text-sm font-semibold text-cocoa">Detalles del local</h3>
            <Field label="Instrucciones de retiro (legibles al finalizar)">
              <Input
                value={s.direccionRetiro}
                onChange={(e) => set("direccionRetiro", e.target.value)}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Dirección del local (para el mapa)">
                <Input
                  value={s.direccionLocal}
                  onChange={(e) => set("direccionLocal", e.target.value)}
                  placeholder="Ej: Av. Mitre 550, Benito Juárez"
                />
              </Field>
              <Field label="Horarios de retiro">
                <Input
                  value={s.horariosRetiro}
                  onChange={(e) => set("horariosRetiro", e.target.value)}
                  placeholder="Ej: Martes a Domingo · 10 a 20 hs"
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Latitud GPS (opcional)">
                <Input
                  type="number"
                  step="any"
                  value={s.localLat ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    set("localLat", val ? Number(val) : null);
                  }}
                  placeholder="Ej: -37.6772"
                />
              </Field>
              <Field label="Longitud GPS (opcional)">
                <Input
                  type="number"
                  step="any"
                  value={s.localLng ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    set("localLng", val ? Number(val) : null);
                  }}
                  placeholder="Ej: -59.8027"
                />
              </Field>
            </div>
          </div>
        )}
      </Section>

      <Section title="Campos del formulario de envío (Checkout)">
        <p className="text-xs text-muted mb-2">
          Configurá qué información solicitar al cliente durante el checkout cuando selecciona envío a domicilio.
        </p>
        <div className="divide-y divide-border rounded-[var(--radius-lg)] border border-border bg-cream-2/30 overflow-hidden">
          {s.camposEntrega.map((campo, index) => (
            <div key={campo.key} className="flex items-center justify-between p-3.5 gap-4">
              <div>
                <span className="text-sm font-medium text-cocoa block">
                  {campo.label}
                </span>
                <span className="text-xs text-muted block font-mono">
                  {campo.key} {campo.fijo && "· Fijo"}
                </span>
              </div>
              <div className="w-44">
                {campo.fijo ? (
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted bg-cream-2 px-2.5 py-1 rounded-full border border-border inline-block float-right">
                    Obligatorio
                  </span>
                ) : (
                  <Select
                    value={campo.visibilidad}
                    onValueChange={(val: "OCULTO" | "OPCIONAL" | "OBLIGATORIO") => {
                      const campos = [...s.camposEntrega];
                      campos[index] = { ...campos[index], visibilidad: val };
                      set("camposEntrega", campos);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OBLIGATORIO">Obligatorio</SelectItem>
                      <SelectItem value="OPCIONAL">Opcional</SelectItem>
                      <SelectItem value="OCULTO">Oculto</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <button
        type="submit"
        disabled={saving}
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-caramel px-8 text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_-8px_rgba(197,123,44,0.8)] transition-all hover:bg-caramel-deep active:scale-[0.98] disabled:opacity-60"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Guardando…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> Guardar cambios
          </>
        )}
      </button>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
      <h2 className="font-display text-lg font-semibold text-cocoa">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
