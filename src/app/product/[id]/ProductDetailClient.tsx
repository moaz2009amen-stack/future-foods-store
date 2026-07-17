"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/types";
import { getEffectivePrice } from "@/types";
import { useCartStore } from "@/store/cart";

export default function ProductDetailClient({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const available = product.status === "available";
  const effectivePrice = getEffectivePrice(product);
  const hasDiscount = effectivePrice < product.sale_price;

  return (
    <section className="max-w-7xl mx-auto px-4 pt-6 grid sm:grid-cols-2 gap-8">
      <div className="card aspect-square overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">لا توجد صورة</div>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-extrabold mb-2">{product.name}</h1>
        <span
          className={`inline-block text-xs px-2 py-1 rounded-full mb-4 ${
            available ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
          }`}
        >
          {available ? "متوفر" : "غير متوفر"}
        </span>
        {product.description && <p className="text-muted mb-4 leading-relaxed">{product.description}</p>}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl font-bold text-accent">{effectivePrice} ج.م</span>
          {hasDiscount && (
            <span className="text-lg text-muted line-through">{product.sale_price} ج.م</span>
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-sm text-muted">الكمية</span>
          <div className="flex items-center gap-3 card px-3 py-1.5">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="تقليل">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-bold">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} aria-label="زيادة">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          disabled={!available}
          onClick={() => addItem(product, qty)}
          className="btn-accent disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-8 py-3 font-bold w-full sm:w-auto"
        >
          إضافة إلى السلة
        </button>
      </div>
    </section>
  );
}
