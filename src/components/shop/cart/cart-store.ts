"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  nombre: string;
  precio: number;
  categoryId: string;
  imagen?: string | null;
  emoji?: string;
  stock: number;
  cantidad: number;
};

type CartState = {
  items: CartItem[];
  lastAddedId: string | null;
  add: (item: Omit<CartItem, "cantidad">, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
  clearLastAdded: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      lastAddedId: null,
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId,
          );
          if (existing) {
            const cantidad = Math.min(existing.stock, existing.cantidad + qty);
            return {
              lastAddedId: item.productId,
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, cantidad } : i,
              ),
            };
          }
          return {
            lastAddedId: item.productId,
            items: [
              ...state.items,
              { ...item, cantidad: Math.min(item.stock, qty) },
            ],
          };
        }),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      setQty: (productId, qty) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, cantidad: Math.max(0, Math.min(i.stock, qty)) }
                : i,
            )
            .filter((i) => i.cantidad > 0),
        })),
      increment: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, cantidad: Math.min(i.stock, i.cantidad + 1) }
              : i,
          ),
        })),
      decrement: (productId) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, cantidad: i.cantidad - 1 }
                : i,
            )
            .filter((i) => i.cantidad > 0),
        })),
      clear: () => set({ items: [], lastAddedId: null }),
      clearLastAdded: () => set({ lastAddedId: null }),
    }),
    {
      name: "egmp-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Selectores derivados. */
export const selectCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.cantidad, 0);

export const selectSubtotal = (s: CartState) =>
  s.items.reduce((n, i) => n + i.precio * i.cantidad, 0);
