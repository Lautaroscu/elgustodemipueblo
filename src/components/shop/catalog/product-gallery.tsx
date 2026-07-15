"use client";

import * as React from "react";
import { ProductImage } from "@/components/shared/product-image";
import { cn } from "@/lib/utils";

type Img = { url: string; alt: string | null };

export function ProductGallery({
  imagenes,
  nombre,
  emoji,
}: {
  imagenes: Img[];
  nombre: string;
  emoji: string;
}) {
  const [active, setActive] = React.useState(0);
  const list = imagenes.length > 0 ? imagenes : [{ url: "", alt: nombre }];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {list.length > 1 && (
        <div className="flex gap-2 sm:flex-col">
          {list.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                active === i
                  ? "border-caramel"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <ProductImage
                src={img.url || null}
                alt={img.alt ?? nombre}
                emoji={emoji}
                fill
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-square flex-1 overflow-hidden rounded-[var(--radius-lg)] bg-cream-2 shadow-[var(--shadow-soft)]">
        <ProductImage
          src={list[active].url || null}
          alt={list[active].alt ?? nombre}
          emoji={emoji}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 480px"
        />
      </div>
    </div>
  );
}
