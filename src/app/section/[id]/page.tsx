import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import type { Product } from "@/types";

export const revalidate = 0;

const PUBLIC_COLUMNS = "id,name,description,image_url,category_id,home_section_id,sale_price,discount_price,status,is_featured";

export default async function SectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const settings = await getStoreSettings();

  const { data: section } = await supabase.from("home_sections").select("*").eq("id", id).single();
  if (!section) notFound();

  const { data: products } = await supabase
    .from("products")
    .select(PUBLIC_COLUMNS)
    .eq("home_section_id", id)
    .eq("status", "available");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
      <StoreHeader settings={settings} />

      <section className="max-w-7xl mx-auto px-4 pt-6">
        <div className="card hero-gradient p-6 sm:p-10 relative overflow-hidden">
          {section.image_url && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={section.image_url} alt={section.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}
          <div className={`relative ${section.image_url ? "text-white" : ""}`}>
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">{section.title}</h1>
            {section.description && <p className={section.image_url ? "text-white/85" : "text-muted"}>{section.description}</p>}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(products as Product[]).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-muted text-center py-16">لسه مفيش منتجات في القسم ده</p>
        )}
      </section>
      </div>

      <StoreFooter settings={settings} />
    </div>
  );
}