"use client";

import * as React from "react";
import { Reorder, useDragControls } from "framer-motion";
import { toast } from "sonner";
import { Upload, Link2, X, GripVertical, Loader2, ImagePlus } from "lucide-react";
import { ProductImage } from "@/components/shared/product-image";
import { Input } from "@/components/ui/input";
import { uploadProductImage } from "@/app/actions/admin-upload";

export type ManagedImage = {
  id: string;
  url: string;
  publicId?: string | null;
  alt?: string | null;
};

export function ImageManager({
  value,
  onChange,
}: {
  value: ManagedImage[];
  onChange: (imgs: ManagedImage[]) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const added: ManagedImage[] = [];
    for (const file of Array.from(files).slice(0, 8)) {
      const dataUrl = await fileToDataUrl(file);
      const res = await uploadProductImage(dataUrl);
      if (res.ok) {
        added.push({ id: crypto.randomUUID(), url: res.url, publicId: res.publicId });
      } else {
        toast.error(res.error);
        break;
      }
    }
    if (added.length) onChange([...value, ...added]);
    setUploading(false);
  }

  function addUrl() {
    const u = url.trim();
    if (!u) return;
    try {
      new URL(u);
    } catch {
      toast.error("URL inválida");
      return;
    }
    onChange([...value, { id: crypto.randomUUID(), url: u }]);
    setUrl("");
  }

  function remove(id: string) {
    onChange(value.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <Reorder.Group
          axis="y"
          values={value}
          onReorder={onChange}
          className="space-y-2"
        >
          {value.map((img, i) => (
            <ImageRow key={img.id} img={img} index={i} onRemove={remove} />
          ))}
        </Reorder.Group>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-dashed border-border px-4 py-2.5 text-sm font-medium text-cocoa-soft transition-colors hover:border-caramel/60 hover:bg-cream-2 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Subir imágenes
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
            placeholder="…o pegá la URL de una imagen"
            className="pl-9"
          />
        </div>
        <button
          type="button"
          onClick={addUrl}
          className="inline-flex h-11 items-center gap-1.5 rounded-[var(--radius-md)] border border-border px-4 text-sm font-medium text-cocoa hover:bg-cream-2"
        >
          <ImagePlus className="h-4 w-4" /> Agregar
        </button>
      </div>
      <p className="text-xs text-muted">
        Arrastrá para reordenar. La primera imagen es la principal.
      </p>
    </div>
  );
}

function ImageRow({
  img,
  index,
  onRemove,
}: {
  img: ManagedImage;
  index: number;
  onRemove: (id: string) => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={img}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-2"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        className="cursor-grab touch-none text-muted active:cursor-grabbing"
        aria-label="Reordenar"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-2">
        <ProductImage src={img.url} alt={img.alt ?? ""} fill sizes="56px" />
      </span>
      <span className="min-w-0 flex-1 truncate text-xs text-muted">
        {index === 0 ? "★ Principal · " : ""}
        {img.url}
      </span>
      <button
        type="button"
        onClick={() => onRemove(img.id)}
        aria-label="Quitar imagen"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"
      >
        <X className="h-4 w-4" />
      </button>
    </Reorder.Item>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
