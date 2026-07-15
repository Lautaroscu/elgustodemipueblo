"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { useCart, selectCount, selectSubtotal } from "./cart-store";
import { ProductImage } from "@/components/shared/product-image";
import { formatPrice } from "@/lib/utils";

/**
 * Panel flotante de confirmación que aparece al agregar un producto:
 * muestra el ítem agregado, cantidad total y subtotal, sin abandonar el
 * catálogo. Se auto-oculta a los ~2.6s.
 */
export function AddedFlyout({ onOpenCart }: { onOpenCart: () => void }) {
  const lastAddedId = useCart((s) => s.lastAddedId);
  const clearLastAdded = useCart((s) => s.clearLastAdded);
  const item = useCart((s) =>
    s.items.find((i) => i.productId === lastAddedId),
  );
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);

  React.useEffect(() => {
    if (!lastAddedId) return;
    const t = setTimeout(() => clearLastAdded(), 2600);
    return () => clearTimeout(t);
  }, [lastAddedId, clearLastAdded]);

  return (
    <AnimatePresence>
      {lastAddedId && item && (
        <motion.div
          initial={{ y: -24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -24, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", damping: 24, stiffness: 320 }}
          className="fixed inset-x-0 top-20 z-40 flex justify-center px-4"
        >
          <button
            type="button"
            onClick={() => {
              clearLastAdded();
              onOpenCart();
            }}
            className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border bg-surface/95 p-2.5 pr-4 text-left shadow-[var(--shadow-lift)] backdrop-blur-xl transition-transform active:scale-[0.99]"
          >
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
              <ProductImage
                src={item.imagen}
                alt={item.nombre}
                emoji={item.emoji}
                fill
                sizes="48px"
              />
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-success text-white">
                <Check className="h-3 w-3" />
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-cocoa">
                {item.nombre}
              </span>
              <span className="text-xs text-muted">
                {count} {count === 1 ? "producto" : "productos"} · Ver pedido
              </span>
            </span>
            <span className="font-display text-sm font-semibold text-cocoa">
              {formatPrice(subtotal)}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
