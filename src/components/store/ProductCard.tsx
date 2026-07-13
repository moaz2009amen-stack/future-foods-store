"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cart";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const available = product.status === "available";

  return (
    <div className="card overflow-hidden flex flex-col group">
      <Link href={`/product/${product.id}`} className="block aspect-square bg-surface2 overflow-hidden relative">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">لا توجد صورة</div>
        )}
        {!available && (
          <span className="absolute top-2 right-2 bg-danger text-white text-[11px] px-2 py-1 rounded-full">
            غير متوفر
          </span>
        )}
      </Link>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <Link href={`/product/${product.id}`} className="font-semibold text-sm line-clamp-1">
          {product.name}
        </Link>
        {product.description && (
          <p className="text-xs text-muted line-clamp-1">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-bold text-accent">{product.sale_price} ج.م</span>
          <button
            disabled={!available}
            onClick={() => addItem(product)}
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
