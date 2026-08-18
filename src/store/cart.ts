"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";
import { getEffectivePrice } from "@/types";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, qty = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + qty }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: qty }] });
        }
      },
      increment: (productId) =>
        set({
          items: get().items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }),
      decrement: (productId) =>
        set({
          items: get()
            .items.map((i) =>
              i.product.id === productId
                ? { ...i, quantity: i.quantity - 1 }
                : i
            )
            .filter((i) => i.quantity > 0),
        }),
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.product.id !== productId) }),
      clear: () => set({ items: [] }),
      total: () =>
        get().items.reduce(
          (sum, i) => sum + getEffectivePrice(i.product) * i.quantity,
          0
        ),
    }),
    { name: "ffs-cart" }
  )
);
