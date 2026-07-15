import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Leaf } from "lucide-react";
import { ProductGallery } from "@/components/shop/catalog/product-gallery";
import { AddToCartButton } from "@/components/shop/cart/add-to-cart-button";
import { ProductCard } from "@/components/shop/product-card";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug, getAllVisibleProducts } from "@/data/catalog";
import { toShopProduct } from "@/lib/shop-types";
import { formatPrice } from "@/lib/utils";
import { site } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.nombre,
    description: product.descripcion,
    openGraph: {
      title: product.nombre,
      description: product.descripcion,
      images: product.imagenes[0]?.url ? [product.imagenes[0].url] : [],
    },
  };
}

export default async function ProductoPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const emoji = product.category.emoji ?? "🍰";
  const outOfStock = product.stock <= 0;
  const relacionados = (await getAllVisibleProducts())
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)
    .map(toShopProduct);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nombre,
    description: product.descripcion,
    image: product.imagenes.map((i) => i.url),
    category: product.category.nombre,
    offers: {
      "@type": "Offer",
      price: product.precio,
      priceCurrency: "ARS",
      availability: outOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: `${site.url}/producto/${product.slug}`,
    },
  };

  const ingredientes = product.ingredientes
    ?.split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav
        aria-label="Migas de pan"
        className="mb-6 flex items-center gap-1 text-sm text-muted"
      >
        <Link href="/catalogo" className="hover:text-cocoa">
          Catálogo
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-cocoa-soft">{product.category.nombre}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          imagenes={product.imagenes.map((i) => ({ url: i.url, alt: i.alt }))}
          nombre={product.nombre}
          emoji={emoji}
        />

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="caramel">{product.category.nombre}</Badge>
            {product.tags.map((t) => (
              <Badge key={t} variant="default" className="capitalize">
                {t}
              </Badge>
            ))}
          </div>

          <h1 className="mt-3 font-display text-3xl font-semibold text-cocoa sm:text-4xl">
            {product.nombre}
          </h1>
          <p className="mt-3 leading-relaxed text-cocoa-soft">
            {product.descripcion}
          </p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-cocoa">
              {formatPrice(product.precio)}
            </span>
            {outOfStock ? (
              <Badge variant="berry">Sin stock</Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="berry">¡Últimas {product.stock} unidades!</Badge>
            ) : (
              <Badge variant="success">Disponible</Badge>
            )}
          </div>

          {ingredientes && ingredientes.length > 0 && (
            <div className="mt-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-cocoa">
                <Leaf className="h-4 w-4 text-success" /> Ingredientes
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ingredientes.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full bg-cream-2 px-3 py-1 text-xs text-cocoa-soft"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <AddToCartButton
              variant="full"
              product={{
                productId: product.id,
                slug: product.slug,
                nombre: product.nombre,
                precio: product.precio,
                categoryId: product.categoryId,
                imagen: product.imagenes[0]?.url ?? null,
                emoji,
                stock: product.stock,
              }}
            />
          </div>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-display text-2xl font-semibold text-cocoa">
            También te puede gustar
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {relacionados.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
