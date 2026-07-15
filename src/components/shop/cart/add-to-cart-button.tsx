"use client";

import * as React from "react";
import { Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, type CartItem } from "./cart-store";
import { QuantityStepper } from "./quantity-stepper";
import { cn } from "@/lib/utils";

type Props = {
  product: Omit<CartItem, "cantidad">;
  variant?: "icon" | "full";
  className?: string;
};

/**
 * Botón "+" del catálogo. Al primer toque agrega 1 y muestra confirmación;
 * si el producto ya está en el carrito, se transforma en un stepper de cantidad
 * sin salir del catálogo (fricción mínima).
 */
export function AddToCartButton({ product, variant = "icon", className }: Props) {
  const item = useCart((s) =>
    s.items.find((i) => i.productId === product.productId),
  );
  const add = useCart((s) => s.add);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const [justAdded, setJustAdded] = React.useState(false);

  const outOfStock = product.stock <= 0;

  function handleAdd() {
    add(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1100);
  }

  if (item) {
    return (
      <QuantityStepper
        value={item.cantidad}
        max={product.stock}
        onDecrement={() => decrement(product.productId)}
        onIncrement={() => increment(product.productId)}
        className={className}
      />
    );
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={outOfStock}
        className={cn(
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-cocoa px-5 text-sm font-medium text-cream transition-all hover:bg-cocoa-deep active:scale-[0.98] disabled:opacity-50",
          className,
        )}
      >
        {justAdded ? (
          <>
            <Check className="h-4 w-4" /> Agregado
          </>
        ) : outOfStock ? (
          "Sin stock"
        ) : (
          <>
            <Plus className="h-4 w-4" /> Agregar
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={outOfStock}
      aria-label={`Agregar ${product.nombre}`}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-full bg-caramel text-primary-foreground shadow-[0_6px_18px_-8px_rgba(197,123,44,0.8)] transition-all hover:bg-caramel-deep active:scale-90 disabled:cursor-not-allowed disabled:bg-cream-3 disabled:text-muted disabled:shadow-none",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {justAdded ? (
          <motion.span
            key="check"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <Check className="h-5 w-5" />
          </motion.span>
        ) : (
          <motion.span
            key="plus"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Plus className="h-5 w-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
