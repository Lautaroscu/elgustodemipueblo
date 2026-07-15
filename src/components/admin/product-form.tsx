"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageManager, type ManagedImage } from "./image-manager";
import { createProduct, updateProduct } from "@/app/actions/admin-products";

type Category = { id: string; nombre: string };

export type ProductFormData = {
  id?: string;
  nombre: string;
  descripcion: string;
  ingredientes: string;
  precio: number;
  stock: number;
  categoryId: string;
  tags: string;
  destacado: boolean;
  visible: boolean;
  imagenes: ManagedImage[];
};

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductFormData;
}) {
  const router = useRouter();
  const [form, setForm] = React.useState<ProductFormData>(
    initial ?? {
      nombre: "",
      descripcion: "",
      ingredientes: "",
      precio: 0,
      stock: 0,
      categoryId: categories[0]?.id ?? "",
      tags: "",
      destacado: false,
      visible: true,
      imagenes: [],
    },
  );
  const [saving, setSaving] = React.useState(false);

  function set<K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.nombre.trim().length < 2) return toast.error("Ingresá un nombre.");
    if (!form.categoryId) return toast.error("Elegí una categoría.");

    setSaving(true);
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      ingredientes: form.ingredientes || null,
      precio: Math.round(form.precio) || 0,
      stock: Math.round(form.stock) || 0,
      categoryId: form.categoryId,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      destacado: form.destacado,
      visible: form.visible,
      imagenes: form.imagenes.map((i) => ({
        url: i.url,
        publicId: i.publicId ?? null,
        alt: i.alt ?? null,
      })),
    };

    try {
      const res = initial?.id
        ? await updateProduct(initial.id, payload)
        : await createProduct(payload);
      if (res.ok) {
        toast.success(initial?.id ? "Producto actualizado" : "Producto creado");
        router.push("/admin/productos");
        router.refresh();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo guardar el producto.",
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Card>
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              placeholder="Ej: Cheesecake de Frutos Rojos"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Contá qué hace especial a este postre…"
              className="min-h-24"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ingredientes">Ingredientes (separados por coma)</Label>
            <Input
              id="ingredientes"
              value={form.ingredientes}
              onChange={(e) => set("ingredientes", e.target.value)}
              placeholder="Queso crema, frutos rojos, galletitas…"
            />
          </div>
        </Card>

        <Card>
          <Label>Imágenes</Label>
          <ImageManager
            value={form.imagenes}
            onChange={(imgs) => set("imagenes", imgs)}
          />
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="precio">Precio ($)</Label>
              <Input
                id="precio"
                type="number"
                min={0}
                value={form.precio}
                onChange={(e) => set("precio", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set("stock", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => set("categoryId", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Elegí una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
            <Input
              id="tags"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="más vendida, premium"
            />
          </div>
        </Card>

        <Card>
          <ToggleRow
            label="Destacado"
            description="Aparece en la home"
            checked={form.destacado}
            onChange={(v) => set("destacado", v)}
          />
          <ToggleRow
            label="Visible"
            description="Se muestra en el catálogo"
            checked={form.visible}
            onChange={(v) => set("visible", v)}
          />
        </Card>

        <button
          type="submit"
          disabled={saving}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-caramel text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_-8px_rgba(197,123,44,0.8)] transition-all hover:bg-caramel-deep active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Guardando…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" /> Guardar producto
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface p-5 shadow-[var(--shadow-soft)]">
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-cocoa">{label}</span>
        <span className="block text-xs text-muted">{description}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
