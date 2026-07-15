import Link from "next/link";
import { ProductImage } from "@/components/shared/product-image";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "./cart/add-to-cart-button";
import { formatPrice } from "@/lib/utils";
import type { ShopProduct } from "@/lib/shop-types";

export function ProductCard({
  product,
  priority,
}: {
  product: ShopProduct;
  priority?: boolean;
}) {
  const outOfStock = product.stock <= 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
      <Link
        href={`/producto/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-cream-2"
        aria-label={product.nombre}
      >
        <ProductImage
          src={product.imagen}
          alt={product.imagenAlt}
          emoji={product.categoryEmoji}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {product.tags.length > 0 && (
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1">
            {product.tags.slice(0, 1).map((t) => (
              <Badge key={t} variant="cocoa" className="capitalize backdrop-blur">
                {t}
              </Badge>
            ))}
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-cocoa-deep/45">
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-cocoa">
              Sin stock
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex-1">
          <Link href={`/producto/${product.slug}`}>
            <h3 className="font-display text-[0.98rem] font-semibold leading-tight text-cocoa transition-colors group-hover:text-caramel-deep">
              {product.nombre}
            </h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
            {product.descripcion}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="font-display text-lg font-bold text-cocoa">
            {formatPrice(product.precio)}
          </span>
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              nombre: product.nombre,
              precio: product.precio,
              categoryId: product.categoryId,
              imagen: product.imagen,
              emoji: product.categoryEmoji,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </article>
  );
}
