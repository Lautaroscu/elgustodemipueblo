"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  emoji?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

/**
 * Imagen de producto con fallback branded: si la foto no carga (offline o URL
 * caída), muestra un degradé cálido con un emoji. Evita imágenes rotas.
 */
export function ProductImage({
  src,
  alt,
  emoji = "🍰",
  fill,
  width,
  height,
  sizes,
  className,
  priority,
}: Props) {
  const [failed, setFailed] = React.useState(false);
  const showFallback = !src || failed;

  if (showFallback) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "grid place-items-center bg-gradient-to-br from-cream-2 via-cream-3 to-caramel-soft/40",
          fill ? "absolute inset-0 h-full w-full" : "",
          className,
        )}
        style={!fill ? { width, height } : undefined}
      >
        <span className="text-5xl opacity-70 drop-shadow-sm">{emoji}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
