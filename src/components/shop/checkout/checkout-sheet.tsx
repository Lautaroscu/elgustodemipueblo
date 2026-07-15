"use client";

import * as React from "react";
import Link from "next/link";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { BottomSheet } from "@/components/ui/sheet";
import { ProductImage } from "@/components/shared/product-image";
import { QuantityStepper } from "../cart/quantity-stepper";
import { useCart, selectSubtotal } from "../cart/cart-store";
import { formatPrice } from "@/lib/utils";
import { CheckoutForm } from "./checkout-form";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Sheet de compra en dos pasos dentro del mismo panel:
 *  1) Revisión del carrito.
 *  2) Datos, entrega, pago (CheckoutForm).
 */
export function CheckoutSheet({ open, onOpenChange }: Props) {
  const items = useCart((s) => s.items);
  const subtotal = useCart(selectSubtotal);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const remove = useCart((s) => s.remove);
  const [step, setStep] = React.useState<"cart" | "checkout">("cart");

  // Al cerrar, volvemos al paso 1 para la próxima apertura.
  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setStep("cart"), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const empty = items.length === 0;

  if (step === "checkout") {
    return (
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Tu pedido"
        description="Completá tus datos para finalizar"
      >
        <CheckoutForm
          onBack={() => setStep("cart")}
          onDone={() => onOpenChange(false)}
        />
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Tu pedido"
      description={empty ? undefined : `${items.length} producto(s)`}
      footer={
        empty ? undefined : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-display text-lg font-semibold text-cocoa">
                {formatPrice(subtotal)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep("checkout")}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-caramel text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_-8px_rgba(197,123,44,0.8)] transition-all hover:bg-caramel-deep active:scale-[0.98]"
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-center text-xs text-muted">
              Promos y cupones se aplican en el siguiente paso.
            </p>
          </div>
        )
      }
    >
      {empty ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-cream-2">
            <ShoppingBag className="h-7 w-7 text-caramel-deep" />
          </span>
          <p className="font-display text-lg font-semibold text-cocoa">
            Tu pedido está vacío
          </p>
          <p className="max-w-xs text-sm text-muted">
            Sumá tus postres favoritos desde el catálogo.
          </p>
          <Link
            href="/catalogo"
            onClick={() => onOpenChange(false)}
            className="mt-2 inline-flex h-11 items-center rounded-full bg-cocoa px-6 text-sm font-medium text-cream transition-colors hover:bg-cocoa-deep"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-3 py-3">
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <ProductImage
                  src={item.imagen}
                  alt={item.nombre}
                  emoji={item.emoji}
                  fill
                  sizes="64px"
                />
              </span>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-medium text-cocoa">
                    {item.nombre}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(item.productId)}
                    aria-label={`Quitar ${item.nombre}`}
                    className="shrink-0 text-muted transition-colors hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <QuantityStepper
                    size="sm"
                    value={item.cantidad}
                    max={item.stock}
                    onDecrement={() => decrement(item.productId)}
                    onIncrement={() => increment(item.productId)}
                  />
                  <span className="text-sm font-semibold text-cocoa">
                    {formatPrice(item.precio * item.cantidad)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </BottomSheet>
  );
}
