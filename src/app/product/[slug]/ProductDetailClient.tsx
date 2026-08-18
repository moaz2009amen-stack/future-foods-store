"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/types";
import { getEffectivePrice } from "@/types";
import { useCartStore } from "@/store/cart";
import { trackEvent } from "@/lib/analytics";

export default function ProductDetailClient({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const available = product.status === "available";
  const effectivePrice = getEffectivePrice(product);
  const hasDiscount = effectivePrice < product.sale_price;

  useEffect(() => {
    trackEvent("ViewContent", {
      content_name: product.name,
      content_ids: [product.id],
      value: effectivePrice,
      currency: "EGP",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  function handleAdd() {
    addItem(product, qty);
    trackEvent("AddToCart", {
      content_name: product.name,
      content_ids: [product.id],
      value: effectivePrice * qty,
      currency: "EGP",
    });
  }

  const extraDetails = [
    { label: "الوزن / الحجم", value: product.weight },
    { label: "المكونات", value: product.ingredients },
    { label: "بلد المنشأ", value: product.origin_country },
    { label: "مدة الصلاحية", value: product.shelf_life },
  ].filter((d) => d.value);

  return (
    <section className="max-w-7xl mx-auto px-4 pt-6 grid sm:grid-cols-2 gap-8">
      <div className="card aspect-square overflow-hidden relative">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
            priority
          />
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
          onClick={handleAdd}
          className="btn-accent disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-8 py-3 font-bold w-full sm:w-auto mb-6"
        >
          إضافة إلى السلة
        </button>

        {extraDetails.length > 0 && (
          <div className="card p-4">
            <h2 className="font-bold text-sm mb-2">تفاصيل المنتج</h2>
            <dl className="flex flex-col gap-1.5 text-sm">
              {extraDetails.map((d) => (
                <div key={d.label} className="flex justify-between gap-3">
                  <dt className="text-muted shrink-0">{d.label}</dt>
                  <dd className="text-left">{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
