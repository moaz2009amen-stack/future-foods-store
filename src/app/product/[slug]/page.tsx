import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getStoreSettings } from "@/lib/settings";
import { getSimilarProducts } from "@/lib/similar-products";
import { getEffectivePrice } from "@/types";
import StoreHeader from "@/components/store/StoreHeader";
import StoreFooter from "@/components/store/StoreFooter";
import ProductCard from "@/components/store/ProductCard";
import ProductReviews from "@/components/store/ProductReviews";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import ProductDetailClient from "./ProductDetailClient";
import type { Product, Review } from "@/types";

export const revalidate = 0;

const PUBLIC_COLUMNS =
  "id,slug,name,description,image_url,category_id,home_section_id,sale_price,discount_price,status,is_featured,weight,ingredients,origin_country,shelf_life";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("name, description, image_url").eq("slug", decodeURIComponent(slug)).single();

  if (!product) return {};

  return {
    title: product.name,
    description: product.description || `اطلب ${product.name} أونلاين من سر السعادة ستور`,
    openGraph: product.image_url ? { images: [{ url: product.image_url }] } : undefined,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const settings = await getStoreSettings();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(PUBLIC_COLUMNS)
    .eq("slug", decodeURIComponent(slug))
    .single();

  // لو حصل خطأ فعلي في الاتصال بقاعدة البيانات (مش مجرد "مفيش نتيجة")،
  // منورّيش صفحة 404 المضلّلة، أحسن نرمي خطأ عادي يوديه لصفحة الخطأ
  // العامة اللي بتوضح إن فيه مشكلة تقنية مش إن المنتج مش موجود
  if (productError && productError.code !== "PGRST116") {
    throw new Error("تعذر تحميل بيانات المنتج");
  }
  if (!product) notFound();

  const [similar, { data: reviews }] = await Promise.all([
    getSimilarProducts(supabase, product.id, product.category_id, 4),
    supabase
      .from("reviews")
      .select("*")
      .eq("product_id", product.id)
      .eq("is_visible", true)
      .order("created_at", { ascending: false }),
  ]);

  const effectivePrice = getEffectivePrice(product);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.image_url || undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "EGP",
      price: effectivePrice,
      availability:
        product.status === "available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex-1">
      <StoreHeader settings={settings} />
      <ProductDetailClient product={product as Product} />

      <ProductReviews reviews={(reviews as Review[]) ?? []} />

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
      </div>
      <StoreFooter settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
    </div>
  );
}
