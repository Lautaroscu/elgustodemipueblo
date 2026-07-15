"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCart, selectCount, selectSubtotal } from "./cart-store";
import { CheckoutSheet } from "../checkout/checkout-sheet";
import { AddedFlyout } from "./added-flyout";
import { useMounted } from "@/hooks/use-mounted";
import { formatPrice } from "@/lib/utils";

/**
 * Elementos globales del carrito: botón flotante fijo "Finalizar pedido",
 * confirmación al agregar, y el bottom sheet de checkout.
 * Oculto en el panel admin.
 */
export function CartDock() {
  const mounted = useMounted();
  const pathname = usePathname();
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);

  const hidden = pathname?.startsWith("/admin");

  if (!mounted || hidden) return null;

  const visible = count > 0 && !checkoutOpen;

  return (
    <>
      <AddedFlyout onOpenCart={() => setCheckoutOpen(true)} />

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          >
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="mx-auto flex w-full max-w-md items-center justify-between gap-3 rounded-full bg-cocoa px-5 py-3.5 text-cream shadow-[0_16px_40px_-12px_rgba(35,22,13,0.6)] transition-transform active:scale-[0.98]"
            >
              <span className="flex items-center gap-3">
                <span className="relative grid h-9 w-9 place-items-center rounded-full bg-cream/10">
                  <ShoppingBag className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-caramel px-1 text-[0.7rem] font-bold text-primary-foreground">
                    {count}
                  </span>
                </span>
                <span className="font-medium">Finalizar pedido</span>
              </span>
              <span className="font-display text-lg font-semibold">
                {formatPrice(subtotal)}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutSheet open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  );
}
