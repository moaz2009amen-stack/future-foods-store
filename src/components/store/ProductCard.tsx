"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import type { Product } from "@/types";
import { getEffectivePrice } from "@/types";
import { useCartStore } from "@/store/cart";
import { trackEvent } from "@/lib/analytics";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const available = product.status === "available";
  const effectivePrice = getEffectivePrice(product);
  const hasDiscount = effectivePrice < product.sale_price;

  function handleAdd() {
    addItem(product);
    trackEvent("AddToCart", {
      content_name: product.name,
      content_ids: [product.id],
      value: effectivePrice,
      currency: "EGP",
    });
  }

  return (
    <div className="card overflow-hidden flex flex-col group relative">
      <Link href={`/product/${product.slug}`} className="block aspect-square bg-surface2 overflow-hidden relative">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">لا توجد صورة</div>
        )}
        {!available && (
          <span className="absolute top-2 right-2 bg-danger text-white text-[11px] px-2 py-1 rounded-full">
            غير متوفر
          </span>
        )}
        {hasDiscount && available && (
          <span className="absolute top-2 left-2 bg-accent text-white text-[11px] px-2 py-1 rounded-full font-bold">
            خصم
          </span>
        )}
      </Link>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <Link href={`/product/${product.slug}`} className="font-semibold text-sm line-clamp-1">
          {product.name}
        </Link>
        {product.description && (
          <p className="text-xs text-muted line-clamp-1">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-accent">{effectivePrice} ج.م</span>
            {hasDiscount && (
              <span className="text-xs text-muted line-through">{product.sale_price} ج.م</span>
            )}
          </div>
          <button
            disabled={!available}
            onClick={handleAdd}
            className="btn-accent disabled:opacity-40 disabled:cursor-not-allowed rounded-full p-2"
            aria-label="إضافة إلى السلة"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
