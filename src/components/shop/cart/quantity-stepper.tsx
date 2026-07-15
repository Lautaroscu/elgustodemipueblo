"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  max?: number;
  size?: "sm" | "md";
  className?: string;
};

export function QuantityStepper({
  value,
  onDecrement,
  onIncrement,
  max,
  size = "md",
  className,
}: Props) {
  const btn =
    size === "sm"
      ? "h-7 w-7"
      : "h-9 w-9";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={onDecrement}
        aria-label="Quitar uno"
        className={cn(
          "grid place-items-center rounded-full text-cocoa transition-colors hover:bg-cream-2 active:scale-90",
          btn,
        )}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        className={cn(
          "min-w-6 text-center text-sm font-semibold tabular-nums text-cocoa",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={max != null && value >= max}
        aria-label="Agregar uno"
        className={cn(
          "grid place-items-center rounded-full text-cocoa transition-colors hover:bg-cream-2 active:scale-90 disabled:opacity-40",
          btn,
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
