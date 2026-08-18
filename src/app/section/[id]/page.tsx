import { notFound } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import type { Product } from "@/types";

export const revalidate = 0;

const PUBLIC_COLUMNS = "id,slug,name,description,image_url,category_id,home_section_id,sale_price,discount_price,status,is_featured";

export default async function SectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const settings = await getStoreSettings();

  const { data: section, error: sectionError } = await supabase
    .from("home_sections")
    .select("*")
    .eq("id", id)
    .single();

  if (sectionError && sectionError.code !== "PGRST116") {
    throw new Error("تعذر تحميل بيانات القسم");
  }
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
              <Image
                src={section.image_url}
                alt={section.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
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
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </div>
  );
}
