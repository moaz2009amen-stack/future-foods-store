"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Search, Phone, ListOrdered } from "lucide-react";
import { useCartStore } from "@/store/cart";
import type { StoreSettings } from "@/types";

export default function StoreHeader({ settings }: { settings: StoreSettings }) {
  const [query, setQuery] = useState("");
  const itemsCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {settings.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt={settings.store_name} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center font-bold">
              {settings.store_name_en.charAt(0)}
            </div>
          )}
          <div className="leading-tight hidden sm:block">
            <div className="font-bold text-sm">{settings.store_name}</div>
            <div className="text-xs text-muted">{settings.store_name_en}</div>
          </div>
        </Link>

        <form
          action="/search"
          className="flex-1 relative max-w-xl mx-auto"
        >
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full bg-surface border border-border rounded-full py-2 pr-10 pl-4 text-sm outline-none focus:border-accent"
          />
        </form>

        <nav className="hidden md:flex items-center gap-5 text-sm text-muted shrink-0">
          <Link href="/" className="hover:text-text">الرئيسية</Link>
          <Link href="/track" className="hover:text-text flex items-center gap-1">
            <ListOrdered className="w-4 h-4" /> تتبع طلبك
          </Link>
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="hover:text-text flex items-center gap-1">
              <Phone className="w-4 h-4" /> {settings.phone}
            </a>
          )}
        </nav>

        <Link href="/cart" className="relative shrink-0 btn-accent rounded-full p-2.5">
          <ShoppingCart className="w-5 h-5" />
          {itemsCount > 0 && (
            <span className="absolute -top-1 -left-1 bg-warning text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {itemsCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
