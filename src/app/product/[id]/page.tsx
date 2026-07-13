import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import { getSimilarProducts } from "@/lib/similar-products";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import ProductDetailClient from "./ProductDetailClient";
import type { Product } from "@/types";

export const revalidate = 0;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const settings = await getStoreSettings();

  const { data: product } = await supabase.from("products").select("id,name,description,image_url,category_id,sale_price,status,is_featured").eq("id", id).single();
  if (!product) notFound();

  const similar = await getSimilarProducts(supabase, id, product.category_id, 4);

  return (
    <div>
      <StoreHeader settings={settings} />
      <ProductDetailClient product={product as Product} />

      {similar.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-4 mb-16">
          <h2 className="text-lg font-bold mb-4">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
      <StoreFooter settings={settings} />
    </div>
  );
}
