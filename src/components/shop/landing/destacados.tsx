import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { Reveal } from "@/components/shared/reveal";
import { getFeaturedProducts } from "@/data/catalog";
import { toShopProduct } from "@/lib/shop-types";

export async function Destacados() {
  const products = (await getFeaturedProducts()).map(toShopProduct);
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-caramel-deep">
              Los más pedidos
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-cocoa sm:text-4xl">
              Productos destacados
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-cocoa transition-colors hover:bg-cream-2 sm:inline-flex"
          >
            Ver todo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <ProductCard product={p} priority={i < 4} />
          </Reveal>
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-1.5 rounded-full bg-cocoa px-6 py-3 text-sm font-medium text-cream"
        >
          Ver todo el catálogo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
