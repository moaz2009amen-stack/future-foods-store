"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Search, Phone, ListOrdered, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { createClient } from "@/lib/supabase/client";
import type { StoreSettings } from "@/types";

interface Suggestion {
  id: string;
  slug: string;
  name: string;
  image_url: string | null;
  sale_price: number;
}

export default function StoreHeader({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const itemsCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id,slug,name,image_url,sale_price")
        .eq("status", "available")
        .ilike("name", `%${query.trim()}%`)
        .limit(5);
      setSuggestions((data as Suggestion[]) ?? []);
      setLoadingSuggestions(false);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {settings.logo_url ? (
            <Image
              src={settings.logo_url}
              alt={settings.store_name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
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

        <div ref={boxRef} className="flex-1 relative max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              name="q"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="ابحث عن منتج..."
              autoComplete="off"
              className="w-full bg-surface border border-border rounded-full py-2 pr-10 pl-4 text-sm outline-none focus:border-accent"
            />
            {loadingSuggestions && (
              <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted animate-spin" />
            )}
          </form>

          {showSuggestions && query.trim().length >= 2 && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full card overflow-hidden z-50 shadow-lg">
              {suggestions.map((s) => (
                <Link
                  key={s.id}
                  href={`/product/${s.slug}`}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center gap-3 p-2.5 hover:bg-surface2 transition-colors border-b border-border last:border-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface2 overflow-hidden shrink-0">
                    {s.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.image_url} alt={s.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="flex-1 text-sm line-clamp-1">{s.name}</span>
                  <span className="text-xs font-bold text-accent shrink-0">{s.sale_price} ج.م</span>
                </Link>
              ))}
            </div>
          )}
        </div>

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
