import type { Metadata } from "next";
import { CatalogView } from "@/components/shop/catalog/catalog-view";
import { getAllVisibleProducts, getCategories } from "@/data/catalog";
import { toShopProduct } from "@/lib/shop-types";

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Descubrí todos nuestros postres artesanales: tortas, cheesecakes, postres en vaso, brownies, cookies y más. Pedí online en un minuto.",
};

// Revalida cada 5 min; se invalida al editar productos desde el admin.
export const revalidate = 300;

export default async function CatalogoPage() {
  const [products, categories] = await Promise.all([
    getAllVisibleProducts(),
    getCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-caramel-deep">
          Nuestro menú
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold text-cocoa sm:text-4xl">
          Elegí tus favoritos
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Sumá postres al pedido con “+” y finalizá cuando quieras. Sin
          registrarte.
        </p>
      </header>

      <CatalogView
        products={products.map(toShopProduct)}
        categories={categories.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          emoji: c.emoji,
        }))}
      />
    </div>
  );
}
