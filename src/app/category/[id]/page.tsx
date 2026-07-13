import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/types";

export const revalidate = 0;

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const settings = await getStoreSettings();

  const [{ data: category }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").eq("id", id).single(),
    supabase
      .from("products")
      .select("id,name,description,image_url,category_id,sale_price,status,is_featured")
      .eq("category_id", id),
  ]);

  return (
    <div>
      <StoreHeader settings={settings} />
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">{category?.name ?? "القسم"}</h1>
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(products as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-muted text-center py-16">لا توجد منتجات في هذا القسم حالياً</p>
        )}
      </section>
      <StoreFooter settings={settings} />
    </div>
  );
}
