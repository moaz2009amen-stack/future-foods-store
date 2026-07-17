"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { getEffectivePrice } from "@/types";
import { useEffect, useState } from "react";
import type { StoreSettings } from "@/types";

export default function CartPage() {
  const { items, increment, decrement, removeItem, total } = useCartStore();
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings);
  }, []);

  const deliveryFee = settings?.delivery_fee ?? 0;
  const grandTotal = total() + deliveryFee;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">سلة التسوق</h1>

      {items.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          السلة فارغة
          <div className="mt-4">
            <Link href="/" className="btn-accent rounded-full px-6 py-2 inline-block">
              تصفح المنتجات
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.product.id} className="card p-3 flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg bg-surface2 overflow-hidden shrink-0">
                  {item.product.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{item.product.name}</div>
                  <div className="text-accent font-bold text-sm">{getEffectivePrice(item.product)} ج.م</div>
                </div>
                <div className="flex items-center gap-2 card px-2 py-1">
                  <button onClick={() => increment(item.product.id)}><Plus className="w-4 h-4" /></button>
                  <span className="w-5 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => decrement(item.product.id)}><Minus className="w-4 h-4" /></button>
                </div>
                <button onClick={() => removeItem(item.product.id)} className="text-danger">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="card p-4 mt-6 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">إجمالي المنتجات</span>
              <span>{total()} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">تكلفة التوصيل</span>
              <span>{deliveryFee} ج.م</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-1">
              <span>الإجمالي</span>
              <span className="text-accent">{grandTotal} ج.م</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="btn-accent rounded-full px-6 py-3 font-bold w-full block text-center mt-4"
          >
            إتمام الطلب
          </Link>
        </>
      )}
    </div>
  );
}
