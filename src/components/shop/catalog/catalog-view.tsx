"use client";

import * as React from "react";
import { Search, X, SearchX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/shop/product-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ShopProduct } from "@/lib/shop-types";

type Category = { id: string; nombre: string; emoji: string | null };

export function CatalogView({
  products,
  categories,
}: {
  products: ShopProduct[];
  categories: Category[];
}) {
  const [query, setQuery] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchCat = !activeCat || p.categoryId === activeCat;
      const matchQuery =
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [products, query, activeCat]);

  return (
    <div>
      {/* Buscador */}
      <div className="relative mx-auto max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar postres, ingredientes…"
          className="rounded-full pl-12 pr-11 text-base"
          aria-label="Buscar productos"
          style={{ height: "3.25rem" }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-cream-2"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Chips de categoría */}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Chip active={activeCat === null} onClick={() => setActiveCat(null)}>
          Todo
        </Chip>
        {categories.map((c) => (
          <Chip
            key={c.id}
            active={activeCat === c.id}
            onClick={() => setActiveCat(activeCat === c.id ? null : c.id)}
          >
            {c.emoji && <span className="mr-1">{c.emoji}</span>}
            {c.nombre}
          </Chip>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-cream-2">
              <SearchX className="h-7 w-7 text-caramel-deep" />
            </span>
            <p className="font-display text-lg font-semibold text-cocoa">
              No encontramos nada
            </p>
            <p className="max-w-xs text-sm text-muted">
              Probá con otra búsqueda o mirá todas las categorías.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveCat(null);
              }}
              className="mt-1 rounded-full bg-cocoa px-5 py-2.5 text-sm font-medium text-cream"
            >
              Ver todo
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.2) }}
                >
                  <ProductCard product={p} priority={i < 4} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all active:scale-95",
        active
          ? "border-cocoa bg-cocoa text-cream"
          : "border-border bg-surface text-cocoa-soft hover:border-caramel/50 hover:bg-cream-2",
      )}
    >
      {children}
    </button>
  );
}
